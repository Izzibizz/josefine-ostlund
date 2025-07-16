/* import { useEffect, useState } from "react"; */
import { NavLink } from "react-router-dom";
import { useProjectStore } from "../stores/ProjectsStore";

type Props = {
  category: string;
};


export const ProjectsOverview: React.FC<Props> = ({ category }) => {
 const projects = useProjectStore((state) => state.projects);

  const projectsToDisplay = projects.filter((project) => project.category === category)

  console.log(projectsToDisplay);
  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-24 laptop:pt-40 gap-10 bg-white flex flex-col">
      <h2 className="font-header uppercase text-lg self-end">{category}</h2>
      <div className="grid grid-cols-2 tablet:grid-cols-2 gap-10">
        {projects.map((project) => (
          <NavLink
            key={project._id}
            className=""
            to={`/${category}/${project.name
              .toLowerCase()
              .replace(/å/g, "a")
              .replace(/ä/g, "a")
              .replace(/ö/g, "o")
              .replace(/\s+/g, "-")
              .replace(/[^\w-]+/g, "")
              .replace(/--+/g, "-")
              .replace(/^-+|-+$/g, "")}`}
          >
            <img
              src={project.images[0].url}
              alt={project.images[0].photographer}
              className="w-full aspect-[4/3] object-cover"
            />
            <h3 className="text-sm font-header text-end">{project.name}</h3>
          </NavLink>
        ))}
      </div>
    </section>
  );
};
