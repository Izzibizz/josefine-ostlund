import { useParams } from "react-router-dom";
import { useProjectStore } from "../stores/ProjectsStore";
import { useState, useEffect, useMemo } from "react";
import { SwiperComp } from "../components/SwiperComp";
import { ImageModal } from "../components/ImageModal";
import { slugify } from "../utils/slugify";

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
    return projects.filter((project) => slugify(project.name) === id);
  }, [projects, id]);
  const [imageToDisplay, setImageToDisplay] = useState({
    url: singleProject[0]?.images[0].url,
    photographer: singleProject[0]?.images[0].photographer || "",
    public_id: singleProject[0]?.images[0].public_id,
  });


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
    if (singleProject[0]?.images?.[0]) {
      setImageToDisplay({
        url: singleProject[0].images[0].url,
        photographer: singleProject[0].images[0].photographer || "",
        public_id: singleProject[0].images[0].public_id,
      });
    }
  }, [singleProject]);

  console.log();
  return (
    <section className="w-11/12 laptop:w-9/12 mx-auto pt-40 laptop:pt-48 flex flex-col gap-10">
      <div className="flex flex-col gap-4 laptop:flex-row laptop:justify-between">
        <img
          src={imageToDisplay.url}
          alt={singleProject[0]?.name}
          className="w-full laptop:w-2/3 max-w-[900px] aspect-[4/3] cursor-pointer"
          onClick={() => handleOpenModal()}
        />
        <div className="flex flex-col gap-10 font-body laptop:w-1/3">
          <SwiperComp
            handlePreviewClick={handlePreviewClick}
            project={singleProject[0]}
          />
          <div className="flex flex-col gap-2">
            <h2 className="font-extrabold text-lg">{singleProject[0]?.name}</h2>
            <h3>{singleProject[0]?.year}</h3>
            <p>{singleProject[0]?.material}</p>
            <p className="text-justify">{singleProject[0]?.description}</p>
          </div>
        </div>
      </div>
      {singleProject[0]?.video && (
        <video
          src={singleProject[0]?.video?.url}
          poster={singleProject[0]?.images[1].url}
          controls
          playsInline
          className="w-full h-auto aspect-[16/9] object-cover"
        />
      )}
      {isModalOpen && (
        <ImageModal image={imageToDisplay} onClose={handleCloseModal} />
      )}
    </section>
  );
};
