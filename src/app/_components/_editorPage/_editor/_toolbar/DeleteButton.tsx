import { useEditorContext } from "@/app/context/editorContext"
import { AlertTriangle, Trash2, X } from "lucide-react"
import React, { useState, type Dispatch, type SetStateAction } from "react"

function DeleteModal() {
  const { editor } = useEditorContext()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  function clearEditor() {
    editor!.chain().focus().clearContent().run()
    setShowDeleteConfirm(false)
  }
  if (!editor) {
    return null
  }

  return (
    <>
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
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#d4d0c8] border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-80">
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
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm">Are you sure? </p>
              </div>

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
    </>
  )
}

export default DeleteModal
