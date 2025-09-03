import { useUserStore } from "../stores/UserStore";
/* import { useProjectStore } from "../stores/ProjectsStore"; */
import { useEffect } from "react";
import Lottie from "lottie-react";
import greenAnimation from "../assets/Animation-green-done.json";
import redAnimation from "../assets/fail-animation.json";
import loadingAnimation from "../assets/Circle-loading-Animation.json"

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
    setLoadingEdit
  } = useUserStore();

  const animationCloneGreen = JSON.parse(JSON.stringify(greenAnimation));
  const animationCloneRed = JSON.parse(JSON.stringify(redAnimation));
  const animationCloneLoad = JSON.parse(JSON.stringify(loadingAnimation));


  const getMessage = () => {
    if (loginError) return "Fel inloggningsuppgifter";
    if (loadingEdit) return ""
    if (success) return "Ditt projekt har sparats";
    if (fail) return "Kunde inte spara, prova igen"; 
    if (loggedIn) return `Välkommen!`;
    if (loggedOut) return "Du är nu utloggad";

    return "";
  };


  const getAnimation = () => {
    if (loginError || fail ) return animationCloneRed;
     if ( loadingEdit ||  loadingUser) return animationCloneLoad; 
    return animationCloneGreen;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setSuccess(false)
      setLoadingEdit(false)
      setFail(false)
      setShowPopupMessage(false);
      setLoginError(false);
    }, 3000);
  }, [success, loginError, fail, loggedIn, loggedOut, loadingEdit] );


  console.log(loginError)

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-overlay backdrop-blur-sm  flex items-center justify-center z-50 animate-fadeIn">
      <div className="w-10/12 tablet:w-1/2 laptop:w-1/4 mb-52 tablet:mb-72 laptop:mb-52 rounded-lg bg-medium-white backdrop-blur-base px-2 py-6 tablet:p-8 relative flex flex-col items-center justify-center justify-between">
        <div className="font-heading text-text-light">
          <h2 className="text-sm tablet:text-base mb-4">{getMessage()}</h2>
        </div>
       {/*  {deleteValidationProcess ? (
           <div className="flex gap-8"><button type="button" className="bg-peach hover:bg-main-dark p-2 px-4 rounded-xl text-main-white" onClick={()=> confirmDelete()}>Yes</button>
          <button type="button" className="bg-peach hover:bg-main-dark p-2 px-4 rounded-xl text-main-white" onClick={()=> abortDelete()}>No</button></div>
        ) : ( */}
          <Lottie
            animationData={getAnimation()}
            loop={false}
            autoPlay
            style={{ width: 100, height: 100 }}
          />
      {/*   )} */}
      </div>
    </div>
  );
};
