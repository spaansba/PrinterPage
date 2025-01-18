"use client"
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder"
import { HtmlEncoder } from "./HtmlEncoder"
import { PRINTER_WIDTH } from "@/lib/constants"
import { baseCanvas } from "./createImagesToPrint"

export const PrepareTextToSend = async (
  text: string,
  sender: string,
  imageURL: string
): Promise<Uint8Array> => {
  const replaceImgTagsWithSrc = processImgTags(text)
  let utf8Encode = new TextEncoder()
  const userMessage = await HtmlEncoder(
    utf8Encode.encode(replaceImgTagsWithSrc.text),
    replaceImgTagsWithSrc.images
  )
  const openTag = await printingOpenTag(sender, imageURL)
  const closingTag = await printingClosingTag()
  const combinedMultiple = combineMultipleUint8Arrays([openTag, userMessage, closingTag])
  return combinedMultiple
}

function processImgTags(rawText: string): { text: string; images: string[] } {
  const images: string[] = []
  const text = rawText.replaceAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/g, (_, srcUrl: string) => {
    images.push(srcUrl)
    return `|&^%image:${images.length - 1}`
  })

  return { text, images }
}

async function printingOpenTag(sender: string, imageURL: string): Promise<Uint8Array> {
  const encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "column",
    font: "9x17",
  })

  return new Promise<Uint8Array>((resolve, reject) => {
    const bannerImg = new Image()
    const profileImg = new Image()
    let loadedImages = 0

    const onAllImagesLoaded = () => {
      try {
        // Render the logo banner
        const banner = baseCanvas(88)
        const profileSize = 56
        const profile = baseCanvas(profileSize + 16) // Increased padding for text + 8 for name +8 for time
        // Create a new canvas for profile picture + username + send date

        if (!banner.context) {
          reject(new Error("Could not get canvas context"))
          return
        }

        if (!profile.context) {
          reject(new Error("Could not get profile canvas context"))
          return
        }

        banner.context.drawImage(bannerImg, 0, 0, banner.canvas.width, banner.canvas.height)
        const logoImageData = banner.context.getImageData(
          0,
          0,
          banner.canvas.width,
          banner.canvas.height
        )

        // Draw profile picture as circle
        profile.context.save()
        profile.context.beginPath()
        profile.context.arc(
          profileSize / 2 + 10,
          profileSize / 2 + 4,
          profileSize / 2,
          0,
          Math.PI * 2
        )
        profile.context.closePath()
        profile.context.clip()
        profile.context.drawImage(profileImg, 10, 4, profileSize, profileSize)
        profile.context.restore()

        // Add username next to profile picture
        profile.context.font = "bold 34px Arial"
        profile.context.textBaseline = "middle"
        const textY = profileSize / 3 + 4
        profile.context.fillText(sender, profileSize + 20, textY)

        // Add timestamp under username in smaller font
        profile.context.font = "24px Arial"
        profile.context.fillText(getFormattedDateTime(), profileSize + 20, textY + 30)

        const profileImageData = profile.context.getImageData(
          0,
          0,
          profile.canvas.width,
          profile.canvas.height
        )

        // Create the printer output
        const result = encoder
          .initialize()
          .raw([0x1b, 0x40])
          .font("a")
          .size(1)
          .image(logoImageData, banner.canvas.width, banner.canvas.height, "atkinson", 128)
          .rule()
          .image(profileImageData, profile.canvas.width, profile.canvas.height, "atkinson", 128)
          .align("left")
          .encode()

        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    // Load logo image
    bannerImg.onload = function () {
      loadedImages++
      if (loadedImages === 2) onAllImagesLoaded()
    }

    bannerImg.onerror = function (error) {
      reject(new Error("Failed to load logo image: " + error))
    }

    // Load profile image
    profileImg.crossOrigin = "anonymous"
    profileImg.onload = function () {
      loadedImages++
      if (loadedImages === 2) onAllImagesLoaded()
    }

    profileImg.onerror = function (error) {
      reject(new Error("Failed to load profile image: " + error))
    }

    // Start loading both images
    bannerImg.src = "/images/Toast.png"
    profileImg.src = imageURL

    setTimeout(() => {
      reject(new Error("Image loading timed out"))
    }, 10000)
  })
}

async function printingClosingTag(): Promise<Uint8Array> {
  let encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    font: "9x17",
  })

  return encoder.newline(1).rule({ style: "double" }).newline(3).encode()
}

export function combineMultipleUint8Arrays(arrays: Uint8Array[]) {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0)
  const combined = new Uint8Array(totalLength)
  let offset = 0
  arrays.forEach((array) => {
    combined.set(array, offset)
    offset += array.length
  })
  return combined
}

const getFormattedDateTime = (): string => {
  const now = new Date()
  const day = now.getDate().toString().padStart(2, "0")
  const month = (now.getMonth() + 1).toString().padStart(2, "0")
  const year = now.getFullYear()
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")
  const seconds = now.getSeconds().toString().padStart(2, "0")
  return `${hours}:${minutes}:${seconds}, ${day}/${month}/${year}`
}
