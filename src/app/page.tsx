"use server"
import { currentUser } from "@clerk/nextjs/server"
import AppDownloadButton from "./_components/AppDownloadButton"
import MainWrapper from "./_components/MainWrapper"
import { getAssociatedPrintersById, getUserName } from "@/lib/queries"
import type { Friend } from "./_components/_editorPage/_friendSelector/FriendSelector"
import { ToasterUserProvider } from "./context/userDataContext"
import { getPairedToasters, getToasterInformation } from "@/lib/queries/toasterInfo"
import { createClerkClient } from "@clerk/backend"
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export type Toaster = {
  id: string
  name: string
  profilePicture: string
}
export type ToasterUser = {
  id: string
  userName: string
  profileImageUrl: string | null
}

export default async function Home() {
  const user = await currentUser()

  const fullServerFriendsList = user ? await getAssociatedPrintersById(user.id) : []

  // Map friends and fetch their profile pictures
  const serverFriendList: Friend[] = await Promise.all(
    fullServerFriendsList.map(async (friend) => {
      let profilePicture = ""
      try {
        const clerkUser = await clerk.users.getUser(friend.userId)
        profilePicture = clerkUser.imageUrl
      } catch (error) {
        console.error(`Failed to fetch profile picture for user ${friend.userId}:`, error)
        profilePicture = ""
      }

      return {
        printerId: friend.associatedPrinterId.toString(),
        name: friend.name,
        lastSendMessage: friend.lastSendMessage,
        profilePicture: profilePicture,
      }
    })
  )
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
