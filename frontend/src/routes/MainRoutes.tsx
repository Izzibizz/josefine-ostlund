import { Route, Routes } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { SingleProject } from "../pages/SingleProject";
import { NotFound } from "../pages/NotFound";
import { About } from "../pages/About";
import { Contact } from "../pages/Contact";
import { Login } from "../pages/Login";
import { ProjectsOverview } from "../pages/ProjectsOverview";
import { Admin } from "../pages/Admin";
import { CreateProject } from "../pages/CreateProject";

export const MainRoutes: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/bio" element={<About />} />
        <Route path="/kontakt" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/nytt" element={<CreateProject />} />

        <Route
          path="/utstallningar"
          element={<ProjectsOverview category="utställningar" />}
        />
        <Route
          path="/performance"
          element={<ProjectsOverview category="performance" />}
        />
        <Route
          path="/skulpturer"
          element={<ProjectsOverview category="skulpturer" />}
        />

        <Route path="/:category/:id" element={<SingleProject />} />

        <Route path="/*" element={<NotFound />} />
      </Routes>
    </div>
  );
};
