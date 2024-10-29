import React, { useState } from "react"
import { ChevronDown, User, Plus } from "lucide-react"

export type Recipient = {
  id: number
  username: string
}

type RecipientSelectorProps = {
  selectedRecipient: Recipient | null
  onSelectRecipient: (recipient: Recipient | null) => void
}

const RecipientSelector = ({ selectedRecipient, onSelectRecipient }: RecipientSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [recipients] = useState<Recipient[]>([
    { id: 1, username: "Nerd1" },
    { id: 2, username: "Nerd2" },
    { id: 3, username: "Nerd3" },
    { id: 4, username: "Nerd4" },
  ])

  const handleSelect = (recipient: Recipient) => {
    onSelectRecipient(recipient)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full text-[13px] font-mono">
      <div
        onClick={() => setIsOpen(!isOpen)}
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
      </div>

      {isOpen && (
        <div className="absolute w-full mt-1 bg-white border-[1px] border-gray-500 shadow-[2px_2px_8px_rgba(0,0,0,0.2)] z-10">
          <div className="max-h-48 overflow-y-auto">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                onClick={() => handleSelect(recipient)}
                className="flex items-center px-4 py-2 hover:bg-[#000080] hover:text-white cursor-pointer"
              >
                <div className="w-4 h-4 bg-[#d4d0c8] border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center mr-2">
                  <User size={12} />
                </div>
                <span>{recipient.username}</span>
                {selectedRecipient?.id === recipient.id && <div className="ml-2 text-xs">✓</div>}
              </div>
            ))}

            <div className="border-t border-gray-500">
              <div
                className="flex items-center px-4 py-2 hover:bg-[#000080] hover:text-white cursor-pointer"
                onClick={() => {
                  setIsOpen(false)
                  // Add callback for new recipient
                }}
              >
                <div className="w-4 h-4 bg-[#d4d0c8] border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center mr-2">
                  <Plus size={12} />
                </div>
                <span>Add new recipient...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipientSelector
