import { useEffect, useRef, useState } from "react"

export function useAddFriend() {
  const [isAddingFriend, setIsAddingFriend] = useState(false)
  const addFriendRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (isAddingFriend && addFriendRef.current) {
      requestAnimationFrame(() => {
        addFriendRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      })
    }
  }, [isAddingFriend])
  return { isAddingFriend, setIsAddingFriend, addFriendRef }
}
