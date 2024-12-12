import { useEditorContext } from "@/app/context/editorContext"
import { Toggle } from "@radix-ui/react-toggle"
import { Bold } from "lucide-react"
import React from "react"

function BoldOption() {
  const { editor } = useEditorContext()

  if (!editor) {
    return null
  }

  return (
    <Toggle
      className={`${
        editor.isActive("bold")
          ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
          : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
      } size-7 flex items-center justify-center bg-[#d4d0c8] border`}
      onPressedChange={() => editor.chain().focus().toggleBold().run()}
      pressed={editor.isActive("bold")}
    >
      <Bold size={15} />
    </Toggle>
  )
}

export default BoldOption
