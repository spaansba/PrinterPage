import { useEffect, useRef, useState } from "react"

export function useDropDownModal(onOutsideClickHandler: (event: MouseEvent) => void) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // When the user clicks outside of the open dropdown, close it
  useEffect(() => {
    const handleMouseDownie = (event: MouseEvent) => {
      const target = event.target as Node

      // Do nothing if the target is not connected element with document
      if (!target || !target.isConnected) {
        return
      }

      if (toggleButtonRef.current?.contains(target)) {
        return
      }

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        onOutsideClickHandler(event)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleMouseDownie)
    }
    return () => {
      document.removeEventListener("mousedown", handleMouseDownie)
    }
  }, [isDropdownOpen])

  return { toggleButtonRef, dropdownRef, isDropdownOpen, setIsDropdownOpen }
}
