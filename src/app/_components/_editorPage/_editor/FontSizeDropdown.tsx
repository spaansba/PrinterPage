"use client"
import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import { useDropDownModal } from "@/app/_customHooks/useDropdownModal"

interface FontSize {
  label: string
  value: string
}

interface FontSizeDropdownProps {
  editor: Editor
}

interface DropdownItemProps {
  size: FontSize
  onClick: (value: string) => void
  isSelected: boolean
}

const fontSizes = [
  { label: "13", value: "text-[13px]" },
  { label: "26", value: "text-[26px]" },
  { label: "42", value: "text-[42px]" },
  { label: "52", value: "text-[52px]" },
] as const

const DropdownItem = ({ size, onClick, isSelected }: DropdownItemProps) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault()
      onClick(size.value)
    }}
    className={`w-full px-2 py-1 text-left text-black text-sm md:hover:bg-toastPrimaryHover 
      ${isSelected ? "bg-toastPrimaryHover" : ""}`}
  >
    {size.label}
  </button>
)

function FontSizeDropdown({ editor }: FontSizeDropdownProps) {
  const [currentSize, setCurrentSize] = useState("text-[13px]")
  const { toggleButtonRef, dropdownRef, isDropdownOpen, setIsDropdownOpen } = useDropDownModal(
    () => setIsDropdownOpen(false),
    true
  )

  const updateFontSize = () => {
    const activeSize = fontSizes.find((size) =>
      editor.isActive("customMark", { class: size.value })
    )
    if (activeSize?.value !== currentSize) {
      setCurrentSize(activeSize?.value ?? fontSizes[0].value)
    }
  }

  const handleFontSizeChange = (selectedValue: string) => {
    if (currentSize === "text-[13px]" && selectedValue === "text-[13px]") {
      setIsDropdownOpen(false)
      return
    }

    editor
      .chain()
      .focus()
      .unsetMark("customMark")
      .setMark("customMark", { class: selectedValue })
      .run()

    setIsDropdownOpen(false)
    setCurrentSize(selectedValue)
  }

  useEffect(() => {
    updateFontSize()

    editor.on("selectionUpdate", updateFontSize)
    editor.on("update", updateFontSize)

    return () => {
      editor.off("selectionUpdate", updateFontSize)
      editor.off("update", updateFontSize)
    }
  }, [editor, updateFontSize])

  const currentLabel = fontSizes.find((size) => size.value === currentSize)?.label ?? "13px"

  return (
    <div className="relative select-none z-[1] mr-1 px-1 border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]">
      <button
        ref={toggleButtonRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setIsDropdownOpen(!isDropdownOpen)
        }}
        className="group h-7 w-[35px] cursor-pointer rounded-none text-sm text-left
          flex items-center justify-between
          active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white"
      >
        <span className="truncate">{currentLabel}</span>
        <span
          className="ml-1 border-l-4 border-r-4 border-t-4 
          border-l-transparent border-r-transparent border-t-black 
          group-active:mt-[1px] group-active:ml-[2px]"
        />
      </button>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 
            border-t-[1px] border-l-[1px] border-r-2 border-b-2
            border-t-white border-l-white border-r-[#808080] border-b-[#808080]"
        >
          <div className="bg-toastPrimary w-full shadow-[inset_-1px_-1px_white]">
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
      )}
    </div>
  )
}

export default FontSizeDropdown
