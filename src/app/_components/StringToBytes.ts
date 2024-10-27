import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder"
import { HTMLBytesToESCPOSCommands } from "../_classes/HTMLBytesToESCPOSCommands"

export const htmlContentToBytesWithCommands = (text: string): Uint8Array => {
  console.log(text)
  let utf8Encode = new TextEncoder()
  const encodedText = utf8Encode.encode(text)
  let HTMLByteToEscpos = new HTMLBytesToESCPOSCommands(encodedText)
  const openTag = printingOpenTag()
  const userText = HTMLByteToEscpos.boldTranslate()
    .underlineTranslate()
    .invertTranslate(`<span style="background-color: rgb(29, 29, 29); color: rgb(255, 255, 255);">`)
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
      .font("b")
      .invert(true)
      .line(tag)
      .invert(false)
      // .newline()
      // .text("sdafdsfsdfsfsdf ")
      // .newline()
      // .size(1, 2)
      // .text("asd asd")
      // .size(1, 1)
      // .text("new")
      // .newline()
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
