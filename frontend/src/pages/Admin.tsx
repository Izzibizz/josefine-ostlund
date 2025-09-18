import { useUserStore } from "../stores/UserStore";
import { useNavigate, NavLink } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";
import { useEffect } from "react";

export const Admin: React.FC = () => {
  const { loggedOut, showPopupMessage } =
    useUserStore();
  const navigate = useNavigate();


  useEffect(() => {
    if (loggedOut && !showPopupMessage) {
      navigate("/login");
    }
  }, [loggedOut, navigate]);

  return (
    <>
      <section className=" mt-40 w-11/12 laptop:w-9/12 mx-auto">
        <h2 className="text-2xl mb-6 font-header text-black">Admin</h2>
        {!showPopupMessage && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <NavLink to="/nytt" aria-label="Link to upload project">
              <div className="bg-white border border-black w-2/3 max-w-[400px] m-auto flex p-4 rounded-2xl mt-20">
                <FiPlusCircle className="w-10 h-10 text-black" />
                <p className="p-2 text-black font-body inline-block ">
                  Nytt projekt
                </p>
              </div>
            </NavLink>
          </div>
        )}
      </section>
    </>
  );
};
