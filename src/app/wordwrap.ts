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
    /* trim each line of the supplied text */
    return (
      this._lines
        /* split each line into an array of chunks, else mark it empty */
        .map((line) => line.match(re.chunk) || ["~~empty~~"])
        .map((lineWords) => lineWords.flat())
        .map((lineWords) => {
          return lineWords.reduce(
            (lines, word) => {
              const currentLine = lines[lines.length - 1]
              if (replaceAnsi(word).length + replaceAnsi(currentLine).length > 32) {
                lines.push(word)
              } else {
                lines[lines.length - 1] += word
              }
              return lines
            },
            [""]
          )
        })
        .flat()

        /* restore the user's original empty lines */
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

function trimLine(line: string) {
  return line.trim()
}

// removes ANSI escape sequences from text when calculating line lengths
function replaceAnsi(text: string) {
  return text.replace(re.ansiEscapeSequence, "")
}
