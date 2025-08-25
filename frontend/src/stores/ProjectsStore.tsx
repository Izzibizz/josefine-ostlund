import { create } from "zustand";
import axios from "axios";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

export interface Project {
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

interface ProjectState {
  projects: Project[];
  fetchProjects: () => Promise<void>;
  createProject: (
    data: Omit<Project, "_id" | "images" | "video">,
    images: File[],
    video?: File
  ) => Promise<void>;
  updateProject: (
    id: string,
    updates: Partial<Project>,
    newImages?: File[],
    newVideo?: File | null,
    removeImages?: string[],
    removeVideo?: boolean
  ) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],

  // --- FETCH ---
  fetchProjects: async () => {
    try {
      const res = await axios.get(
        "https://josefine-ostlund.onrender.com/projects"
      );
      set({ projects: res.data.projects });
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  },

  // --- CREATE ---
  createProject: async (data, images, video) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      images.forEach((file) => formData.append("images", file));
      if (video) formData.append("video", video);

      console.log([...formData.entries()]);

      const res = await axios.post(
        "https://josefine-ostlund.onrender.com/projects/newProject",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Saved successfully");

      set((state) => ({ projects: [...state.projects, res.data.project] }));
    } catch (err) {
      console.error("Error creating project", err);
    }
  },

  // --- UPDATE ---
  updateProject: async (
    id,
    updates,
    newImages,
    newVideo,
    removeImages,
    removeVideo
  ) => {
    try {
      const formData = new FormData();
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value as string);
      });

      if (newImages)
        newImages.forEach((file) => formData.append("images", file));
      if (newVideo) formData.append("video", newVideo);
      if (removeImages)
        removeImages.forEach((id) => formData.append("removeImages", id));
      if (removeVideo) formData.append("removeVideo", "true");

      const res = await axios.patch(
        `https://josefine-ostlund.onrender.com/projects/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === id ? res.data.project : p
        ),
      }));
    } catch (err) {
      console.error("Error updating project", err);
    }
  },
}));
