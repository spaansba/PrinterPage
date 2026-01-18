import type {
  PeriodWeather,
  weatherAstro,
  weatherLocation,
} from "@/lib/queries/subscriptions/weather";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import { PRINTER_WIDTH } from "@/lib/constants";
import {
  createCanvas,
  loadImage,
  type SKRSContext2D as CanvasRender,
  type Canvas,
} from "@napi-rs/canvas";
import { imageCanvas } from "./toastBanner";
import type { TempUnit } from "@/lib/schema/subscriptions";

export const weatherCardBytes = async (
  imageCanvas: imageCanvas,
): Promise<Uint8Array> => {
  const encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "column",
    font: "9x17",
  });

  const image = imageCanvas.context?.getImageData(
    0,
    0,
    imageCanvas.canvas.width,
    imageCanvas.canvas.height,
  );
  console.log(imageCanvas.canvas.height);
  return encoder
    .initialize()
    .raw([0x1b, 0x40])
    .font("a")
    .size(1)
    .image(image, PRINTER_WIDTH, imageCanvas.canvas.height, "atkinson", 128)
    .rule()
    .newline(2)
    .align("left")
    .encode() as Uint8Array;
};

export const drawLocationHeader = async (location: weatherLocation) => {
  // Create a canvas with a standard height for the header
  const canvas = createCanvas(PRINTER_WIDTH, 112);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, ctx };
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";

  // Date from localTimeEpoch
  const localDate = new Date(location.localTimeEpoch * 1000);
  const dateString = localDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Add date below location name
  ctx.font = "bold 18px Courier New";
  ctx.fillText(dateString, canvas.width / 2, 15);

  // Location name (main text)
  ctx.font = "bold 40px Courier New";
  ctx.fillText(location.name, canvas.width / 2, 55);

  // Smaller text for region and country
  const regionAndCountry = `${location.region}, ${location.country}`;
  if (regionAndCountry.length > 26) {
    ctx.font = "bold 18px Courier New";
  } else {
    ctx.font = "bold 24px Courier New";
  }
  const subLocationText = regionAndCountry;
  ctx.fillText(subLocationText, canvas.width / 2, 90);
  addStroke(ctx, canvas);
  return { canvas, ctx };
};

export const drawAstroCard = async (astro: weatherAstro) => {
  const canvas = createCanvas(PRINTER_WIDTH, 144);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, ctx };

  // Set background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";

  // Create two columns for sun and moon data
  const leftColX = 30;
  const rightColX = canvas.width / 2 + 30;
  const startY = 20;
  const lineHeight = 25;
  const triangleOffset = 12; // Space between triangle and text

  // Sun information (left column)
  ctx.textAlign = "left";
  ctx.font = "bold 24px Courier New";
  ctx.fillText("Sun", leftColX, startY);

  ctx.font = "bold 20px Courier New";
  // Draw sunrise triangle and text
  drawTriangle(ctx, leftColX + 8, startY + lineHeight - 6, true);
  ctx.fillText(
    astro.sunrise,
    leftColX + triangleOffset + 8,
    startY + lineHeight,
  );

  // Draw sunset triangle and text
  drawTriangle(ctx, leftColX + 8, startY + lineHeight * 2 - 6, false);
  ctx.fillText(
    astro.sunset,
    leftColX + triangleOffset + 8,
    startY + lineHeight * 2,
  );

  // Moon information (right column)
  ctx.font = "bold 24px Courier New";
  ctx.fillText("Moon", rightColX, startY);

  ctx.font = "bold 20px Courier New";
  // Draw moonrise triangle and text
  drawTriangle(ctx, rightColX + 8, startY + lineHeight - 6, true);
  ctx.fillText(
    astro.moonrise,
    rightColX + triangleOffset + 8,
    startY + lineHeight,
  );

  // Draw moonset triangle and text
  drawTriangle(ctx, rightColX + 8, startY + lineHeight * 2 - 6, false);
  ctx.fillText(
    astro.moonset,
    rightColX + triangleOffset + 8,
    startY + lineHeight * 2,
  );

  // Moon phase centered at bottom
  ctx.font = "bold 24px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("Moon Phase", canvas.width / 2, startY + lineHeight * 3 + 10);

  ctx.font = "bold 20px Courier New";
  ctx.fillText(astro.moonPhase, canvas.width / 2, startY + lineHeight * 4 + 6);

  addStroke(ctx, canvas);
  return { canvas, ctx };
};

export const drawWeatherCard = async (
  forcast: PeriodWeather,
  temperatureUnit: TempUnit,
) => {
  const canvas = createCanvas(PRINTER_WIDTH, 120);
  const ctx = canvas.getContext("2d");
  const iconSize = 55;
  const yCenterOffset = 10;
  if (!ctx) return { canvas, ctx };

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  // Period text at top
  ctx.font = "bold 24px Courier New";
  ctx.fillText(forcast.period, 10, 25);

  // Weather icon with black filter

  const iconX = 5;
  const iconY = (canvas.height - iconSize) / 2 + yCenterOffset;

  const image = await loadImage(`https:${forcast.condition.icon}`);
  ctx.drawImage(image, iconX, iconY, iconSize, iconSize);
  applyBlackFilter(ctx, iconX, iconY, iconSize, iconSize);
  // ctx.filter = "brightness(0)" // Make everything black

  // Temperature
  const tempNum = `${formatNumber(temperatureUnit === "Celsius" ? forcast.temp_c : forcast.temp_f)}`;

  // Main temperature number
  ctx.font = "bold 38px Courier New";
  const metrics = ctx.measureText(tempNum);
  const fontHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const tempWidth = metrics.width;
  const tempX = iconSize + 35 + (120 - (iconSize + 35)) / 2 - tempWidth / 2;
  const tempY =
    (canvas.height + fontHeight) / 2 -
    metrics.actualBoundingBoxDescent +
    yCenterOffset;
  ctx.fillText(tempNum, tempX, tempY);

  ctx.font = "bold 22px Courier New";
  const tempUnitChar = temperatureUnit === "Celsius" ? "C" : "F";
  ctx.fillText(
    `°${tempUnitChar}`,
    tempX + tempWidth - 4,
    tempY - fontHeight + 3,
  );

  // Info column
  const infoX = iconSize + 145;
  ctx.font = "bold 17px Courier New";
  ctx.fillText(`Rain Chance: ${forcast.chance_of_rain}%`, infoX, 40);
  ctx.fillText(`Wind: ${forcast.wind_kph} km/h`, infoX, 65);
  ctx.fillText(
    `Feels Like: ${
      temperatureUnit === "Celsius" ? forcast.feelslike_c : forcast.feelslike_f
    }°${tempUnitChar}`,
    infoX,
    90,
  );

  return { canvas, ctx };
};

export const applyBlackFilter = (
  ctx: CanvasRender,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  // Iterate through each pixel
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const alpha = data[i + 3];

    // Skip fully transparent pixels
    if (alpha === 0) continue;

    // Check if the pixel is white (all values close to 255)
    const isWhite = red > 250 && green > 250 && blue > 250;

    if (!isWhite) {
      // Calculate brightness using luminosity method
      const brightness = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

      // Make non-white pixels darker by reducing brightness more aggressively
      const darkness = Math.min(1, (1 - brightness) * 1.5);

      // Apply darkened values while preserving alpha
      data[i] = data[i + 1] = data[i + 2] = Math.round(255 * (1 - darkness));
    }
    // White pixels remain unchanged
  }

  // Put the modified image data back on the canvas
  ctx.putImageData(imageData, x, y);
};
const formatNumber = (c: number, totalLength: number = 5): string => {
  // Convert to string with one decimal place
  const formattedNum = c.toFixed(1);

  // Pad or trim to ensure consistent length
  return formattedNum.padStart(totalLength, " ");
};

const addStroke = (
  ctx: CanvasRender,
  canvas: Canvas,
  thickness = 3,
): CanvasRender => {
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - thickness);
  ctx.lineTo(canvas.width, canvas.height - thickness);
  ctx.stroke();
  return ctx;
};

const drawTriangle = (
  ctx: CanvasRender,
  x: number,
  y: number,
  isUpward: boolean,
  size: number = 8,
) => {
  ctx.save();
  ctx.beginPath();

  if (isUpward) {
    // Upward pointing triangle
    ctx.moveTo(x, y - size); // Top point
    ctx.lineTo(x - size, y + size); // Bottom left
    ctx.lineTo(x + size, y + size); // Bottom right
  } else {
    // Downward pointing triangle
    ctx.moveTo(x, y + size); // Bottom point
    ctx.lineTo(x - size, y - size); // Top left
    ctx.lineTo(x + size, y - size); // Top right
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
};
