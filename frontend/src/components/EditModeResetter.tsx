import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";

export const EditModeResetter = () => {
  const location = useLocation();
  const setEditMode = useUserStore((s) => s.setEditMode);

  useEffect(() => {
    // varje gång pathen ändras → stäng av editmode
    setEditMode(false);
  }, [location.pathname, setEditMode]);

  return null; // ingen UI, bara logik
}
