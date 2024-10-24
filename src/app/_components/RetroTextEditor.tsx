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
import { normalize } from "path"

type RetroTextEditorProps = {
  handleChange: (e: React.FormEvent<HTMLDivElement>) => void
  setFormattedValue: Dispatch<SetStateAction<string>>
  formattedValue: string
  status: string
}

const OPTION_BUTTONS = {
  Bold: {
    icon: Bold,
    label: "Bold",
    html: "b",
  },
  Italic: {
    icon: Italic,
    label: "Italic",
    html: "em",
  },
  Underline: {
    icon: Underline,
    label: "Underline",
    html: "u",
  },
  Strikethrough: {
    icon: Strikethrough,
    label: "Strikethrough",
    html: "strike",
  },
} as const
type OptionButtonKey = keyof typeof OPTION_BUTTONS

const RetroTextEditor = ({
  handleChange,
  formattedValue,
  setFormattedValue,
  status,
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

  const handleOptionMouseDown = (e: React.MouseEvent, label: OptionButtonKey) => {
    e.preventDefault() // Prevent losing focus

    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    const htmlTag = document.createElement(OPTION_BUTTONS[label].html)

    const range = selection.getRangeAt(0)
    if (range.collapsed) {
      setOptionButtonStates((prev) => ({
        ...prev,
        [label]: !prev[label],
      }))
      console.log(range.surroundContents)
      return
    }

    // const [leftIsFormatted, rightIsFormatted] = GetFormatted(range, htmlTag.tagName)

    // try {
    //   range.surroundContents(htmlTag)
    // } catch (e) {
    //   console.log(e)
    // }

    try {
      // Wrap selected content in tag
      range.surroundContents(htmlTag)
    } catch (e) {
      // Handle case where selection crosses multiple nodes
      const fragment = range.extractContents()
      htmlTag.appendChild(fragment)
      range.insertNode(htmlTag)
    }
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

    function isNodeFormattedWithTag(node: Node, htmlTagName: string) {
      if (node.nodeType != 3) {
        console.log("Node is not of type node type")
        return false //"TODO FIX"
      }

      let parentNode = node.parentNode
      while (parentNode && parentNode.nodeName !== "DIV") {
        if (parentNode.nodeName === htmlTagName) {
          return true
        }
        parentNode = parentNode.parentNode
      }

      return false
    }
    //If the user has a selection, check if the left and right are already formatted
    const isLeftFormattedWithTag = isNodeFormattedWithTag(range.startContainer, htmlTag.tagName)
    const isRightFormattedWithTag = isNodeFormattedWithTag(range.endContainer, htmlTag.tagName)

    const isSame = range.startContainer.isSameNode(range.endContainer)
    console.log(isSame)
    switch (true) {
      case isLeftFormattedWithTag && isRightFormattedWithTag:
        // 1: All chars within the selection are already formatted > unformat it
        // 2: Not all chars within the selection are already formatted > format them all

        break
      case isLeftFormattedWithTag:
        // handle left side only
        break
      case isRightFormattedWithTag:
        // handle right side only
        break
      default:
        // handle neither side formatted
        break
    }
    // if (textDivRef.current) {
    //   normalizeHTML(textDivRef.current)
    //   console.log(textDivRef.current?.getHTML())
    // }
    console.log(isLeftFormattedWithTag, isRightFormattedWithTag)
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

            <div className="flex items-center justify-center ml-auto">
              <button
                onMouseDown={(e) => setFormattedValue("This is a test text")}
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
                onMouseDown={() => setFormattedValue("")}
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

      <div className="w-full px-4 py-2 min-h-[200px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none font-mono resize-none whitespace-pre-wrap">
        {textDivRef.current?.getHTML()}
      </div>
    </div>
  )
}

RetroTextEditor.displayName = "RetroTextEditor"

export default RetroTextEditor
