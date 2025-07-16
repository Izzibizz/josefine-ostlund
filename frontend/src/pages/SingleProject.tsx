import { useParams } from "react-router-dom";
import { useProjectStore } from "../stores/ProjectsStore";
import { useState, useEffect } from "react";
import { SwiperComp } from "../components/SwiperComp";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

export const SingleProject: React.FC = () => {
  const { id } = useParams();
  const projects = useProjectStore((state) => state.projects);
  const singleProject = projects.filter(
    (project) =>
      project.name
        .toLowerCase()
        .replace(/å/g, "a")
        .replace(/ä/g, "a")
        .replace(/ö/g, "o")
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+|-+$/g, "") === id
  );
  const [ imageToDisplay, setImageToDisplay ] = useState({
  url: singleProject[0]?.images[0].url,
  photographer: singleProject[0]?.images[0].photographer || "",
  public_id: singleProject[0]?.images[0].public_id
});

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
}, []);

  console.log(id, "single:", singleProject);
  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-24 laptop:pt-40 flex flex-col gap-10">
      <div className="flex flex-col laptop:flex-row laptop:justify-between">
     
      <img src={imageToDisplay.url} alt={singleProject[0]?.name} className="w-full laptop:w-2/3 max-w-[900px]"/>
      <div className="flex flex-col font-body laptop:w-1/3">
      <SwiperComp handlePreviewClick={handlePreviewClick} project={singleProject[0]} />
       <h2 className="font-extrabold text-lg">{singleProject[0]?.name}</h2>
       <h3>{singleProject[0]?.year}</h3>
       </div>
      </div>
      {singleProject[0]?.video && (
        <video>

        </video>
      )}
    </section>
  );
};
