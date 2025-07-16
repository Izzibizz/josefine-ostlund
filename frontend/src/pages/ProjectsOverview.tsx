import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

type Props = {
  category: string;
};

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

interface Project {
  _id: string;
  name: string;
  year: number;
  material: string;
  exhibited_at: string;
  category: string;
  description: string;
  images: Image[];
  video?: Image;
}

export const ProjectsOverview: React.FC<Props> = ({ category }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        "https://josefine-ostlund.onrender.com/projects"
      );
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  console.log(projects);
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
