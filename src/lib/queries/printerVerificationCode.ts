"use server";
import { and, eq, gt, lt } from "drizzle-orm";
import {
  InsertPrinterUserPairing,
  InsertVerificationAttempts,
  InsertVerificationCode,
  printerUserPairing,
  verificationAttempts,
  verificationCodes,
  type newPrinterUserPairing,
  type newVerificationAttempts,
  type newVerificationCode,
} from "../schema";
import { db } from "..";
import { createCode, sendCodeToUser } from "../helpers";

export const createValidatedUserEntry = async (
  printerId: string,
  userId: string,
) => {
  try {
    const newPairing: newPrinterUserPairing = {
      printerId: printerId,
      userId: userId,
    };

    const validatedPairing = InsertPrinterUserPairing.parse(newPairing);
    const result = await db
      .insert(printerUserPairing)
      .values(validatedPairing)
      .returning(); // Get the inserted row back

    if (result.length > 0) {
      await deletePreviouslyCreatedVerificationCode(printerId);
      return {
        success: true,
        message: "Printer successfully paired with user",
      };
    }

    return {
      success: false,
      message: "Failed to create printer-user pairing",
    };
  } catch (error) {
    console.error("Error creating user-printer pairing:", error);
    return {
      success: false,
      message: "Error creating printer-user pairing",
    };
  }
};

export const sendVerificationCode = async (printerId: string) => {
  try {
    return await db.transaction(async (tx) => {
      const verificationCode = await createCode();
      // Delete any existing codes
      await tx
        .delete(verificationCodes)
        .where(eq(verificationCodes.printerId, printerId));

      // Insert new code
      const newCode: newVerificationCode = {
        code: verificationCode.code,
        printerId: printerId,
      };
      const validateInsert = InsertVerificationCode.parse(newCode);

      const insertCode = await tx
        .insert(verificationCodes)
        .values(validateInsert)
        .returning({
          code: verificationCodes.code,
          expiresAt: verificationCodes.expiresAt,
        });

      if (insertCode.length > 0) {
        await sendCodeToUser(verificationCode.bytes, printerId);
        return {
          success: true,
          message: "Verification code sent successfully",
        };
      }

      return {
        success: false,
        message: "Failed to create verification code",
      };
    });
  } catch (error) {
    console.error("Error sending verification code:", error);
    return {
      success: false,
      message: "Error sending verification code",
    };
  }
};

export const checkVerificationCode = async (
  printerId: string,
  userInputtedCode: string,
) => {
  const now = new Date();
  const code = await db.query.verificationCodes.findFirst({
    where: and(
      eq(verificationCodes.printerId, printerId),
      eq(verificationCodes.code, userInputtedCode),
    ),
  });

  if (!code) {
    return {
      verified: false,
      message: "Invalid verification code",
    };
  }

  if (new Date(code.expiresAt + "Z").toISOString() < now.toISOString()) {
    return {
      verified: false,
      message: "Verification code has expired",
    };
  }

  return {
    verified: true,
    message: "",
  };
};

// If an user asks for a code multiple times within 5 minutes delete the previous code
export const deletePreviouslyCreatedVerificationCode = async (
  printerId: string,
) => {
  await db
    .delete(verificationCodes)
    .where(eq(verificationCodes.printerId, printerId));
};

// Gets called ones per day via Vercel Cron jobs (see api)
export const cleanupExpiredCodes = async () => {
  try {
    const now = new Date();
    await db
      .delete(verificationCodes)
      .where(lt(verificationCodes.expiresAt, now.toISOString()));
  } catch (error) {
    console.error("Error cleaning up expired codes:", error);
  }
};

// Gets called ones per day via Vercel Cron jobs (see api)
export const cleanupVerificationAttempts = async () => {
  try {
    const now = new Date();
    await db
      .delete(verificationAttempts)
      .where(lt(verificationAttempts.expiresAt, now));
  } catch (error) {
    console.error("Error cleaning up expired codes:", error);
  }
};

export const incrementVerificationAttempt = async (userId: string) => {
  const now = new Date();
  const maxAttemptsPerHour = 10;
  return await db.transaction(async (tx) => {
    const currentAttempt = await tx
      .select()
      .from(verificationAttempts)
      .where(
        and(
          eq(verificationAttempts.userId, userId),
          gt(verificationAttempts.expiresAt, now),
        ),
      )
      .limit(1);

    // If there was a previous attempt
    if (currentAttempt.length > 0) {
      const updatedCount = (currentAttempt[0].countLastHour || 0) + 1;

      await tx
        .update(verificationAttempts)
        .set({
          countLastHour: updatedCount,
        })
        .where(eq(verificationAttempts.id, currentAttempt[0].id));
      return {
        attemptsRemaining: Math.max(maxAttemptsPerHour - updatedCount, 0),
        blocked: updatedCount >= maxAttemptsPerHour,
        expiresAt: currentAttempt[0].expiresAt,
      };
    } else {
      // No current attempt record - create new one
      const newVerificationAttempt: newVerificationAttempts = {
        userId: userId,
        countLastHour: 1,
      };
      const validationVerificationAttempt = InsertVerificationAttempts.parse(
        newVerificationAttempt,
      );
      const result = await tx
        .insert(verificationAttempts)
        .values(validationVerificationAttempt)
        .returning();

      return {
        attemptsRemaining: maxAttemptsPerHour - 1,
        blocked: false,
        expiresAt: result[0].expiresAt,
      };
    }
  });
};
