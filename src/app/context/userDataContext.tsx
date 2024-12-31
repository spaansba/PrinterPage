"use client"
import { createContext, useContext, useState, type ReactNode } from "react"
import type { Friend } from "../_components/_editorPage/_friendSelector/FriendSelector"

type ToasterUserContextType = {
  friendList: Friend[]
  pairedToasters: string[]
  setFriendList: React.Dispatch<React.SetStateAction<Friend[]>>
  setPairedToasters: React.Dispatch<React.SetStateAction<string[]>>
  username: string
  setUsername: React.Dispatch<React.SetStateAction<string>>
}

const ToasterUserContext = createContext<ToasterUserContextType>({
  friendList: [],
  pairedToasters: [],
  setFriendList: () => {},
  setPairedToasters: () => {},
  username: "",
  setUsername: () => {},
})

interface ToasterUserProviderProps {
  children: ReactNode
  initialFriendList: Friend[]
  initialPairedToasters: string[]
  initialUsername: string
}

export function ToasterUserProvider({
  children,
  initialFriendList,
  initialPairedToasters,
  initialUsername,
}: ToasterUserProviderProps) {
  const [friendList, setFriendList] = useState<Friend[]>(initialFriendList)
  const [pairedToasters, setPairedToasters] = useState<string[]>(initialPairedToasters)
  const [username, setUsername] = useState<string>(initialUsername)
  return (
    <ToasterUserContext.Provider
      value={{
        friendList,
        pairedToasters,
        setFriendList,
        setPairedToasters,
        username,
        setUsername,
      }}
    >
      {children}
    </ToasterUserContext.Provider>
  )
}

export function useToasterUser() {
  const context = useContext(ToasterUserContext)
  if (!context) {
    throw new Error("useToasterUser must be used within a ToasterUserProvider")
  }
  return context
}

export default ToasterUserContext
