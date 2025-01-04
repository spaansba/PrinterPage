import React, { useRef, useEffect } from "react"
import { MoreVertical } from "lucide-react"

export type MenuOption = {
  label: string
  icon: React.ReactNode
  onClick: () => void
  className?: string
}

type MenuModalProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  options: MenuOption[]
}

export const MenuModal: React.FC<MenuModalProps> = ({ isOpen, setIsOpen, options }) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setIsOpen])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div ref={menuRef} className="absolute right-0 w-48 mt-1 bg-white border shadow-lg z-50">
          {options.map((option, index) => (
            <button
              key={index}
              className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm ${
                option.className || ""
              }`}
              onClick={() => {
                option.onClick()
                setIsOpen(false)
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
