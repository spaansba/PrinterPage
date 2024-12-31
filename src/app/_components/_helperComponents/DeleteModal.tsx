import { AlertTriangle, X } from "lucide-react"
import React, { useState, type Dispatch, type SetStateAction } from "react"

type DeleteModelProps = {
  showDeleteModal: boolean
  setShowDeleteModal: Dispatch<SetStateAction<boolean>>
  handleOnDeleteClick: () => void
  titleText: string
  messageText: string
}

function DeleteModal({
  showDeleteModal,
  setShowDeleteModal,
  handleOnDeleteClick,
  titleText,
  messageText,
}: DeleteModelProps) {
  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-start pt-24  justify-center bg-black/50 z-50">
          <div className="bg-toastPrimary border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-80">
            <div className="bg-toastTertiary px-2 py-1 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} />
                <span className="text-sm">{titleText}</span>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="size-7 flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm">{messageText}</p>
              </div>

              <div className="flex justify-end gap-1 bg-toastPrimary">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    handleOnDeleteClick()
                  }}
                  className="h-7 px-4 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
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

export default DeleteModal
