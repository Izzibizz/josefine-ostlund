import { useRef, useEffect } from "react";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

interface ImageModalProps {
  image: Image;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
 const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose(); // Close the modal if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-80 cursor-pointer">
      <div ref={modalRef} className="flex flex-col max-w-[90vw] max-h-[80vh]">
        <img
          src={image.url}
          alt={image.photographer}
          className="object-contain cursor-pointer max-w-[90vw] max-h-[80vh]"
          onClick={onClose}
        />
        <p className="text-white font-medium">Fotograf: {image.photographer}</p>
      </div>
    </div>
  );
};
