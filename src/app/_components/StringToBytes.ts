import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder"
import { HTMLBytesToESCPOSCommands } from "../_classes/HTMLBytesToESCPOSCommands"

export const htmlContentToBytesWithCommands = (text: string): Uint8Array => {
  const textWithoutPTag = text.replace("<p>", "")
  const textWithoutPTag2 = textWithoutPTag.replace("</p>", "")
  let utf8Encode = new TextEncoder()
  const encodedText = utf8Encode.encode(textWithoutPTag2)
  let HTMLByteToEscpos = new HTMLBytesToESCPOSCommands(encodedText)
  const openTag = printingOpenTag()
  console.log(openTag)
  const userText = HTMLByteToEscpos.boldTranslate()
    .underlineTranslate()
    .invertTranslate(
      `<mark class="color-white" data-color="rgb(49, 49, 49)" style="background-color: rgb(49, 49, 49); color: inherit">`
    )
    // .sizeTallWide(`<span class="text-[??px]">`)
    .encode()
  const closingTag = printingClosingTag()
  const combinedMultiple = combineMultipleUint8Arrays([openTag, userText, closingTag])
  return combinedMultiple
}

function printingOpenTag(): Uint8Array {
  const tag = "----------NEW MESSAGE----------"
  let encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "raster",
    font: "9x17",
  })
  return (
    encoder
      .initialize()
      .font("a")
      .invert(false)
      .line(tag)
      .invert(false)
      // .newline()
      // .newline()
      // .size(8, 1)
      // .text("twee en een")
      // .newline()
      // .size(1, 2)
      // .text("een en twee")
      // .newline()
      // .size(2, 2)
      // .text("twee en twee")
      // .newline()
      // .size(1, 1)
      // .text("een en een")
      .newline()
      .encode()
  )
}

function printingClosingTag(): Uint8Array {
  const tag = "******************"
  let encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "raster",
    font: "9x17",
  })
  return encoder.newline(3).line(tag).newline(2).encode()
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
