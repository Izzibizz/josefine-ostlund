import { useRef, useState, useEffect, useMemo } from "react";
import { useUserStore } from "../stores/UserStore";
import { useLocation } from "react-router-dom";
import { SwiperComp } from "./SwiperComp";
import cancel from "../assets/cancel.svg"

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

interface ImageModalProps {
  image: Image;
  images?: Image[];
  onClose: () => void;
  onUpdatePhotographer?: (id: string, photographer: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, images, onClose, onUpdatePhotographer }) => {
 const modalRef = useRef<HTMLDivElement | null>(null);
 const [photographer, setPhotographer] = useState(image.photographer ?? "");
 const { editMode } = useUserStore()
const location = useLocation();
const showSwiper = !editMode || location.pathname !== "/nytt" && images;

  const initialSlideIndex = useMemo(() => {
    if (!images) return 0;
    return images.findIndex((img) => img.public_id === image.public_id);
  }, [images, image]);

 useEffect(() => {
  setPhotographer(image.photographer ?? "");
}, [image]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose(); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/95 flex  justify-center z-80 cursor-pointer">
      {showSwiper ? (
        <div ref={modalRef} className="w-[90vw] max-w-[1200px] flex flex-col pt-10 laptop:pt-6">
           <img src={cancel} className="w-8 cursor-pointer self-end" onClick={() => onClose()}/>
          <SwiperComp images={images!} initialSlide={initialSlideIndex} />
        </div>
      ) : (
        <div
          ref={modalRef}
          className="flex flex-col max-w-[90vw] max-h-[80vh] gap-4"
        >
          <img
            key={image.public_id}
            src={image.url}
            alt={image.photographer}
            className="object-contain cursor-pointer max-w-[90vw] max-h-[70vh]"
            onClick={onClose}
          />
          {(editMode || location.pathname === "/nytt") && (
            <div className="flex flex-col tablet:flex-row gap-2">
              <input
                className="border p-2 h-10 text-white w-[500px]"
                placeholder="Bildtext"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdatePhotographer?.(image.public_id, photographer);
                    onClose();
                  }}
                  className="bg-gray-300 rounded h-10 px-4 py-2"
                >
                  Lägg till
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-300 rounded h-10 px-4 py-2"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};