import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import { PRINTER_WIDTH } from "@/lib/constants";
import {
  createCanvas,
  type SKRSContext2D as CanvasRender,
} from "@napi-rs/canvas";
import type { LetterResult } from "@/lib/queries/wordle";

const BOX_SIZE = 50;
const BOX_GAP = 8;
const GRID_WIDTH = BOX_SIZE * 5 + BOX_GAP * 4;
const GRID_START_X = (PRINTER_WIDTH - GRID_WIDTH) / 2;

// Draw a single letter box with the appropriate style
function drawLetterBox(
  ctx: CanvasRender,
  x: number,
  y: number,
  letter: string,
  status: "correct" | "present" | "absent" | "empty",
) {
  // Box styling based on status
  switch (status) {
    case "correct":
      // Filled black box with white text (inverted)
      ctx.fillStyle = "#000000";
      ctx.fillRect(x, y, BOX_SIZE, BOX_SIZE);
      ctx.fillStyle = "#ffffff";
      break;
    case "present":
      // Outlined box with black text and thick border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, BOX_SIZE, BOX_SIZE);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 2, y + 2, BOX_SIZE - 4, BOX_SIZE - 4);
      ctx.fillStyle = "#000000";
      break;
    case "absent":
      // Just outline, no fill
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, BOX_SIZE, BOX_SIZE);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, BOX_SIZE, BOX_SIZE);
      ctx.fillStyle = "#000000";
      break;
    case "empty":
      // Empty outlined box
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, BOX_SIZE, BOX_SIZE);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, BOX_SIZE, BOX_SIZE);
      ctx.fillStyle = "#000000";
      break;
  }

  // Draw letter
  if (letter) {
    ctx.font = "bold 32px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter.toUpperCase(), x + BOX_SIZE / 2, y + BOX_SIZE / 2 + 2);
  }
}

// Draw a row of 5 letter boxes
function drawGuessRow(
  ctx: CanvasRender,
  y: number,
  result: LetterResult[] | null,
) {
  for (let i = 0; i < 5; i++) {
    const x = GRID_START_X + i * (BOX_SIZE + BOX_GAP);
    if (result && result[i]) {
      drawLetterBox(ctx, x, y, result[i].letter, result[i].status);
    } else {
      drawLetterBox(ctx, x, y, "", "empty");
    }
  }
}

// Create the wordle card image
export async function createWordleCard(
  guessResults: LetterResult[][],
  guessNumber: number,
  gameStatus: "playing" | "won" | "lost",
) {
  const headerHeight = 50;
  const gridHeight = 6 * (BOX_SIZE + BOX_GAP) - BOX_GAP;
  const footerHeight = 16;
  const statusHeight = gameStatus !== "playing" ? 40 : 0;
  // Ensure height is a multiple of 8 for the printer encoder
  const rawHeight = headerHeight + gridHeight + statusHeight + footerHeight;
  const totalHeight = Math.ceil(rawHeight / 8) * 8;

  const canvas = createCanvas(PRINTER_WIDTH, totalHeight);
  const ctx = canvas.getContext("2d");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = "#000000";
  ctx.font = "bold 28px Courier New";
  ctx.textAlign = "center";
  ctx.fillText(`TOASTLE - Guess ${guessNumber}/6`, PRINTER_WIDTH / 2, 35);

  // Draw grid rows
  const gridStartY = headerHeight;
  for (let row = 0; row < 6; row++) {
    const y = gridStartY + row * (BOX_SIZE + BOX_GAP);
    const result = guessResults[row] || null;
    drawGuessRow(ctx, y, result);
  }

  // Status message if game ended
  let currentY = gridStartY + gridHeight + 15;
  if (gameStatus !== "playing") {
    ctx.font = "bold 24px Courier New";
    ctx.textAlign = "center";
    if (gameStatus === "won") {
      ctx.fillText("WINNER!", PRINTER_WIDTH / 2, currentY);
    } else {
      ctx.fillText("GAME OVER", PRINTER_WIDTH / 2, currentY);
    }
    currentY += 35;
  }

  return { canvas, ctx };
}

// Convert wordle card to printer bytes
export async function wordleCardBytes(
  guessResults: LetterResult[][],
  guessNumber: number,
  gameStatus: "playing" | "won" | "lost",
): Promise<Uint8Array> {
  const { canvas, ctx } = await createWordleCard(
    guessResults,
    guessNumber,
    gameStatus,
  );

  const encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "column",
    font: "9x17",
  });

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return encoder
    .initialize()
    .raw([0x1b, 0x40])
    .font("a")
    .size(1)
    .rule()
    .image(image, PRINTER_WIDTH, canvas.height, "threshold", 128)
    .newline(2)
    .encode() as Uint8Array;
}
