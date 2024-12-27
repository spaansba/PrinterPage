"use client"
import FontSizeDropdown from "../FontSizeDropdown"
import SmileyDropdown from "../SmileyDropdown"
import { useEditorContext } from "@/app/context/editorContext"
import QRCodeButton from "./QRCodeButton"
import ImageButton from "./_camera/ImageButton"
import ToggleButton from "./ToggleButton"
import { Bold, Highlighter, Underline } from "lucide-react"
import DeleteMessageButton from "./DeleteMessageButton"

const TextStyles = `
  .tall-text {
    display: inline-block;
    transform: scaleY(2);
    transform-origin: 0 0;
    line-height: 2em;
    margin-bottom: 1em;
  }
  
  .wide-text {
    font-size: 26px
  }
`
export function Toolbar() {
  const { editor } = useEditorContext()

  if (!editor) {
    return null
  }

  const DividerLine = () => <div className="w-px h-6 bg-[#808080] mx-1"></div>
  return (
    <>
      <style>{TextStyles}</style>

      <div className="px-1 py-1 flex items-center ">
        <FontSizeDropdown editor={editor} />
        <DividerLine />

        <ToggleButton
          editor={editor}
          Icon={Bold}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          name="bold"
        />
        <ToggleButton
          editor={editor}
          Icon={Underline}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          name="underline"
        />
        <ToggleButton
          editor={editor}
          Icon={Highlighter}
          onPressedChange={() =>
            editor.chain().focus().toggleHighlight({ color: "rgb(49, 49, 49)" }).run()
          }
          name="highlight"
        />

        <DividerLine />

        <ImageButton />
        <QRCodeButton />
        <SmileyDropdown editor={editor} />
        <DividerLine />

        <DeleteMessageButton />
      </div>
    </>
  )
}
