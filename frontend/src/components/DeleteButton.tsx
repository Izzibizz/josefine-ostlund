import { useState } from "react";
import { useProjectStore } from "../stores/ProjectsStore"
interface DeleteButtonProps {
  projectId?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ projectId }) => {
  const [expanded, setExpanded] = useState(false);
  const { deleteProject } = useProjectStore();

  const handleClick = async () => {
    if (expanded && projectId) {
      // ✅ klick när den är expanderad = radera
      await deleteProject(projectId);
    } else {
      // ✅ klick första gången = expandera
      setExpanded(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onBlur={() => setExpanded(false)} // stäng när man klickar utanför
      className={`z-20 rounded-4xl px-4 py-2 self-end cursor-pointer transition-all duration-300
        ${expanded ? "bg-red-600 text-white w-32" : "bg-red-600 text-white"}`}
    >
      {expanded ? "bekräfta" : "radera"}
    </button>
  );
};
