import { Route, Routes } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { SingleProject } from "../pages/SingleProject";
import { NotFound } from "../pages/NotFound";
import { About } from "../pages/About";
import { Contact } from "../pages/Contact"; 
import { Login } from "../pages/Login"
import { ProjectsOverview } from "../pages/ProjectsOverview";
import { Admin } from "../pages/Admin";


export const MainRoutes: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/*" element={<NotFound />} />
        <Route path="/bio" element={<About />} />
        <Route path="/kontakt" element={<Contact />} />
        <Route path="/login" element={<Login />} />
         <Route path="/admin" element={<Admin />} />

        <Route path="/utstallningar" element={<ProjectsOverview category="utställningar" />} />
        <Route path="/performance" element={<ProjectsOverview category="performance"/>} />
        <Route path="/skulpturer" element={<ProjectsOverview category="skulpturer"/>} />

        <Route path="/utstallningar/:id" element={<SingleProject />} />
        <Route path="/performance/:id" element={<SingleProject />} />
        <Route path="/skulpturer/:id" element={<SingleProject />} />
      </Routes>
    </div>
  );
};
