"use client"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { EditorContent } from "@tiptap/react"
import { getAssociatedPrintersById, getUserName, incrementPrinterMessageStats } from "@/lib/queries"
import { useEditorContext } from "@/app/context/editorContext"
import RecipientSelector, { type Recipient } from "./RecipientSelector"
import { Toolbar } from "./_editor/Toolbar"
import ToasterStatusBar from "./StatusBar"
import ToasterSendButton from "./ToasterSendButton"

type EditorPageProps = {
  hTMLContent: string
  status: string
  setStatus: Dispatch<SetStateAction<string>>
}

function EditorPage({ setStatus, status, hTMLContent }: EditorPageProps) {
  const { selectedRecipient, setSelectedRecipient, recipients, setRecipients } = useRecipients()
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
          <RecipientSelector
            recipients={recipients}
            setRecipients={setRecipients}
            selectedRecipient={selectedRecipient}
            onSelectRecipient={setSelectedRecipient}
          />
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
        selectedRecipient={selectedRecipient}
      />
    </>
  )
}

function useRecipients() {
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const { editorForm } = useEditorContext()
  const { user } = useUser()

  useEffect(() => {
    const fetchRecipients = async () => {
      if (!user) return
      try {
        const associatedPrinters = await getAssociatedPrintersById(user.id)
        // Transform the data to match the Recipient type
        const formattedRecipients = associatedPrinters.map((printer) => ({
          printerId: printer.associatedPrinterId,
          name: printer.name,
        }))
        setSelectedRecipient(formattedRecipients[0])
        setRecipients(formattedRecipients)
      } catch (err) {
        console.error("Error fetching recipients:", err)
      }
    }

    fetchRecipients()
  }, [user])

  useEffect(() => {
    if (selectedRecipient) {
      editorForm.setValue("recipient", selectedRecipient)
      editorForm.clearErrors()
    }
  }, [selectedRecipient])

  return { selectedRecipient, setSelectedRecipient, recipients, setRecipients }
}

export default EditorPage
