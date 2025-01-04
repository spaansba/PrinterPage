import { db } from ".."
import { users } from "../schema"
import { inArray } from "drizzle-orm"
import { clerkClient } from "@clerk/nextjs/server"
import type { User } from "@clerk/nextjs/server"

export const getUserInformation = async (userIds: string | string[]) => {
  // Convert single userId to array for consistent handling
  const userIdArray = Array.isArray(userIds) ? userIds : [userIds]

  // Ensure we have at least one userId
  if (userIdArray.length === 0) {
    throw new Error("At least one userId must be provided")
  }

  // Query all user information from your database
  const userInfo = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(inArray(users.id, userIdArray))

  // Fetch Clerk user data for profile pictures
  const clerk = await clerkClient()
  const clerkUsersResponse = await clerk.users.getUserList({
    userId: userIdArray,
  })

  // Add profile pictures to user info
  const enrichedUserInfo = userInfo.map((user) => {
    const clerkUser = clerkUsersResponse.data.find((clerk: User) => clerk.id === user.id)
    return {
      ...user,
      profileImageUrl: clerkUser?.imageUrl || null,
    }
  })

  return enrichedUserInfo
}
