import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  // Actions
  setLoggedIn: () => void;
  setLoggedOut: () => void;
  setShowPopupMessage: (input: boolean) => void;
  setLoginError: (input: boolean) => void;
  loginUser: (userName: string, password: string) => Promise<void>;
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

      setLoggedIn: () => set({ loggedIn: true, loggedOut: false }),
      setShowPopupMessage: (input: boolean) =>
        set({ showPopupMessage: input }),
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
    }),
    {
      name: "User-storage",
    }
  )
);
