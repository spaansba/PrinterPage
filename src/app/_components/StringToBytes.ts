const TextJustify = {
  Left: 0,
  Center: 1,
  Right: 2,
} as const

const QRCodeErrorCorrectionLevel = {
  L: 48,
  M: 49,
  Q: 50,
  H: 51,
} as const

const ASCII = {
  ESC: 0x1b,
  GS: 0x1d,
  FS: 0x1c,
  DC2: 0x12,
} as const

export const htmlContentToBytesWithCommands = (text: string): Uint8Array => {
  let utf8Encode = new TextEncoder()
  console.log(text)

  const sendHTMLBytes = utf8Encode.encode(text)
  const boldStart = utf8Encode.encode(ASCII.ESC + "E" + true + " " + text)
  console.log(boldStart)
  return sendHTMLBytes
}
