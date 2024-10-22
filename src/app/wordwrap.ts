const re = {
  // Matches either:
  // - A sequence of non-whitespace chars ending with hyphen at word boundary
  // - Any non-whitespace sequence
  // - Any whitespace sequence
  // - Carriage return and/or newline
  chunk: /[^\s-]+?-\b|\S+|\s+|\r\n?|\n/g,

  // Matches ANSI escape sequences (used for terminal colors/formatting)
  ansiEscapeSequence: /\u001b.*?m/g,
}

export class WordWrap {
  private _lines: string[]
  constructor(text: string) {
    this._lines = String(text).split(/\r\n|\n/g)
  }

  lines() {
    return (
      this._lines
        .map((line) => line.match(re.chunk) || ["~~empty~~"])
        .map((lineWords) => lineWords.flat())
        .map((lineWords) => {
          return lineWords.reduce(
            (lines, word) => {
              const currentLine = lines[lines.length - 1]
              const wordLength = replaceAnsi(word).length
              const currentLength = replaceAnsi(currentLine).length

              // If the current line is already at 32 chars, start a new line
              if (currentLength >= 32) {
                lines.push(word)
              }

              // If adding the word would exceed 32 chars
              else if (wordLength + currentLength > 32) {
                // If the word itself is longer than 32 chars, split it
                if (wordLength > 32) {
                  const firstPart = word.slice(0, 32 - currentLength)
                  const remainingPart = word.slice(32 - currentLength)
                  lines[lines.length - 1] += firstPart
                  lines.push(remainingPart)
                } else {
                  lines.push(word)
                }
              } else {
                lines[lines.length - 1] += word
              }
              return lines
            },
            [""]
          )
        })
        .flat()

        /* filter out empty lines created by the word wrap */
        .filter((line) => line.trim())

        /* Put empty lines created by the user back */
        .map((line) => line.replace("~~empty~~", ""))
    )
  }

  wrap() {
    return this.lines().join("\n")
  }

  static wrap(text: string) {
    const block = new this(text)
    return block.wrap()
  }

  static lines(text: string) {
    const block = new this(text)
    return block.lines()
  }

  static isWrappable(text: string) {
    const matches = String(text).match(re.chunk)
    return matches ? matches.length > 1 : false
  }
}

// removes ANSI escape sequences from text when calculating line lengths
function replaceAnsi(text: string) {
  return text.replace(re.ansiEscapeSequence, "")
}
