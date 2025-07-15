import { useEffect, useState } from "react";
import axios from "axios";

type Props = {
  category: string;
}

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

export const ProjectsOverview: React.FC<Props> = ({category}) => {
  const [projects, setProjects] = useState<Project[]>([]);


  const fetchProjects = async () => {
    try {
      const res = await axios.get("https://josefine-ostlund.onrender.com/projects");
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);


console.log(projects)
  return (
     <section className="p-8 space-y-6 bg-white">
      <h2 className="font-header uppercase">{category}</h2>
      {projects.map((project) => (
        <div key={project._id} className="border p-4 rounded-xl shadow">
          <h2 className="text-xl font-header">{project.name}</h2>
          <p><strong>Year:</strong> {project.year}</p>
          <p><strong>Material:</strong> {project.material}</p>
          <p><strong>Exhibited at:</strong> {project.exhibited_at}</p>
          <p><strong>Category:</strong> {project.category}</p>
          <p><strong>Description:</strong> {project.description}</p>

          <div className="mt-4">
            <h3 className="font-semibold">Images:</h3>
            <div className="grid grid-cols-2 gap-4">
              {project.images.map((img, index) => (
                <div key={img.public_id + index}>
                  <img src={img.url} alt="Project" className="rounded" />
                  <p className="text-sm text-gray-500">{img.photographer}</p>
                  <p className="text-xs break-words text-gray-400">public_id: {img.public_id}</p>
                </div>
              ))}
            </div>
          </div>

          {project.video && (
            <div className="mt-4">
              <h3 className="font-semibold">Video:</h3>
              <video controls className="w-full rounded">
                <source src={project.video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p className="text-sm text-gray-500">{project.video.photographer}</p>
              <p className="text-xs break-words text-gray-400">public_id: {project.video.public_id}</p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
};