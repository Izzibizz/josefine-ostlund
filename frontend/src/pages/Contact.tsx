import { useUserStore } from "../stores/UserStore";
import { useDropzone } from "react-dropzone";
import { useEffect, useState, useCallback } from "react";
import cv from "../assets/cv.svg";
import mail from "../assets/mail.svg";
import insta from "../assets/insta.svg";
import phone from "../assets/phone.svg";
import cancel from "../assets/cancel.png"

export const Contact: React.FC = () => {
  const {
    contact,
    fetchContact,
    editMode,
    patchContact,
  } = useUserStore();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    telefon: "",
    mail: "",
    instagram: "",
    cv: "",
  });

    const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
      setFileName(file.name);
    } else {
      alert("Endast PDF-filer är tillåtna.");
    }
  }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  useEffect(() => {
    fetchContact();
  }, []);

  useEffect(() => {
    if (contact && contact.telefon !== undefined) {
      setFormData(contact);
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
    await patchContact(formData, cvFile || undefined);
    setCvFile(null); // 
    setFileName(null);
  };

  console.log(contact.cv);

  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-40 laptop:pt-0 gap-16 max-w-[1300px] laptop:mx-auto bg-white flex flex-col laptop:justify-center h-screen">
      <h2 className="font-header uppercase text-lg">Kontakt</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 font-body">
        <ul className={`flex flex-col ${editMode ? "laptop:flex-col" : "laptop:flex-row laptop:gap-14"} gap-8 justify-between font-body w-full`}>
          <li className="w-full flex gap-2 items-center w-fit">
            {editMode ? (
              <>
              <img src={phone} className="w-6" />
              <input
                type="text"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                className="border-b border-gray-300 px-1 py-0.5 w-full laptop:w-fit"
              />
              </>
            ) : (
              <a href={`tel:${contact.telefon}`} className="flex gap-2 items-center">
                <img src={phone} className="w-6" />
                {contact.telefon}</a>
            )}
          </li>

          <li className="w-full flex gap-2 items-center w-fit">
            {editMode ? (
              <>
              <img src={mail} className="w-6" />
              <input
                type="email"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                className="border-b border-gray-300 px-1 py-0.5 w-full laptop:w-fit"
              />
              </>
            ) : (
              <a href={`mailto:${contact.mail}`} className="flex gap-2 items-center">
                            <img src={mail} className="w-6" />
                            {contact.mail}</a>
            )}
          </li>

          <li className="w-full flex gap-2 items-center">
            {editMode ? (
              <>
               <img src={insta} className="w-6" />
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="border-b border-gray-300 px-1 py-0.5 w-full laptop:w-fit min-w-[400px]"
              />
              </>
            ) : (
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className=" flex gap-2 items-center"
              >           
               <img src={insta} className="w-6" />
                Josefine.ostlund
              </a>
            )}
          </li>

          <li>
          
           {editMode ? (
              <div className="w-full flex gap-2 items-center">
                  <img src={cv} className="w-6" />
                <div
                  {...getRootProps()}
                  className="border border-dashed border-gray-400 p-2 rounded cursor-pointer bg-gray-50 hover:border-black transition w-fit max-w-[400px]"
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Släpp CV-filen här...</p>
                  ) : (
                    <p>
                      {fileName
                        ? `Vald fil: ${fileName}`
                        : "Dra & släpp eller klicka för att välja CV (PDF)"}
                    </p>
                  )}
                </div>
               {fileName && <button onClick={() => setCvFile(null)}>  <img src={cancel} className="w-4 cursor-pointer"/></button>
 } </div>
            ) : (
              <a href={contact.cv} className=" flex gap-2 items-center">
                  <img src={cv} className="w-6" />
                Fullständigt CV
              </a>
            )}
          </li>
        </ul>
        

        {editMode && (
          <button
            type="submit"
            className="mt-4 laptop:mt-0 bg-black text-white px-4 py-2 rounded-4xl self-end laptop:self-start cursor-pointer"
          >
            Spara
          </button>
        )}
      </form>
    </section>
  );
};
