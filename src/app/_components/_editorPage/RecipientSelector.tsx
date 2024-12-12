"use client"
import React, { useEffect, useRef, useState, type RefObject } from "react"
import { ChevronDown, User, Plus, Pencil, SendHorizonal, X } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import { addAssociatedPrinters, changeNameAssociatedPrinters } from "@/lib/queries"
import Image from "next/image"
import { useDropDownModal } from "../../_customHooks/useDropdownModal"

export type Recipient = {
  printerId: string
  name: string
}

export const recipientNameSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name is too short (min 3)" })
    .max(20, { message: "Name is too long (max 20)" }),
})

const newRecipientSchema = z.object({
  printerId: z
    .string()
    .min(10, { message: "Should be 10 characters long" })
    .max(10, { message: "Should be 10 characters long" }),
  name: recipientNameSchema.shape.name,
})

type RecipientSelectorProps = {
  recipients: Recipient[]
  setRecipients: React.Dispatch<React.SetStateAction<Recipient[]>>
  selectedRecipient: Recipient | null
  onSelectRecipient: (recipient: Recipient | null) => void
}

const RecipientSelector = ({
  recipients,
  setRecipients,
  selectedRecipient,
  onSelectRecipient,
}: RecipientSelectorProps) => {
  const editNameFormRef = useRef<HTMLFormElement>(null)
  const { user } = useUser()
  const [editingId, setEditingId] = useState<string | null>(null)
  const { isAddingRecipient, setIsAddingRecipient, addRecipientRef } = useAddRecipient()

  const { toggleButtonRef, dropdownRef, isDropdownOpen, setIsDropdownOpen } = useDropDownModal(
    () => {
      setIsDropdownOpen(false)
      setIsAddingRecipient(false)
      setEditingId(null)
    }
  )

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    formState: { errors: errorsNew },
    reset: resetNew,
    setError: setErrorNew,
    setFocus: setNewFocus,
  } = useForm<z.infer<typeof newRecipientSchema>>({
    resolver: zodResolver(newRecipientSchema),
    mode: "onSubmit",
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setError: setErrorEdit,
    setFocus: setEditFocus,
  } = useForm<z.infer<typeof recipientNameSchema>>({
    resolver: zodResolver(recipientNameSchema),
    mode: "onSubmit",
  })

  async function handleFormSubmit(data: z.infer<typeof newRecipientSchema>) {
    if (!user) {
      setErrorNew("root", { message: "User Doesnt Exist" })
      return
    }
    try {
      const added = await addAssociatedPrinters(user.id, data.printerId, data.name)
      if (added.error) {
        setErrorNew("root", { message: added.error.message })
      } else {
        resetNew()
        const newRecipient: Recipient = { printerId: added.data.printerId, name: added.data.name }
        setRecipients((prev) => [...prev, newRecipient])
        setIsAddingRecipient(false)
        onSelectRecipient(newRecipient)
      }
    } catch (error) {
      setErrorNew("root", {
        message: "Failed to add toaster. Please try again.",
      })
      console.error(error)
    }
  }

  function handleNewRecipientClick() {
    setIsAddingRecipient(true)
    // Give inputbox automatic focus for UX
    setTimeout(() => {
      setNewFocus("printerId")
    }, 0)
  }

  function handleEditClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, printerId: string) {
    e.stopPropagation()
    resetEdit()
    if (printerId == editingId) {
      setEditingId(null)
    } else {
      setEditingId(printerId)

      setTimeout(() => {
        setEditFocus("name")
      }, 0)
    }
    setIsAddingRecipient(false)
  }

  async function handleNewName(data: z.infer<typeof recipientNameSchema>, printerId: string) {
    if (!user) {
      setErrorEdit("root", { message: "User Doesnt Exist" })
      return
    }
    try {
      const changed = await changeNameAssociatedPrinters(user.id, printerId, data.name)
      if (changed.error) {
        console.error(changed.error.message)
        setErrorEdit("root", { message: changed.error.message })
      } else {
        setEditingId(null)
        resetEdit()
        setRecipients((prev) =>
          prev.map((recipient) =>
            recipient.printerId === printerId ? { ...recipient, name: data.name } : recipient
          )
        )
      }
    } catch (error) {
      setErrorEdit("root", { message: "Failed to update name. Please try again." })
      console.error(error)
    }
  }

  function handleSelect(recipient: Recipient) {
    if (recipient.printerId != editingId) {
      onSelectRecipient(recipient)
      setIsDropdownOpen(false)
    }
  }

  const RecipientItem = ({ recipient }: { recipient: Recipient }) => {
    return (
      <div className="group/recipient hover:bg-[#e4d3b2] bg-[#e8e8e8]">
        <div
          onClick={() => handleSelect(recipient)}
          className="flex w-full items-center px-4 py-2 hover:bg-[#e4d3b2] cursor-pointer"
          title={`Toaster ID: ${recipient.printerId}`}
        >
          <div className=" flex items-center justify-center mr-2">
            <Image src="/images/Logo512BW.png" alt="Toaster" width={24} height={24} />
          </div>
          <div className="flex flex-col">
            {editingId === recipient.printerId ? (
              <form
                ref={editNameFormRef}
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmitEdit((data) => handleNewName(data, recipient.printerId))(e)
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center text-[16px]">
                  <input
                    {...registerEdit("name")}
                    // ref={editNameInputRef}
                    className="border-solid border border-gray-300 px-2 py-1 rounded"
                    autoComplete="off"
                    spellCheck="false"
                    defaultValue={recipient.name}
                  />
                </div>
              </form>
            ) : (
              <span>{recipient.name}</span>
            )}
          </div>

          {selectedRecipient?.printerId === recipient.printerId && (
            <div className="ml-2 text-xs">✓</div>
          )}

          {editingId === recipient.printerId ? (
            <>
              <button
                type="button"
                className="ml-auto"
                title="Confirm Name"
                onClick={(e) => {
                  e.stopPropagation()
                  editNameFormRef.current?.requestSubmit()
                }}
              >
                <SendHorizonal className="text-black" size={14} />
              </button>
              <button
                type="button"
                title="Cancel"
                className="ml-2"
                onClick={() => setEditingId(null)}
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="ml-auto relative before:absolute before:content-[''] before:-inset-3 before:z-10"
              title="Edit Name"
              onClick={(e) => handleEditClick(e, recipient.printerId)}
            >
              <Pencil
                className="opacity-100 md:opacity-0 group-hover/recipient:opacity-100 text-black relative z-20"
                size={14}
              />
            </button>
          )}
        </div>
        {editingId === recipient.printerId && (
          <div className="text-red-600 pl-[43px] text-[11px]">
            {errorsEdit.name?.message && <p key="id_error">{errorsEdit.name?.message}</p>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full text-[13px] font-mono">
      <SignedIn>
        <button
          ref={toggleButtonRef}
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-4 py-2 bg-[#e8e8e8] border-[1px] border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center">
            {selectedRecipient ? (
              <>
                <div className=" flex items-center justify-center mr-2">
                  <Image src="/images/Logo512BW.png" alt="Toaster" width={24} height={24} />
                </div>
                <span>{selectedRecipient.name}</span>
              </>
            ) : (
              <span className="text-gray-500">Select toaster...</span>
            )}
          </div>
          <ChevronDown size={14} />
        </button>

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute w-[120%] -translate-x-[10%] mt-1 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]  bg-[#e8e8e8] border border-gray-500 z-10"
          >
            <div className="max-h-[30rem] overflow-y-auto">
              {recipients.map((recipient) => (
                <RecipientItem key={recipient.printerId} recipient={recipient} />
              ))}

              <div className="border-t border-gray-500">
                {isAddingRecipient ? (
                  <form
                    ref={addRecipientRef}
                    className="flex flex-col px-4 py-2 gap-1"
                    onSubmit={handleSubmitNew(handleFormSubmit)}
                  >
                    <div className="grid grid-cols-2">
                      <label htmlFor="printerId" className="content-center">
                        Toaster ID:
                      </label>
                      <input
                        {...registerNew("printerId")}
                        placeholder="xxxxxxxxxx"
                        className="border-solid border border-gray-300 px-2 text-[16px] py-1 rounded"
                        id="printerId"
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <div className="col-span-2 text-red-600 pt-1">
                        {errorsNew.printerId?.message && (
                          <p key="id_error">{errorsNew.printerId?.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <label htmlFor="name" className="content-center">
                        Toaster Name:
                      </label>

                      <input
                        {...registerNew("name")}
                        id="name"
                        placeholder="Name"
                        className="border-solid border border-gray-300 text-[16px] px-2 py-1 rounded"
                      />
                      <div className="col-span-2 text-red-600 pt-1">
                        {errorsNew.name?.message && (
                          <p key="name_error">{errorsNew.name?.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-red-600 pt-1">
                      {errorsNew.root?.message && <p key="root_error">{errorsNew.root?.message}</p>}
                    </div>
                    <button
                      type="submit"
                      className="flex justify-center bg-[#735721] hover:bg-[#e4d3b2] text-white  py-[6px]"
                    >
                      <Plus />
                    </button>
                  </form>
                ) : (
                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-[#e4d3b2] cursor-pointer bg-[#e8e8e8]"
                    onClick={handleNewRecipientClick} // Dont change to mouse down!!
                  >
                    <div className="size-6 bg-[#d4d0c8] border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center mr-2">
                      <Plus size={14} />
                    </div>
                    <span>Add new toaster...</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <button
            type="button"
            className="w-full px-4 py-2 bg-[#e8e8e8] border-[1px] border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] cursor-pointer flex items-center justify-between"
          >
            Sign in to select a toaster
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  )
}

function useAddRecipient() {
  const [isAddingRecipient, setIsAddingRecipient] = useState(false)
  const addRecipientRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (isAddingRecipient && addRecipientRef.current) {
      requestAnimationFrame(() => {
        addRecipientRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      })
    }
  }, [isAddingRecipient])
  return { isAddingRecipient, setIsAddingRecipient, addRecipientRef }
}

export default RecipientSelector
