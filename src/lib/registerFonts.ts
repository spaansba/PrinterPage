import { GlobalFonts } from "@napi-rs/canvas";
import path from "path";

let fontsRegistered = false;

export function registerFonts() {
  // Only register fonts once
  if (fontsRegistered) return;

  try {
    GlobalFonts.registerFromPath(
      path.join(process.cwd(), "fonts", "CourierPrime-Regular.ttf"),
      "Courier New",
    );

    GlobalFonts.registerFromPath(
      path.join(process.cwd(), "fonts", "CourierPrime-Bold.ttf"),
      "Courier New",
    );

    GlobalFonts.registerFromPath(
      path.join(process.cwd(), "fonts", "CourierPrime-Italic.ttf"),
      "Courier New",
    );

    GlobalFonts.registerFromPath(
      path.join(process.cwd(), "fonts", "CourierPrime-BoldItalic.ttf"),
      "Courier New",
    );

    fontsRegistered = true;
  } catch (error) {
    console.error("Error registering fonts:", error);
  }
}
