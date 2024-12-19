import { useEditorContext } from "@/app/context/editorContext"
import { Toggle } from "@radix-ui/react-toggle"
import type { Editor } from "@tiptap/core"
import { type LucideIcon } from "lucide-react"
import React from "react"

type ToggleButtonProps = {
  editor: Editor
  Icon: LucideIcon
  onPressedChange: () => void
  name: string
}

function ToggleButton({ editor, Icon, onPressedChange, name }: ToggleButtonProps) {
  const isPressed = editor.isActive(name)
  return (
    <Toggle
      className={`${
        isPressed
          ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
          : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
      } size-7 flex items-center justify-center bg-[#d4d0c8] border`}
      onPressedChange={onPressedChange}
      pressed={isPressed}
    >
      <Icon size={15} />
    </Toggle>
  )
}

export default ToggleButton
