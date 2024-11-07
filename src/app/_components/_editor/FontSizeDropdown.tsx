"use client"
import React, { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"

interface FontSize {
  label: string
  value: string
}

interface FontSizeDropdownProps {
  editor: Editor | null
}

const FontSizeDropdown: React.FC<FontSizeDropdownProps> = ({ editor }) => {
  const [currentSize, setCurrentSize] = useState<string>("")

  if (!editor) return null

  const fontSizes: readonly FontSize[] = [
    { label: "13px", value: "text-[13px]" },
    { label: "26px", value: "text-[26px]" },
    { label: "42px", value: "text-[42px]" },
    { label: "52px", value: "text-[52px]" },
  ] as const

  const updateFontSize = () => {
    const activeSize = fontSizes.find((size) =>
      editor.isActive("customMark", { class: size.value })
    )
    setCurrentSize(activeSize?.value || fontSizes[0].value)
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    if (selectedValue) {
      editor.chain().focus().toggleCustomMark(selectedValue).run()
      // Update the current size after the editor state changes
      setTimeout(updateFontSize, 0)
    }
  }

  // Update currentSize when editor selection changes
  useEffect(() => {
    if (!editor) return

    // Initial update
    updateFontSize()

    // Subscribe to editor changes
    editor.on("selectionUpdate", updateFontSize)
    editor.on("update", updateFontSize)

    return () => {
      editor.off("selectionUpdate", updateFontSize)
      editor.off("update", updateFontSize)
    }
  }, [editor])

  return (
    <>
      <select
        value={currentSize}
        onChange={handleFontSizeChange}
        className="h-7 px-1 bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] w-[70px] hover:bg-[#f0f0f0] appearance-none cursor-pointer rounded-none text-sm"
      >
        {fontSizes.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
    </>
  )
}

export default FontSizeDropdown
