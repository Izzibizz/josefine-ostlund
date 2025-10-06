import { create } from "zustand";
import axios from "axios";
import { useUserStore } from "./UserStore";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

type ProjectOrderUpdate = {
  id: string;
  order: number;
};

export interface Project {
  _id: string;
  name: string;
  year: string;
  material: string;
  exhibited_at: string;
  category: string;
  description: string;
  short_description: string;
  size?: string;
  images: Image[];
  video?: Image;
  order?: number;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  deleteFail: boolean;
  deleteSuccess: boolean;
  orderSuccess: boolean;
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
  setOrderSuccess: (input: boolean) => void;
  updateProjectOrder: (orders: ProjectOrderUpdate[]) => Promise<void>;
}

async function uploadVideoToBunny(file: File) {
  // 1. be backend om upload-url
  const res = await fetch(
    `https://api.onrender.com/projects/get-upload-url?fileName=${encodeURIComponent(file.name)}`
  );
  if (!res.ok) throw new Error("Kunde inte hämta upload-url från backend");
  const { uploadUrl, cdnUrl, pathOnBunny, headers } = await res.json();

  // 2. ladda upp till Bunny
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers,
    body: file,
  });
  if (!uploadRes.ok) throw new Error("Kunde inte ladda upp video till Bunny");

  // 3. returnera metadata till backend
  return {
    url: cdnUrl,
    public_id: pathOnBunny, 
  };
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,
  deleteFail: false,
  deleteSuccess: false,
  orderSuccess: false,
  setDeleteFail: (input) => set({ deleteFail: input }),
  setDeleteSuccess: (input) => set({ deleteSuccess: input }),
  setOrderSuccess: (input) => set({orderSuccess: input}),

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

  createProject: async (data, images, photographers, videoFile) => {
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
      if (photographers?.length) {
        formData.append("photographers", JSON.stringify(photographers));
      }

      // Video (ladda upp till Bunny först → sen bifoga som JSON)
      if (videoFile) {
        const videoMeta = await uploadVideoToBunny(videoFile);
        formData.append("video", JSON.stringify(videoMeta));
      }

      const res = await fetch("https://api.onrender.com/projects/newProject", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Kunde inte skapa projekt");
      const dataRes = await res.json();
      const newProject: Project = JSON.parse(JSON.stringify(dataRes.project));

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
    newVideoFile,
    removeImages,
    removeVideo,
    imageData
  ) => {
    useUserStore.setState({
      success: false,
      fail: false,
      loadingEdit: true,
      showPopupMessage: true,
    });

    try {
      const formData = new FormData();

      // Textfält
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Nya bilder
      if (newImages?.length) {
        newImages.forEach((file) => formData.append("images", file));
      }

      // Fotografer (både gamla och nya)
      if (imageData?.length) {
        formData.append("imageData", JSON.stringify(imageData));
      }

      // Video (ladda upp ny först → bifoga JSON)
      if (newVideoFile) {
        const videoMeta = await uploadVideoToBunny(newVideoFile);
        formData.append("video", JSON.stringify(videoMeta));
      }

      // Remove
      if (removeImages?.length) {
        removeImages.forEach((id) => formData.append("removeImages", id));
      }
      if (removeVideo) {
        formData.append("removeVideo", "true");
      }

      const res = await fetch(`https://api.onrender.com/projects/${id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) throw new Error("Kunde inte uppdatera projekt");
      const dataRes = await res.json();
      const updatedProject: Project = JSON.parse(
        JSON.stringify(dataRes.project)
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
  updateProjectOrder: async (orders) => {
    try {
      useUserStore.setState({
        success: false,
        fail: false,
        loadingEdit: true,
        showPopupMessage: true,
      });
      await axios.patch("https://josefine-ostlund.onrender.com/projects/reorder", orders);
      const res = await axios.get("https://josefine-ostlund.onrender.com/projects"
      );
      set({ projects: res.data.projects, loading: false, orderSuccess: true });
      useUserStore.setState({
        loadingEdit: false,
        showPopupMessage: true,
        editMode: false
      });
    } catch (error) {
      console.error("Failed to update project order:", error);
      useUserStore.setState({
        fail: true,
        loadingEdit: false,
        showPopupMessage: true,
      });
      throw error;
    }
  },
}));
