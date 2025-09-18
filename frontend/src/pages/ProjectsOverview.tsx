import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { displayCategory } from "../components/CategoryUtils";
import { useProjectStore } from "../stores/ProjectsStore";
import { useUserStore } from "../stores/UserStore";
import { slugify } from "../utils/slugify";
import { RiArrowRightDoubleLine } from "react-icons/ri";

type Props = {
  category: string;
};

export const ProjectsOverview: React.FC<Props> = ({ category }) => {
  const { projects, updateProjectOrder } = useProjectStore();
  const { editMode } = useUserStore();

  const parseYear = (yearStr: string): number => {
    const matches = yearStr?.match(/\d{4}/g);
    if (!matches) return 0;
    // Tar sista året i intervallet om det finns flera
    return parseInt(matches[matches.length - 1], 10);
  };

  const projectsToDisplay = projects
    .filter((project) => project.category === category)
    .sort((a, b) => {
      const aHasOrder = a.order != null;
      const bHasOrder = b.order != null;

      if (aHasOrder && bHasOrder) {
        return (a.order as number) - (b.order as number);
      } else if (aHasOrder) {
        return -1;
      } else if (bHasOrder) {
        return 1;
      } else {
        return parseYear(b.year) - parseYear(a.year);
      }
    });
  const [tempProjects, setTempProjects] = useState(projectsToDisplay);
  const [isLaptop, setIsLaptop] = useState(window.innerWidth > 1024);
  const categories = ["utställningar", "performance", "skulpturer"];
  const currentIndex = categories.indexOf(category);
  const nextCategory = categories[(currentIndex + 1) % categories.length];

  const getCloudinaryUrlWithWidth = (url: string, width: number) => {
    const parts = url.split("/upload/");

    if (parts.length !== 2) return url;

    return `${parts[0]}/upload/w_${width}/${parts[1]}`;
  };

  const moveProject = (index: number, direction: "left" | "right") => {
    const newProjects = [...tempProjects];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;

    // Swap
    [newProjects[index], newProjects[targetIndex]] = [
      newProjects[targetIndex],
      newProjects[index],
    ];

    setTempProjects(newProjects);
  };

  const handleSaveOrder = async () => {
    const reordered = tempProjects.map((project, index) => ({
      id: project._id,
      order: index,
    }));

    try {
      await updateProjectOrder(reordered);
      console.log("Sparad ordning!");
    } catch (err) {
      console.error("Kunde inte spara ordningen:", err);
    }
  };

  useEffect(() => {
    const filteredAndSorted = projects
      .filter((project) => project.category === category)
      .sort((a, b) => {
        const aHasOrder = a.order != null;
        const bHasOrder = b.order != null;

        if (aHasOrder && bHasOrder) {
          return (a.order as number) - (b.order as number);
        } else if (aHasOrder) {
          return -1;
        } else if (bHasOrder) {
          return 1;
        } else {
          return parseYear(b.year) - parseYear(a.year);
        }
      });

    setTempProjects(filteredAndSorted);
  }, [projects, category]);

  useEffect(() => {
    const handleResize = () => {
      setIsLaptop(window.innerWidth > 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-40 gap-10 bg-white flex flex-col min-h-screen">
      <h2 className="font-header uppercase text-lg">
        {displayCategory(category)}
      </h2>
      {!projectsToDisplay ? (
        <div className="mx-auto mt-40">
          <p>Loading</p>
        </div>
      ) : (
        <div className="grid laptop:grid-cols-2 tablet:grid-cols-2 gap-10 flex-1">
          {projectsToDisplay.length > 1 ? (
            <>
              {(editMode ? tempProjects : projectsToDisplay).map(
                (project, index) => (
                  <NavLink
                    key={project._id}
                    to={`/${slugify(category)}/${slugify(project.name)}`}
                    className="relative block"
                  >
                    {project.images && project.images[0] !== undefined ? (
                      <img
                        src={getCloudinaryUrlWithWidth(
                          project.images[0].url,
                          1500
                        )}
                        alt={project.images[0].photographer}
                        className="w-full aspect-[4/3] object-cover"
                      />
                    ) : (
                      <div className="w-full h-[95%] aspect-[4/3]" />
                    )}
                    {editMode && (
                      <div className="absolute inset-0 flex items-center justify-between px-2 z-10">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            moveProject(index, "left");
                          }}
                          disabled={index === 0}
                          className={`px-2 py-1 bg-white rounded-full shadow text-sm ${
                            index === 0
                              ? "opacity-30 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          aria-label="Flytta vänster"
                        >
                          ←
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            moveProject(index, "right");
                          }}
                          disabled={
                            index ===
                            (editMode ? tempProjects : projectsToDisplay)
                              .length -
                              1
                          }
                          className={` px-2 py-1 bg-white rounded-full shadow text-sm ${
                            index ===
                            (editMode ? tempProjects : projectsToDisplay)
                              .length -
                              1
                              ? "opacity-30 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          aria-label="Flytta höger"
                        >
                          →
                        </button>
                      </div>
                    )}
                    <h3 className="font-medium laptop:text-sm font-body text-end">
                      {project.name}, {project.year}
                    </h3>
                  </NavLink>
                )
              )}
            </>
          ) : (
            projectsToDisplay.length > 0 && (
              <NavLink
                to={`/${slugify(category)}/${slugify(
                  projectsToDisplay[0]?.name
                )}`}
                className="flex flex-col flex-1"
              >
                {projectsToDisplay[0]?.images[0] &&
                  projectsToDisplay[0].images[0] !== undefined && (
                    <img
                      src={projectsToDisplay[0]?.images[0]?.url}
                      alt={projectsToDisplay[0]?.name}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  )}
                <h3 className="text-sm laptop:text-base font-body font-bold text-end">
                  {projectsToDisplay[0].name}
                </h3>
              </NavLink>
            )
          )}
        </div>
      )}
      {editMode && (
      <button
        type="button"
        onClick={handleSaveOrder}
        className="z-20 bg-black text-white rounded-4xl px-4 py-2 self-end cursor-pointer"
      >
        Spara
      </button>
      )}
      {!isLaptop && (
        <NavLink
          to={`/${slugify(nextCategory)}`}
          className="font-header uppercase flex  justify-end items-center items-center"
        >
          <p className="text-sm">{nextCategory} </p>
          <RiArrowRightDoubleLine className="h-6 w-6" />
        </NavLink>
      )}
    </section>
  );
};
