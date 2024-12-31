"use server"
import { currentUser } from "@clerk/nextjs/server"
import AppDownloadButton from "./_components/AppDownloadButton"
import MainWrapper from "./_components/MainWrapper"
import { getAssociatedPrintersById, getUserName } from "@/lib/queries"
import type { Friend } from "./_components/_editorPage/_friendSelector/FriendSelector"
import { ToasterUserProvider } from "./context/userDataContext"
import { getPairedToasters } from "@/lib/queries/printerVerificationCode"

export default async function Home() {
  const user = await currentUser()
  const fullServerFriendsList = user ? await getAssociatedPrintersById(user.id) : []
  const serverFriendList: Friend[] = fullServerFriendsList.map((friend) => ({
    printerId: friend.associatedPrinterId.toString(),
    name: friend.name,
    lastSendMessage: friend.lastSendMessage,
  }))
  const serverUsername: string = user ? await getUserName(user.id) : ""

  const serverPairedToasters = user ? await getPairedToasters(user.id) : []

  return (
    <div className="flex flex-col items-center justify-center p-2 gap-6 font-mono text-black bg-toastPrimary">
      <ToasterUserProvider
        initialFriendList={serverFriendList}
        initialPairedToasters={serverPairedToasters}
        initialUsername={serverUsername}
      >
        <MainWrapper />
      </ToasterUserProvider>
      <AppDownloadButton />
    </div>
  )
}
