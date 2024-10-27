import React, { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react"
import {
  Bold,
  Underline,
  Barcode,
  QrCode,
  Trash2,
  Image as ImageIcon,
  Square,
  Minus,
  X,
  FlaskRound,
  Aperture,
  Highlighter,
} from "lucide-react"

//must be RGB for queryCommandValue later on, also firefox needs rgb (clown emoij)
const InvertColor = "rgb(29, 29, 29)"
const InvertTextColor = "rgb(255, 255, 255)"
const RegularTextColor = "rgb(0, 0, 0)"
const OPTION_BUTTONS = {
  Bold: {
    icon: Bold,
    label: "Bold",
    html: "b",
    command: "bold",
    commandValue: "",
    styleWithCSS: false,
  },
  Underline: {
    icon: Underline,
    label: "Underline",
    html: "u",
    command: "underline",
    commandValue: "",
    styleWithCSS: false,
  },
  Invert: {
    icon: Highlighter,
    label: "Invert",
    html: "mark",
    command: "backColor",
    commandValue: InvertColor,
    styleWithCSS: true,
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
    Underline: false,
    Invert: false,
  })
  const textDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textDivRef.current) {
      return
    }
    textDivRef.current.textContent = textContent
  }, [textContent, textDivRef])

  const handleSelectionChange = () => {
    const newStates = {
      Bold: document.queryCommandState(OPTION_BUTTONS["Bold"].command),
      Underline: document.queryCommandState(OPTION_BUTTONS["Underline"].command),
      Invert: document.queryCommandValue(OPTION_BUTTONS["Invert"].command) === InvertColor,
    }
    setOptionButtonStates(newStates)
  }

  useEffect(() => {
    console.log(optionButtonStates.Invert)
  }, [optionButtonStates.Invert])

  const handleOptionMouseDown = (e: React.MouseEvent, label: OptionButtonKey) => {
    e.preventDefault() // Prevent losing focus of the text erea
    const option = OPTION_BUTTONS[label]
    // API deprecated but there is no alternitive
    document.execCommand("styleWithCSS", false, option.styleWithCSS.toString())

    if (option.label === "Invert") {
      handleInvertMouseDown()
    } else {
      document.execCommand(option.command, false, option.commandValue)
    }

    handleSelectionChange()
  }

  const handleInvertMouseDown = () => {
    // For invert its not simply turn off / on, we set the value to the color or to transparant instead
    console.log("")
    if (optionButtonStates.Invert) {
      console.log("is now inverted, will not")
      document.execCommand("backColor", false, "rgba(0,0,0,0")
      // document.execCommand("foreColor", false, RegularTextColor)
    } else {
      console.log("is not inverted will now ")

      document.execCommand("backColor", false, InvertColor)
      // document.execCommand("foreColor", false, InvertTextColor)
    }
  }

  function htmlTest() {
    const str = `span style="background-color: rgb(29, 29, 29); color: rgb(255, 255, 255);"`
    const hexArray = Array.from(str).map((char) => "0x" + char.charCodeAt(0).toString(16))
    console.log(hexArray)
  }

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    setStatus("Editing")
    if (!textDivRef.current) {
      return
    }
    setHTMLContent(textDivRef.current.innerHTML)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    document.execCommand("inserttext", false, e.clipboardData.getData("text/plain"))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
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
                className="size-7 bg-[#d4d0c8] flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
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
                  className={`
                    size-7 flex items-center justify-center bg-[#d4d0c8] border 
                    ${
                      optionButtonStates[key]
                        ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
                        : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
                    }
                  `}
                  onMouseDown={(e) => handleOptionMouseDown(e, key)}
                >
                  <Icon
                    size={15}
                    style={
                      optionButtonStates[key] ? { transform: "translate(0.5px, 0.5px)" } : undefined
                    }
                  />
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
          spellCheck={"false"}
          defaultValue="Enter message to print..."
          onInput={handleTextChange}
          onSelect={handleSelectionChange}
          onPaste={(e) => handlePaste(e)}
          onDrop={handleDrop}
          contentEditable="true"
          className="text-[13px] font-printer w-full px-4 py-2 min-h-[200px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none font-mono resize-none whitespace-pre-wrap"
        ></div>

        <div className="min-h-[200px]">{textDivRef.current?.getHTML()}</div>

        {/* Status Bar */}
        <div className="h-6 bg-[#d4d0c8] border-t border-[#808080] flex items-center px-2 text-xs justify-between">
          <div>
            <span className="pr-4">Characters: {textContent.length}</span>
            <span>Lines: {textContent.split("\n").length}</span>
          </div>
          {status && <span>{status}</span>}
        </div>
      </div>
    </div>
  )
}

export default RetroTextEditor
