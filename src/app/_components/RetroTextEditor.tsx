import React from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Barcode,
  QrCode,
  Trash2,
  ImageIcon,
  Square,
  Minus,
  X,
} from "lucide-react"

type RetroTextEditorProps = {
  ref: React.RefObject<HTMLTextAreaElement>
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  formattedValue: string
  status: string
}

function RetroTextEditor({ ref, handleChange, formattedValue, status }: RetroTextEditorProps) {
  return (
    <div className="w-[600px] bg-[#d4d0c8] border-2 border-white shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
      {/* Window Title Bar */}
      <div className="h-6 bg-[#000080] flex items-center justify-between px-2">
        <span className="text-white text-sm font-bold">Retro Text Editor</span>
        <div className="flex gap-1">
          <button className="w-4 h-4 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center justify-center">
            <Minus size={12} />
          </button>
          <button className="w-4 h-4 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center justify-center">
            <Square size={12} />
          </button>
          <button className="w-4 h-4 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center justify-center">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="border border-[#808080]">
        {/* Toolbar */}
        <div className="h-[50px] bg-[#d4d0c8] px-2 py-1 flex items-center gap-2 border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080]">
          {/* Heading Radio Group */}
          <div className="flex h-8 bg-[#d4d0c8] rounded overflow-hidden border border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]">
            <label className="relative flex items-center">
              <input
                type="radio"
                name="heading"
                value="h1"
                className="absolute opacity-0 w-full h-full cursor-pointer peer"
                defaultChecked
              />
              <span className="px-3 py-1 peer-checked:bg-[#bdb9b3] peer-checked:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)] hover:bg-[#e6e3de] cursor-pointer select-none">
                H₁
              </span>
            </label>
            <label className="relative flex items-center border-l border-[#808080]">
              <input
                type="radio"
                name="heading"
                value="h2"
                className="absolute opacity-0 w-full h-full cursor-pointer peer"
              />
              <span className="px-3 py-1 peer-checked:bg-[#bdb9b3] peer-checked:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)] hover:bg-[#e6e3de] cursor-pointer select-none">
                H₂
              </span>
            </label>
          </div>

          {/* Font Family Selector */}
          <select className="h-8 px-2 bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] min-w-[120px] hover:bg-[#f0f0f0] appearance-none cursor-pointer rounded-none">
            <option>Sans Serif</option>
            <option>Normal</option>
          </select>

          {/* Formatting Buttons Group */}
          <div className="flex items-center gap-px p-1 bg-[#d4d0c8] border border-[#808080] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]">
            {["B", "I", "U", "S"].map((tool, index) => (
              <button
                key={tool}
                className="w-8 h-6 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                {tool === "B" && <Bold size={16} />}
                {tool === "I" && <Italic size={16} />}
                {tool === "U" && <Underline size={16} />}
                {tool === "S" && <Strikethrough size={16} />}
              </button>
            ))}
          </div>

          {/* Media Buttons Group */}
          <div className="flex items-center gap-px p-1 bg-[#d4d0c8] border border-[#808080] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]">
            <button className="w-8 h-6 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
              <Barcode size={16} />
            </button>
            <button className="w-8 h-6 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
              <QrCode size={16} />
            </button>
            <button className="w-8 h-6 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
              <ImageIcon size={16} />
            </button>
          </div>

          {/* Delete Button */}
          <button className="w-8 h-6 ml-auto flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={ref}
          className="w-full px-4 py-2 min-h-[200px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none font-mono resize-none"
          onChange={handleChange}
          value={formattedValue}
          placeholder="Enter message to print..."
          rows={8}
        />

        {/* Status Bar */}
        <div className="h-6 bg-[#d4d0c8] border-t border-[#808080] flex items-center px-2 text-xs justify-between">
          <div>
            <span className="pr-4">Characters: {formattedValue.length}</span>
            <span>Lines: {formattedValue.split("\n").length}</span>
          </div>
          {status && <span>{status}</span>}
        </div>
      </div>
    </div>
  )
}

export default RetroTextEditor
