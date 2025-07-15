
import { Route, Routes } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { ProjectsOverview } from "../pages/ProjectsOverview"
import { SingleProject } from "../pages/SingleProject"
import { NotFound } from "../pages/NotFound";
import { About } from "../pages/About"
import { Contact } from "../pages/Contact"



export const MainRoutes: React.FC = () => {
  return (
    <div>
        <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/projects" element={<ProjectsOverview/>}/>
        <Route path="/projects/:id" element={<SingleProject/>} />
        <Route path="/*" element={<NotFound/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
        </Routes>
    </div>
  )
}

