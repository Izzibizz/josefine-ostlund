import { useRef, useState, useEffect } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";

interface ExpandableHTMLProps {
  html: string;
  collapsedHeight?: number; // px
}

export const ExpandableTextDiv: React.FC<ExpandableHTMLProps> = ({
  html,
  collapsedHeight = 290,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string | number>(
    collapsedHeight + "px"
  );

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateHeight = () => {
      if (isOpen) {
        setMaxHeight(el.scrollHeight + "px");
      } else {
        setMaxHeight(collapsedHeight + "px");
      }
    };

    updateHeight();

    const ro = new ResizeObserver(() => {
      if (isOpen && el) setMaxHeight(el.scrollHeight + "px");
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [isOpen, html, collapsedHeight]);

  return (
    <div className="flex flex-col">
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight }}
      >
        <div
          className="desctext text-justify"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-3 text-sm text-black cursor-pointer transition-colors flex gap-1 items-center self-end"
      >
        {isOpen ? (
          <>
            <MdKeyboardArrowUp /> <p>Visa mindre</p>
          </>
        ) : (
          <>
            <MdKeyboardArrowDown /> <p>Läs mer</p>
          </>
        )}
      </button>
    </div>
  );
};
