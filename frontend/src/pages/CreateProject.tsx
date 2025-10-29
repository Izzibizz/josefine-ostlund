import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProjectStore } from "../stores/ProjectsStore";
import { useUserStore } from "../stores/UserStore";
import { ImageModal } from "../components/ImageModal";
import Dropzone from "react-dropzone";
import { FiPlus } from "react-icons/fi";
import { DeleteButton } from "../components/DeleteButton";
import { TextEditor } from "../components/Texteditor";
import { VideoPlayer } from "../components/HlsPlayer";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

type TempImage = {
  file: File;
  url: string;
  tempId: string;
  photographer: string;
};

const CATEGORIES = ["performance", "skulpturer", "utställningar"] as const;
type Category = (typeof CATEGORIES)[number];

export const CreateProject: React.FC<{ projectId?: string }> = ({
  projectId,
}) => {
  const { projects, updateProject, createProject } = useProjectStore();
  const { success } = useUserStore();
  const existingProject = useMemo(
    () => projects.find((p) => p._id === projectId),
    [projects, projectId]
  );
  const location = useLocation();
  const isNewProject = location.pathname === "/nytt";
  const navigate = useNavigate();
  const [name, setName] = useState(existingProject?.name ?? "");
  const [year, setYear] = useState(existingProject?.year ?? "");
  const [material, setMaterial] = useState(existingProject?.material ?? "");
  const [exhibitedAt, setExhibitedAt] = useState(
    existingProject?.exhibited_at ?? ""
  );
  const [category, setCategory] = useState<Category>(
    (existingProject?.category as Category) ?? "skulpturer"
  );
  const [description, setDescription] = useState(
    existingProject?.description ?? ""
  );
  const [shortDescription, setShortDescription] = useState(
    existingProject?.short_description ?? ""
  );
  const [size, setSize] = useState(existingProject?.size ?? "");
  const [existingImages, setExistingImages] = useState<Image[]>(
    existingProject?.images ?? []
  );
  const [newImages, setNewImages] = useState<TempImage[]>([]);
  const [imagesOrder, setImagesOrder] = useState<string[]>([
    ...(existingProject?.images?.map((img) => img.public_id) ?? []),
  ]);
  const [gallery, setGallery] = useState<Image[]>([]);

  const [removeImages, setRemoveImages] = useState<string[]>([]);

  const [videoUrl, setVideoUrl] = useState(existingProject?.video?.url ?? "");
  const [videoThumbnail, setVideoThumbnail] = useState(
    existingProject?.video?.public_id ?? ""
  );
  const [removeVideo, setRemoveVideo] = useState<boolean>(false);
  const [videoPhotographer, setVideoPhotographer] = useState(
    existingProject?.video?.photographer ?? ""
  );
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageToDisplay, setImageToDisplay] = useState<Image | null>(
    gallery[0] ?? null
  );

  const handleUpdatePhotographer = (id: string, photographer: string) => {
    setExistingImages((prev) =>
      prev.map((img) => (img.public_id === id ? { ...img, photographer } : img))
    );

    setNewImages((prev) =>
      prev.map((img) => (img.tempId === id ? { ...img, photographer } : img))
    );
  };

  const handleDropImages = (accepted: File[]) => {
    const additions: TempImage[] = accepted.map((file) => {
      const id = `temp-${crypto.randomUUID()}`;
      return {
        file,
        url: URL.createObjectURL(file),
        tempId: id,
        photographer: "",
      };
    });

    setNewImages((prev) => [...prev, ...additions]);
    setImagesOrder((prev) => [...prev, ...additions.map((a) => a.tempId)]);
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    setImagesOrder((prev) => {
      const newOrder = [...prev];
      const targetIndex = direction === "left" ? index - 1 : index + 1;

      // skydd mot indexfel
      if (targetIndex < 0 || targetIndex >= newOrder.length) return prev;

      // flytta bilden
      const [moved] = newOrder.splice(index, 1);
      newOrder.splice(targetIndex, 0, moved);

      return newOrder;
    });
  };


  const handleDeleteThumb = (img: Image) => {
    const isTemp = img.public_id.startsWith("temp-");

    // ta bort från imagesOrder först
    setImagesOrder((prev) => prev.filter((id) => id !== img.public_id));

    if (isTemp) {
      setNewImages((prev) =>
        prev.filter(
          (t) =>
            t.tempId !== img.public_id && // vanlig jämförelse
            `temp-${t.tempId}` !== img.public_id // fallback om tempId fått extra prefix
        )
      );
    } else {
      setExistingImages((prev) =>
        prev.filter((e) => e.public_id !== img.public_id)
      );
      setRemoveImages((prev) =>
        prev.includes(img.public_id) ? prev : [...prev, img.public_id]
      );
    }

    // uppdatera preview
    if (imageToDisplay?.public_id === img.public_id) {
      const next =
        gallery.filter((g) => g.public_id !== img.public_id)[0] ?? null;
      setImageToDisplay(next);
    }
  };

  const handlePreviewClick = (image: Image | TempImage) => {
    const id = "public_id" in image ? image.public_id : image.tempId;
    setImageToDisplay({
      url: image.url,
      public_id: id,
      photographer: image.photographer || "",
    });
    setIsModalOpen(true);
  };

  const handleLoadVideo = () => {
    if (!videoUrl.includes("b-cdn.net") || !videoUrl.endsWith(".m3u8")) {
      setVideoError("Länken måste vara en giltig Bunny Stream-länk (.m3u8)");
      setShowVideo(false);
      return;
    }

    setShowVideo(true);
    setVideoError(null);
  };

  const handleDeleteVideo = () => {
    if (existingProject?.video) {
      setShowVideo(false);
      setRemoveVideo(true);
      setVideoUrl("");
      setVideoThumbnail("");
    } else if (videoUrl) {
      setShowVideo(false);
      setVideoUrl("");
      setVideoThumbnail("");
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving project...");
      const textData = {
        name,
        year,
        material,
        exhibited_at: exhibitedAt,
        category,
        description,
        short_description: shortDescription,
        size,
      };

      const videoData =
        videoUrl && !removeVideo
          ? {
              url: videoUrl,
              photographer: videoPhotographer || "",
              public_id: videoThumbnail,
            }
          : null;

      const imageData = gallery.map((img, index) => ({
        index,
        public_id: img.public_id,
        photographer: img.photographer || "",
      }));

      if (!isNewProject && projectId && existingProject) {
        console.log("Updating project...");
        await updateProject(
          projectId,
          textData,
          newImages.map((n) => n.file),
          videoData,
          removeImages,
          removeVideo,
          imageData
        );
      } else {
        console.log("Creating project...");
        await createProject(
          textData,
          newImages.map((n) => n.file),
          imageData,
          videoData || undefined
        );
      }
    } catch (err) {
      console.error("Error saving project:", err);
    }
  };

  useEffect(() => {
    if (gallery.length === 0) {
      setImageToDisplay(null);
      return;
    }

    const firstId = imagesOrder[0];
    const firstImage = gallery.find((g) => g.public_id === firstId);
    if (firstImage) setImageToDisplay(firstImage);
  }, [imagesOrder, gallery]);

  useEffect(() => {
    if (existingProject?.video?.url) {
      setVideoUrl(existingProject?.video?.url);
      setShowVideo(true);
    }
  }, []);

  useEffect(() => {
    const combined = [
      ...imagesOrder
        .map((id) => {
          const existing = existingImages.find((img) => img.public_id === id);
          if (existing) return existing;

          const temp = newImages.find((img) => img.tempId === id);
          if (temp) {
            return {
              url: temp.url,
              public_id: temp.tempId,
              photographer: temp.photographer,
            };
          }
          return null;
        })
        .filter((img): img is Image => img !== null),

      // lägg till ev. nya som inte finns i order-listan än
      ...newImages
        .filter((n) => !imagesOrder.includes(n.tempId))
        .map((n) => ({
          url: n.url,
          public_id: n.tempId,
          photographer: n.photographer,
        })),
    ];

    // Ta bort eventuella dubletter
    const unique = Array.from(
      new Map(combined.map((i) => [i.public_id, i])).values()
    );
    setGallery(unique);
  }, [imagesOrder, existingImages, newImages]);

  useEffect(() => {
    if (imageToDisplay) {
      const updated = gallery.find(
        (img) => img.public_id === imageToDisplay.public_id
      );
      if (updated && updated.photographer !== imageToDisplay.photographer) {
        setImageToDisplay(updated);
      }
    }
  }, [gallery]);

  useEffect(() => {
    if (success) {
      navigate("/");
    }
  }, [success]);

  console.log(videoUrl);

  return (
    <section className="w-11/12 laptop:w-9/12 mx-auto mt-40 flex flex-col gap-10">
      {!projectId && (
        <h2 className="font-header uppercase text-lg">Nytt projekt</h2>
      )}

      <div className="flex flex-col gap-4 laptop:gap-10 laptop:flex-row laptop:justify-between">
        <div className="w-full flex flex-col laptop:w-2/3 gap-4">
          <div className="w-full flex items-start">
            {imageToDisplay ? (
              <img
                src={imageToDisplay.url}
                alt="Preview"
                className="w-full h-full max-w-[900px] laptop:h-[650px] object-contain object-top-left"
                onClick={() => setIsModalOpen(true)}
              />
            ) : (
              <Dropzone onDrop={handleDropImages} accept={{ "image/*": [] }}>
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer flex flex-col gap-2 w-full laptop:min-h-[300px] justify-center items-center"
                  >
                    <input {...getInputProps()} />
                    <p className="font-body text-sm tablet:text-base flex gap-2 items-center">
                      {" "}
                      <FiPlus /> Klicka för att lägga till bilder
                    </p>
                    <p className="text-xs">
                      JPG, PNG eller WEBP (max-mått 1800px) <br />
                      glöm inte namnge med ditt namn, titel, fotograf
                    </p>
                  </div>
                )}
              </Dropzone>
            )}
          </div>
          {gallery.length >= 1 && (
            <div className="flex flex-col laptop:flex-row gap-6">
              <div className="flex flex-wrap gap-2">
                {gallery.map((img) => {
                  const index = imagesOrder.indexOf(img.public_id);
                  return (
                    <div
                      key={img.public_id}
                      className="w-28 h-20 relative cursor-pointer"
                    >
                      <img
                        src={img.url}
                        className="w-full h-full object-cover"
                        onClick={() => handlePreviewClick(img)}
                      />
                      <button
                        onClick={() => handleDeleteThumb(img)}
                        className="absolute z-10 top-1 right-1 bg-black text-white rounded-full px-2 cursor-pointer"
                        aria-label="Ta bort bild"
                      >
                        ×
                      </button>
                      {index > 0 && (
                        <button
                          onClick={() => moveImage(index, "left")}
                          className="absolute bottom-1 left-1 bg-white/80 rounded-full px-2 cursor-pointer"
                          aria-label="Flytta vänster"
                        >
                          ←
                        </button>
                      )}
                      {index < imagesOrder.length - 1 && (
                        <button
                          onClick={() => moveImage(index, "right")}
                          className="absolute bottom-1 right-1 bg-white/80 rounded-full px-2 cursor-pointer"
                          aria-label="Flytta höger"
                        >
                          →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <Dropzone onDrop={handleDropImages} accept={{ "image/*": [] }}>
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer flex flex-col gap-2"
                  >
                    <input {...getInputProps()} />
                    <p className="font-body text-sm tablet:text-base flex gap-2 items-center">
                      {" "}
                      <FiPlus /> Klicka för att lägga till fler bilder
                    </p>
                    <p className="text-xs">
                      JPG, PNG eller WEBP (max-mått 1800px) <br /> glöm inte
                      namnge med ditt namn, titel, fotograf
                    </p>
                  </div>
                )}
              </Dropzone>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 laptop:w-1/3 font-body">
          <input
            className="border p-2"
            placeholder="Projektnamn"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="År"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Storlek (t.ex. 40x60 cm)"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />

          <input
            className="border p-2"
            placeholder="Visad på (galleri/plats)"
            value={exhibitedAt}
            onChange={(e) => setExhibitedAt(e.target.value)}
          />
          <select
            className="border p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <TextEditor
            value={shortDescription}
            onChange={(html) => setShortDescription(html)}
          />

          <TextEditor
            value={description}
            onChange={(html) => setDescription(html)}
          />

          <div className="flex flex-col gap-2">
            <h3>Video</h3>
            {showVideo && (
              <div className="relative w-full aspect-[16/9]">
                <VideoPlayer src={videoUrl} />
                <button
                  onClick={handleDeleteVideo}
                  className="absolute z-20 top-2 right-2 bg-black text-white rounded-full px-2"
                  aria-label="Ta bort video"
                >
                  ×
                </button>
              </div>
            )}
            <input
              type="text"
              placeholder="HLS Playlist URL (Bunny.net)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="border p-2 w-full"
            />
            <input
              type="text"
              placeholder="Thumbnail URL (Bunny.net)"
              value={videoThumbnail}
              onChange={(e) => setVideoThumbnail(e.target.value)}
              className="border p-1 w-full"
            />
            <input
              type="text"
              placeholder="Videotext + Fotograf"
              value={videoPhotographer}
              onChange={(e) => setVideoPhotographer(e.target.value)}
              className="border p-1 w-full"
            />
            <button
              type="button"
              onClick={handleLoadVideo}
              className="bg-black text-white px-4 py-2 rounded mt-2 w-fit rounded-4xl"
            >
              Ladda video
            </button>
            {videoError && <p className="text-red-500">{videoError}</p>}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="z-20 bg-black text-white rounded-4xl px-4 py-2 self-end cursor-pointer"
          >
            {projectId ? "Spara ändringar" : "Spara projekt"}
          </button>
          {projectId && <DeleteButton projectId={projectId} />}
        </div>
      </div>

      {isModalOpen && imageToDisplay && (
        <ImageModal
          key={imageToDisplay.public_id}
          image={{
            ...imageToDisplay,
            public_id: imageToDisplay.public_id,
          }}
          onClose={() => setIsModalOpen(false)}
          onUpdatePhotographer={handleUpdatePhotographer}
        />
      )}
    </section>
  );
};
