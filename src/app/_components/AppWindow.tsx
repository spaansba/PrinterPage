import React, { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import TitleBar, { type Pages } from "./TitleBar"
import EditorPage from "./_editorPage/EditorPage"
import AccountPage from "./_accountPage/AccountPage"
import FriendsPage from "./_friendsPage/FriendsPage"
import type { Friend, friendNameSchema } from "./_editorPage/FriendSelector"
import { useEditorContext } from "../context/editorContext"
import { changeNameAssociatedPrinters, removeAssociatedPrinters } from "@/lib/queries"
import type { z } from "zod"
import type { UseFormSetError } from "react-hook-form"

type AppWindowProps = {
  initialFriendList: Friend[]
  status: string
  setStatus: Dispatch<SetStateAction<string>>
  hTMLContent: string
}
export type FriendListHook = ReturnType<typeof useFriendList>

function AppWindow({ initialFriendList, status, setStatus, hTMLContent }: AppWindowProps) {
  const [pageActivated, setPageActivated] = useState<Pages>("Toast")
  const friendsHook: FriendListHook = useFriendList(initialFriendList)
  return (
    <>
      <div className="w-[288px] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
        <TitleBar pageActivated={pageActivated} setPageActivated={setPageActivated} />
        {pageActivated === "Toast" && (
          <EditorPage
            friendsHook={friendsHook}
            status={status}
            setStatus={setStatus}
            hTMLContent={hTMLContent}
          />
        )}
        {pageActivated === "Account" && <AccountPage />}
        {pageActivated === "Toasters" && <FriendsPage friendsHook={friendsHook} />}
      </div>
    </>
  )
}

function useFriendList(initialFriendList: Friend[]) {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(() =>
    getLastMessagedFriend(initialFriendList)
  )
  const [friendList, setFriendList] = useState<Friend[]>(initialFriendList)
  const { editorForm } = useEditorContext()

  useEffect(() => {
    if (selectedFriend) {
      editorForm.setValue("recipient", selectedFriend)
      editorForm.clearErrors()
    }
  }, [selectedFriend])

  const deleteFriend = async (userId: string, friendToDelete: Friend) => {
    const result = await removeAssociatedPrinters(userId, friendToDelete.printerId)
    if (!result.succes) {
      console.error(result)
      return
    }
    setFriendList((prev) => prev.filter((friend) => friend.printerId !== friendToDelete.printerId))
    if (friendToDelete === selectedFriend) {
      setSelectedFriend(getLastMessagedFriend(friendList))
    }
  }

  const changeFriendName = async (
    userId: string,
    data: z.infer<typeof friendNameSchema>,
    printerId: string
  ) => {
    try {
      const changed = await changeNameAssociatedPrinters(userId, printerId, data.name)
      if (changed.error) {
        return {
          succes: false,
          errorMessage: changed.error.message,
        }
      } else {
        setFriendList((prev) =>
          prev.map((friend: Friend) =>
            friend.printerId === printerId ? { ...friend, name: data.name } : friend
          )
        )

        // Update selectedFriend if the changed friend is currently selected
        setSelectedFriend((prev) =>
          prev?.printerId === printerId ? { ...prev, name: data.name } : prev
        )
      }
    } catch (error) {
      return {
        succes: false,
        errorMessage: "Server Error",
      }
    } finally {
      return {
        succes: true,
        errorMessage: "",
      }
    }
  }

  return {
    selectedFriend,
    setSelectedFriend,
    friendList,
    setFriendList,
    deleteFriend,
    changeFriendName,
  }
}

function getLastMessagedFriend(friendList: Friend[]) {
  if (friendList.length === 0) return null

  return friendList.reduce((mostRecent, current) => {
    if (!mostRecent.lastSendMessage) return current
    if (!current.lastSendMessage) return mostRecent

    return new Date(current.lastSendMessage) > new Date(mostRecent.lastSendMessage)
      ? current
      : mostRecent
  })
}
export default AppWindow
