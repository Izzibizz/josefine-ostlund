import { forwardRef } from "react"

interface MenuToggleProps {
    isOpen: boolean;
    color: boolean;
    toggleMenu: () => void;
    buttonRef?: React.Ref<HTMLButtonElement>;
  }
  
  export const MenuToggle = forwardRef<HTMLButtonElement, MenuToggleProps>(
    ({ isOpen, toggleMenu, color }, ref) => {
      


      return (
        <button
          ref={ref}
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          className="relative w-10 h-10 z-50 cursor-pointer" 
        >
          <span
            className={`absolute block h-0.5 w-full ${color? "bg-white" : "bg-black"} transition-transform duration-300 
              ${isOpen? "top-1/2 -translate-y-1/2 rotate-45 bg-white": "top-1/3"}`}
          ></span>

          <span
            className={`absolute block h-0.5 w-full ${color? "bg-white" : "bg-black"} transition-transform duration-300 
              ${isOpen? "top-1/2 -translate-y-1/2 -rotate-45 bg-white" : "top-2/3 translate-x-2"}`}
          ></span>
        </button>
      );
    }
  );
  

  MenuToggle.displayName = "MenuToggle";