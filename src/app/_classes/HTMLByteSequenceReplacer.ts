import { Strikethrough } from "lucide-react"

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

const CONTROL = {
  ESC: 0x1b,
  GS: 0x1d,
  FS: 0x1c,
  DC2: 0x12,
} as const

const TAGS = {
  LESS_THAN: 0x3c, //
  GREATER_THAN: 0x3e, // >
  FSLASH: 0x2f, // /
  B: 0x62, // b
  U: 0x75, // u
  INVERT: [
    0x73, 0x70, 0x61, 0x6e, 0x20, 0x73, 0x74, 0x79, 0x6c, 0x65, 0x3d, 0x22, 0x62, 0x61, 0x63, 0x6b,
    0x67, 0x72, 0x6f, 0x75, 0x6e, 0x64, 0x2d, 0x63, 0x6f, 0x6c, 0x6f, 0x72, 0x3a, 0x20, 0x72, 0x67,
    0x62, 0x28, 0x32, 0x39, 0x2c, 0x20, 0x32, 0x39, 0x2c, 0x20, 0x32, 0x39, 0x29, 0x3b, 0x20, 0x63,
    0x6f, 0x6c, 0x6f, 0x72, 0x3a, 0x20, 0x77, 0x68, 0x69, 0x74, 0x65, 0x3b, 0x22,
  ] as const, // span style="background-color: rgb(29, 29, 29); color: white;
  SPAN: [0x73, 0x70, 0x61, 0x6e], // span
} as const

const BOOL = {
  TRUE: 0x1,
  FALSE: 0x0,
} as const

const commands = {
  bold: {
    on: [CONTROL.ESC, 0x45, BOOL.TRUE],
    off: [CONTROL.ESC, 0x45, BOOL.FALSE],
    html: {
      open: [TAGS.LESS_THAN, TAGS.B, TAGS.GREATER_THAN], // <b>
      close: [TAGS.LESS_THAN, TAGS.FSLASH, TAGS.B, TAGS.GREATER_THAN], // </b>
    },
  },
  underline: {
    on: [CONTROL.ESC, 0x2d, BOOL.TRUE],
    off: [CONTROL.ESC, 0x2d, BOOL.FALSE],
    html: {
      open: [TAGS.LESS_THAN, TAGS.U, TAGS.GREATER_THAN], // <u>
      close: [TAGS.LESS_THAN, TAGS.FSLASH, TAGS.U, TAGS.GREATER_THAN], // </u>
    },
  },
  invert: {
    on: [CONTROL.GS, 0x42, BOOL.TRUE],
    off: [CONTROL.GS, 0x42, BOOL.FALSE],
    html: {
      open: [TAGS.LESS_THAN, ...TAGS.INVERT, TAGS.GREATER_THAN], // <u>
      close: [TAGS.LESS_THAN, TAGS.FSLASH, ...TAGS.SPAN, TAGS.GREATER_THAN], // </u>
    },
  },
} as const

type possibleTags = "underline" | "bold" | "invert"

export class HTMLByteSequenceReplacer {
  private _bytes: Uint8Array
  constructor(bytes: Uint8Array) {
    this._bytes = bytes
  }

  underlineTranslate(): HTMLByteSequenceReplacer {
    this._bytes = this.general("underline")
    return this
  }
  boldTranslate(): HTMLByteSequenceReplacer {
    this._bytes = this.general("bold")
    return this
  }
  invertTranslate(): HTMLByteSequenceReplacer {
    this._bytes = this.general("invert")
    return this
  }

  private general(htmlTag: possibleTags) {
    const [replacedOpen, x] = findAndReplaceByteSequence(
      this._bytes,
      commands[htmlTag].html.open,
      commands[htmlTag].on
    )
    const [replacedClosed, y] = findAndReplaceByteSequence(
      replacedOpen,
      commands[htmlTag].html.close,
      commands[htmlTag].off
    )
    return replacedClosed
  }

  encode(): Uint8Array {
    return this._bytes
  }
}

export function findAndReplaceByteSequence(
  array: Uint8Array,
  findSequence: readonly number[],
  replaceSequence: readonly number[],
  startIndex: number = 0
): [Uint8Array, number] {
  let replacementCount = 0
  let matches: number[] = [] //Array of indexes of the start of each match

  // Find all matches in the users sequence
  for (let i = startIndex; i <= array.length - findSequence.length; i++) {
    let currentSequenceMatches = true
    for (let j = 0; j < findSequence.length; j++) {
      if (array[i + j] !== findSequence[j]) {
        currentSequenceMatches = false
        break
      }
    }
    if (currentSequenceMatches) {
      matches.push(i)
      replacementCount++
    }
  }

  // Calculate new array size since we need to create a new one and copy over the values
  const sizeDiff = replaceSequence.length - findSequence.length
  const newSize = array.length + sizeDiff * matches.length
  let newBitArray = new Uint8Array(newSize)

  let targetIndex = 0
  for (let i = 0; i < array.length; i++) {
    if (matches.includes(i)) {
      // Copy replacement sequence
      for (let j = 0; j < replaceSequence.length; j++) {
        newBitArray[targetIndex++] = replaceSequence[j]
      }
      // Skip the original sequence
      i += findSequence.length - 1
    } else {
      newBitArray[targetIndex++] = array[i]
    }
  }

  return [newBitArray, replacementCount]
}
