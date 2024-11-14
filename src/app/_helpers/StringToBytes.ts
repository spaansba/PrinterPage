"use client"
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder"
import { HTMLBytesToESCPOSCommands } from "../_classes/HTMLBytesToESCPOSCommands"

export const htmlContentToBytesWithCommands = async (
  text: string,
  sender: string
): Promise<Uint8Array> => {
  const replaceImgTagsWithSrc = text.replace(
    /<img[^>]*src=["']([^"']+)["'][^>]*>/g,
    (_, srcUrl) => `${srcUrl}|`
  )

  const cleanText = replaceImgTagsWithSrc
    .replace(/<p[^>]*>/g, "")
    .replace(/<\/p>/g, "")
    .replace(/<span[^>]*>/g, "")
    .replace(/<\/span>/g, "")
    .replace(/<br[^>]*>/g, "")
    .replace(/<\/br>/g, "")

  let utf8Encode = new TextEncoder()
  const encodedText = utf8Encode.encode(cleanText)
  let HTMLByteToEscpos = new HTMLBytesToESCPOSCommands(encodedText)
  const openTag = await printingOpenTag(sender)
  const closingTag = await printingClosingTag()
  const userText = await HTMLByteToEscpos.boldTranslate()
    .underlineTranslate()
    .invertTranslate(
      `<mark class="color-white" data-color="rgb(49, 49, 49)" style="background-color: rgb(49, 49, 49); color: inherit">`
    )
    .textSizeTranslate()
    .encode()

  const combinedMultiple = combineMultipleUint8Arrays([openTag, userText, closingTag])
  return combinedMultiple
}

async function printingOpenTag(sender: string): Promise<Uint8Array> {
  const encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "raster",
    font: "9x17",
  })

  return new Promise<Uint8Array>((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = function () {
      try {
        canvas.width = img.width
        canvas.height = img.height

        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          const result = encoder
            .initialize()
            .font("a")
            .underline(false)
            .italic(false)
            .invert(false)

            .align("left")
            .size(1)
            .image(imageData, 384, 96, "atkinson")
            .rule()
            .bold(true)
            .line(`Sender:  ${sender}`)
            .line("Send at: " + getFormattedDateTime())
            .bold(false)
            .rule()
            .encode()

          resolve(result)
        } else {
          reject(new Error("Could not get canvas context"))
        }
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = function (error) {
      reject(new Error("Failed to load image: " + error))
    }

    // Load the local image from public directory
    img.src = "/images/Toast.png"

    // Optional: Add timeout to prevent hanging
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
    imageMode: "raster",
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
