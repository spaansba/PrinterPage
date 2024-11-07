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

const TEXT_SIZE_MAP = {
  "13": 0x00,
  "26": 0x11,
  "42": 0x22,
  "52": 0x33,
} as const

const CONTROL = {
  ESC: 0x1b,
  GS: 0x1d,
  FS: 0x1c,
  DC2: 0x12,
} as const

const TAGS = {
  WILDCARD: 0x3f,
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
    on: Uint8Array
    off: Uint8Array
  }
  html: {
    open: Uint8Array
    close: Uint8Array
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
        on: new Uint8Array([CONTROL.ESC, 0x2d, BOOL.TRUE]),
        off: new Uint8Array([CONTROL.ESC, 0x2d, BOOL.FALSE]),
      },
      html: {
        open: new Uint8Array([TAGS.LESS_THAN, TAGS.U, TAGS.GREATER_THAN]),
        close: new Uint8Array([TAGS.LESS_THAN, TAGS.FSLASH, TAGS.U, TAGS.GREATER_THAN]),
      },
    }
    return this
  }

  boldTranslate(): HTMLBytesToESCPOSCommands {
    this._boolCommands.bold = {
      state: {
        on: new Uint8Array([CONTROL.ESC, 0x45, BOOL.TRUE]),
        off: new Uint8Array([CONTROL.ESC, 0x45, BOOL.FALSE]),
      },
      html: {
        open: new Uint8Array([TAGS.LESS_THAN, ...TAGS.STRONG, TAGS.GREATER_THAN]),
        close: new Uint8Array([TAGS.LESS_THAN, TAGS.FSLASH, ...TAGS.STRONG, TAGS.GREATER_THAN]),
      },
    }
    return this
  }
  invertTranslate(invert: string): HTMLBytesToESCPOSCommands {
    this._boolCommands.invert = {
      state: {
        on: new Uint8Array([CONTROL.GS, 0x42, BOOL.TRUE]),
        off: new Uint8Array([CONTROL.GS, 0x42, BOOL.FALSE]),
      },
      html: {
        open: new Uint8Array(this.hexArrayFromString(invert)),
        close: new Uint8Array([TAGS.LESS_THAN, TAGS.FSLASH, ...TAGS.MARK, TAGS.GREATER_THAN]),
      },
    }
    return this
  }

  textSizeTranslate(): HTMLBytesToESCPOSCommands {
    const openTagPattern = this.hexArrayFromString(`<text-size class="text-[`)
    openTagPattern.push(TAGS.WILDCARD, TAGS.WILDCARD) // for the size digits
    openTagPattern.push(...this.hexArrayFromString(`px]">`))

    this._boolCommands.size = {
      state: {
        on: new Uint8Array([CONTROL.GS, 0x21, 0x00]), // we change the 0 later on to the real value
        off: new Uint8Array([CONTROL.GS, 0x21, 0x00]),
      },
      html: {
        open: new Uint8Array(openTagPattern),
        close: new Uint8Array([
          TAGS.LESS_THAN,
          TAGS.FSLASH,
          ...this.hexArrayFromString(`text-size`),
          TAGS.GREATER_THAN,
        ]),
      },
    }
    return this
  }

  private hexArrayFromString(str: string): number[] {
    return Array.from(str).map((char) => char.charCodeAt(0))
  }

  encode(): Uint8Array {
    Object.entries(this._boolCommands).forEach(([key, command]) => {
      const [replacedOpen] = htmlTagsToESCPOSEncoder(
        this._bytes,
        command.html.open,
        command.state.on,
        key,
        true
      )
      const [replacedClosed] = htmlTagsToESCPOSEncoder(
        replacedOpen,
        command.html.close,
        command.state.off,
        key,
        false
      )
      this._bytes = replacedClosed
    })
    return this._bytes
  }
}

export function htmlTagsTo() {}

export function htmlTagsToESCPOSEncoder(
  array: Uint8Array,
  findSequence: Uint8Array,
  replaceSequence: Uint8Array,
  key: string,
  openTag: boolean,
  startIndex: number = 0
): [Uint8Array, number] {
  let replacementCount = 0
  // Create a Map to store matchIndex -> replaceSequence pairs
  const replacements = new Map<number, Uint8Array>()

  // Find all matches in the sequence
  for (let i = startIndex; i <= array.length - findSequence.length; i++) {
    let currentSequenceMatches = true
    for (let j = 0; j < findSequence.length; j++) {
      if (findSequence[j] === TAGS.WILDCARD) {
        continue
      }
      if (array[i + j] !== findSequence[j]) {
        currentSequenceMatches = false
        break
      }
    }

    if (currentSequenceMatches) {
      if (key === "size" && openTag) {
        const sizeStartIndex = i + findSequence.indexOf(TAGS.WILDCARD)
        const sizeDigits =
          String.fromCharCode(array[sizeStartIndex]) +
          String.fromCharCode(array[sizeStartIndex + 1])

        if (sizeDigits in TEXT_SIZE_MAP) {
          // Create a new replacement sequence for this specific size
          const specificReplaceSequence = new Uint8Array(replaceSequence)
          specificReplaceSequence[2] = TEXT_SIZE_MAP[sizeDigits as keyof typeof TEXT_SIZE_MAP]

          // Store the specific replacement sequence for this match
          replacements.set(i, specificReplaceSequence)
          replacementCount++
        }
      } else {
        // For non-size tags or closing tags, use the original replacement sequence
        replacements.set(i, replaceSequence)
        replacementCount++
      }
    }
  }

  // Calculate new array size
  const sizeDiff = replaceSequence.length - findSequence.length
  const newSize = array.length + sizeDiff * replacements.size
  let newBitArray = new Uint8Array(newSize)

  let targetIndex = 0
  let currentIndex = 0

  // Sort the match indices to process them in order
  const sortedIndices = Array.from(replacements.keys()).sort((a, b) => a - b)

  // Process each segment
  sortedIndices.forEach((matchIndex) => {
    // Copy bytes up to the match
    while (currentIndex < matchIndex) {
      newBitArray[targetIndex++] = array[currentIndex++]
    }

    // Get and copy the specific replacement sequence for this match
    const currentReplaceSequence = replacements.get(matchIndex)!
    for (let j = 0; j < currentReplaceSequence.length; j++) {
      newBitArray[targetIndex++] = currentReplaceSequence[j]
    }

    // Skip the original sequence
    currentIndex += findSequence.length
  })

  // Copy any remaining bytes
  while (currentIndex < array.length) {
    newBitArray[targetIndex++] = array[currentIndex++]
  }

  if (key === "size" && openTag) {
    console.log("Matches and their replacements:")
    replacements.forEach((sequence, index) => {
      console.log(`Match at ${index}:`, Array.from(sequence))
    })
  }

  return [newBitArray, replacementCount]
}
