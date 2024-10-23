import React, { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Barcode,
  QrCode,
  Trash2,
  Image as ImageIcon,
  Square,
  Minus,
  X,
} from "lucide-react"

type RetroTextEditorProps = {
  handleChange: (e: React.FormEvent<HTMLDivElement>) => void
  setFormattedValue: Dispatch<SetStateAction<string>>
  formattedValue: string
  status: string
}

const OptionButtons = {
  Bold: {
    icon: Bold,
    label: "Bold",
  },
  Italic: {
    icon: Italic,
    label: "Italic",
  },
  Underline: {
    icon: Underline,
    label: "Underline",
  },
  Strikethrough: {
    icon: Strikethrough,
    label: "Strikethrough",
  },
} as const

const RetroTextEditor = ({
  handleChange,
  formattedValue,
  setFormattedValue,
  status,
}: RetroTextEditorProps) => {
  const [isBold, setIsBold] = useState(false)
  const textDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textDivRef.current) {
      return
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount < 1) return
    const range = selection.getRangeAt(0)
    const cursorOffset = range?.startOffset || 0

    // Only update if the content is different to avoid cursor jumps
    if (textDivRef.current.textContent !== formattedValue) {
      textDivRef.current.textContent = formattedValue

      // Restore cursor position
      if (selection && range) {
        const newRange = document.createRange()
        newRange.setStart(
          textDivRef.current.firstChild || textDivRef.current,
          Math.min(cursorOffset, formattedValue.length)
        )
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }
  }, [formattedValue, textDivRef])

  const handleBoldMouseDown = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent losing focus
    setIsBold(!isBold)

    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    const range = selection.getRangeAt(0)
    if (range.collapsed) return // No text selected

    // Store the selection position
    const startContainer = range.startContainer
    const startOffset = range.startOffset
    const endContainer = range.endContainer
    const endOffset = range.endOffset

    const strong = document.createElement("strong")
    try {
      // Wrap selected content in <strong> tag
      range.surroundContents(strong)
    } catch (e) {
      // Handle case where selection crosses multiple nodes
      const fragment = range.extractContents()
      strong.appendChild(fragment)
      range.insertNode(strong)
    }

    // Restore the selection
    const newRange = document.createRange()
    try {
      newRange.setStart(startContainer, startOffset)
      newRange.setEnd(endContainer, endOffset)
      selection.removeAllRanges()
      selection.addRange(newRange)
    } catch (e) {
      // If original containers are no longer valid, select the strong element
      newRange.selectNodeContents(strong)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
  }

  return (
    <div className="w-[350px] bg-[#d4d0c8] border-2 border-white shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
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

            {/* Delete Button */}
            <button
              onMouseDown={() => setFormattedValue("")}
              className="w-7 h-7 ml-auto flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Bottom Row - Font and Media */}
          <div className="px-1 py-1 flex items-center gap-1">
            {/* Text Style Buttons */}
            <div className="flex items-center gap-px p-0.5 bg-[#d4d0c8] border border-[#808080] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]">
              {Object.values(OptionButtons).map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="w-7 h-7 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                >
                  <Icon
                    size={15}
                    className={label === "Bold" && isBold ? "bg-slate-200" : ""}
                    onMouseDown={label === "Bold" ? handleBoldMouseDown : undefined}
                  />
                </button>
              ))}
            </div>

            {/* Media Buttons */}
            <div className="flex items-center gap-px p-0.5 bg-[#d4d0c8] border border-[#808080] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]">
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

        {/* Text Area */}
        {/* <textarea
          ref={ref}
          className="w-full px-4 py-2 min-h-[200px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none font-mono resize-none"
          onChange={handleChange}
          value={formattedValue}
          placeholder="Enter message to print..."
          rows={8}
        /> */}

        {/* Text Area */}
        <div
          ref={textDivRef}
          defaultValue="Enter message to print..."
          onInput={handleChange}
          contentEditable="true"
          className="w-full px-4 py-2 min-h-[200px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none font-mono resize-none whitespace-pre-wrap"
        ></div>

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

RetroTextEditor.displayName = "RetroTextEditor"

export default RetroTextEditor
