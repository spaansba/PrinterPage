"use server";
import { randomBytes } from "crypto";
import { VERIFICATION_CODE_LENGTH } from "./constants";

export async function createCode(): Promise<{
  code: string;
  bytes: Uint8Array;
}> {
  // Create charset without confusing characters (O, 0, I, L)
  const charset = "123456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "";
  const randomValues = randomBytes(VERIFICATION_CODE_LENGTH);

  for (let i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
    code += charset[randomValues[i] % charset.length];
  }

  // Convert to bytes for printing
  const encoder = new TextEncoder();
  const bytes = encoder.encode(code);

  return {
    code, // e.g., "A2B4C6" but without O, 0, I, L
    bytes, // e.g., Uint8Array containing ASCII values
  };
}
// Need to be send from server so user doesn't see the code in the network tab
export async function sendCodeToUser(code: Uint8Array, printerId: string) {
  // ESC/POS commands
  const ESC = 0x1b;
  const GS = 0x1d;

  const encoder = new TextEncoder();
  const message = encoder.encode("Toaster Verification Code:\n\n");
  const instruction = encoder.encode(
    "\n\nEnter this code in your app to\npair the printer to your account\n\n\n",
  );

  const printCommand = new Uint8Array([
    ESC,
    0x40, // Init
    ESC,
    0x61,
    0x01, // Center
    ESC,
    0x45,
    0x01, // Bold
    ...message, // Title
    ESC,
    0x21,
    0x30, // Double size
    ...code, // The verification code
    ESC,
    0x21,
    0x00, // Normal size
    ...instruction, // Instructions
    0x0a,
    0x0a, // Line feeds
    GS,
    0x56,
    0x00, // Cut
  ]);

  try {
    const response = await fetch(`https://${printerId}.toasttexter.com/print`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: Array.from(printCommand),
      }),
    });
    await response.text();
  } catch (error) {
    console.error("Error sending code:", error);
  }
}
