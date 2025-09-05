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
    photographers?: { public_id: string; photographer: string }[] // 👈 för PATCH
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
  useUserStore.setState({
    success: false,
    fail: false,
    loadingEdit: true,
    showPopupMessage: true,
  });

  try {
    const formData = new FormData();

    // Lägg till textfält
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    // Bygg ihop imageData = [{ index: 0, photographer: "…" }, …]
    const imageData = images.map((_, i) => ({
      index: i,
      photographer: photographers[i] || "",
    }));

    // Lägg till imageData som JSON
    formData.append("imageData", JSON.stringify(imageData));

    // Lägg till bilder
    images.forEach((file) => formData.append("images", file));

    // Lägg till video
    if (video) formData.append("video", video);

    console.log("CREATE formData:", [...formData.entries()]);

    const res = await axios.post(
      "https://josefine-ostlund.onrender.com/projects/newProject",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    set((state) => ({ projects: [...state.projects, res.data.project] }));
    useUserStore.setState({
      editMode: false,
      loadingEdit: false,
      success: true,
      showPopupMessage: true,
    });
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
  photographers // array med { public_id, photographer }
) => {
  try {
    useUserStore.setState({
      success: false,
      fail: false,
      loadingEdit: true,
      showPopupMessage: true,
    });

    const formData = new FormData();

    // Lägg till textfält
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Lägg till nya bilder
    if (newImages?.length) {
      newImages.forEach((file) => {
        formData.append("images", file);
      });
    }

    // Lägg till photographers JSON (för både nya och befintliga bilder)
    if (photographers?.length) {
      formData.append("imageData", JSON.stringify(photographers));
    }

    // Lägg till ny video
    if (newVideo) {
      formData.append("video", newVideo);
    }

    // Lägg till removeImages
    if (removeImages?.length) {
      removeImages.forEach((id) => {
        formData.append("removeImages", id);
      });
    }

    // Lägg till removeVideo
    if (removeVideo) {
      formData.append("removeVideo", "true");
    }

    const res = await axios.patch(
      `https://j-ostlund.onrender.com/projects/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    // Uppdatera state
    set((state) => ({
      projects: state.projects.map((p) =>
        p._id === id ? res.data.project : p
      ),
    }));

    useUserStore.setState({
      editMode: false,
      loadingEdit: false,
      success: true,
      showPopupMessage: true,
    });
    console.log("Update successful");
  } catch (err) {
    useUserStore.setState({
      loadingEdit: false,
      fail: true,
      showPopupMessage: true,
    });
    console.error("Error updating project", err);
  }
},

}));
