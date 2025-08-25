import { useMemo, useState, useEffect } from "react";
import { useProjectStore } from "../stores/ProjectsStore";
import { SwiperComp } from "../components/SwiperComp";
import { ImageModal } from "../components/ImageModal";
import Dropzone from "react-dropzone";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

type TempImage = { file: File; url: string; tempId: string };

const CATEGORIES = ["performance", "skulpturer", "utställningar"] as const;
type Category = (typeof CATEGORIES)[number];

export const CreateProject: React.FC<{ projectId?: string }> = ({
  projectId,
}) => {
  const { projects, updateProject, createProject } = useProjectStore();
  const existingProject = useMemo(
    () => projects.find((p) => p._id === projectId),
    [projects, projectId]
  );
  const [name, setName] = useState(existingProject?.name ?? "");
  const [year, setYear] = useState<number>(
    existingProject?.year ?? new Date().getFullYear()
  );
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

  const [existingImages, setExistingImages] = useState<Image[]>(
    existingProject?.images ?? []
  );
  const [newImages, setNewImages] = useState<TempImage[]>([]);
  const gallery: Image[] = [
    ...existingImages,
    ...newImages.map((n) => ({ url: n.url, public_id: n.tempId })),
  ];

  const [removeImages, setRemoveImages] = useState<string[]>([]);

  const [videoPreview, setVideoPreview] = useState<string | null>(
    existingProject?.video?.url ?? null
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeVideo, setRemoveVideo] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageToDisplay, setImageToDisplay] = useState<Image | null>(
    gallery[0] ?? null
  );

  const handleDeleteThumb = (img: Image) => {
    const isTemp = img.public_id.startsWith("temp-");

    if (isTemp) {
      setNewImages((prev) => prev.filter((t) => t.tempId !== img.public_id));
    } else {
      setExistingImages((prev) =>
        prev.filter((e) => e.public_id !== img.public_id)
      );
      setRemoveImages((prev) =>
        prev.includes(img.public_id) ? prev : [...prev, img.public_id]
      );
    }

    if (imageToDisplay?.public_id === img.public_id) {
      const next =
        gallery.filter((g) => g.public_id !== img.public_id)[0] ?? null;
      setImageToDisplay(next);
    }
  };

  const handleDropVideo = (accepted: File[]) => {
    if (!accepted.length) return;
    const file = accepted[0];
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setRemoveVideo(false);
  };

  const handleDeleteVideo = () => {
    if (videoFile) {
      setVideoFile(null);
      setVideoPreview(null);
    } else if (existingProject?.video) {
      setRemoveVideo(true);
      setVideoPreview(null);
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
      };

      if (projectId && existingProject) {
        console.log("Updating project...");
        await updateProject(
          projectId,
          textData,
          newImages.map((n) => n.file),
          videoFile,
          removeImages,
          removeVideo
        );
      } else {
        console.log("Creating project...");
        await createProject(
          textData,
          newImages.map((n) => n.file),
          videoFile || undefined
        );
      }
    } catch (err) {
      console.error("Error saving project:", err);
    }
  };

  useEffect(() => {
    setImageToDisplay(gallery[0] ?? null);
  }, [gallery.length]);

  const handleDropImages = (accepted: File[]) => {
    const additions: TempImage[] = accepted.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    setNewImages((prev) => [...prev, ...additions]);
  };

  const swiperProject = existingProject
    ? { ...existingProject, images: gallery }
    : {
        _id: "temp",
        name,
        year,
        material,
        exhibited_at: exhibitedAt,
        category,
        description,
        images: gallery,
      };

  return (
    <section className="w-11/12 laptop:w-9/12 mx-auto mt-40 flex flex-col gap-10">
      {!projectId && (
        <h2 className="font-header uppercase text-lg">Nytt projekt</h2>
      )}

      <div className="flex flex-col gap-4 laptop:flex-row laptop:justify-between">
        <div className="w-full laptop:w-2/3">
          {gallery.length > 1 ? (
            <SwiperComp
              project={swiperProject}
              handlePreviewClick={(img: Image) => setImageToDisplay(img)}
              slides={1}
            />
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-300 flex justify-center items-center">
              {imageToDisplay ? (
                <img
                  src={imageToDisplay.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onClick={() => setIsModalOpen(true)}
                />
              ) : (
                <Dropzone onDrop={handleDropImages} accept={{ "image/*": [] }}>
                  {({ getRootProps, getInputProps }) => (
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer"
                    >
                      <input {...getInputProps()} />
                      <p>Släpp eller klicka för att lägga till bilder</p>
                    </div>
                  )}
                </Dropzone>
              )}
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
            type="number"
            placeholder="År"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <input
            className="border p-2"
            placeholder="Material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
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
          <textarea
            className="border p-2"
            placeholder="Beskrivning"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {gallery.length >= 1 && (
            <Dropzone onDrop={handleDropImages} accept={{ "image/*": [] }}>
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <p>Släpp eller klicka för att lägga till fler bilder</p>
                </div>
              )}
            </Dropzone>
          )}

          <div className="flex flex-wrap gap-2">
            {gallery.map((img) => (
              <div
                key={img.public_id}
                className="w-28 h-20 relative cursor-pointer"
              >
                <img
                  src={img.url}
                  className="w-full h-full object-cover"
                  onClick={() => setImageToDisplay(img)}
                />
                <button
                  onClick={() => handleDeleteThumb(img)}
                  className="absolute top-1 right-1 bg-black text-white rounded-full px-2"
                  aria-label="Ta bort bild"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div>
            {videoPreview ? (
              <div className="relative">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-auto aspect-[16/9] bg-gray-300"
                />
                <button
                  onClick={handleDeleteVideo}
                  className="absolute top-2 right-2 bg-black text-white rounded-full px-2"
                  aria-label="Ta bort video"
                >
                  ×
                </button>
              </div>
            ) : (
              <Dropzone onDrop={handleDropVideo} accept={{ "video/*": [] }}>
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-400 p-6 text-center cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    <p>Släpp eller klicka för att ladda upp en video</p>
                  </div>
                )}
              </Dropzone>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="z-20 bg-black text-white rounded-4xl px-4 py-2 self-end cursor-pointer"
          >
            Spara projekt
          </button>
        </div>
      </div>

      {isModalOpen && imageToDisplay && (
        <ImageModal
          image={imageToDisplay}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
};
