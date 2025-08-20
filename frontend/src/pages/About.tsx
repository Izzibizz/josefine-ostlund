import { useEffect, useState } from "react";
import { useUserStore } from "../stores/UserStore";
import { useDropzone } from "react-dropzone";

export const About: React.FC = () => {
  const { about, fetchAbout, patchAbout, editMode } = useUserStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [formData, setFormData] = useState(about);
  const [newImage, setNewImage] = useState<File | null>(null);

  const handleDeleteExhibition = (idToDelete: string) => {
    const updatedExhibitions = about.exhibitions.filter(
      (ex) => ex._id !== idToDelete
    );

    patchAbout({ exhibitions: updatedExhibitions });
  };

  const handleDeleteScholarship = (idToDelete: string) => {
    const updatedScholarships = about.scholarships.filter(
      (st) => st._id !== idToDelete
    );

    patchAbout({ scholarships: updatedScholarships });
  };

  const handleAddExhibition = () => {
  const newEx = {
    _id: Date.now().toString(),
    place: "",
    city: "",
    year: null,
    type: "",
    with: "",
  };
  setFormData({ ...formData, exhibitions: [...formData.exhibitions, newEx] });
};

const handleAddScholarship = () => {
  const newSt = {
    _id: Date.now().toString(),
    name: "",
    year: null,
  };
  setFormData({ ...formData, scholarships: [...formData.scholarships, newSt] });
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
 await patchAbout(formData, newImage ?? undefined);
  setNewImage(null); // rensa dropzone
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
    setFormData(about);
  }, [about]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  

  console.log("is editing", editMode);

  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-40 laptop:pt-48 gap-10 bg-white flex flex-col min-h-screen">
      {!editMode ? (
        <>
          <h2 className="font-header uppercase text-lg">Biografi</h2>
          <div className="flex flex-col laptop:flex-row gap-6 laptop:gap-20">
            {!isMobile && (
              <img
                src={about.image}
                className="w-full laptop:w-1/2 laptop:max-w-[800px] object-cover"
                alt="josefine Östlund"
              />
            )}
            <div className="font-body flex flex-col gap-6 text-justify">
              <p>{about.bio_1}</p>
              <p>{about.bio_2}</p>
              {isMobile && (
                <img
                  src={about.image}
                  className="w-full laptop:w-1/2 laptop:max-w-[600px] object-cover"
                  alt="josefine Östlund"
                />
              )}
              <ul className="flex flex-col gap-2">
                <h3 className="font-body font-bold">Utställningar</h3>
                {[...about.exhibitions]
                  .sort((a, b) => Number(b.year) - Number(a.year))
                  .map((ex, i) => (
                    <li key={i}>
                      {[ex.place, ex.city, ex.year].filter(Boolean).join(", ")}
                    </li>
                  ))}
              </ul>
              <ul className="flex flex-col gap-2">
                <h3 className="font-body font-bold">Stipendium</h3>
                {about.scholarships.map((st, i) => (
                  <li key={i}>{st.name && `${st.name}, ${st.year}`}</li>
                ))}
              </ul>
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
                <p>{newImage.name}</p>
              ) : (
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
              )}
            </div>
            <div className="font-body flex flex-col gap-6 text-justify w-full laptop:w-1/2">
              <textarea
                value={formData.bio_1}
                onChange={(e) =>
                  setFormData({ ...formData, bio_1: e.target.value })
                }
                className="border p-2 w-full"
              />
              <textarea
                value={formData.bio_2}
                onChange={(e) =>
                  setFormData({ ...formData, bio_2: e.target.value })
                }
                className="border p-2 w-full"
              />

              <div className="flex flex-col gap-2">
                <h3 className="font-body font-bold">Utställningar</h3>
                {formData.exhibitions.map((ex, i) => (
                  <div key={ex._id} className="flex gap-2 items-center">
                    <input
                      value={ex.place || ""}
                      onChange={(e) => {
                        const newEx = [...formData.exhibitions];
                        newEx[i].place = e.target.value;
                        setFormData({ ...formData, exhibitions: newEx });
                      }}
                      placeholder="Place"
                      className="border p-1"
                    />
                    <select
                      value={ex.year || ""}
                      onChange={(e) => {
                        const newEx = [...formData.exhibitions];
                        newEx[i].year = Number(e.target.value); // 👈 här gör vi conversion
                        setFormData({ ...formData, exhibitions: newEx });
                      }}
                      className="border p-1"
                    >
                      <option value="">Select year</option>
                      {Array.from({ length: 150 }, (_, idx) => {
                        const year = new Date().getFullYear() - idx;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteExhibition(ex._id)}
                      className="bg-black text-white rounded-4xl px-4 py-2 cursor-pointer"
                    >
                      Delete
                    </button>
                    
                  </div>
                  
                ))}
                <button
    type="button"
    onClick={handleAddExhibition}
    className="bg-gray-200 rounded-4xl px-4 py-2 w-fit mt-2 cursor-pointer"
  >
    + Lägg till utställning
  </button>
              </div>

              <div>
                <h3 className="font-body font-bold">Stipendium</h3>
                {formData.scholarships.map((st, i) => (
                  <div key={st._id} className="flex gap-2 items-center">
                    <input
                      value={st.name || ""}
                      onChange={(e) => {
                        const newSt = [...formData.scholarships];
                        newSt[i].name = e.target.value;
                        setFormData({ ...formData, scholarships: newSt });
                      }}
                      placeholder="Name"
                      className="border p-1"
                    />
                     <select
                      value={st.year || ""}
                      onChange={(e) => {
                        const newSt = [...formData.scholarships];
                        newSt[i].year = Number(e.target.value);
                        setFormData({ ...formData, scholarships: newSt });
                      }}
                      className="border p-1"
                    >
                      <option value="">Select year</option>
                      {Array.from({ length: 150 }, (_, idx) => {
                        const year = new Date().getFullYear() - idx;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteScholarship(st._id)}
                      className="bg-black text-white rounded-4xl px-4 py-2 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <button
    type="button"
    onClick={handleAddScholarship}
    className="bg-gray-200 rounded-4xl px-4 py-2 w-fit mt-2 cursor-pointer"
  >
    + Lägg till stipendium
  </button>
              </div>

              <button
                type="submit"
                className="bg-black text-white rounded-4xl px-4 py-2 cursor-pointer w-fit"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};
