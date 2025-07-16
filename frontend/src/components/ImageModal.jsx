import { useRef, useEffect } from "react";

export const ImageModal = ({ src, onClose, alt }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Close the modal if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 cursor-pointer">
      <div ref={modalRef} className="flex flex-col max-w-[90vw] max-h-[80vh]">
        <img
          src={src}
          alt={alt}
          className="object-contain cursor-pointer max-w-[90vw] max-h-[80vh]"
          onClick={onClose}
        />
        <p className="text-white font-medium">{alt}</p>
      </div>
    </div>
  );
};
