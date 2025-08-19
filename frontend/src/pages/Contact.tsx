import { useUserStore } from "../stores/UserStore";
import { useEffect, useState } from "react";
import cv from "../assets/cv.svg";
import mail from "../assets/mail.svg";
import insta from "../assets/insta.svg";
import phone from "../assets/phone.svg";

export const Contact: React.FC = () => {
  const { contact, fetchContact, editMode, patchContact, success, loadingEdit } = useUserStore();
  const [formData, setFormData] = useState({
    telefon: "",
    mail: "",
    instagram: "",
    cv: "",
  });

 
  useEffect(() => {
    fetchContact();
  }, []);

     useEffect(() => {
    if (contact.length > 0) {
      setFormData(contact[0]);
    }
  }, [contact]);


   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await patchContact(formData);
  };

  console.log(success, loadingEdit);

  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-40 laptop:pt-48 gap-16 laptop:gap-32 max-w-[1300px] laptop:mx-auto bg-white flex flex-col min-h-screen">
      <h2 className="font-header uppercase text-lg">Kontakt</h2>

      <form onSubmit={handleSubmit} className="flex flex-col laptop:flex-row gap-8 laptop:gap-40 justify-between font-body">
        <ul className="flex flex-col laptop:flex-row gap-8 laptop:gap-40 justify-between font-body w-full">
          <li className="flex gap-2 items-center">
            <img src={phone} className="w-6" />
            {editMode ? (
              <input
                type="text"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                className="border-b border-gray-300 px-1 py-0.5 w-full"
              />
            ) : (
              <a href={`tel:${contact[0].telefon}`}>{contact[0].telefon}</a>
            )}
          </li>

          <li className="flex gap-2 items-center">
            <img src={mail} className="w-6" />
            {editMode ? (
              <input
                type="email"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                className="border-b border-gray-300 px-1 py-0.5 w-full"
              />
            ) : (
              <a href={`mailto:${contact[0].mail}`}>{contact[0].mail}</a>
            )}
          </li>

          <li className="flex gap-2 items-center">
            <img src={insta} className="w-6" />
            {editMode ? (
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="border-b border-gray-300 px-1 py-0.5 w-full"
              />
            ) : (
              <a href={contact[0].instagram} target="_blank" rel="noopener noreferrer">
                Josefine.ostlund
              </a>
            )}
          </li>

          <li className="flex gap-2 items-center">
            <img src={cv} className="w-6" />
            {editMode ? (
              <input
                type="text"
                name="cv"
                value={formData.cv}
                onChange={handleChange}
                className="border-b border-gray-300 px-1 py-0.5 w-full"
              />
            ) : (
              <a href={contact[0].cv} target="_blank" rel="noopener noreferrer">
                Fullständigt CV
              </a>
            )}
          </li>
        </ul>

        {editMode && (
          <button
            type="submit"
            className="mt-4 laptop:mt-0 bg-black text-white px-4 py-2 rounded-4xl self-start cursor-pointer"
          >
            Spara
          </button>
        )}
      </form>
    </section>
  );
};
