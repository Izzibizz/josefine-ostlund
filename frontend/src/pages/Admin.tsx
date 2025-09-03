import { useUserStore } from "../stores/UserStore";
import { useNavigate, NavLink } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";
import { useEffect } from "react";

export const Admin: React.FC = () => {
  const { loggedOut, setLoggedOut, showPopupMessage, setShowPopupMessage } =
    useUserStore();
  const navigate = useNavigate();

  const handleLogOut = () => {
    setShowPopupMessage(true);
    setLoggedOut();
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  useEffect(() => {
    if (loggedOut && !showPopupMessage) {
      navigate("/login");
    }
  }, [loggedOut, navigate]);

  return (
    <>
      <section className=" mt-40 w-11/12 laptop:w-9/12 mx-auto">
        <div className=" flex justify-between">
          <h2 className="text-2xl mb-6 font-header text-black">Admin</h2>
                       <button
            onClick={handleLogOut}
            className="p-2 h-10 bg-black rounded-2xl text-white font-body"
          >
            Log out
          </button>
        </div>
        {!showPopupMessage && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <NavLink to="/nytt" aria-label="Link to upload project">
              <div className="bg-white border border-black w-2/3 max-w-[400px] m-auto flex p-4 rounded-2xl mt-20">
                <FiPlusCircle className="w-10 h-10 text-black" />
                <p className="p-2 text-black font-body inline-block ">
                  Add new project
                </p>
              </div>
            </NavLink>
          </div>
        )}
      </section>
    </>
  );
};