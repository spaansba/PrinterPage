"use client"
import { useEffect, useState, useCallback, memo } from "react"
import type { Editor } from "@tiptap/react"

interface FontSize {
  label: string
  value: string
}

interface FontSizeDropdownProps {
  editor: Editor | null
}

const fontSizes: readonly FontSize[] = [
  { label: "13px", value: "text-[13px]" },
  { label: "26px", value: "text-[26px]" },
  { label: "42px", value: "text-[42px]" },
  { label: "52px", value: "text-[52px]" },
] as const

const DropdownItem = memo(
  ({
    size,
    onClick,
    isSelected,
  }: {
    size: FontSize
    onClick: (value: string) => void
    isSelected: boolean
  }) => (
    <button
      onClick={() => onClick(size.value)}
      className={`w-full px-2 py-1 text-left text-black text-sm hover:bg-[#e4d3b2] 
    ${isSelected ? "bg-[#e4d3b2]" : ""}`}
    >
      {size.label}
    </button>
  )
)
DropdownItem.displayName = "DropdownItem"

const FontSizeDropdown: React.FC<FontSizeDropdownProps> = ({ editor }) => {
  const [currentSize, setCurrentSize] = useState<string>("text-[13px]")
  const [isOpen, setIsOpen] = useState(false)

  if (!editor) return null

  const updateFontSize = useCallback(() => {
    const activeSize = fontSizes.find((size) =>
      editor.isActive("customMark", { class: size.value })
    )
    if (activeSize?.value !== currentSize) {
      setCurrentSize(activeSize?.value || fontSizes[0].value)
    }
  }, [editor, currentSize])

  const handleFontSizeChange = useCallback(
    (selectedValue: string) => {
      editor.chain().focus().toggleCustomMark(selectedValue).run()
      setIsOpen(false)
      const activeSize = fontSizes.find((size) =>
        editor.isActive("customMark", { class: size.value })
      )
      setCurrentSize(activeSize?.value || fontSizes[0].value)
    },
    [editor]
  )

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-font-dropdown]")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (!editor) return

    updateFontSize()
    editor.on("selectionUpdate", updateFontSize)
    editor.on("update", updateFontSize)

    return () => {
      editor.off("selectionUpdate", updateFontSize)
      editor.off("update", updateFontSize)
    }
  }, [editor, updateFontSize])

  const currentLabel = fontSizes.find((size) => size.value === currentSize)?.label || "13px"

  return (
    <div className="relative select-none z-[1]" data-font-dropdown>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group
          h-7 px-2 
          border-t-[1px] border-l-[1px] border-r-[1px] border-b-[1px]
          border-t-white border-l-white border-r-[#808080] border-b-[#808080]
          w-[70px] cursor-pointer rounded-none text-sm text-left
          flex items-center justify-between
          active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white

        `}
      >
        <span className="truncate">{currentLabel}</span>
        <span
          className={`
          ml-1 border-l-4 border-r-4 border-t-4 
          border-l-transparent border-r-transparent border-t-black 
          group-active:mt-[1px] group-active:ml-[2px]
        `}
        />
      </button>

      {isOpen && (
        <>
          {/* Dropdown shadow/border */}
          <div
            className="absolute top-full left-0 w-[70px] 
            border-t-[1px] border-l-[1px] border-r-2 border-b-2
            border-t-white border-l-white border-r-[#808080] border-b-[#808080]
          "
          >
            {/* Dropdown content */}
            <div className="bg-[#d4d0c8] w-full shadow-[inset_-1px_-1px_white]">
              {fontSizes.map((size) => (
                <DropdownItem
                  key={size.value}
                  size={size}
                  onClick={handleFontSizeChange}
                  isSelected={size.value === currentSize}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(FontSizeDropdown)
