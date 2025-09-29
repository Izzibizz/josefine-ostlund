import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

/* interface Exhibition {
  place: string;
  city?: string | null;
  year?: number | null;
  type?: string;
  with?: string;
  _id: string;
}

interface Scholarship {
  name: string;
  year?: number | null;
  _id: string;
} */

interface About {
  bio_1: string;
  bio_2: string;
  exhibitions: string;
  scholarships: string;
  image: string;
}

interface Contact {
  telefon: string;
  mail: string;
  instagram: string;
  cv: string;
  cv_public_id: string;
}

interface UserState {
  loggedIn: boolean;
  loggedOut: boolean;
  showPopupMessage: boolean;
  userId: string;
  accessToken: string;
  loadingUser: boolean;
  loginError: boolean;
  signUpError: boolean;
  signedUp: boolean;
  signupMessage: string;
  loginMessage: string;
  about: About;
  contact: Contact;
  editMode: boolean;
  loadingEdit: boolean;
  success: boolean;
  fail: boolean;

  setEditMode: (value: boolean) => void;
  setLoggedIn: () => void;
  setLoggedOut: () => void;
  setShowPopupMessage: (input: boolean) => void;
  setLoginError: (input: boolean) => void;
  setFail: (input: boolean) => void;
  setSuccess: (input: boolean) => void;
  setLoadingEdit: (input: boolean) => void;
  loginUser: (userName: string, password: string) => Promise<void>;
  fetchAbout: () => Promise<void>;
  updateAbout: (data: Partial<About>, imageFile?: File) => Promise<void>;
  /*   deleteAboutItem: (type: "exhibitions" | "scholarships", id: string) => Promise<void>; */
  fetchContact: () => Promise<void>;
  patchContact: (data: Partial<Contact>, cvFile?: File) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set): UserState => ({
      loggedIn: false,
      loggedOut: false,
      showPopupMessage: false,
      userId: "",
      accessToken: "",
      loadingUser: false,
      loginError: false,
      signUpError: false,
      signedUp: false,
      signupMessage: "",
      loginMessage: "",
      about: {
        bio_1: "",
        bio_2: "",
        exhibitions: "",
        scholarships: "",
        image: "",
      },
      contact: {
        telefon: "",
        mail: "",
        instagram: "",
        cv: "",
        cv_public_id: "",
      },
      editMode: false,
      loadingEdit: false,
      success: false,
      fail: false,

      setEditMode: (value) => set({ editMode: value }),
      setLoggedIn: () => set({ loggedIn: true, loggedOut: false }),
      setShowPopupMessage: (input: boolean) => set({ showPopupMessage: input }),
      setLoggedOut: () =>
        set({
          loggedOut: true,
          loggedIn: false,
          userId: "",
          accessToken: "",
          loginMessage: "",
          showPopupMessage: true,
        }),
      setLoginError: (input: boolean) => set({ loginError: input }),
      setFail: (input: boolean) => set({ fail: input }),
      setSuccess: (input: boolean) => set({ success: input }),
      setLoadingEdit: (input: boolean) => set({ loadingEdit: input }),

      loginUser: async (userName: string, password: string) => {
        set({ loadingUser: true, loginError: false, loggedIn: false });
        const URL_login = "https://josefine-ostlund.onrender.com/users/login";

        try {
          const response = await fetch(URL_login, {
            method: "POST",
            body: JSON.stringify({ userName, password }),
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
          }

          const data = await response.json();

          if (data.accessToken) {
            set({
              userId: data.id,
              accessToken: data.accessToken,
              loginMessage: data.message,
              loggedIn: true,
              loggedOut: false,
              showPopupMessage: true,
            });
          }
        } catch (error) {
          console.error("error in login:", error);
          set({ loginError: true, showPopupMessage: true });
        } finally {
          set({ loadingUser: false });
        }
      },
      fetchAbout: async () => {
        try {
          const response = await fetch(
            "https://josefine-ostlund.onrender.com/about"
          );
          if (!response.ok) throw new Error("Failed to fetch about");
          const data: About = await response.json();
          set({ about: data });
        } catch (error) {
          console.error("Error fetching about:", error);
        }
      },
      updateAbout: async (data: Partial<About>, imageFile?: File) => {
        try {
          let body: FormData | object;

          if (imageFile) {
            const formData = new FormData();

            // Lägg till alla fält utom image
            Object.keys(data).forEach((key) => {
              const value = data[key as keyof About];

              if (key === "image") return;

              // Om array, konvertera till JSON
              if (Array.isArray(value))
                formData.append(key, JSON.stringify(value));
              else if (value !== undefined && value !== null)
                formData.append(key, String(value));
            });

            // Lägg till filen
            formData.append("image", imageFile);
            body = formData;
          } else {
            // Skicka som ren JSON
            body = data;
          }

          const res = await axios.post(
            "https://josefine-ostlund.onrender.com/about",
            body,
            {
              headers: imageFile
                ? undefined
                : { "Content-Type": "application/json" },
            }
          );

          // Backend returnerar alltid fullständig About med alla arrays uppdaterade
          set({
            about: res.data,
            success: true,
            editMode: false,
            showPopupMessage: true,
          });
        } catch (error) {
          set({ fail: true, showPopupMessage: true });
          console.error("patchAbout error:", error);
        }
      },

      /* deleteAboutItem: async (type, id) => {
  try {
    const res = await axios.delete("https://josefine-ostlund.onrender.com/about", { 
      data: { type, id },
    });
    if (res.data) set({ about: res.data, success: true, editMode: false, showPopupMessage: true });
  } catch (error) {
    set({fail: true, showPopupMessage: true})
    console.error("deleteAboutItem error:", error);
  }
}, */

      fetchContact: async () => {
        try {
          const response = await fetch(
            "https://josefine-ostlund.onrender.com/contact"
          );
          if (!response.ok) throw new Error("Failed to fetch contact");
          const data: Contact[] = await response.json();
          set({ contact: data[0] });
        } catch (error) {
          console.error("Error fetching about:", error);
        }
      },

      patchContact: async (data: Partial<Contact>, cvFile?: File) => {
        set({ loadingEdit: true, success: false });

        try {
          let body: FormData | string;
          const headers: HeadersInit = {};

          if (cvFile) {
            // Om CV-fil finns, använd FormData
            const formData = new FormData();

            // Lägg till textfält
            Object.entries(data).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, value);
              }
            });

            // Lägg till fil
            formData.append("cv", cvFile);
            body = formData;
          } else {
            // Annars: skicka som JSON
            body = JSON.stringify(data);
            headers["Content-Type"] = "application/json";
          }

          const response = await fetch(
            `https://josefine-ostlund.onrender.com/contact`,
            {
              method: "PATCH",
              headers,
              body,
            }
          );

          if (!response.ok) throw new Error("Failed to update contact");

          const updated: Contact = await response.json();

          set({
            contact: updated,
            success: true,
            loadingEdit: false,
            showPopupMessage: true,
          });
        } catch (error) {
          console.error("patchContact error:", error);
          set({ loadingEdit: false, fail: true, showPopupMessage: true });
        } finally {
          set({ loadingEdit: false, editMode: false });
        }
      },
    }),
    {
      name: "User-storage",
    }
  )
);
