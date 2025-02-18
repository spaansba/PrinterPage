import { registerFont } from "canvas"
import path from "path"
import fs from "fs"

let fontsRegistered = false

interface FontConfig {
  filename: string
  config: {
    family: string
    style?: string
    weight?: string
  }
}

const FONT_CONFIGS: FontConfig[] = [
  {
    filename: "CourierPrime-Regular.ttf",
    config: {
      family: "Courier New",
      style: "normal",
      weight: "normal",
    },
  },
  {
    filename: "CourierPrime-Bold.ttf",
    config: {
      family: "Courier New",
      style: "normal",
      weight: "bold",
    },
  },
  {
    filename: "CourierPrime-Italic.ttf",
    config: {
      family: "Courier New",
      style: "italic",
      weight: "normal",
    },
  },
  {
    filename: "CourierPrime-BoldItalic.ttf",
    config: {
      family: "Courier New",
      style: "italic",
      weight: "bold",
    },
  },
]

export function registerFonts() {
  // Only register fonts once
  if (fontsRegistered) {
    return
  }

  const fontDir = path.join(process.cwd(), "fonts")

  // First check if fonts directory exists
  if (!fs.existsSync(fontDir)) {
    console.error(`Fonts directory not found: ${fontDir}`)
    return
  }

  let successCount = 0
  const errors: string[] = []

  for (const fontConfig of FONT_CONFIGS) {
    const fontPath = path.join(fontDir, fontConfig.filename)

    try {
      // Check if font file exists
      if (!fs.existsSync(fontPath)) {
        throw new Error(`Font file not found: ${fontPath}`)
      }

      // Register the font
      registerFont(fontPath, fontConfig.config)
      successCount++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push(`Failed to register ${fontConfig.filename}: ${errorMessage}`)
    }
  }

  if (successCount === FONT_CONFIGS.length) {
    fontsRegistered = true
    console.log("All fonts registered successfully")
  } else {
    console.error(
      `Font registration partially completed: ${successCount}/${FONT_CONFIGS.length} fonts registered`
    )
    if (errors.length > 0) {
      console.error("Font registration errors:", errors)
    }
  }
}
