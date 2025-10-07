
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
      placeholder="Markera ord och klicka på t.ex. länk-ikonen för att lägga till länk."
      className="bg-white text-black rounded laptop:mb-10"
    />
  );
};
