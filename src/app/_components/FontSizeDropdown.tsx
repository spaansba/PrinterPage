import React from "react"
import type { Editor } from "@tiptap/react"

interface FontSize {
  label: string
  value: string
  coordinates: string
}

interface FontSizeDropdownProps {
  editor: Editor | null
}

const FontSizeDropdown: React.FC<FontSizeDropdownProps> = ({ editor }) => {
  if (!editor) return null

  const fontSizes: readonly FontSize[] = [
    { label: "13px", value: "text-[13px]", coordinates: "0,0" },
    { label: "19px", value: "text-[19px]", coordinates: "1,1" },
    { label: "24px", value: "text-[24px]", coordinates: "2,2" },
    { label: "30px", value: "text-[30px]", coordinates: "3,3" },
    { label: "35px", value: "text-[35px]", coordinates: "4,4" },
    { label: "41px", value: "text-[41px]", coordinates: "5,5" },
    { label: "46px", value: "text-[46px]", coordinates: "6,6" },
    { label: "52px", value: "text-[52px]", coordinates: "7,7" },
  ] as const

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value

    if (selectedValue) {
      editor.chain().focus().toggleSpanClass(selectedValue).run()
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
      value={getCurrentFontSize()}
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
