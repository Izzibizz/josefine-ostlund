import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUserStore } from "../stores/UserStore";
import { FiPlus } from "react-icons/fi";
import done from "../assets/check.png"
import pen from "../assets/pencil-edit.svg";

export const AdminFooter: React.FC = () => {
  const navigate = useNavigate();
  const { setShowPopupMessage, setLoggedOut, editMode, setEditMode } = useUserStore();
  const [showPlus, setShowPlus] = useState(false);
  const [ showPen, setShowPen ] = useState(false)

  const handleLogOut = () => {
    setShowPopupMessage(true);
    setLoggedOut();
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };


  useEffect(() => {
    const path = location.pathname; 
    if (
      path.includes("performance") ||
      path.includes("utstallningar") ||
      path.includes("skulpturer")
    ) {
      setShowPlus(true);
    } else {
      setShowPlus(false);
    }
  }, [location.pathname]);

   useEffect(() => {
    const path = location.pathname; 
    const genres = ["performance", "utstallningar", "skulpturer"];

    const segments = path.split("/").filter(Boolean); 

    if (genres.includes(segments[0]) && segments.length > 1 || path.includes("bio") || path.includes("kontakt")) {
      setShowPen(true);
    } else {
      setShowPen(false);
    }
  }, [location.pathname]);

    console.log("is editing", editMode);

  return (
    <section className="fixed bottom-4 right-4 laptop:bottom-10 laptop:right-10 flex gap-2 font-body">
      
      {showPlus && !editMode && (
        <div
          className="bg-black text-white rounded-4xl px-3 py-2 cursor-pointer items-center flex gap-1"
          onClick={() => navigate("/nytt")}
        >
          <FiPlus />
        </div>
      )}
      {showPen && (
        <img src={editMode ? done : pen} className="w-10 cursor-pointer" onClick={() => setEditMode(!editMode)}/>
      )}
      <div
        className="bg-black text-white rounded-4xl px-4 py-2 cursor-pointer"
        onClick={() => handleLogOut()}
      >
        Logga ut
      </div>
    </section>
  );
};
