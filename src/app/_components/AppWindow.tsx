import React, { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import TitleBar, { type Pages } from "./TitleBar"
import EditorPage from "./_editorPage/EditorPage"
import AccountPage from "./_accountPage/AccountPage"
import FriendsPage from "./_friendsPage/FriendsPage"
import type { Friend } from "./_editorPage/FriendSelector"
import { useEditorContext } from "../context/editorContext"
import { removeAssociatedPrinters } from "@/lib/queries"

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
  // initialize selected friend with the most recent friend that the user send a message to
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
      setSelectedFriend(getLastMessagedFriend(initialFriendList))
    }
  }

  return { selectedFriend, setSelectedFriend, friendList, setFriendList, deleteFriend }
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
