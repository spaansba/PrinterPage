"use client"
import { Toggle } from "@radix-ui/react-toggle"
import {
  AlertTriangle,
  Aperture,
  Bold,
  FlaskRound,
  Highlighter,
  ImageIcon,
  QrCode,
  Trash2,
  Underline,
  X,
} from "lucide-react"
import { useState } from "react"
import FontSizeDropdown from "./FontSizeDropdown"
import SmileyDropdown from "./SmileyDropdown"
import QRCode from "qrcode"
import { useEditorContext } from "@/app/context/editorContext"

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
  const [showQRInput, setShowQRInput] = useState(false)
  const [qrInputText, setQRInputText] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { editor } = useEditorContext()

  if (!editor) {
    return null
  }

  function handleQRCode() {
    setShowQRInput(true)
  }

  function generateQRCode() {
    if (!qrInputText.trim()) return

    QRCode.toDataURL(qrInputText, { scale: 4 })
      .then((url) => {
        pasteImageToEditor(url)
        setShowQRInput(false)
        setQRInputText("")
      })
      .catch((err) => {
        console.error(err)
      })
  }

  function triggerImageUpload() {
    // Check if the device has camera support
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    const inputElement = document.createElement("input")
    inputElement.type = "file"
    inputElement.accept = isMobile ? "image/*" : "image/png, image/jpeg"
    inputElement.className = "hidden"

    // Add it to document temp for mobile to work
    document.body.appendChild(inputElement)
    inputElement.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        const url = URL.createObjectURL(file)
        pasteImageToEditor(url)
        target.remove()
      }
      // Clean up by removing the input element after handling the file
      inputElement.remove()
    })
    inputElement.click()
  }

  function pasteImageToEditor(url: string) {
    const pos = editor!.state.selection.from
    editor!
      .chain()
      .focus()
      .setImage({ src: url })
      .setTextSelection(pos + 3) // make us unselect the image, so that if you type you dont instantly delete the image
      .run()
  }

  function clearEditor() {
    editor!.chain().focus().clearContent().run()
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <style>{TextStyles}</style>

      <div className="px-1 py-1 flex items-center ">
        <FontSizeDropdown editor={editor} />

        <Toggle
          className={`${
            editor.isActive("bold")
              ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
              : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
          } size-7 flex items-center justify-center bg-[#d4d0c8] border`}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          pressed={editor.isActive("bold")}
        >
          <Bold size={15} />
        </Toggle>

        <Toggle
          className={`${
            editor.isActive("underline")
              ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
              : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
          } size-7 flex items-center justify-center bg-[#d4d0c8] border`}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          pressed={editor.isActive("underline")}
        >
          <Underline size={15} />
        </Toggle>

        <Toggle
          className={`${
            editor.isActive("highlight")
              ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
              : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
          } size-7 flex items-center justify-center bg-[#d4d0c8] border`}
          onPressedChange={() =>
            editor.chain().focus().toggleHighlight({ color: "rgb(49, 49, 49)" }).run()
          }
          pressed={editor.isActive("highlight")}
        >
          <Highlighter size={15} />
        </Toggle>

        {/* Simple divider line */}
        <div className="w-px h-6 bg-[#808080] mx-1"></div>

        <button
          onMouseDown={() => triggerImageUpload()}
          className="size-7 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
        >
          <ImageIcon size={15} />
        </button>

        <button
          onMouseDown={() => handleQRCode()}
          className="size-7 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
        >
          <QrCode size={15} />
        </button>

        <SmileyDropdown editor={editor} />

        <div className="w-px h-6 bg-[#808080] mx-1"></div>
        <div className="ml-1">
          <button
            onMouseDown={() => {
              if (editor.state.selection.from > 1) {
                setShowDeleteConfirm(true)
              }
            }}
            className="size-7 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#d4d0c8] border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-80">
            {/* Title Bar */}
            <div className="bg-[#735721] px-2 py-1 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} />
                <span className="text-sm">Confirm Delete</span>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="size-7 flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm">Are you sure? </p>
              </div>

              {/* Buttons Container */}
              <div className="flex justify-end gap-1 bg-[#d4d0c8]">
                <button
                  onClick={clearEditor}
                  className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Input Modal */}
      {showQRInput && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#d4d0c8] border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-80">
            {/* Title Bar */}
            <div className="bg-[#735721] px-2 py-1 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <QrCode size={14} />
                <span className="text-sm">Generate QR Code</span>
              </div>
              <button
                onClick={() => setShowQRInput(false)}
                className="size-7 flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-2">
                <label className="block mb-2 text-sm">Enter text/url for QR code:</label>
                <input
                  type="text"
                  value={qrInputText}
                  onChange={(e) => setQRInputText(e.target.value)}
                  className="w-full px-2 py-1 border-2 border-[#808080] shadow-[inset_-1px_-1px_#dfdfdf,inset_1px_1px_#000] bg-white focus:outline-none"
                  placeholder="Enter your text here..."
                />
              </div>

              {/* Buttons Container with matching style */}
              <div className="flex justify-end gap-1  bg-[#d4d0c8]  ">
                <button
                  onClick={generateQRCode}
                  disabled={!qrInputText.trim()}
                  className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white disabled:opacity-50 disabled:pointer-events-none"
                >
                  Generate
                </button>
                <button
                  onClick={() => setShowQRInput(false)}
                  className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
