"use client"
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
  LESS_THAN: 0x3c,
  GREATER_THAN: 0x3e,
  FSLASH: 0x2f,
  STRONG: [0x73, 0x74, 0x72, 0x6f, 0x6e, 0x67],
  U: 0x75,
  SPAN: [0x73, 0x70, 0x61, 0x6e],
  MARK: [0x6d, 0x61, 0x72, 0x6b],
} as const

const BOOL = {
  TRUE: 0x1,
  FALSE: 0x0,
} as const

type BoolCommand = {
  state: {
    on: number[]
    off: number[]
  }
  html: {
    open: number[]
    close: number[]
  }
}

type BoolCommands = {
  [key: string]: BoolCommand
}

export class HTMLBytesToESCPOSCommands {
  private _bytes: Uint8Array
  private _boolCommands: BoolCommands = {}
  constructor(bytes: Uint8Array) {
    this._bytes = bytes
  }

  underlineTranslate(): HTMLBytesToESCPOSCommands {
    this._boolCommands.underline = {
      state: {
        on: [CONTROL.ESC, 0x2d, BOOL.TRUE],
        off: [CONTROL.ESC, 0x2d, BOOL.FALSE],
      },
      html: {
        open: [TAGS.LESS_THAN, TAGS.U, TAGS.GREATER_THAN],
        close: [TAGS.LESS_THAN, TAGS.FSLASH, TAGS.U, TAGS.GREATER_THAN],
      },
    }
    return this
  }
  boldTranslate(): HTMLBytesToESCPOSCommands {
    this._boolCommands.bold = {
      state: {
        on: [CONTROL.ESC, 0x45, BOOL.TRUE],
        off: [CONTROL.ESC, 0x45, BOOL.FALSE],
      },
      html: {
        open: [TAGS.LESS_THAN, ...TAGS.STRONG, TAGS.GREATER_THAN], // <b>
        close: [TAGS.LESS_THAN, TAGS.FSLASH, ...TAGS.STRONG, TAGS.GREATER_THAN], // </b>
      },
    }
    return this
  }
  invertTranslate(invert: string): HTMLBytesToESCPOSCommands {
    this._boolCommands.invert = {
      state: {
        on: [CONTROL.GS, 0x42, BOOL.TRUE],
        off: [CONTROL.GS, 0x42, BOOL.FALSE],
      },
      html: {
        open: this.hexArrayFromString(invert),
        close: [TAGS.LESS_THAN, TAGS.FSLASH, ...TAGS.MARK, TAGS.GREATER_THAN],
      },
    }
    return this
  }

  // sizeTallWide(tallWide: string): HTMLBytesToESCPOSCommands {
  //   this._commands.tallWide = {
  //     multiState: {
  //       0: [CONTROL.GS, 0x21, 0x00],
  //       1: [CONTROL.GS, 0x21, 0x11],
  //       2: [CONTROL.GS, 0x21, 0x22],
  //       3: [CONTROL.GS, 0x21, 0x33],
  //       4: [CONTROL.GS, 0x21, 0x44],
  //       5: [CONTROL.GS, 0x21, 0x55],
  //       6: [CONTROL.GS, 0x21, 0x66],
  //       7: [CONTROL.GS, 0x21, 0x77],
  //     },
  //     html: {
  //       open: this.hexArrayFromString(tallWide),
  //       close: [TAGS.LESS_THAN, TAGS.FSLASH, ...TAGS.SPAN, TAGS.GREATER_THAN],
  //     },
  //   }
  //   return this
  // }

  private hexArrayFromString(str: string): number[] {
    return Array.from(str).map((char) => char.charCodeAt(0))
  }

  encode(): Uint8Array {
    Object.entries(this._boolCommands).forEach(([key, command]) => {
      const [replacedOpen, x] = htmlTagsToESCPOSEncoder(
        this._bytes,
        command.html.open,
        command.state.on
      )
      const [replacedClosed, y] = htmlTagsToESCPOSEncoder(
        replacedOpen,
        command.html.close,
        command.state.off
      )
      this._bytes = replacedClosed
    })
    return this._bytes
  }
}

export function htmlTagsTo() {}

export function htmlTagsToESCPOSEncoder(
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
      //"?" as wildcard
      if (array[i + j] !== findSequence[j] && array[i + j] !== 0x3f) {
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
