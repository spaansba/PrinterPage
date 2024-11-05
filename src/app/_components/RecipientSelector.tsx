"use client"
import React, { useEffect, useRef, useState } from "react"
import { ChevronDown, User, Plus, Pencil } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useUser } from "@clerk/nextjs"
import { addAssociatedPrinters, getAssociatedPrintersById } from "@/lib/queries"

export type Recipient = {
  printerId: string
  name: string
}

const recipientNameSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name is too short" })
    .max(50, { message: "Name is too long" }),
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAddingRecipient, setIsAddingRecipient] = useState(false)
  const addRecipientRef = useRef<HTMLFormElement>(null)
  const { user } = useUser()
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    formState: { errors: errorsNew },
    reset: resetNew,
    setError: setErrorNew,
  } = useForm<z.infer<typeof newRecipientSchema>>({
    resolver: zodResolver(newRecipientSchema),
    mode: "onSubmit",
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setValue: setValueEdit,
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
        message: "Failed to add printer. Please try again.",
      })
      console.error(error)
    }
  }

  function handleEditMouseDown(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    printerId: string
  ) {
    e.stopPropagation()
    if (printerId == editingId) {
      setEditingId(null)
    } else {
      setEditingId(printerId)
    }
  }

  function handleNewName() {}

  useEffect(() => {
    setIsAddingRecipient(false)
  }, [isDropdownOpen])

  // Add useEffect to handle scrolling after state update
  useEffect(() => {
    if (isAddingRecipient && addRecipientRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        addRecipientRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      })
    }
  }, [isAddingRecipient])

  function handleSelect(recipient: Recipient) {
    if (recipient.printerId != editingId) {
      onSelectRecipient(recipient)
      setIsDropdownOpen(false)
    }
  }

  function handleNewRecipient() {
    // setIsDropdownOpen(false)
    setIsAddingRecipient(true)
  }

  return (
    <div className="relative w-full text-[13px] font-mono">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full px-4 py-2 bg-white border-[1px] border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center">
          {selectedRecipient ? (
            <>
              <div className="w-4 h-4 bg-[#d4d0c8] border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center mr-2">
                <User size={12} />
              </div>
              <span>{selectedRecipient.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Select recipient...</span>
          )}
        </div>
        <ChevronDown size={14} />
      </button>

      {isDropdownOpen && (
        <div className="absolute w-full mt-1 bg-white border-[1px] border-gray-500 shadow-[2px_2px_8px_rgba(0,0,0,0.2)] z-10">
          <div className="max-h-48 overflow-y-auto">
            {recipients.map((recipient) => (
              <button
                title={`printer ID: ${recipient.printerId}`}
                key={recipient.printerId}
                onMouseDown={() => handleSelect(recipient)}
                className="group/recipient flex w-full items-center px-4 py-2 hover:bg-[#e4d3b2] cursor-pointer"
              >
                <div className="w-4 h-4 bg-[#d4d0c8] border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center mr-2">
                  <User size={14} />
                </div>
                <div className="flex flex-col">
                  {editingId === recipient.printerId ? (
                    <form onSubmit={handleSubmitEdit(handleNewName)}>
                      <input
                        {...registerEdit("name")}
                        className="border-solid border border-gray-300 px-2 py-1 rounded"
                      />
                    </form>
                  ) : (
                    <span>{recipient.name}</span>
                  )}
                </div>
                {selectedRecipient?.printerId === recipient.printerId && (
                  <div className="ml-2 text-xs">✓</div>
                )}
                <button
                  className="ml-auto"
                  title="Edit Name"
                  onMouseDown={(e) => {
                    handleEditMouseDown(e, recipient.printerId)
                  }}
                >
                  <Pencil
                    className=" opacity-100 md:opacity-0 group-hover/recipient:opacity-100 text-black"
                    size={14}
                  />
                </button>
              </button>
            ))}

            <div className="border-t border-gray-500">
              {isAddingRecipient ? (
                <form
                  ref={addRecipientRef}
                  className="flex flex-col px-4 py-2 gap-2"
                  onSubmit={handleSubmitNew(handleFormSubmit)}
                >
                  <div className="grid grid-cols-2">
                    <label htmlFor="printerId" className="content-center">
                      Printer ID:
                    </label>
                    <input
                      {...registerNew("printerId")}
                      placeholder="xxxxxxxxxx"
                      className="border-solid border border-gray-300 px-2 py-1 rounded"
                      id="printerId"
                    />
                    <div className="col-span-2 text-red-600 pt-1">
                      {errorsNew.printerId?.message && (
                        <p key="id_error">{errorsNew.printerId?.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <label htmlFor="name" className="content-center">
                      Printer Name:
                    </label>

                    <input
                      {...registerNew("name")}
                      id="name"
                      placeholder="Yasmin en Bart"
                      className="border-solid border border-gray-300 px-2 py-1 rounded"
                    />
                    <div className="col-span-2 text-red-600 pt-1">
                      {errorsNew.name?.message && <p key="name_error">{errorsNew.name?.message}</p>}
                    </div>
                  </div>
                  <div className=" text-red-600 pt-1">
                    {errorsNew.root?.message && <p key="root_error">{errorsNew.root?.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
                  >
                    add +
                  </button>
                </form>
              ) : (
                <button
                  className="flex items-center w-full px-4 py-2 hover:bg-[#e4d3b2]  cursor-pointer"
                  onMouseDown={() => {
                    handleNewRecipient()
                  }}
                >
                  <div className="w-4 h-4 bg-[#d4d0c8] border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center mr-2">
                    <Plus size={12} />
                  </div>

                  <span>Add new recipient...</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipientSelector
