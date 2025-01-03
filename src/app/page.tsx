"use server"
import { clerkClient, currentUser } from "@clerk/nextjs/server"
import AppDownloadButton from "./_components/AppDownloadButton"
import MainWrapper from "./_components/MainWrapper"
import { getAssociatedPrintersById, getUserName } from "@/lib/queries"
import { ToasterUserProvider } from "./context/userDataContext"
import { getPairedToasters } from "@/lib/queries/toasterInfo"
import type { Friend } from "./_components/_editorPage/_friendSelector/FriendSelector"
import type { Toaster } from "./types/printer"

export default async function Home() {
  const user = await currentUser()
  const clerk = await clerkClient()
  // Get user's friendlist from server
  const fullServerFriendsList: Friend[] = user ? await getAssociatedPrintersById(user.id) : []

  // Get user username from server
  const serverUsername: string = user ? await getUserName(user.id) : ""

  // Get paired toaster information from server
  let serverPairedToasters: Toaster[] = user ? await getPairedToasters(user.id) : []

  if (serverPairedToasters.length > 0) {
    const updatedToasters = await Promise.all(
      serverPairedToasters.map(async (toaster) => {
        if (toaster.pairedAccounts && toaster.pairedAccounts.length > 0) {
          const pairedAccountsWithImages = await Promise.all(
            toaster.pairedAccounts.map(async (account) => {
              try {
                const clerkUser = await clerk.users.getUser(account.id)
                return {
                  ...account,
                  profileImageUrl: clerkUser.imageUrl,
                }
              } catch (error) {
                console.error(`Failed to fetch profile picture for user ${account.id}:`, error)
                return account
              }
            })
          )
          return {
            ...toaster,
            pairedAccounts: pairedAccountsWithImages,
          }
        }
        return toaster
      })
    )
    serverPairedToasters = updatedToasters
  }
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
