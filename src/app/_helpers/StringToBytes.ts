"use client"
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder"
import { HTMLBytesToESCPOSCommands } from "../_classes/HTMLBytesToESCPOSCommands"

export const htmlContentToBytesWithCommands = async (text: string): Promise<Uint8Array> => {
  console.log(text)
  const cleanText = text
    .replaceAll("<p>", "")
    .replaceAll("</p>", "")
    .replaceAll("<span>", "")
    .replaceAll("</span>", "")
  console.log(cleanText)
  let utf8Encode = new TextEncoder()
  const encodedText = utf8Encode.encode(cleanText)
  let HTMLByteToEscpos = new HTMLBytesToESCPOSCommands(encodedText)
  const openTag = printingOpenTag()
  const userText = HTMLByteToEscpos.boldTranslate()
    .underlineTranslate()
    .invertTranslate(
      `<mark class="color-white" data-color="rgb(49, 49, 49)" style="background-color: rgb(49, 49, 49); color: inherit">`
    )
    .textSizeTranslate()
    .encode()
  console.log(userText)

  const closingTag = await printingClosingTag()
  const combinedMultiple = combineMultipleUint8Arrays([openTag, userText, closingTag])
  return combinedMultiple
}

function printingOpenTag(): Uint8Array {
  let encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "raster",
    font: "9x17",
  })
  return encoder
    .initialize()
    .font("a")
    .underline(false)
    .italic(false)
    .align("left")
    .bold(false)
    .size(1)
    .invert(false)
    .line("----------NEW MESSAGE----------")
    .invert(false)
    .line("Sender:  Bart")
    .line("Send at: " + getFormattedDateTime())
    .rule()
    .encode()
}

async function printingClosingTag(): Promise<Uint8Array> {
  let encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "raster",
    font: "9x17",
  })

  // Create a promise to handle image loading
  const loadLocalImage = (): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      // Use a local image from your public directory
      img.src = "/images/Knipsel.PNG" // Make sure this file exists in your public folder
    })
  }

  try {
    // Use either Option 1 or Option 2
    // const img = await loadImageWithProxy("https://images.pexels.com/photos/28029772/pexels-photo-28029772/free-photo-of-man-vent-kerel-model.jpeg")
    const img = await loadLocalImage()

    return (
      encoder
        .newline(1)
        .rule({ style: "double" })
        .newline(3)
        // .image(img, 128, 128, "atkinson")
        .encode()
    )
  } catch (error) {
    console.error("Error loading image:", error)
    return encoder
      .newline(1)
      .rule({ style: "double" })
      .newline(3)
      .text("Image loading failed")
      .newline(1)
      .encode()
  }
}

function combineMultipleUint8Arrays(arrays: Uint8Array[]) {
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

  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`
}
