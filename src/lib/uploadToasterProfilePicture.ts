"use server"
import { del, put } from "@vercel/blob"

export async function uploadToBlob(formData: FormData, folder: string) {
  const file = formData.get("file") as File
  if (!file) {
    throw new Error("No file found in form data")
  }

  const filename = `${folder}/${Date.now()}-${file.name}`

  const blob = await put(filename, file, {
    access: "public",
  })

  return { url: blob.url }
}

export async function deleteFromBlob(url: string) {
  if (!url.includes("blob.vercel-storage.com")) {
    throw new Error("Not a valid Vercel Blob URL")
  }

  try {
    await del(url)
    return { success: true }
  } catch (error) {
    console.error("Error deleting blob:", error)
    return { success: false, message: "Error Deleting Blob" }
  }
}
