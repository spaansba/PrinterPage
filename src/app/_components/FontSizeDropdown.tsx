"use client"
import React from "react"
import type { Editor } from "@tiptap/react"

interface FontSize {
  label: string
  value: string
}

interface FontSizeDropdownProps {
  editor: Editor | null
}

const FontSizeDropdown: React.FC<FontSizeDropdownProps> = ({ editor }) => {
  if (!editor) return null

  const fontSizes: readonly FontSize[] = [
    { label: "13px", value: "text-[13px]" },
    { label: "26px", value: "text-[26px]" },
    { label: "42px", value: "text-[42px]" },
    { label: "52px", value: "text-[52px]" },
  ] as const

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value

    if (selectedValue) {
      editor.chain().focus().toggleCustomMark(selectedValue).run()
    }
  }

  const getCurrentFontSize = (): string => {
    const activeSize = fontSizes.find((size) =>
      editor.isActive("textStyle", { spanClass: size.value })
    )
    return activeSize?.value || ""
  }

  return (
    <select
      onChange={handleFontSizeChange}
      className="h-7 px-1 bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] w-[70px] hover:bg-[#f0f0f0] appearance-none cursor-pointer rounded-none text-sm"
    >
      {fontSizes.map((size) => (
        <option key={size.value} value={size.value}>
          {size.label}
        </option>
      ))}
    </select>
  )
}

export default FontSizeDropdown
