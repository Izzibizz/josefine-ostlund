import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate()
  const {projects, loading} = useProjectStore();
  const singleProject = useMemo(() => {
  return projects.find((project) => slugify(project.name) === id);
}, [projects, id]);
  const [imageToDisplay, setImageToDisplay] = useState<Image | null>(null);
  const { editMode } = useUserStore()

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

  console.log(id);

  if (!singleProject ) {
  return <div className="w-fit mx-auto mt-40"><p className="font-body">Laddar projekt...</p> </div>;
}
if (editMode && singleProject) {
  return <CreateProject projectId={singleProject._id} />;
}

  return (
    <section className="w-11/12 laptop:w-9/12 mx-auto pt-40 laptop:pt-48 flex flex-col gap-10">
      <div className="flex flex-col gap-4 laptop:flex-row ">
        <img
          src={imageToDisplay?.url}
          alt={singleProject?.name}
          className="w-full laptop:w-2/3 max-w-[900px] laptop:max-h-[650px] object-contain object-left cursor-pointer"
          onClick={() => handleOpenModal()}
        />
        <div className="flex flex-col gap-10 font-body laptop:w-1/3 laptop:self-end">
        
          <div className="flex flex-col gap-2 text-end">
            <h2 className="font-extrabold text-lg">{singleProject?.name}</h2>
             {singleProject?.category === "utställningar" && <p><span className="font-semibold">Visad på: </span>{singleProject?.exhibited_at}</p> }
            <h3>{singleProject?.year}</h3>
            <p>{singleProject?.material}</p>
            <p>{singleProject?.description}</p>
            {singleProject?.category !== "utställningar" && <p><span className="font-semibold">Visad på: </span>{singleProject?.exhibited_at}</p> }
          </div>
            <SwiperComp
            handlePreviewClick={handlePreviewClick}
            project={{ ...singleProject, images: reorderedImages }}
            slides={3}
            style=""
            aspect=" object-contain"
            thumbnail={true}
          />
        </div>
      </div>
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
        <ImageModal image={imageToDisplay} onClose={handleCloseModal} />
      )}
    </section>
  );
};
