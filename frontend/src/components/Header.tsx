import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { displayCategory } from "./CategoryUtils";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { MenuToggle } from "./MenuToggle";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [smallerHeader, setSmallerHeader] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1025);
  const [homePage, setHomePage] = useState(false);
  const [textWhite, setTextWhite] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const navlinks = [
    { name: displayCategory("skulpturer"), path: "/skulpturer" },
    { name: displayCategory("performance"), path: "/performance" },
    { name: displayCategory("utställningar"), path: "/utstallningar" },
    { name: "biografi", path: "/bio" },
    { name: "kontakt", path: "/kontakt" },
  ];

  const logoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (currentPath === "/") {
      setTextWhite(true);
      setHomePage(true);
    } else {
      setTextWhite(false);
      setHomePage(false);
    }
  }, [currentPath]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setSmallerHeader(true);
      } else {
        setSmallerHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target) &&
        !(buttonRef.current && buttonRef.current.contains(event.target))
      ) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 w-screen font-header flex justify-between p-4 tablet:p-6 laptop:px-8 items-center z-70 ${
        textWhite ? "text-white" : "text-black bg-white"
      } ${isMobile && homePage && "justify-end"}`}
    >
      {isMobile ? (
        <>
          {!homePage && (
            <h1
              className={`${
                smallerHeader ? "text-sm" : "text-base"
              } cursor-pointer hover:scale-105`}
              onClick={() => logoClick()}
            >
              JOSEFINE ÖSTLUND
            </h1>
          )}
          <MenuToggle
            isOpen={isOpen}
            toggleMenu={toggleMenu}
            ref={buttonRef}
            color={textWhite}
          />
          <AnimatePresence>
            {isOpen && isMobile && (
              <motion.div
                initial={{ clipPath: "circle(5% at 100% 0%)" }}
                animate={{ clipPath: "circle(150% at 50% 50%)" }}
                exit={{ clipPath: "circle(5% at 100% 0%)" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className={`fixed top-0 right-0 h-screen w-screen overflow-hidden bg-black text-2xl backdrop-blur-xl flex justify-end px-10 `}
                ref={dropdownRef}
              >
                <ul className="flex flex-col laptop:flex-row items-end gap-5 font-header uppercase text-white absolute bottom-26 tablet:bottom-40 animate-fadeIn">
                  {navlinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={closeMenu}
                      className="hover:scale-105 transform transition-transform duration-100"
                    >
                      {link.name}
                    </NavLink>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <>
          <ul
            className={`flex gap-10 ${
              homePage ? "text-lg" : "text-sm"
            } uppercase`}
          >
            {navlinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className="hover:scale-105 transform transition-transform duration-100"
              >
                {link.name}
              </NavLink>
            ))}
          </ul>
          {!homePage && (
            <h1
              className={`${
                smallerHeader ? "text-xl" : "text-2xl"
              } cursor-pointer hover:scale-105 text-end transform transition-transform duration-100`}
              onClick={() => logoClick()}
            >
              JOSEFINE ÖSTLUND
            </h1>
          )}
        </>
      )}
    </header>
  );
};
