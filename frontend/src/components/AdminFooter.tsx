import { useNavigate } from "react-router-dom"
import { useUserStore } from "../stores/UserStore";
import { FiPlus } from "react-icons/fi";

export const AdminFooter: React.FC = () => {

const navigate = useNavigate()
const { setShowPopupMessage, setLoggedOut } = useUserStore()

const handleLogOut = () => {
    setShowPopupMessage(true);
    setLoggedOut();
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <section className="fixed bottom-4 left-4 laptop:bottom-10 laptop:left-10 flex gap-2 font-body" >
         <div className="bg-black text-white rounded-4xl px-3 py-2 cursor-pointer items-center flex gap-1" onClick={() => navigate("/nytt")}><FiPlus /></div>
      <div className="bg-black text-white rounded-4xl px-4 py-2 cursor-pointer" onClick={() => handleLogOut()}>Logga ut</div>
    </section>
  )
}


