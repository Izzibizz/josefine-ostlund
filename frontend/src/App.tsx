import { Header } from "./components/Header"
import { MainRoutes } from "./routes/MainRoutes";
import { Footer } from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { useProjectStore } from "./stores/ProjectsStore"; 
import { useUserStore } from "./stores/UserStore";
import { useEffect } from "react"
import { AdminFooter } from "./components/AdminFooter";
import { EditModeResetter } from "./components/EditModeResetter";
import { PopupMessage } from "./components/PopupMessage";


const App = () => {

const fetchProjects = useProjectStore((state) => state.fetchProjects);
const { loggedIn, showPopupMessage } = useUserStore()

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <>
    <ScrollToTop />
    <EditModeResetter/>
    {showPopupMessage && <PopupMessage />}
    <div className="max-w-screen min-h-screen flex flex-col overflow-hidden relative">
      <Header />
      <main className="flex-grow mb-20">
        <MainRoutes />
      </main>
      {loggedIn && <AdminFooter />}
      <Footer />
    </div>
    </>
  );
};

export default App
