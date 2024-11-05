"use client"
import React, { useEffect, useRef, useState } from "react"
import { ChevronDown, User, Plus } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export type Recipient = {
  id: string
  username: string
}

const newRecipientSchema = z.object({
  id: z
    .string()
    .min(10, { message: "Should be 10 characters long" })
    .max(10, { message: "Should be 10 characters long" }),
  name: z
    .string()
    .min(3, { message: "Name is too short" })
    .max(50, { message: "Name is too long" }),
})

type RecipientSelectorProps = {
  selectedRecipient: Recipient | null
  onSelectRecipient: (recipient: Recipient | null) => void
}

const RecipientSelector = ({ selectedRecipient, onSelectRecipient }: RecipientSelectorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAddingRecipient, setIsAddingRecipient] = useState(false)
  const addRecipientRef = useRef<HTMLFormElement>(null)
  const [recipients] = useState<Recipient[]>([
    { id: "fcs2ean4kg", username: "Nerd1" },
    { id: "2", username: "Nerd2" },
    { id: "3", username: "Nerd3" },
    { id: "4", username: "Nerd4" },
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof newRecipientSchema>>({
    resolver: zodResolver(newRecipientSchema),
    mode: "onSubmit",
  })

  function handleFormSubmit() {}

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
    onSelectRecipient(recipient)
    setIsDropdownOpen(false)
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
              <span>{selectedRecipient.username}</span>
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
                key={recipient.id}
                onMouseDown={() => handleSelect(recipient)}
                className="flex w-full items-center px-4 py-2 hover:bg-[#e4d3b2] hover:text-white cursor-pointer"
              >
                <div className="w-4 h-4 bg-[#d4d0c8] border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center mr-2">
                  <User size={12} />
                </div>
                <span>{recipient.username}</span>
                {selectedRecipient?.id === recipient.id && <div className="ml-2 text-xs">✓</div>}
              </button>
            ))}

            <div className="border-t border-gray-500">
              {isAddingRecipient ? (
                <form
                  ref={addRecipientRef}
                  className="flex flex-col px-4 py-2 gap-2"
                  onSubmit={handleSubmit(handleFormSubmit)}
                >
                  <div className="grid grid-cols-2">
                    <label htmlFor="ID" className="content-center">
                      Printer ID:
                    </label>
                    <input
                      {...register("id")}
                      placeholder="xxxxxxxxxx"
                      className="border-solid border border-gray-300 px-2 py-1 rounded"
                      id="ID"
                    />
                    <div className="col-span-2 text-red-600 pt-1">
                      {errors.id?.message && <p key="id_error">{errors.id?.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <label htmlFor="name" className="content-center">
                      Printer Name:
                    </label>

                    <input
                      {...register("name")}
                      id="name"
                      name="name"
                      placeholder="Yasmin en Bart"
                      className="border-solid border border-gray-300 px-2 py-1 rounded"
                      type="text"
                    />
                    <div className="col-span-2 text-red-600 pt-1">
                      {errors.name?.message && <p key="name_error">{errors.name?.message}</p>}
                    </div>
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
                  className="flex items-center w-full px-4 py-2 hover:bg-[#e4d3b2] hover:text-white cursor-pointer"
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
