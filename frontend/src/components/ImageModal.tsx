import { useRef, useState, useEffect } from "react";
import { useUserStore } from "../stores/UserStore";
import { useLocation } from "react-router-dom";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

interface ImageModalProps {
  image: Image;
  onClose: () => void;
  onUpdatePhotographer?: (id: string, photographer: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose, onUpdatePhotographer }) => {
 const modalRef = useRef<HTMLDivElement | null>(null);
 const [photographer, setPhotographer] = useState(image.photographer ?? "");
 const { editMode } = useUserStore()
const location = useLocation();


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


  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-80 cursor-pointer">
      <div ref={modalRef} className="flex flex-col max-w-[90vw] max-h-[80vh] gap-4">
        <img
        key={image.public_id} 
          src={image.url}
          alt={image.photographer}
          className={`object-contain cursor-pointer max-w-[90vw] ${editMode ? "max-h-[70vh]" : "max-h-[80vh]"}`}
          onClick={onClose}
        />
        {editMode || location.pathname === "/nytt" ? (
          <div className="flex flex-col tablet:flex-row gap-2">
            <input
              className="border p-2 h-10 text-white"
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
                Spara
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 rounded h-10 px-4 py-2"
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
        image.photographer && <p className="text-white font-medium">{image.photographer}</p>
        )}
      </div>
    </div>
  );
};
