"use client"
import { processImage } from "../_helpers/ImageToBytes"

const TextJustify = {
  Left: 0,
  Center: 1,
  Right: 2,
} as const

const TEXT_SIZE_MAP = {
  "13": 0x00,
  "26": 0x11,
  "42": 0x22,
  "52": 0x33,
} as const

const HTML_ENTITIES = {
  LT: {
    entity: [0x26, 0x6c, 0x74, 0x3b], // "&lt;"
    value: 0x3c, // <
  },
  GT: {
    entity: [0x26, 0x67, 0x74, 0x3b], // "&gt;"
    value: 0x3e, // >
  },
  AMP: {
    entity: [0x26, 0x61, 0x6d, 0x70, 0x3b], // "&amp;"
    value: 0x26, // &
  },
  QUOT: {
    entity: [0x26, 0x71, 0x75, 0x6f, 0x74, 0x3b], // "&quot;"
    value: 0x22, // "
  },
  APOS: {
    entity: [0x26, 0x61, 0x70, 0x6f, 0x73, 0x3b], // "&apos;"
    value: 0x27, // '
  },
} as const

const CONTROL = {
  ESC: 0x1b,
  GS: 0x1d,
  FS: 0x1c,
  DC2: 0x12,
  LF: 0x0a,
} as const

const MODIFIERS = {
  HYPHEN: 0x2d, //-
  E: 0x45, //E
  B: 0x42, //B
}

const TAGS = {
  WILDCARD: 0x3f,
  LESS_THAN: 0x3c,
  GREATER_THAN: 0x3e,
  FSLASH: 0x2f,
  PIPE: 0x7c,
  STRONG: [0x73, 0x74, 0x72, 0x6f, 0x6e, 0x67],
  U: 0x75,
  SPAN: [0x73, 0x70, 0x61, 0x6e],
  MARK: [0x6d, 0x61, 0x72, 0x6b],
} as const

const BOOL = {
  TRUE_DOUBLE: 0x2,
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
        on: new Uint8Array([CONTROL.ESC, MODIFIERS.HYPHEN, BOOL.TRUE_DOUBLE]), // Always use 2 dots underline, 1 dot is very small and ugly (can change to 0x01 to test)
        off: new Uint8Array([CONTROL.ESC, MODIFIERS.HYPHEN, BOOL.FALSE]),
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
        on: new Uint8Array([CONTROL.ESC, MODIFIERS.E, BOOL.TRUE]),
        off: new Uint8Array([CONTROL.ESC, MODIFIERS.E, BOOL.FALSE]),
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
        on: new Uint8Array([CONTROL.GS, MODIFIERS.B, BOOL.TRUE]),
        off: new Uint8Array([CONTROL.GS, MODIFIERS.B, BOOL.FALSE]),
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

  public async encode(): Promise<Uint8Array> {
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

    this.addLineBreaks()
    this.convertEntitiesToHex()
    this.removeBasicTags()
    await this.convertImages()
    return this._bytes
  }

  private async convertImages(): Promise<void> {
    const blobPrefix = new Uint8Array([0x62, 0x6c, 0x6f, 0x62, 0x3a]) // blob:
    const dataImagePrefix = new Uint8Array([
      0x64, 0x61, 0x74, 0x61, 0x3a, 0x69, 0x6d, 0x61, 0x67, 0x65,
    ]) // data:image
    const replacements = new Map<number, { data: Uint8Array; length: number }>()
    const processingPromises: Promise<void>[] = []

    for (let i = 0; i < this._bytes.length; i++) {
      let isBlob = true
      let isDataImage = true

      for (let j = 0; j < blobPrefix.length; j++) {
        if (this._bytes[i + j] !== blobPrefix[j]) {
          isBlob = false
          break
        }
      }

      for (let j = 0; j < dataImagePrefix.length; j++) {
        if (this._bytes[i + j] !== dataImagePrefix[j]) {
          isDataImage = false
          break
        }
      }

      if (isBlob || isDataImage) {
        let urlEnd = i
        while (urlEnd < this._bytes.length && this._bytes[urlEnd] !== TAGS.PIPE) {
          urlEnd++
        }

        const urlBytes = this._bytes.slice(i, urlEnd)
        console.log(urlBytes.length)
        const imageUrl = String.fromCharCode.apply(null, Array.from(urlBytes))
        // console.log(imageUrl)
        // Create a promise for processing each image
        const processPromise = processImage(imageUrl)
          .then((processedBlob) => {
            if (!processedBlob || !processedBlob.data) {
              throw new Error("Invalid processed blob data")
            }
            replacements.set(i, {
              data: processedBlob.data,
              length: urlEnd - i + 1, // +1 to include the pipe character
            })
          })
          .catch((error) => {
            console.error("Error processing image:", error)
          })

        processingPromises.push(processPromise)
      }
    }

    await Promise.all(processingPromises)

    if (replacements.size > 0) {
      let newSize = this._bytes.length
      for (const replacement of replacements.values()) {
        newSize = newSize - replacement.length + replacement.data.length
      }

      const newArray = new Uint8Array(newSize)
      let targetIndex = 0
      let sourceIndex = 0

      const sortedIndices = Array.from(replacements.keys()).sort((a, b) => a - b)
      for (const replaceIndex of sortedIndices) {
        while (sourceIndex < replaceIndex) {
          newArray[targetIndex++] = this._bytes[sourceIndex++]
        }

        const replacement = replacements.get(replaceIndex)!
        newArray.set(replacement.data, targetIndex)
        targetIndex += replacement.data.length
        sourceIndex += replacement.length
      }

      while (sourceIndex < this._bytes.length) {
        newArray[targetIndex++] = this._bytes[sourceIndex++]
      }

      this._bytes = newArray
    }
  }

  private removeBasicTags() {
    const tagsToRemove = ["p", "span", "div"]

    tagsToRemove.forEach((tag) => {
      // Handle any tag variation (with or without class)
      let openTag = new Uint8Array([TAGS.LESS_THAN, ...this.hexArrayFromString(tag)])

      let i = 0
      while (i < this._bytes.length) {
        let matches = true
        for (let j = 0; j < openTag.length; j++) {
          if (this._bytes[i + j] !== openTag[j]) {
            matches = false
            break
          }
        }

        if (matches) {
          // Find the closing '>'
          let end = i
          while (end < this._bytes.length && this._bytes[end] !== TAGS.GREATER_THAN) {
            end++
          }

          const newArray = new Uint8Array(this._bytes.length - (end - i + 1))
          newArray.set(this._bytes.slice(0, i))
          newArray.set(this._bytes.slice(end + 1), i)
          this._bytes = newArray
        } else {
          i++
        }
      }

      const closeTag = new Uint8Array([
        TAGS.LESS_THAN,
        TAGS.FSLASH,
        ...this.hexArrayFromString(tag),
        TAGS.GREATER_THAN,
      ])

      const [result] = htmlTagsToESCPOSEncoder(
        this._bytes,
        closeTag,
        new Uint8Array([]),
        "remove",
        false
      )
      this._bytes = result
    })
  }

  private convertEntitiesToHex() {
    Object.values(HTML_ENTITIES).forEach((entity) => {
      const findSequence = new Uint8Array(entity.entity)
      const replaceSequence = new Uint8Array([entity.value])
      const [result] = htmlTagsToESCPOSEncoder(
        this._bytes,
        findSequence,
        replaceSequence,
        "entity",
        true
      )
      this._bytes = result
    })
  }

  private addLineBreaks() {
    const lineBreakTag = new Uint8Array(this.hexArrayFromString("<line-break>"))
    const emptyLineTag = new Uint8Array(
      this.hexArrayFromString(`<br class="ProseMirror-trailingBreak">`)
    )
    const lfByte = new Uint8Array([CONTROL.LF])

    const [result] = htmlTagsToESCPOSEncoder(this._bytes, lineBreakTag, lfByte, "linebreak", true)
    const [result2] = htmlTagsToESCPOSEncoder(result, emptyLineTag, lfByte, "emptyLine", true)
    this._bytes = result2
  }
}

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

  const sizeDiff = replaceSequence.length - findSequence.length
  const newSize = array.length + sizeDiff * replacements.size
  let newBitArray = new Uint8Array(newSize)

  let targetIndex = 0
  let currentIndex = 0

  // Sort the match indices to process them in order
  const sortedIndices = Array.from(replacements.keys()).sort((a, b) => a - b)

  sortedIndices.forEach((matchIndex) => {
    while (currentIndex < matchIndex) {
      newBitArray[targetIndex++] = array[currentIndex++]
    }

    const currentReplaceSequence = replacements.get(matchIndex)!
    for (let j = 0; j < currentReplaceSequence.length; j++) {
      newBitArray[targetIndex++] = currentReplaceSequence[j]
    }

    currentIndex += findSequence.length
  })

  // Copy any remaining bytes
  while (currentIndex < array.length) {
    newBitArray[targetIndex++] = array[currentIndex++]
  }

  return [newBitArray, replacementCount]
}
