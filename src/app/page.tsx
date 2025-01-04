"use server"
import { clerkClient, currentUser } from "@clerk/nextjs/server"
import AppDownloadButton from "./_components/AppDownloadButton"
import MainWrapper from "./_components/MainWrapper"
import { getAssociatedPrintersById, getUserName } from "@/lib/queries"
import { ToasterUserProvider } from "./context/userDataContext"
import { getPairedToasters } from "@/lib/queries/toasterInfo"
import type { Friend, Toaster, ToasterUser } from "./types/printer"
import NotSignedInPage from "./_components/NotSignedInPage"

export default async function Home() {
  const user = await currentUser()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-2 gap-6 font-mono text-black bg-toastPrimary">
        <NotSignedInPage />
        <AppDownloadButton />
      </div>
    )
  }
  // Get user's friendlist from server
  const fullServerFriendsList: Friend[] = await getAssociatedPrintersById(user.id)

  // Get user information
  const toasterUser: ToasterUser = {
    id: user.id,
    userName: await getUserName(user.id),
    profileImageUrl: user.imageUrl,
  }

  // Get paired toaster information from server
  let serverPairedToasters: Toaster[] = await getPairedToasters(user.id)

  serverPairedToasters = await getProfilePicFromUsers(serverPairedToasters)

  return (
    <div className="flex flex-col items-center justify-center p-2 gap-6 font-mono text-black bg-toastPrimary">
      <ToasterUserProvider
        initialFriendList={fullServerFriendsList}
        initialPairedToasters={serverPairedToasters}
        initialUser={toasterUser}
      >
        <MainWrapper />
      </ToasterUserProvider>
      <AppDownloadButton />
    </div>
  )
}

const getProfilePicFromUsers = async (toasters: Toaster[]) => {
  if (toasters.length === 0) {
    return toasters
  }
  const clerk = await clerkClient()
  const updatedToasters = await Promise.all(
    toasters.map(async (toaster) => {
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
  return updatedToasters
}
