"use server"
import { drizzle } from "drizzle-orm/vercel-postgres"
import { sql } from "@vercel/postgres"
import { posts, usersAssociatedPrinters, type NewPost } from "./schema"
import * as schema from "./schema"

// Use this object to send drizzle queries to your DB
export const db = drizzle(sql, { schema })

export const getPosts = async () => {
  const selectResult = await db.select().from(posts)
  console.log("Results", selectResult)
  return selectResult
}

export const insertPost = async (post: NewPost) => {
  return db.insert(posts).values(post).returning()
}

export const getAssociatedPrinters = async () => {
  const results = await db.select().from(usersAssociatedPrinters)
  console.log(results)
  return results
}
