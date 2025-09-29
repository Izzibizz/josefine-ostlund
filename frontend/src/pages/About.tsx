import { useEffect, useState } from "react";
import { useUserStore } from "../stores/UserStore";
import { useDropzone } from "react-dropzone";
import { TextEditor } from "../components/Texteditor";

/* interface Exhibition {
  place: string;
  city?: string | null;
  year?: number | null;
  type?: string;
  with?: string;
  _id: string;
}

interface Scholarship {
  name: string;
  year?: number | null;
  _id: string;
} */

interface About {
  bio_1: string;
  bio_2: string;
  exhibitions: string;
  scholarships: string;
  image: string;
}

export const About: React.FC = () => {
  const { about, fetchAbout, updateAbout, editMode } = useUserStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1025);
  const [newImage, setNewImage] = useState<File | null>(null);

  const defaultAbout: About = {
    bio_1: "",
    bio_2: "",
    exhibitions: "",
    scholarships: "",
    image: "",
  };
  const [formData, setFormData] = useState<About>(defaultAbout);

  /* const handleDeleteExhibition = (idToDelete: string) => {
  setFormData((prev) => ({
    ...prev,
    exhibitions: prev.exhibitions.filter((ex) => ex._id !== idToDelete),
  }));
}; */

  /* const handleDeleteScholarship = (idToDelete: string) => {
  setFormData((prev) => ({
    ...prev,
    scholarships: prev.scholarships.filter((st) => st._id !== idToDelete),
  }));
}; */

  /* const handleAddExhibition = () => {
  const newEx = {
    _id: Date.now().toString(), // temporärt id
    place: "",
    city: "",
    year: null,
    type: "",
    with: ""
  };

  setFormData((prev) => ({
    ...prev,
    exhibitions: [...prev.exhibitions, newEx],
  }));
};

const handleAddScholarship = () => {
  const newSt = {
    _id: Date.now().toString(), 
    name: "",
    year: null,
  };

  setFormData((prev) => ({
    ...prev,
    scholarships: [...prev.scholarships, newSt],
  }));
}; */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newImage) {
      await updateAbout(formData, newImage);
    } else {
      await updateAbout(formData);
    }

    setNewImage(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setNewImage(acceptedFiles[0]),
  });

  useEffect(() => {
    const fetchData = async () => {
      await fetchAbout();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (about) {
      setFormData(about);
    }
  }, [about]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1025);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-40 gap-10 bg-white flex flex-col min-h-screen">
      {!editMode ? (
        <>
          <h2 className="font-header uppercase text-lg">Biografi</h2>
          <div className="flex flex-col laptop:flex-row gap-6 laptop:gap-20">
            {!isMobile && about.image && (
              <img
                src={about.image}
                className="w-full laptop:w-1/3 laptop:max-w-[500px] self-start object-contain"
                alt="josefine Östlund"
              />
            )}
            <div className="font-body flex flex-col gap-6 text-justify">
              <div
                className="desctext"
                dangerouslySetInnerHTML={{ __html: about.bio_1 }}
              />
              <div
                className="desctext"
                dangerouslySetInnerHTML={{ __html: about.bio_2 }}
              />
              {isMobile && about.image && (
                <img
                  src={about.image}
                  className="w-full object-cover"
                  alt="josefine Östlund"
                />
              )}
              <div
                className="desctext"
                dangerouslySetInnerHTML={{ __html: about.exhibitions }}
              />
              <div
                className="desctext"
                dangerouslySetInnerHTML={{ __html: about.scholarships }}
              />
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="">
          <h2 className="font-header uppercase text-lg">Biografi</h2>
          <div className="flex flex-col laptop:flex-row gap-6 laptop:gap-20">
            <div
              {...getRootProps()}
              className="border-2 w-full laptop:w-1/2 flex flex-col gap-4 items-center justify-center cursor-pointer relative"
            >
              <input {...getInputProps()} />
              {newImage ? (
                <img
                  src={URL.createObjectURL(newImage)}
                  alt="preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                formData.image && (
                  <>
                    <img
                      src={formData.image}
                      alt="preview"
                      className="object-cover w-full h-full"
                    />
                    <p className="bg-white rounded-4xl px-4 py-2 absolute">
                      Tryck eller släpp bild här för att ladda upp ny
                    </p>
                  </>
                )
              )}
            </div>
            <div className="font-body flex flex-col gap-6 text-justify w-full laptop:w-1/2">
              <h3 className="font-body font-bold">Intro</h3>
              <TextEditor
                value={formData.bio_1}
                onChange={(html) => setFormData({ ...formData, bio_1: html })}
              />
              <h3 className="font-body font-bold">Beskrivning</h3>
              <TextEditor
                value={formData.bio_2}
                onChange={(html) => setFormData({ ...formData, bio_2: html })}
              />

              <div className="flex flex-col gap-2">
                <h3 className="font-body font-bold">Utställningar</h3>
                <TextEditor
                  value={formData.exhibitions}
                  onChange={(html) =>
                    setFormData({ ...formData, exhibitions: html })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-body font-bold">Stipendier</h3>
                <TextEditor
                  value={formData.scholarships}
                  onChange={(html) =>
                    setFormData({ ...formData, scholarships: html })
                  }
                />
              </div>

              <button
                type="submit"
                className="bg-black text-white rounded-4xl px-4 py-2 cursor-pointer w-fit"
              >
                Spara
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};
