"use server"
import { currentUser } from "@clerk/nextjs/server"
import AppDownloadButton from "./_components/AppDownloadButton"
import MainWrapper from "./_components/MainWrapper"
import { getAssociatedPrintersById, getUserName } from "@/lib/queries"
import { ToasterUserProvider } from "./context/userDataContext"
import { getPairedToasters } from "@/lib/queries/toasterInfo"
import type { Friend } from "./_components/_editorPage/_friendSelector/FriendSelector"
import type { Toaster } from "./types/printer"

export default async function Home() {
  const user = await currentUser()

  // Get user's friendlist from server
  const fullServerFriendsList: Friend[] = user ? await getAssociatedPrintersById(user.id) : []

  // Get user username from server
  const serverUsername: string = user ? await getUserName(user.id) : ""

  // Get paired toaster information from server
  const serverPairedToasters: Toaster[] = user ? await getPairedToasters(user.id) : []

  return (
    <div className="flex flex-col items-center justify-center p-2 gap-6 font-mono text-black bg-toastPrimary">
      <ToasterUserProvider
        initialFriendList={fullServerFriendsList}
        initialPairedToasters={serverPairedToasters}
        initialUsername={serverUsername}
      >
        <MainWrapper />
      </ToasterUserProvider>
      <AppDownloadButton />
    </div>
  )
}
