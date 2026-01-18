"use server";

import { getWeatherReport } from "@/lib/queries/subscriptions/weather";
import { PRINTER_WIDTH } from "@/lib/constants";
import {
  drawAstroCard,
  drawLocationHeader,
  drawWeatherCard,
  weatherCardBytes,
} from "../_helpers/imageCreating/weatherCard";
import { createCanvas } from "@napi-rs/canvas";

export async function testWeatherPrint(location: string = "amsterdam") {
  const weather = await getWeatherReport(location);
  if (!weather.forecast?.length) {
    return { success: false, error: "No forecast data" };
  }

  try {
    // Create location header
    const locationHeader = await drawLocationHeader(weather.location!);
    const astroCard = await drawAstroCard(weather.astro);

    // Create weather cards
    const weatherCards = await Promise.all(
      weather.forecast.map((forecast) => drawWeatherCard(forecast, "Celsius")),
    );

    const spacing = 8;
    const totalHeight =
      locationHeader.canvas.height +
      astroCard.canvas.height +
      weatherCards.length * (weatherCards[0].canvas.height + spacing);

    const combinedCanvas = createCanvas(PRINTER_WIDTH, totalHeight);
    const combinedCtx = combinedCanvas.getContext("2d");

    // Draw location header first
    combinedCtx.drawImage(locationHeader.canvas, 0, 0);

    let currentY = locationHeader.canvas.height + spacing;
    combinedCtx.drawImage(astroCard.canvas, 0, currentY);
    currentY = currentY + astroCard.canvas.height + spacing;

    weatherCards.forEach((card) => {
      combinedCtx.drawImage(card.canvas, 0, currentY);
      currentY += card.canvas.height + spacing;
    });

    // Convert to printer bytes
    const content = await weatherCardBytes({
      canvas: combinedCanvas,
      context: combinedCtx,
    });

    // Get data URL for preview
    const dataUrl = combinedCanvas.toDataURL("image/png");

    // Send to printer
    await fetch(`https://fcs2ean4kg.toasttexter.com/print`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: Array.from(content),
      }),
    });

    return { success: true, dataUrl };
  } catch (error) {
    console.error("Error creating weather cards:", error);
    return { success: false, error: String(error) };
  }
}
