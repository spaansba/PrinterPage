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
import { useForm } from "react-hook-form"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import Tiptap from "./Tiptap"

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

  // Use a ref to access the quill instance directly
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

  const formSchema = z.object({
    description: z.string().min(1, { message: "to short" }).max(300, { message: "too long" }),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      description: "",
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
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
        {/* Text Area */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Tiptap description={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            </form>
          </Form>
        </div>
        {/* <div
          ref={textDivRef}
          spellCheck={"false"}
          defaultValue="Enter message to print..."
          onInput={handleTextChange}
          onSelect={handleSelectionChange}
          onPaste={(e) => handlePaste(e)}
          onDrop={handleDrop}
          contentEditable="true"
          className="text-[13px] font-printer w-full px-4 py-2 min-h-[200px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none font-mono resize-none whitespace-pre-wrap"
        ></div> */}

        {/* <div className="min-h-[200px]">{textDivRef.current?.getHTML()}</div> */}

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
