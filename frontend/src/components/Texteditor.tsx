
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export const TextEditor: React.FC<{
  value: string;
  onChange: (html: string) => void;
}> = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],             
      ["clean"],
    ],
  };

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder="Skriv text här… markera ord och klicka länk-ikonen för att lägga till länk."
      className="bg-white text-black rounded mb-10"
    />
  );
};
