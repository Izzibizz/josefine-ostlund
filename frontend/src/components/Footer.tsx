import { useUserStore } from "../stores/UserStore";
import { useEffect } from "react";
import insta from "../assets/insta.svg";
import mail from "../assets/mail.svg";
import phone from "../assets/phone.svg";
import { LiaCopyright } from "react-icons/lia";

export const Footer: React.FC = () => {
  const { contact, fetchContact } = useUserStore();


    useEffect(() => {
      fetchContact();
    }, []);

   

  return (
    <footer className="p-1 px-4 flex justify-between">
      <div className="flex gap-3 laptop:gap-4 items-center">
        <a href={contact.instagram} target="_blank" rel="noopener noreferrer">
          <img src={insta} className="w-4 laptop:w-6" />
        </a>
        <a href={`tel:${contact.telefon}`}>
          {" "}
          <img src={phone} className="w-4 laptop:w-6" />
        </a>
        <a href={`mailto:${contact.mail}`}>
          <img src={mail} className="w-4 laptop:w-6" />
        </a>
      </div>
      <div className="flex gap-3 items-center">
        <p className=" font-body flex gap-1 items-center">
          {" "}
          <LiaCopyright className="w-3"/>
          <span className="text-[8px] leading-none tracking-tight select-none">Josefine Östlund 2025</span>
        </p>
        <a
          href="http://izabellind.com"
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex gap-2 items-center text-[8px] after:content-[''] after:block after:w-0 after:h-[1px] after:bg-stone-600 after:absolute after:left-0 after:bottom-0 after:transition-all after:duration-300 hover:after:w-full"
        >
          {" "}
          Design & utveckling 2025 | itFlows
        </a>
      </div>
    </footer>
  );
};
