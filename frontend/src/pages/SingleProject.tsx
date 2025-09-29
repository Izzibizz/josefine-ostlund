import { useParams, useNavigate } from "react-router-dom";
import { useProjectStore } from "../stores/ProjectsStore";
import { useUserStore } from "../stores/UserStore";
import { useState, useEffect, useMemo } from "react";
import { ImageModal } from "../components/ImageModal";
import { slugify } from "../utils/slugify";
import { CreateProject } from "./CreateProject";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

export const SingleProject: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { projects, loading } = useProjectStore();
  const singleProject = useMemo(() => {
    return projects.find(
      (project) =>
        slugify(project.category) === category && slugify(project.name) === id
    );
  }, [projects, category, id]);

  const [isLaptop, setIsLaptop] = useState(window.innerWidth > 1024);
  const [imageToDisplay, setImageToDisplay] = useState<Image | null>(null);
  const { editMode } = useUserStore();

  const reorderedImages = useMemo(() => {
    if (!singleProject?.images) return [];
    if (singleProject.images.length <= 1) return singleProject.images;
    return [...singleProject.images.slice(1), singleProject.images[0]];
  }, [singleProject]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePreviewClick = (image: Image) => {
    setImageToDisplay({
      url: image.url,
      public_id: image.public_id,
      photographer: image.photographer || "",
    });
  };

  const getThumbnailUrl = (url: string, width: number) => {
    return url.replace("/upload/", `/upload/w_${width},c_fill/`);
  };

  useEffect(() => {
    if (singleProject?.images?.[0]) {
      setImageToDisplay({
        url: singleProject.images[0].url,
        photographer: singleProject.images[0].photographer || "",
        public_id: singleProject.images[0].public_id,
      });
    }
  }, [singleProject]);

  useEffect(() => {
    if (!singleProject && !loading) {
      navigate(-1);
    }
  }, [singleProject, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsLaptop(window.innerWidth > 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLaptop]);

  if (!singleProject) {
    return (
      <div className="w-fit mx-auto mt-40">
        <p className="font-body">Laddar projekt...</p>{" "}
      </div>
    );
  }
  if (editMode && singleProject) {
    return <CreateProject projectId={singleProject._id} />;
  }

  console.log(singleProject.images);
  return (
    <section className="w-11/12 laptop:w-9/12 mx-auto pt-40 flex flex-col gap-10">
      <div className="flex flex-col gap-4 laptop:flex-row laptop:gap-14">
        <div className="flex flex-col laptop:w-2/3 laptop:gap-20">
          {imageToDisplay && imageToDisplay !== undefined ? (
            <img
              src={imageToDisplay?.url}
              alt={singleProject?.name}
              className="w-full self-start max-w-[900px] laptop:max-h-[700px] object-contain object-left cursor-pointer"
              onClick={() => handleOpenModal()}
            />
          ) : (
            <div className="w-full laptop:w-2/3 max-w-[900px] laptop:max-h-[650px] object-contain object-left" />
          )}
          {singleProject?.description && isLaptop && (
            <div
              className="desctext text-sm text-justify max-w-none"
              dangerouslySetInnerHTML={{ __html: singleProject.description }}
            />
          )}
        </div>
        <div
          className={`flex flex-col gap-10 font-body laptop:w-1/3 ${
            singleProject?.description.length === 0 && "self-end"
          }`}
        >
          <div
            className={` ${
              reorderedImages.length > 3
                ? "grid grid-cols-4"
                : "flex flex-wrap justify-end"
            } gap-3`}
          >
            {reorderedImages.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-[4/3] cursor-pointer ${
                  reorderedImages.length < 4
                    ? "w-[80px] h-[100px]"
                    : "w-full max-w-[100px]"
                }`}
                onClick={() => handlePreviewClick(image)}
              >
                <img
                  src={getThumbnailUrl(image.url, 250)}
                  alt={image.photographer || singleProject.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 text-end">
            <h2 className="font-bold text-lg">{singleProject?.name}</h2>
            {singleProject?.category === "utställningar" && (
              <p>
                <span className="font-semibold"></span>
                {singleProject?.exhibited_at}
              </p>
            )}
            <h3 className="font-medium">{singleProject?.year}</h3>
            <div className="flex flex-col gap-2 text-sm">
              <p>{singleProject?.material}</p>
              {singleProject?.size && <p>{singleProject?.size}</p>}
            </div>
            {singleProject?.short_description &&
              singleProject?.short_description.length > 0 && (
                <div
                  className="desctext text-sm text-justify-right max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: singleProject.short_description,
                  }}
                />
              )}
          </div>
        </div>
      </div>
      {singleProject?.description && !isLaptop && (
        <div
          className="desctext text-sm text-justify max-w-none"
          dangerouslySetInnerHTML={{ __html: singleProject.description }}
        />
      )}
      {singleProject?.video && (
        <video
          src={singleProject?.video?.url}
          poster={singleProject?.images[0].url}
          controls
          playsInline
          className="w-full h-auto aspect-[16/9] object-cover"
        />
      )}
      {isModalOpen && imageToDisplay && (
        <ImageModal
          image={imageToDisplay}
          images={singleProject.images}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};
