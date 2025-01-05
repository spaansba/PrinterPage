export type Lines = { characters: string; characterCount: number }[]
// Since you cant see the visual line breaks (like you see on the website) inside an html element
// We extract those here.
export function getVisualLinesFromHTML(element: HTMLElement): Lines {
  const lines: Lines = []
  const positions: { char: string; baseline: number }[] = []
  const range = document.createRange()

  // Get every character and calculate its baseline position
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let node

  while ((node = walker.nextNode())) {
    const text = node.textContent || ""
    const parentElement = node.parentElement

    for (let i = 0; i < text.length; i++) {
      try {
        range.setStart(node, i)
        range.setEnd(node, i + 1)
        const rect = range.getBoundingClientRect()

        // Get the computed font size of the parent element
        const style = window.getComputedStyle(parentElement!)
        const fontSize = parseFloat(style.fontSize)

        // Calculate the baseline position
        // The baseline is typically around 20% from the bottom for most fonts
        const baseline = rect.bottom - fontSize * 0.2

        positions.push({
          char: text[i],
          baseline: Math.round(baseline),
        })
      } catch (e) {
        console.error("Error measuring character:", e)
      }
    }
  }

  // Sort positions by baseline to handle potential out-of-order characters
  positions.sort((a, b) => a.baseline - b.baseline)

  // Group by baseline position with a tolerance for different font sizes
  let currentLine = ""
  let lastBaseline = positions[0]?.baseline
  const TOLERANCE = 3 // Slightly larger tolerance to account for baseline calculation

  for (const pos of positions) {
    // If the baseline difference is greater than our tolerance, it's a new line
    if (Math.abs((lastBaseline || 0) - pos.baseline) > TOLERANCE) {
      if (currentLine.trim()) {
        lines.push({ characters: currentLine.trim(), characterCount: currentLine.length })
      }
      currentLine = pos.char
      lastBaseline = pos.baseline
    } else {
      currentLine += pos.char
    }
  }

  // Add final line
  if (currentLine.trim()) {
    lines.push({ characters: currentLine.trim(), characterCount: currentLine.length })
  }

  range.detach()
  return lines
}
