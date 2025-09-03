import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { displayCategory } from "../components/CategoryUtils"
import { useProjectStore } from "../stores/ProjectsStore";
import { slugify } from "../utils/slugify";
import { RiArrowRightDoubleLine } from "react-icons/ri";


type Props = {
  category: string;
};

export const ProjectsOverview: React.FC<Props> = ({ category }) => {
  const projects = useProjectStore((state) => state.projects);
const projectsToDisplay = projects
  .filter((project) => project.category === category)
  .sort((a, b) => b.year - a.year);

  const [isLaptop, setIsLaptop] = useState(window.innerWidth > 1024);
  const categories = ["utställningar", "performance", "skulpturer"];
  const currentIndex = categories.indexOf(category);
  const nextCategory = categories[(currentIndex + 1) % categories.length];

  useEffect(() => {
    const handleResize = () => {
      setIsLaptop(window.innerWidth > 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLaptop]);

  console.log(projectsToDisplay);
  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-40 laptop:pt-48 gap-10 bg-white flex flex-col min-h-screen">
      <h2 className="font-header uppercase text-lg">{displayCategory(category)}</h2>
      {!projectsToDisplay ? (
        <div className="mx-auto mt-40">
          <p>Loading</p>
        </div>
      ) : (
        <div className="grid laptop:grid-cols-2 tablet:grid-cols-2 gap-10 flex-1">
          {projectsToDisplay.length > 1 ? (
            <>
              {projectsToDisplay.map((project) => (
                <NavLink
                  key={project._id}
                  to={`/${slugify(category)}/${slugify(project.name)}`}
                >
                  <img
                    src={project.images[0].url}
                    alt={project.images[0].photographer}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <h3 className="text-sm laptop:text-base font-body font-bold text-end">
                    {project.name}
                  </h3>
                </NavLink>
              ))}
            </>
          ) : (
            projectsToDisplay.length > 0 && (
              <NavLink
                to={`/${slugify(category)}/${slugify(
                  projectsToDisplay[0]?.name
                )}`}
                className="flex flex-col flex-1"
              >
                <img
                  src={projectsToDisplay[0]?.images[0]?.url}
                  alt={projectsToDisplay[0]?.name}
                  className="w-full aspect-[4/3] object-cover"
                />
                <h3 className="text-sm laptop:text-base font-body font-bold text-end">
                  {projectsToDisplay[0].name}
                </h3>
              </NavLink>
            )
          )}
        </div>
      )}
      {!isLaptop && (
        <NavLink
          to={`/${slugify(nextCategory)}`}
          className="font-header uppercase flex  justify-end items-center items-center"
        >
          <p className="text-sm">{nextCategory} </p><RiArrowRightDoubleLine className="h-6 w-6"/>

        </NavLink>
      )}
    </section>
  );
};
