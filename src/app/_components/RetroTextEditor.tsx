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
  FlaskRound,
  Aperture,
} from "lucide-react"

import { WordWrap } from "../wordwrap"

const OPTION_BUTTONS = {
  Bold: {
    icon: Bold,
    label: "Bold",
    html: "b",
    command: "bold",
  },
  Italic: {
    icon: Italic,
    label: "Italic",
    html: "em",
    command: "italic",
  },
  Underline: {
    icon: Underline,
    label: "Underline",
    html: "u",
    command: "underline",
  },
  Strikethrough: {
    icon: Strikethrough,
    label: "StrikeThrough",
    html: "strike",
    command: "strikeThrough",
  },
} as const
type OptionButtonKey = keyof typeof OPTION_BUTTONS

type RetroTextEditorProps = {
  setTextContent: Dispatch<SetStateAction<string>>
  textContent: string
  setHTMLContent: Dispatch<SetStateAction<string>>
  hTMLContent: string
  setStatus: Dispatch<SetStateAction<string>>
  status: string
}

const RetroTextEditor = ({
  textContent,
  setTextContent,
  status,
  setStatus,
  hTMLContent,
  setHTMLContent,
}: RetroTextEditorProps) => {
  const [optionButtonStates, setOptionButtonStates] = useState({
    Bold: false,
    Italic: false,
    Underline: false,
    Strikethrough: false,
  })
  const textDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textDivRef.current) {
      return
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount < 1) return
    const range = selection.getRangeAt(0)
    // const cursorOffset = range?.startOffset || 0
  }, [textContent, textDivRef])

  const handleSelectionChange = () => {
    const newStates = {
      Bold: document.queryCommandState("bold"),
      Italic: document.queryCommandState("italic"),
      Underline: document.queryCommandState("underline"),
      Strikethrough: document.queryCommandState("strikeThrough"),
    }
    setOptionButtonStates(newStates)
  }

  const handleOptionMouseDown = (e: React.MouseEvent, label: OptionButtonKey) => {
    e.preventDefault() // Prevent losing focus of the text erea
    const command = OPTION_BUTTONS[label].command
    // API deprecated but there is no alternitive
    document.execCommand(command, false)
    handleSelectionChange()
  }

  function htmlTest() {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    const htmlTag = document.createElement("b")

    const range = selection.getRangeAt(0)
    if (range.collapsed) {
      console.log(range.surroundContents)
      return
    }
  }

  // Keep track of the last input operation
  const lastOperation = useRef({
    text: "",
    cursor: 0,
    timestamp: Date.now(),
  })

  // Handle both input changes and cursor positioning in one synchronous operation
  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    setStatus("Editing")

    const currentTime = Date.now()
    const newValue = e.currentTarget.textContent
    // console.log(e.currentTarget.getHTML())
    // console.log(newValue)
    if (!newValue) {
      return
    }

    if (!textDivRef.current || !textDivRef.current.textContent) {
      return
    }

    const text = textDivRef.current.textContent
    const textLines = text.split(/\r\n|\n/g)

    const chunkLinesBySpace = textLines
      .map((line) => line.match(/[^\s-]+?-\b|\S+|\s+|\r\n?|\n/g) || ["~~empty~~"])
      .flat()
    const x = chunkLinesBySpace.map((lineWords) => {
      const y = lineWords
    })

    // console.log(text)
    setTextContent(text)

    setHTMLContent(textDivRef.current.getHTML())
  }
  return (
    <div className="w-[40ch] bg-[#d4d0c8] border-2 border-white shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
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

            <div className="flex items-center justify-center ml-auto">
              <button
                onMouseDown={(e) => setTextContent("This is a test text")}
                className="size-7 bg-[#d4d0c8] flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <FlaskRound size={15} />
              </button>

              <button
                onMouseDown={htmlTest}
                className="size-7 bg-[#d4d0c8] flex items-center justify-center  border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <Aperture size={15} />
              </button>
              {/* Delete Button */}
              <button
                onMouseDown={() => setTextContent("")}
                className="size-7 bg-[#d4d0c8] flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Bottom Row - Font and Media */}
          <div className="px-1 py-1 flex items-center gap-1">
            {/* Text Style Buttons */}
            <div className="flex items-center gap-px p-[3px] bg-[#d4d0c8] border border-[#808080] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.5)]">
              {(
                Object.entries(OPTION_BUTTONS) as [
                  OptionButtonKey,
                  (typeof OPTION_BUTTONS)[OptionButtonKey]
                ][]
              ).map(([key, { icon: Icon }]) => (
                <button
                  key={key}
                  className={`${
                    optionButtonStates[key] ? "bg-[#808080]" : ""
                  } size-7 flex items-center justify-center bg-[#d4d0c8]  border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] `}
                  onMouseDown={(e) => handleOptionMouseDown(e, key)}
                >
                  <Icon size={15} className={optionButtonStates[key] ? "text-white" : ""} />
                </button>
              ))}
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

        {/* Text Area */}
        <div
          ref={textDivRef}
          defaultValue="Enter message to print..."
          onInput={handleTextChange}
          onSelect={handleSelectionChange}
          contentEditable="true"
          className="w-full px-4 py-2 min-h-[200px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none font-mono resize-none whitespace-pre-wrap"
        ></div>

        {/* Status Bar */}
        <div className="h-6 bg-[#d4d0c8] border-t border-[#808080] flex items-center px-2 text-xs justify-between">
          <div>
            <span className="pr-4">Characters: {textContent.length}</span>
            <span>Lines: {textContent.split("\n").length}</span>
          </div>
          {status && <span>{status}</span>}
        </div>
      </div>

      <div
        // contentEditable="true"
        className="w-full px-4 py-2 min-h-[200px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none font-mono resize-none whitespace-pre-wrap"
      >
        {WordWrap.wrap(textDivRef.current?.textContent!)}
      </div>
      {textContent}
    </div>
  )
}

RetroTextEditor.displayName = "RetroTextEditor"

export default RetroTextEditor
