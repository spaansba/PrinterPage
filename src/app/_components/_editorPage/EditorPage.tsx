"use client"
import { type Dispatch, type SetStateAction } from "react"
import { EditorContent } from "@tiptap/react"
import { useEditorContext } from "@/app/context/editorContext"
import RecipientSelector from "./FriendSelector"
import { Toolbar } from "./_editor/_toolbar/Toolbar"
import ToasterStatusBar from "./StatusBar"
import ToasterSendButton from "./ToasterSendButton"
import type { FriendListHook } from "../AppWindow"

type EditorPageProps = {
  hTMLContent: string
  status: string
  setStatus: Dispatch<SetStateAction<string>>
  friendsHook: FriendListHook
}

function EditorPage({ setStatus, status, hTMLContent, friendsHook }: EditorPageProps) {
  const { editor, editorForm } = useEditorContext()

  // Get the first form error message if any exist
  const getFirstFormError = () => {
    if (editorForm.formState.errors.recipient) {
      return editorForm.formState.errors.recipient.message
    }
    if (editorForm.formState.errors.textEditorInput) {
      return editorForm.formState.errors.textEditorInput.message
    }
    return null
  }

  return (
    <>
      <div>
        <div>
          <RecipientSelector friendsHook={friendsHook} />
          <Toolbar />
          <form className="text-[16px]">
            <div>
              <EditorContent
                {...editorForm.register("textEditorInput")}
                id="editorwrapper"
                editor={editor}
                spellCheck="false"
              />
              {getFirstFormError() && (
                <div className="bg-[#d4d0c8] border-t border-[#808080] px-2 py-1">
                  <span className="text-red-500 text-xs">{getFirstFormError()}</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <ToasterStatusBar status={status} />
      <ToasterSendButton
        setStatus={setStatus}
        hTMLContent={hTMLContent}
        selectedFriend={friendsHook.selectedFriend}
      />
    </>
  )
}

export default EditorPage
