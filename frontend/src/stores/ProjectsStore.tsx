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
  loading: boolean;
  deleteFail: boolean;
  deleteSuccess: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (
    data: Omit<Project, "_id" | "images" | "video">,
    images: File[],
    photographers: string[],
    video?: File
  ) => Promise<Project | undefined>;

  updateProject: (
    id: string,
    updates: Partial<Project>,
    newImages?: File[],
    newVideo?: File | null,
    removeImages?: string[],
    removeVideo?: boolean,
    imageData?: { public_id?: string; index?: number; photographer: string }[]
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setDeleteFail: (input: boolean) => void;
  setDeleteSuccess: (input: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,
  deleteFail: false,
  deleteSuccess: false,
  setDeleteFail: (input) => set({ deleteFail: input }),
  setDeleteSuccess: (input) => set({ deleteSuccess: input }),

  // --- FETCH ---
  fetchProjects: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(
        "https://josefine-ostlund.onrender.com/projects"
      );
      set({ projects: res.data.projects, loading: false });
    } catch (err) {
      console.error("Error fetching projects", err);
      set({ loading: false });
    }
  },

  createProject: async (data, images, photographers, video) => {
    useUserStore.setState({
      success: false,
      fail: false,
      loadingEdit: true,
      showPopupMessage: true,
    });

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

      // 🔧 Klona projektet för att undvika "object is not extensible"
      const newProject: Project = JSON.parse(JSON.stringify(res.data.project));

      set((state) => ({
        projects: [...state.projects, newProject],
      }));

      useUserStore.setState({
        editMode: false,
        loadingEdit: false,
        success: true,
        showPopupMessage: true,
      });

      return newProject;
    } catch (err) {
      console.error("Error creating project", err);
      useUserStore.setState({
        loadingEdit: false,
        fail: true,
        showPopupMessage: true,
      });
    }
  },

  // --- UPDATE ---
  updateProject: async (
    id,
    updates,
    newImages,
    newVideo,
    removeImages,
    removeVideo,
    imageData
  ) => {
    try {
      useUserStore.setState({
        success: false,
        fail: false,
        loadingEdit: true,
        showPopupMessage: true,
      });

      const formData = new FormData();

      // Textfält
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          formData.append(key, String(value));
      });

      // Nya bilder
      if (newImages?.length)
        newImages.forEach((file) => formData.append("images", file));

      // Fotografer (både gamla och nya)
      if (imageData?.length)
        formData.append("imageData", JSON.stringify(imageData));

      // Video
      if (newVideo) formData.append("video", newVideo);

      // Remove
      if (removeImages?.length)
        removeImages.forEach((id) => formData.append("removeImages", id));
      if (removeVideo) formData.append("removeVideo", "true");

      const res = await axios.patch(
        `https://josefine-ostlund.onrender.com/projects/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // 🔧 Klona objektet innan det sätts i state
      const updatedProject: Project = JSON.parse(
        JSON.stringify(res.data.project)
      );

      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === id ? updatedProject : p
        ),
      }));

      useUserStore.setState({
        editMode: false,
        loadingEdit: false,
        success: true,
        showPopupMessage: true,
      });
    } catch (err) {
      console.error("Error updating project", err);
      useUserStore.setState({
        loadingEdit: false,
        fail: true,
        showPopupMessage: true,
      });
    }
  },

  deleteProject: async (id) => {
    try {
      useUserStore.setState({
        success: false,
        fail: false,
        loadingEdit: true,
        showPopupMessage: true,
      });
      set({ deleteFail: false, deleteSuccess: false });

      await axios.delete(
        `https://josefine-ostlund.onrender.com/projects/${id}`
      );

      // 🗑 Uppdatera state: ta bort projektet lokalt
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== id),
      }));

      set({ deleteSuccess: true });

      useUserStore.setState({
        loadingEdit: false,
        showPopupMessage: true,
      });
      console.log("Delete successful");
    } catch (err) {
      console.error("Error deleting project", err);
      set({ deleteFail: true });
      useUserStore.setState({
        loadingEdit: false,
        showPopupMessage: true,
      });
    }
  },
}));
