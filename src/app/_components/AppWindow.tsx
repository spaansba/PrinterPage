import React, { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import TitleBar, { type Pages } from "./TitleBar"
import EditorPage from "./_editorPage/EditorPage"
import AccountPage from "./_accountPage/AccountPage"
import FriendsPage from "./_friendsPage/FriendsPage"

import { useEditorContext } from "../context/editorContext"
import { changeNameAssociatedPrinters, removeAssociatedPrinters } from "@/lib/queries"
import type { z } from "zod"
import type { messageStatus } from "./MainWrapper"
import type { Friend } from "./_editorPage/_friendSelector/FriendSelector"
import type { friendNameSchema } from "./_editorPage/AddNewFriendForm"
import MyToasterPage from "./_myToasterPage/MyToasterPage"
import { useToasterUser } from "../context/userDataContext"

type AppWindowProps = {
  messageStatus: messageStatus
  setMessageStatus: Dispatch<SetStateAction<messageStatus>>
  hTMLContent: string
}
export type FriendListHook = ReturnType<typeof useFriendList>

function AppWindow({ messageStatus, setMessageStatus, hTMLContent }: AppWindowProps) {
  const [pageActivated, setPageActivated] = useState<Pages>("Toast")
  const friendsHook = useFriendList()
  return (
    <>
      <div className="w-[288px] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
        <TitleBar pageActivated={pageActivated} setPageActivated={setPageActivated} />
        {pageActivated === "Toast" && (
          <EditorPage
            friendsHook={friendsHook}
            messageStatus={messageStatus}
            setMessageStatus={setMessageStatus}
            hTMLContent={hTMLContent}
          />
        )}
        {pageActivated === "Account" && <AccountPage />}
        {pageActivated === "Friends" && <FriendsPage friendsHook={friendsHook} />}
        {pageActivated === "Toaster" && <MyToasterPage />}
      </div>
    </>
  )
}

function useFriendList() {
  const { friendList, setFriendList } = useToasterUser()
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>(() =>
    getLastMessagedFriend(friendList)
  )
  const { editorForm } = useEditorContext()

  useEffect(() => {
    if (selectedFriends) {
      editorForm.setValue("recipients", selectedFriends)
      editorForm.clearErrors()
    }
  }, [selectedFriends])

  const deleteFriend = async (userId: string, friendToDelete: Friend) => {
    const result = await removeAssociatedPrinters(userId, friendToDelete.printerId)
    if (!result.success) {
      console.error(result)
      return
    }
    setFriendList((prev) => prev.filter((friend) => friend.printerId !== friendToDelete.printerId))
    if (selectedFriends.includes(friendToDelete)) {
      setSelectedFriends(getLastMessagedFriend(friendList))
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
          success: false,
          errorMessage: changed.error.message,
        }
      } else {
        setFriendList((prev) =>
          prev.map((friend: Friend) =>
            friend.printerId === printerId ? { ...friend, name: data.name } : friend
          )
        )

        // Update selectedFriend if the changed friend is currently selected
        // setSelectedFriends((prev) =>
        //   prev?.printerId === printerId ? { ...prev, name: data.name } : prev
        // )
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: "Server Error",
      }
    } finally {
      return {
        success: true,
        errorMessage: "",
      }
    }
  }

  return {
    selectedFriends,
    setSelectedFriends,
    friendList,
    setFriendList,
    deleteFriend,
    changeFriendName,
  }
}

function getLastMessagedFriend(friendList: Friend[]): Friend[] | [] {
  if (friendList.length === 0) return []

  // Find the most recent message time
  const mostRecentFriend = friendList.reduce((mostRecent, current) => {
    if (!mostRecent.lastSendMessage) return current
    if (!current.lastSendMessage) return mostRecent

    return new Date(current.lastSendMessage) > new Date(mostRecent.lastSendMessage)
      ? current
      : mostRecent
  })

  // If no messages exist at all, return null
  if (!mostRecentFriend.lastSendMessage) return []

  // Find all friends who messaged at the same most recent time
  const mostRecentTime = new Date(mostRecentFriend.lastSendMessage).getTime()
  const tiedFriends = friendList.filter(
    (friend) =>
      friend.lastSendMessage && new Date(friend.lastSendMessage).getTime() === mostRecentTime
  )

  return tiedFriends
}
export default AppWindow
