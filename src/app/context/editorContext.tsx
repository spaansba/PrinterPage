"use client"

import { Editor, useEditor } from "@tiptap/react"
import React, { createContext, useContext, useMemo } from "react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import TextStyle from "@tiptap/extension-text-style"
import { CustomMark } from "../_components/_editorPage/_editor/CustomSpan"
import Image from "@tiptap/extension-image"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Lines } from "../_components/_editorPage/RetroTextEditor"
import { getVisualLinesFromHTML } from "../_helpers/getVisualLines"

// Define base types that don't depend on the editor
type RecipientType = {
  printerId: string
  name: string
}

type EditorFormData = {
  textEditorInput: string
  recipient: RecipientType | null
}

type EditorContextProps = {
  editor: Editor | null
  editorForm: UseFormReturn<EditorFormData>
}

type CustomEditorProviderProps = {
  children: React.ReactNode
  handleTextChange: (inputText: string, inputHTML: string) => void
}

export const EditorContext = createContext<EditorContextProps | undefined>(undefined)

export function CustomEditorProvider({ children, handleTextChange }: CustomEditorProviderProps) {
  const editor = useEditor({
    immediatelyRender: false,
    content: "",
    extensions: [
      StarterKit.configure({
        history: {
          depth: 100,
          newGroupDelay: 500,
        },
        paragraph: {
          HTMLAttributes: {
            // We have the editor on 16px so it doesnt zoom in on mobile automatically. This hack makes it 13px again
            class: "text-[13px]",
          },
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true, HTMLAttributes: { class: "color-white" } }),
      TextStyle,
      CustomMark,
      Image.configure({ HTMLAttributes: { class: "thermal-print-effect" } }), // Dont change the name since we remove it in the qr code function
    ],
    editorProps: {
      attributes: {
        class: `text-[13px] font-mono  [&[contenteditable=false]]:!opacity-70 w-full px-4 py-4 min-h-[200px] border-[1px] border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none whitespace-pre-wrap break-word touch-manipulation [--webkit-user-modify:read-write-plaintext-only] [--webkit-text-size-adjust:none] [word-wrap:break-word] [overflow-wrap:break-word] [white-space:pre-wrap] [max-width:100%]`,
        "data-gramm": "false", // existing attributes if any
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Backspace") {
          const { from, to } = view.state.selection
          if (from === to) {
            // If no text is selected
            // Get the current position and delete the previous character
            const tr = view.state.tr.delete(from - 1, from)
            view.dispatch(tr)
            return true
          }
        }
        return false
      },
      // Turn dropped in text to plain text without formatting
      handleDrop: (view, event) => {
        const dt = event.dataTransfer
        if (!dt) return true

        // If user is dragging an image aroun, actually accept the drop (not from outside the editor, only inside to inside)
        const html = dt.getData("text/html")
        if (html && (html.includes("<img") || html.includes("data:image"))) {
          return false
        }

        const text = dt.getData("text/plain")
        if (text) {
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (pos) {
            view.dispatch(view.state.tr.insertText(text, pos.pos))
          }
        }
        return true
      },
      handlePaste: (view, event) => {
        if (event?.clipboardData) {
          const text = event.clipboardData.getData("text/plain")
          view.dispatch(view.state.tr.insertText(text))
          return true
        }
        return false
      },
      handleClick: (view, pos, event) => {
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
        if (isTouchDevice) {
          return false
        }

        // Remove selected image class on all images not clicked
        view.state.doc.descendants((_, position) => {
          const element = view.nodeDOM(position) as Element
          if (element instanceof HTMLImageElement) {
            element.classList.remove("selected-image")
          }
        })

        // Add selected image class on the clicked image
        const clickedNode = event.target as Element
        if (clickedNode instanceof HTMLImageElement) {
          clickedNode.classList.toggle("selected-image")
        }
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      handleTextChange(text, editor.view.dom.innerHTML)
      editorForm.setValue("textEditorInput", text)
    },
    onCreate: ({ editor }) => {
      editor.commands.focus("start")
    },
  })

  // Create the schema with access to the editor instance
  const editorFormSchema = useMemo(() => {
    return z.object({
      textEditorInput: z
        .string()
        .min(1, { message: "Message is a bit on the short side" })
        .refine(
          () => {
            const editorElement = editor?.view?.dom as HTMLElement
            if (!editorElement) return true
            const lines = getVisualLinesFromHTML(editorElement)
            return lines.length <= 40
          },
          { message: "Message cannot exceed 40 lines" }
        ),
      recipient: z
        .object({
          printerId: z.string(),
          name: z.string(),
        })
        .nullable()
        .refine((val) => val !== null, {
          message: "Please select a recipient",
        }),
    })
  }, [editor]) // Recreate schema when editor changes

  // Initialize form with the dynamic schema
  const editorForm = useForm<EditorFormData>({
    resolver: zodResolver(editorFormSchema),
    mode: "onChange",
    defaultValues: {
      textEditorInput: "",
      recipient: null,
    },
  })

  const contextValue = useMemo(
    () => ({
      editor,
      editorForm,
    }),
    [editor, editorForm]
  )

  return <EditorContext.Provider value={contextValue}>{children}</EditorContext.Provider>
}

export function useEditorContext() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditorContext must be used within an EditorProvider")
  }
  return context
}
