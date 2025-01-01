"use server"
import { put } from "@vercel/blob"

export async function uploadToBlob(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No file provided")
    }

    // Create a unique filename to avoid conflicts
    const uniqueFilename = `${Date.now()}-${file.name}`

    const { url } = await put(uniqueFilename, file, {
      access: "public",
    })

    return { url }
  } catch (error) {
    console.error("Error uploading to blob:", error)
    throw error
  }
}
