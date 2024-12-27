"use server"
import { currentUser } from "@clerk/nextjs/server"
import AppDownloadButton from "./_components/AppDownloadButton"
import MainWrapper from "./_components/MainWrapper"
import { getAssociatedPrintersById } from "@/lib/queries"
import type { Friend } from "./_components/_editorPage/FriendSelector"

export default async function Home() {
  const user = await currentUser()
  const fullServerFriendsList = user ? await getAssociatedPrintersById(user.id) : []
  const serverFriendList: Friend[] = fullServerFriendsList.map((friend) => ({
    printerId: friend.associatedPrinterId.toString(),
    name: friend.name,
    lastSendMessage: friend.lastSendMessage,
  }))

  return (
    <div className="flex flex-col items-center justify-center p-2 gap-6 font-mono text-black bg-[#d4d0c8]">
      <MainWrapper initialFriendList={serverFriendList}></MainWrapper>

      <AppDownloadButton />
    </div>
  )
}
