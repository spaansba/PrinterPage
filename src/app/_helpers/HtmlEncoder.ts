import { processImage } from "./ImageToBytes"

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
  TEXT_SIZE: [0x74, 0x65, 0x78, 0x74, 0x2d, 0x73, 0x69, 0x7a, 0x65], // text-size
  TEXT: [
    0x20, 0x63, 0x6c, 0x61, 0x73, 0x73, 0x3d, 0x22, 0x74, 0x65, 0x78, 0x74, 0x2d, 0x5b, 0x3f, 0x3f,
    0x70, 0x78, 0x5d, 0x22,
  ], //  class="text-[??px]"
  SPAN: [0x73, 0x70, 0x61, 0x6e],
  MARK: [0x6d, 0x61, 0x72, 0x6b],
  IMAGE_MARKER: [0x7c, 0x26, 0x5e, 0x25, 0x69, 0x6d, 0x61, 0x67, 0x65, 0x3a], // |&^%image:
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

const BoolCommands: BoolCommands = {
  bold: {
    state: {
      on: new Uint8Array([CONTROL.ESC, MODIFIERS.E, BOOL.TRUE]),
      off: new Uint8Array([CONTROL.ESC, MODIFIERS.E, BOOL.FALSE]),
    },
    html: {
      open: new Uint8Array([TAGS.LESS_THAN, ...TAGS.STRONG, TAGS.GREATER_THAN]),
      close: new Uint8Array([TAGS.LESS_THAN, TAGS.FSLASH, ...TAGS.STRONG, TAGS.GREATER_THAN]),
    },
  },
  underline: {
    state: {
      on: new Uint8Array([CONTROL.ESC, MODIFIERS.HYPHEN, BOOL.TRUE_DOUBLE]), // Always use 2 dots underline, 1 dot is very small and ugly (can change to 0x01 to test)
      off: new Uint8Array([CONTROL.ESC, MODIFIERS.HYPHEN, BOOL.FALSE]),
    },
    html: {
      open: new Uint8Array([TAGS.LESS_THAN, TAGS.U, TAGS.GREATER_THAN]),
      close: new Uint8Array([TAGS.LESS_THAN, TAGS.FSLASH, TAGS.U, TAGS.GREATER_THAN]),
    },
  },
  invert: {
    state: {
      on: new Uint8Array([CONTROL.GS, MODIFIERS.B, BOOL.TRUE]),
      off: new Uint8Array([CONTROL.GS, MODIFIERS.B, BOOL.FALSE]),
    },
    html: {
      //<mark class="color-white" data-color="rgb(49, 49, 49)" style="background-color: rgb(49, 49, 49); color: inherit">
      open: new Uint8Array([
        0x3c, 0x6d, 0x61, 0x72, 0x6b, 0x20, 0x63, 0x6c, 0x61, 0x73, 0x73, 0x3d, 0x22, 0x63, 0x6f,
        0x6c, 0x6f, 0x72, 0x2d, 0x77, 0x68, 0x69, 0x74, 0x65, 0x22, 0x20, 0x64, 0x61, 0x74, 0x61,
        0x2d, 0x63, 0x6f, 0x6c, 0x6f, 0x72, 0x3d, 0x22, 0x72, 0x67, 0x62, 0x28, 0x34, 0x39, 0x2c,
        0x20, 0x34, 0x39, 0x2c, 0x20, 0x34, 0x39, 0x29, 0x22, 0x20, 0x73, 0x74, 0x79, 0x6c, 0x65,
        0x3d, 0x22, 0x62, 0x61, 0x63, 0x6b, 0x67, 0x72, 0x6f, 0x75, 0x6e, 0x64, 0x2d, 0x63, 0x6f,
        0x6c, 0x6f, 0x72, 0x3a, 0x20, 0x72, 0x67, 0x62, 0x28, 0x34, 0x39, 0x2c, 0x20, 0x34, 0x39,
        0x2c, 0x20, 0x34, 0x39, 0x29, 0x3b, 0x20, 0x63, 0x6f, 0x6c, 0x6f, 0x72, 0x3a, 0x20, 0x69,
        0x6e, 0x68, 0x65, 0x72, 0x69, 0x74, 0x22, 0x3e,
      ]),
      close: new Uint8Array([TAGS.LESS_THAN, TAGS.FSLASH, ...TAGS.MARK, TAGS.GREATER_THAN]),
    },
  },
  size: {
    state: {
      on: new Uint8Array([CONTROL.GS, 0x21, 0x00]), // we change the 0 later on to the real value
      off: new Uint8Array([CONTROL.GS, 0x21, 0x00]),
    },
    html: {
      //<text-size class="text-[??px]">
      open: new Uint8Array([TAGS.LESS_THAN, ...TAGS.TEXT_SIZE, ...TAGS.TEXT, TAGS.GREATER_THAN]),
      close: new Uint8Array([TAGS.LESS_THAN, TAGS.FSLASH, ...TAGS.TEXT_SIZE, TAGS.GREATER_THAN]),
    },
  },
}

export async function HtmlEncoder(originalArray: Uint8Array, imageArray: string[]) {
  let newArray = new Uint8Array(originalArray)
  debugArray(newArray, "Original")

  // Process boolean commands
  Object.entries(BoolCommands).forEach(([key, command]) => {
    const [replacedOpen] = htmlTagToESCPOSEncoder(
      newArray,
      command.html.open,
      command.state.on,
      key,
      true
    )
    const [replacedClosed] = htmlTagToESCPOSEncoder(
      replacedOpen,
      command.html.close,
      command.state.off,
      key,
      false
    )
    newArray = replacedClosed
  })
  debugArray(newArray, "After bool commands")

  newArray = await convertImages(newArray, imageArray)

  newArray = addLineBreaks(newArray)
  debugArray(newArray, "After line breaks")

  newArray = convertEntitiesToHex(newArray)
  debugArray(newArray, "After entities")

  newArray = removeBasicTags(newArray)
  debugArray(newArray, "After removing tags")

  return newArray
}

function addLineBreaks(array: Uint8Array): Uint8Array {
  const lineBreakTag = new Uint8Array(hexArrayFromString("<line-break>"))
  const emptyLineTag = new Uint8Array(hexArrayFromString(`<br class="ProseMirror-trailingBreak">`))
  const lfByte = new Uint8Array([CONTROL.LF])

  const [result] = htmlTagToESCPOSEncoder(array, lineBreakTag, lfByte, "linebreak", true)
  const [result2] = htmlTagToESCPOSEncoder(result, emptyLineTag, lfByte, "emptyLine", true)
  return result2
}

function convertEntitiesToHex(array: Uint8Array): Uint8Array {
  let result = new Uint8Array(array)

  Object.values(HTML_ENTITIES).forEach((entity) => {
    const findSequence = new Uint8Array(entity.entity)
    const replaceSequence = new Uint8Array([entity.value])
    const [newResult] = htmlTagToESCPOSEncoder(
      result,
      findSequence,
      replaceSequence,
      "entity",
      true
    )
    result = newResult
  })

  return result
}

function removeBasicTags(array: Uint8Array): Uint8Array {
  const tagsToRemove = ["p", "span", "div"]

  return tagsToRemove.reduce((acc, tag) => {
    let result = new Uint8Array(acc)

    // Remove opening tags with all their attributes
    let i = 0
    while (i < result.length) {
      if (result[i] === TAGS.LESS_THAN && result[i + 1] === hexArrayFromString(tag)[0]) {
        // Find the closing '>'
        let end = i
        while (end < result.length && result[end] !== TAGS.GREATER_THAN) {
          end++
        }

        if (end < result.length) {
          // Remove everything from '<' to '>'
          const newArray = new Uint8Array(result.length - (end - i + 1))
          newArray.set(result.slice(0, i))
          newArray.set(result.slice(end + 1), i)
          result = newArray
          continue
        }
      }
      i++
    }

    // Remove closing tags
    const closeTag = new Uint8Array([
      TAGS.LESS_THAN,
      TAGS.FSLASH,
      ...hexArrayFromString(tag),
      TAGS.GREATER_THAN,
    ])

    const [finalResult] = htmlTagToESCPOSEncoder(
      result,
      closeTag,
      new Uint8Array([]),
      "remove",
      false
    )

    return finalResult
  }, array)
}

// Add this debug helper function
function debugArray(array: Uint8Array, label: string = ""): void {
  const text = new TextDecoder().decode(array)
  console.log(`${label} (${array.length} bytes):`, text)
  console.log(
    "Hex:",
    Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ")
  )
}

function hexArrayFromString(str: string): number[] {
  return Array.from(str).map((char) => char.charCodeAt(0))
}

function htmlTagToESCPOSEncoder(
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

  let totalIndex = 0
  let currentIndex = 0

  // Sort the match indices to process them in order
  const sortedIndices = Array.from(replacements.keys()).sort((a, b) => a - b)

  sortedIndices.forEach((matchIndex) => {
    while (currentIndex < matchIndex) {
      newBitArray[totalIndex++] = array[currentIndex++]
    }

    const currentReplaceSequence = replacements.get(matchIndex)!
    for (let j = 0; j < currentReplaceSequence.length; j++) {
      newBitArray[totalIndex++] = currentReplaceSequence[j]
    }

    currentIndex += findSequence.length
  })

  // Copy any remaining bytes
  while (currentIndex < array.length) {
    newBitArray[totalIndex++] = array[currentIndex++]
  }

  return [newBitArray, replacementCount]
}

async function convertImages(array: Uint8Array, imageArray: string[]): Promise<Uint8Array> {
  const imageMarker = new Uint8Array([...TAGS.IMAGE_MARKER])
  const replacements = new Map<number, Uint8Array>()
  let replacementCount = 0

  for (let i = 0; i < array.length; i++) {
    let isImageMarker = true
    for (let j = 0; j < imageMarker.length; j++) {
      if (array[i + j] !== imageMarker[j]) {
        isImageMarker = false
        break
      }
    }
    if (isImageMarker) {
      const image = await processImage(imageArray[replacementCount])
      replacements.set(i, image)
      replacementCount++
    }
  }

  if (replacementCount > 0) {
    // Calculate total size of all replacement images
    const totalImageSize = Array.from(replacements.values()).reduce(
      (total, image) => total + image.length,
      0
    )

    // Calculate final array size: original size - markers + images
    const newSize = array.length - replacementCount * imageMarker.length + totalImageSize

    const bitArrayWithImages = replaceArrays(array, replacements, newSize, imageMarker.length)
    return bitArrayWithImages
  }
  return array
}

function replaceArrays(
  mainArray: Uint8Array,
  replacements: Map<number, Uint8Array>,
  newArraySize: number,
  replaceSize: number
): Uint8Array {
  let newBitArray = new Uint8Array(newArraySize)
  let targetIndex = 0
  let currentIndex = 0

  // Sort the match indices to process them in order
  const sortedIndices = Array.from(replacements.keys()).sort((a, b) => a - b)

  sortedIndices.forEach((matchIndex) => {
    while (currentIndex < matchIndex) {
      newBitArray[targetIndex++] = mainArray[currentIndex++]
    }

    const currentReplacementSequence = replacements.get(matchIndex)!
    for (let j = 0; j < currentReplacementSequence.length; j++) {
      newBitArray[targetIndex++] = currentReplacementSequence[j]
    }
    currentIndex += replaceSize
  })

  // Copy any remaining bytes
  while (currentIndex < mainArray.length) {
    newBitArray[targetIndex++] = mainArray[currentIndex++]
  }
  console.log(newBitArray)
  return newBitArray
}
