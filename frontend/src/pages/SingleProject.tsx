import { useParams } from "react-router-dom";
import { useProjectStore } from "../stores/ProjectsStore";
import { useUserStore } from "../stores/UserStore";
import { useState, useEffect, useMemo } from "react";
import { SwiperComp } from "../components/SwiperComp";
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
  const { id } = useParams();
  const projects = useProjectStore((state) => state.projects);
  const singleProject = useMemo(() => {
  return projects.find((project) => slugify(project.name) === id);
}, [projects, id]);
  const [imageToDisplay, setImageToDisplay] = useState<Image | null>(null);
  const { editMode } = useUserStore()

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

  useEffect(() => {
    if (singleProject?.images?.[0]) {
      setImageToDisplay({
        url: singleProject.images[0].url,
        photographer: singleProject.images[0].photographer || "",
        public_id: singleProject.images[0].public_id,
      });
    }
  }, [singleProject]);

  console.log();

  if (!singleProject ) {
  return <p>Laddar projekt...</p>;
}
if (editMode && singleProject) {
  return <CreateProject projectId={singleProject._id} />;
}

  return (
    <section className="w-11/12 laptop:w-9/12 mx-auto pt-40 laptop:pt-48 flex flex-col gap-10">
      <div className="flex flex-col gap-4 laptop:flex-row laptop:justify-between">
        <img
          src={imageToDisplay?.url}
          alt={singleProject?.name}
          className="w-full laptop:w-2/3 max-w-[900px] aspect-[4/3] cursor-pointer"
          onClick={() => handleOpenModal()}
        />
        <div className="flex flex-col gap-10 font-body laptop:w-1/3">
          <SwiperComp
            handlePreviewClick={handlePreviewClick}
            project={singleProject}
            slides={3}
          />
          <div className="flex flex-col gap-2">
            <h2 className="font-extrabold text-lg">{singleProject?.name}</h2>
            <h3>{singleProject?.year}</h3>
            <p>{singleProject?.material}</p>
            <p className="text-justify">{singleProject?.description}</p>
          </div>
        </div>
      </div>
      {singleProject?.video && (
        <video
          src={singleProject?.video?.url}
          poster={singleProject?.images[1].url}
          controls
          playsInline
          className="w-full h-auto aspect-[16/9] object-cover"
        />
      )}
      {isModalOpen && imageToDisplay && (
        <ImageModal image={imageToDisplay} onClose={handleCloseModal} />
      )}
    </section>
  );
};
