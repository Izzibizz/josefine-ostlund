import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Exhibition {
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
}

interface About {
  bio_1: string;
  bio_2: string;
  exhibitions: Exhibition[];
  scholarships: Scholarship[];
  image: string;
}

interface Contact {
  telefon: string;
  mail: string;
  instagram: string;
  cv: string;
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

  setEditMode: (value: boolean) => void;
  setLoggedIn: () => void;
  setLoggedOut: () => void;
  setShowPopupMessage: (input: boolean) => void;
  setLoginError: (input: boolean) => void;
  loginUser: (userName: string, password: string) => Promise<void>;
  fetchAbout: () => Promise<void>;
  patchAbout: (data: Partial<About>, imageFile?: File) => Promise<void>;
  fetchContact: () => Promise<void>;
  patchContact: (data: Partial<Contact>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get): UserState => ({
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
        exhibitions: [],
        scholarships: [],
        image: "",
      },
      contact: {
        telefon: "",
        mail: "",
        instagram: "",
        cv: "",
      },
      editMode: false,
      loadingEdit: false,
      success: false,

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
      patchAbout: async (data: Partial<About>, imageFile?: File) => {
        try {
          const current = get().about;

          let body: BodyInit;
          const headers: HeadersInit = {};

          // 🔹 Om det finns en fil → använd FormData
          if (imageFile) {
            const formData = new FormData();
            Object.keys(data).forEach((key) => {
              const value = data[key as keyof About];
              if (key === "image") return;

              if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value)); // alltid stringify arrays
              } else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
              }
            });

            if (imageFile) formData.append("image", imageFile);
            body = formData;
          } else {
            body = JSON.stringify({ ...current, ...data });
            headers["Content-Type"] = "application/json";
          }

          const res = await fetch(
            "https://josefine-ostlund.onrender.com/about",
            {
              method: "PATCH",
              headers,
              body,
            }
          );

          if (!res.ok) throw new Error("Failed to update about");

          const updated: About = await res.json();
          set({ about: updated });
        } catch (error) {
          console.error("patchAbout error:", error);
        }
      },

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
      patchContact: async (data) => {
        set({ loadingEdit: true, success: false });
        try {
          const response = await fetch(
            `https://josefine-ostlund.onrender.com/contact`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          );
          if (!response.ok) throw new Error("Failed to update about");
          const updated: Contact = await response.json();
          set({ contact: updated, success: true, loadingEdit: false });
        } catch (error) {
          console.error(error);
          set({ success: false });
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
