import type { Editor } from "@tiptap/core"
import React, { memo, useEffect, useState } from "react"

type SmileyDropdownProps = {
  editor: Editor
}

type Smiley = {
  smiley: string
  alt: string
}

export default function SmileyDropdown({ editor }: SmileyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleSmileyInput(smiley: string) {
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

  const DropdownItem = memo(
    ({ smiley, onMouseDown }: { smiley: Smiley; onMouseDown: (value: string) => void }) => (
      <button
        title={smiley.alt}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          onMouseDown(smiley.smiley)
        }}
        className="w-full px-2 py-1 text-left text-black text-sm hover:bg-[#e4d3b2]"
      >
        {smiley.smiley}
      </button>
    )
  )

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

  return (
    <div className="relative select-none z-[1]" data-smiley-dropdown>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
        className="
          group h-7 px-2 
          border-t-[1px] border-l-[1px] border-r-[1px] border-b-[1px]
          border-t-white border-l-white border-r-[#808080] border-b-[#808080]
          w-[70px] cursor-pointer rounded-none text-sm text-left
          flex items-center justify-between
          active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white
        "
      >
        <span>{`:)`}</span>
        <span
          className="
            ml-1 border-l-4 border-r-4 border-t-4 
            border-l-transparent border-r-transparent border-t-black 
            group-active:mt-[1px] group-active:ml-[2px]
          "
        />
      </button>

      {isOpen && (
        <div
          className="
            absolute top-full left-[-55%]
            border-t-[1px] border-l-[1px] border-r-2 border-b-2
            border-t-white border-l-white border-r-[#808080] border-b-[#808080]
            w-[150px]
          "
        >
          <div className="bg-[#d4d0c8] shadow-[inset_-1px_-1px_white] grid grid-cols-2">
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
