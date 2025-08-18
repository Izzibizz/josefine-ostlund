import { useEffect, useState } from "react";
import { useUserStore } from "../stores/UserStore";

export const About: React.FC = () => {
  const { about, fetchAbout } = useUserStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAbout();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  console.log(about);

  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-24 laptop:pt-40 gap-10 bg-white flex flex-col min-h-screen">
      <h2 className="font-header uppercase text-lg">Biografi</h2>
      <div className="flex flex-col laptop:flex-row gap-6 laptop:gap-20">
        {!isMobile && (
          <img
            src={about.image}
            className="w-full laptop:w-1/2 laptop:max-w-[800px]"
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
          <ul>
            <h3 className="font-body font-semibold">Utställningar</h3>
            {about.exhibitions.map((exhibition, index) => (
              <li key={index} className="flex gap-2">
                {exhibition.place && <p>{exhibition.place},</p>}
                {exhibition.city && <p>{exhibition.city},</p>}
                {exhibition.year && <p>{exhibition.year},</p>}
                {exhibition.type && <p>{exhibition.type}</p>}
                {exhibition.with && <p>{exhibition.with}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
