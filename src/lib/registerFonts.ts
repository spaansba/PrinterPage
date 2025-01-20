import { registerFont } from "canvas"
import path from "path"

let fontsRegistered = false

export function registerFonts() {
  // Only register fonts once
  if (fontsRegistered) return

  try {
    registerFont(path.join(process.cwd(), "fonts", "CourierPrime-Regular.ttf"), {
      family: "Courier New",
      style: "normal",
      weight: "normal",
    })

    registerFont(path.join(process.cwd(), "fonts", "CourierPrime-Bold.ttf"), {
      family: "Courier New",
      style: "normal",
      weight: "bold",
    })

    registerFont(path.join(process.cwd(), "fonts", "CourierPrime-Italic.ttf"), {
      family: "Courier New",
      style: "italic",
      weight: "normal",
    })

    registerFont(path.join(process.cwd(), "fonts", "CourierPrime-BoldItalic.ttf"), {
      family: "Courier New",
      style: "italic",
      weight: "bold",
    })

    fontsRegistered = true
  } catch (error) {
    console.error("Error registering fonts:", error)
  }
}
