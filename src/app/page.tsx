"use server"
import { currentUser } from "@clerk/nextjs/server"
import AppDownloadButton from "./_components/AppDownloadButton"
import MainWrapper from "./_components/MainWrapper"
import { getAssociatedPrintersById, getUserName } from "@/lib/queries"
import { ToasterUserProvider } from "./context/userDataContext"
import { getPairedToasters, getToasterInformation } from "@/lib/queries/toasterInfo"
import type { Friend } from "./_components/_editorPage/_friendSelector/FriendSelector"

export type Toaster = {
  id: string
  name: string
  profilePicture: string | null
}
export type ToasterUser = {
  id: string
  userName: string
  profileImageUrl: string | null
}

export default async function Home() {
  const user = await currentUser()

  const fullServerFriendsList: Friend[] = user ? await getAssociatedPrintersById(user.id) : []

  console.log(fullServerFriendsList)
  const serverUsername: string = user ? await getUserName(user.id) : ""
  const serverPairedToasters = user ? await getPairedToasters(user.id) : []
  const serverPairedToasterInformation: Toaster[] = user
    ? await getToasterInformation(serverPairedToasters)
    : []

  return (
    <div className="flex flex-col items-center justify-center p-2 gap-6 font-mono text-black bg-toastPrimary">
      <ToasterUserProvider
        initialFriendList={fullServerFriendsList}
        initialPairedToasters={serverPairedToasterInformation}
        initialUsername={serverUsername}
      >
        <MainWrapper />
      </ToasterUserProvider>
      <AppDownloadButton />
    </div>
  )
}
