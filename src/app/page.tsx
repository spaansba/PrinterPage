"use server"
import { currentUser } from "@clerk/nextjs/server"
import AppDownloadButton from "./_components/AppDownloadButton"
import MainWrapper from "./_components/MainWrapper"
import { getAssociatedPrintersById, getUserName } from "@/lib/queries"
import type { Friend } from "./_components/_editorPage/_friendSelector/FriendSelector"
import { ToasterUserProvider } from "./context/userDataContext"
import { getPairedToasters, getToasterInformation } from "@/lib/queries/pairedToasters"

export type Toaster = {
  id: string
  name: string
  profilePicture: string
}

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
  const serverPairedToasterInformation: Toaster[] = user
    ? await getToasterInformation(serverPairedToasters)
    : []

  return (
    <div className="flex flex-col items-center justify-center p-2 gap-6 font-mono text-black bg-toastPrimary">
      <ToasterUserProvider
        initialFriendList={serverFriendList}
        initialPairedToasters={serverPairedToasterInformation}
        initialUsername={serverUsername}
      >
        <MainWrapper />
      </ToasterUserProvider>
      <AppDownloadButton />
    </div>
  )
}
