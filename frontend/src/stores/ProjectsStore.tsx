import { create } from "zustand";
import axios from "axios";
import { useUserStore } from "./UserStore"; 

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
    photographers: string[],
    video?: File
  ) => Promise<void>;
  updateProject: (
    id: string,
    updates: Partial<Project>,
    newImages?: File[],
    newVideo?: File | null,
    removeImages?: string[],
    removeVideo?: boolean,
    imageData?: { public_id?: string; index?: number; photographer: string }[]
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

  createProject: async (data, images, photographers, video) => {
    useUserStore.setState({ success: false, fail: false, loadingEdit: true, showPopupMessage: true });

    try {
      const formData = new FormData();

      // Textdata
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Bilder
      images.forEach((file) => formData.append("images", file));

      // Fotografer
      if (photographers.length > 0) {
        formData.append("photographers", JSON.stringify(photographers));
      }

      // Video
      if (video) formData.append("video", video);

      const res = await axios.post(
        "https://josefine-ostlund.onrender.com/projects/newProject",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      set((state) => ({ projects: [...state.projects, res.data.project] }));
      useUserStore.setState({ editMode: false, loadingEdit: false, success: true, showPopupMessage: true });
    } catch (err) {
      console.error("Error creating project", err);
      useUserStore.setState({ loadingEdit: false, fail: true, showPopupMessage: true });
    }
  },

  // --- UPDATE ---
  updateProject: async (id, updates, newImages, newVideo, removeImages, removeVideo, imageData) => {
    try {
      useUserStore.setState({ success: false, fail: false, loadingEdit: true, showPopupMessage: true });

      const formData = new FormData();

      // Textfält
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value));
      });

      // Nya bilder
      if (newImages?.length) newImages.forEach((file) => formData.append("images", file));

      // Fotografer (både gamla och nya)
      if (imageData?.length) formData.append("imageData", JSON.stringify(imageData));

      // Video
      if (newVideo) formData.append("video", newVideo);

      // Remove
      if (removeImages?.length) removeImages.forEach((id) => formData.append("removeImages", id));
      if (removeVideo) formData.append("removeVideo", "true");

      const res = await axios.patch(
        `https://josefine-ostlund.onrender.com/projects/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      set((state) => ({
        projects: state.projects.map((p) => (p._id === id ? res.data.project : p)),
      }));
      useUserStore.setState({ editMode: false, loadingEdit: false, success: true, showPopupMessage: true });
    } catch (err) {
      console.error("Error updating project", err);
      useUserStore.setState({ loadingEdit: false, fail: true, showPopupMessage: true });
    }
  },
}));
