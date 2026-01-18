import React, { useEffect, type Dispatch, type SetStateAction } from "react";
import { useEditorContext } from "../context/editorContext";
const pages = ["Toast", "Friends", "Toaster", "Toastle", "Account"] as const;
export type Pages = (typeof pages)[number];

type TitleBarProps = {
  pageActivated: Pages;
  setPageActivated: Dispatch<SetStateAction<Pages>>;
};

function TitleBar({ pageActivated, setPageActivated }: TitleBarProps) {
  const { editor } = useEditorContext();
  const Title = () => {
    switch (pageActivated) {
      case "Toast":
        return "Toasting";
      case "Friends":
        return "Toasters";
      case "Toaster":
        return "Configure your toaster";
      case "Toastle":
        return "Daily Toastle";
      case "Account":
        return "User Profile";
      default:
    }
  };

  useEffect(() => {
    if (pageActivated === "Toast") {
      editor?.commands.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageActivated]);
  return (
    <>
      <div className="h-6 bg-toastTertiary flex items-center justify-between px-2">
        <span className="text-white text-sm font-bold">{Title()}</span>
      </div>

      <div className="h-6 bg-toastPrimary border-t border-[#808080] border-b flex items-center px-2 text-xs gap-[0.7rem] overflow-x-auto whitespace-nowrap scrollbar-hide">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setPageActivated(page)}
            className={`${pageActivated === page ? "underline" : "hover:opacity-80"} flex-shrink-0`}
          >
            <u>{page.charAt(0)}</u>
            {page.slice(1)}
          </button>
        ))}
      </div>
    </>
  );
}

export default TitleBar;
