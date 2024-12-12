import React, { useEffect, type Dispatch, type SetStateAction } from "react"
import { useEditorContext } from "../context/editorContext"
export type Pages = "Toaster" | "Account"

type TitleBarProps = {
  pageActivated: Pages
  setPageActivated: Dispatch<SetStateAction<Pages>>
}

function TitleBar({ pageActivated, setPageActivated }: TitleBarProps) {
  const { editor } = useEditorContext()
  const Title = () => {
    switch (pageActivated) {
      case "Toaster":
        return "Thermal Toaster"
      case "Account":
        return "User Profile"
      default:
        break
    }
  }

  useEffect(() => {
    if (pageActivated === "Toaster") {
      editor?.commands.focus()
    }
  }, [pageActivated])
  return (
    <>
      <div className="h-6 bg-[#735721] flex items-center justify-between px-2">
        <span className="text-white text-sm font-bold">{Title()}</span>
      </div>

      <div className="h-6 bg-[#d4d0c8] border-t border-[#808080] border-b flex items-center px-2 text-xs gap-[0.7rem]">
        <button
          onClick={() => setPageActivated("Toaster")}
          className={`${pageActivated === "Toaster" ? "underline" : "hover:opacity-80"} `}
        >
          <u>T</u>oaster
        </button>
        <button
          onClick={() => setPageActivated("Account")}
          className={`${pageActivated === "Account" ? "underline" : "hover:opacity-80"} `}
        >
          <u>A</u>ccount
        </button>
      </div>
    </>
  )
}

export default TitleBar
