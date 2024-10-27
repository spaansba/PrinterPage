import { Toggle } from "@radix-ui/react-toggle"
import type { Editor } from "@tiptap/react"
import {
  Aperture,
  Barcode,
  Bold,
  FlaskRound,
  Highlighter,
  ImageIcon,
  QrCode,
  Trash2,
  Underline,
} from "lucide-react"

type ToolbarProps = {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div className="bg-[#d4d0c8] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080]">
      {/* Top Row - Text Formatting */}
      <div className="px-1 py-1 flex items-center gap-1 border-b border-[#808080]">
        {/* Heading Selector */}
        <select className="h-7 px-1 bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] w-[80px] hover:bg-[#f0f0f0] appearance-none cursor-pointer rounded-none text-sm">
          <option>Regular</option>
          <option>H1</option>
          <option>H2</option>
        </select>

        {/* Font Family Selector */}
        <select className="h-7 px-1 bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] w-[100px] hover:bg-[#f0f0f0] appearance-none cursor-pointer rounded-none text-sm">
          <option>Sans Serif</option>
          <option>Normal</option>
        </select>

        <div className="flex items-center justify-center ml-auto">
          <button
            //   onMouseDown={(e) => setTextContent("This is a test text")}
            className="size-7 bg-[#d4d0c8] flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
          >
            <FlaskRound size={15} />
          </button>

          <button
            //   onMouseDown={htmlTest}
            className="size-7 bg-[#d4d0c8] flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
          >
            <Aperture size={15} />
          </button>
          {/* Delete Button */}
          <button
            //   onMouseDown={() => setTextContent("")}
            className="size-7 bg-[#d4d0c8] flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Bottom Row - Font and Media */}
      <div className="px-1 py-1 flex items-center gap-1">
        <div className="flex items-center gap-px p-[3px] bg-[#d4d0c8] border border-[#808080] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]">
          <Toggle
            className={`${
              editor.isActive("bold")
                ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
                : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
            }  size-7 flex items-center justify-center bg-[#d4d0c8] border `}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            pressed={editor.isActive("bold")}
          >
            <Bold
              size={15}
              style={editor.isActive("bold") ? { transform: "translate(0.5px, 0.5px)" } : undefined}
            />
          </Toggle>

          <Toggle
            className={`${
              editor.isActive("underline")
                ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
                : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
            }  size-7 flex items-center justify-center bg-[#d4d0c8] border `}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            pressed={editor.isActive("underline")}
          >
            <Underline
              size={15}
              style={
                editor.isActive("underline") ? { transform: "translate(0.5px, 0.5px)" } : undefined
              }
            />
          </Toggle>

          <Toggle
            className={`${
              editor.isActive("highlight")
                ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
                : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
            }  size-7 flex items-center justify-center bg-[#d4d0c8] border `}
            onPressedChange={() =>
              editor.chain().focus().toggleHighlight({ color: "rgb(49, 49, 49)" }).run()
            }
            pressed={editor.isActive("highlight")}
          >
            <Highlighter
              size={15}
              style={
                editor.isActive("highlight") ? { transform: "translate(0.5px, 0.5px)" } : undefined
              }
            />
          </Toggle>
        </div>
        {/* Media Buttons */}
        <div className="flex items-center gap-px p-[3px] bg-[#d4d0c8] border border-[#808080] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]">
          {[Barcode, QrCode, ImageIcon].map((Icon, index) => (
            <button
              key={index}
              className="w-7 h-7 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
