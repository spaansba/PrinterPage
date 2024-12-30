import { useEditorContext } from "@/app/context/editorContext"
import { QrCode, X } from "lucide-react"
import React, { useState } from "react"
import QRCode from "qrcode"

function QRCodeButton() {
  const [showQRInput, setShowQRInput] = useState(false)
  const [qrInputText, setQRInputText] = useState("")
  const { editor } = useEditorContext()
  function handleQRCode() {
    setShowQRInput(true)
  }

  function generateQRCode() {
    if (!qrInputText.trim()) return

    QRCode.toDataURL(qrInputText, { scale: 4, margin: 3, color: { light: "#e8e8e8" } })
      .then((url) => {
        const pos = editor!.state.selection.from
        editor!
          .chain()
          .focus()
          .setImage({ src: url, alt: "[QR code]", title: `QR code for: ${qrInputText}` })
          .setTextSelection(pos + 3)
          .run()

        // Find and remove the thermal-print-effect class from the newly added QR code
        const editorElement = editor?.view?.dom as HTMLElement
        const images = editorElement.getElementsByTagName("img")
        const lastImage = images[images.length - 1]
        if (lastImage) {
          lastImage.classList.remove("thermal-print-effect")
        }

        setShowQRInput(false)
        setQRInputText("")
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <>
      <button
        onMouseDown={() => handleQRCode()}
        className="size-7 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
      >
        <QrCode size={15} />
      </button>
      {/* QR Code Input Modal */}
      {showQRInput && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-toastPrimary border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-80">
            <div className="bg-toastTertiary px-2 py-1 flex items-center justify-between text-white">
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

              <div className="flex justify-end gap-1  bg-toastPrimary  ">
                <button
                  onClick={generateQRCode}
                  disabled={!qrInputText.trim()}
                  className="h-7 px-4 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white disabled:opacity-50 disabled:pointer-events-none"
                >
                  Generate
                </button>
                <button
                  onClick={() => setShowQRInput(false)}
                  className="h-7 px-4 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
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

export default QRCodeButton
