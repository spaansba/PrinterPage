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
    <div className="relative ">
      <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical className="size-5 text-gray-700 md:hover:text-gray-400" />
      </button>

      {isOpen && (
        <div ref={menuRef} className="absolute right-0 w-48 mt-1 bg-toastWhite shadow-lg z-50">
          <div className="border border-gray-500 ">
            {options.map((option) => (
              <button
                key={option.label}
                className={`flex items-center gap-2 px-2 py-[0.4rem] w-full text-left text-sm md:hover:bg-toastPrimaryHover ${
                  option.className || ""
                }`}
                onClick={() => {
                  option.onClick()
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center justify-center">{option.icon}</div>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuModal
