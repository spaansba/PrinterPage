import type { Editor } from "@tiptap/core"
import { Smile } from "lucide-react"
import React, { useEffect, useState } from "react"

type Smiley = {
  smiley: string
  alt: string
}

interface SmileyDropdownProps {
  editor: Editor
}

interface DropdownItemProps {
  smiley: Smiley
  onMouseDown: (value: string) => void
}

const smileys: Smiley[] = [
  { smiley: ":-)", alt: "smile" },
  { smiley: ":-(", alt: "frown" },
  { smiley: ":-P", alt: "tongue" },
  { smiley: ":-D", alt: "grin" },
  { smiley: ":-O", alt: "surprised" },
  { smiley: ":-|", alt: "neutral" },
  { smiley: ":^)", alt: "happy" },
  { smiley: ">:-(", alt: "angry" },
  { smiley: ">_<", alt: "frustrated" },
  { smiley: "T_T", alt: "crying" },
  { smiley: "^_^", alt: "joy" },
  { smiley: "=^.^=", alt: "cat" },
  { smiley: "(>_<)", alt: "squeezed" },
  { smiley: "\\(^o^)/", alt: "excited" },
  { smiley: "(-_-)", alt: "unimpressed" },
  { smiley: "(^_^;)", alt: "nervous" },
]

const DropdownItem = ({ smiley, onMouseDown }: DropdownItemProps) => (
  <button
    title={smiley.alt}
    type="button"
    onMouseDown={(e) => {
      e.preventDefault()
      onMouseDown(smiley.smiley)
    }}
    className="w-full px-2 py-1 text-left text-black text-sm md:hover:bg-toastPrimaryHover"
  >
    {smiley.smiley}
  </button>
)

export default function SmileyDropdown({ editor }: SmileyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSmileyInput = (smiley: string) => {
    setIsOpen(false)
    editor
      .chain()
      .insertContent(smiley + " ")
      .focus()
      .run()
  }

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-smiley-dropdown]")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative select-none z-[3]" data-smiley-dropdown>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
        className="size-7 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
      >
        <Smile size={15} />
      </button>

      {isOpen && (
        <div
          className="
            absolute top-full left-[-220%]
            border-t-[1px] border-l-[1px] border-r-2 border-b-2
            border-t-white border-l-white border-r-[#808080] border-b-[#808080]
            w-[160px]
          "
        >
          <div className="bg-toastPrimary shadow-[inset_-1px_-1px_white] grid grid-cols-2">
            {smileys.map((smiley) => (
              <DropdownItem
                key={smiley.alt}
                smiley={smiley}
                onMouseDown={() => handleSmileyInput(smiley.smiley)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
