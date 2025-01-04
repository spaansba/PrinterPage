"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Friend, Toaster, ToasterUser } from "../types/printer"
import UserName from "../_components/_accountPage/_userInformation/UserName"

type ToasterUserContextType = {
  friendList: Friend[]
  pairedToasters: Toaster[]
  setFriendList: React.Dispatch<React.SetStateAction<Friend[]>>
  setPairedToasters: React.Dispatch<React.SetStateAction<Toaster[]>>
  currentUser: ToasterUser
  alterUsername: (userId: string, newName: string) => void
}

const ToasterUserContext = createContext<ToasterUserContextType>({
  friendList: [],
  pairedToasters: [],
  setFriendList: () => {},
  setPairedToasters: () => {},
  currentUser: {
    id: "",
    userName: "",
    profileImageUrl: "",
  },
  alterUsername: (userId: string, newName: string) => {},
})

interface ToasterUserProviderProps {
  children: ReactNode
  initialFriendList: Friend[]
  initialPairedToasters: Toaster[]
  initialUser: ToasterUser
}

export function ToasterUserProvider({
  children,
  initialFriendList,
  initialPairedToasters,
  initialUser,
}: ToasterUserProviderProps) {
  const [friendList, setFriendList] = useState<Friend[]>(initialFriendList)
  const [pairedToasters, setPairedToasters] = useState<Toaster[]>(initialPairedToasters)
  const [currentUser, setCurrentUser] = useState<ToasterUser>(initialUser)

  //const alterPairedToasters

  const alterUsername = (userId: string, newName: string) => {
    setCurrentUser((prev) => ({
      id: prev.id,
      userName: newName,
      profileImageUrl: prev.profileImageUrl,
    }))

    setPairedToasters((prev) => {
      return prev.map((toaster) => ({
        ...toaster,
        pairedAccounts: toaster.pairedAccounts?.map((account) =>
          account.id === userId
            ? {
                ...account,
                userName: newName,
              }
            : account
        ),
      }))
    })
  }

  return (
    <ToasterUserContext.Provider
      value={{
        friendList,
        pairedToasters,
        setFriendList,
        setPairedToasters,
        currentUser,
        alterUsername,
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
