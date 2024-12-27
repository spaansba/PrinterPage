import React, { useEffect, type Dispatch, type SetStateAction } from "react"
import { useEditorContext } from "../context/editorContext"
const pages = ["Toast", "Account", "Toasters"] as const
export type Pages = (typeof pages)[number]

type TitleBarProps = {
  pageActivated: Pages
  setPageActivated: Dispatch<SetStateAction<Pages>>
}

function TitleBar({ pageActivated, setPageActivated }: TitleBarProps) {
  const { editor } = useEditorContext()
  const Title = () => {
    switch (pageActivated) {
      case "Toast":
        return "Toasting"
      case "Account":
        return "User Profile"
      case "Toasters":
        return "Toasters"
      default:
    }
  }

  useEffect(() => {
    if (pageActivated === "Toasters") {
      editor?.commands.focus()
    }
  }, [pageActivated])
  return (
    <>
      <div className="h-6 bg-[#735721] flex items-center justify-between px-2">
        <span className="text-white text-sm font-bold">{Title()}</span>
      </div>

      <div className="h-6 bg-[#d4d0c8] border-t border-[#808080] border-b flex items-center px-2 text-xs gap-[0.7rem]">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setPageActivated(page)}
            className={`${pageActivated === page ? "underline" : "hover:opacity-80"} `}
          >
            <u>{page.charAt(0)}</u>
            {page.slice(1)}
          </button>
        ))}
      </div>
    </>
  )
}

export default TitleBar
