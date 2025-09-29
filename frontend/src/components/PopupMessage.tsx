import { useUserStore } from "../stores/UserStore";
import { useProjectStore } from "../stores/ProjectsStore";
import { useEffect } from "react";
import loading from "../assets/loading_gray.gif"
import done from "../assets/Done.gif"
import failed from "../assets/Failed.gif"


export const PopupMessage = () => {
  const {
    loggedIn,
    loggedOut,
    setShowPopupMessage,
    loginError,
    loadingUser,
    setLoginError,
    success,
    fail,
    loadingEdit,
    setSuccess,
    setFail,
    setLoadingEdit,
  } = useUserStore();

  const { setDeleteFail, deleteFail, deleteSuccess, setDeleteSuccess, orderSuccess, setOrderSuccess } =
    useProjectStore();

  const getMessage = () => {
    if (loginError) return "Fel inloggningsuppgifter";
    if (loadingEdit) return "";
    if (deleteSuccess) return "Projektet har raderats";
    if (success) return "Dina ändringar har sparats";
    if (deleteFail) return "Kunde inte radera projektet";
    if (fail) return "Kunde inte spara, prova igen";
    if (orderSuccess) return "";
    if (loggedIn) return `Välkommen!`;
    if (loggedOut) return "Du är nu utloggad";

    return "";
  };

  const getAnimation = () => {
    if (loginError || fail || deleteFail) return failed;
    if (loadingEdit || loadingUser) return loading ;
    return done;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoadingEdit(false);
      setFail(false);
      setShowPopupMessage(false);
      setLoginError(false);
      setDeleteFail(false);
      setDeleteSuccess(false);
      setSuccess(false);
      setOrderSuccess(false)
    }, 3000);
  }, [success, loginError, fail, loggedIn, loggedOut, loadingEdit]);


  return (
    <div className="fixed top-0 left-0 w-full h-full bg-overlay backdrop-blur-sm  flex items-center justify-center z-50 animate-fadeIn">
      <div className="w-10/12 tablet:w-1/2 laptop:w-1/4 mb-52 tablet:mb-72 laptop:mb-52 rounded-lg bg-medium-white backdrop-blur-base px-2 py-6 tablet:p-8 relative flex flex-col items-center justify-center justify-between">
        <div className="font-heading bg-white font-header p-4 px-6 flex flex-col justify-center items-center">
          <h2 className="text-sm tablet:text-base bg-4 text-center">{getMessage()}</h2>
          <img
            src={getAnimation()}
            className="w-20 h-20"
          /> 
        </div>
      </div>
    </div>
  );
};
