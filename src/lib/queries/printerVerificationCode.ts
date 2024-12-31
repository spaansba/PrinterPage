"use server"
import { and, eq, gt, lt } from "drizzle-orm"
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
} from "../schema"
import { db } from ".."

export const checkIfAlreadyPaired = async (printerId: string, userId: string) => {
  return await db
    .select()
    .from(printerUserPairing)
    .where(and(eq(printerUserPairing.printerId, printerId), eq(printerUserPairing.userId, userId)))
}

export const createValidatedUserEntry = async (printerId: string, userId: string) => {
  const newPairing: newPrinterUserPairing = {
    printerId: printerId,
    userId: userId,
  }
  const validatedPairing = InsertPrinterUserPairing.parse(newPairing)
  const result = await db.insert(printerUserPairing).values(validatedPairing)
  if (result) {
    await deletePreviouslyCreatedVerificationCode(printerId)
  }
}

export const createVerificationCode = async (printerId: string, code: string) => {
  const newCode: newVerificationCode = {
    code: code,
    printerId: printerId,
  }
  const validateInsert = InsertVerificationCode.parse(newCode)
  await deletePreviouslyCreatedVerificationCode(printerId)

  return await db
    .insert(verificationCodes)
    .values(validateInsert)
    .returning({ code: verificationCodes.code, expiresAt: verificationCodes.expiresAt })
}

export const checkVerificationCode = async (printerId: string, userInputtedCode: string) => {
  const now = new Date()
  const code = await db.query.verificationCodes.findFirst({
    where: and(
      eq(verificationCodes.printerId, printerId),
      eq(verificationCodes.code, userInputtedCode)
    ),
  })

  if (!code) {
    return {
      verified: false,
      message: "Invalid verification code",
    }
  }

  if (code.expiresAt < now) {
    return {
      verified: false,
      message: "Verification code has expired",
    }
  }

  return {
    verified: true,
    message: "",
  }
}

// If an user asks for a code multiple times within 5 minutes delete the previous code
export const deletePreviouslyCreatedVerificationCode = async (printerId: string) => {
  await db.delete(verificationCodes).where(eq(verificationCodes.printerId, printerId))
}

// Gets called ones per day via Vercel Cron jobs (see api)
export const cleanupExpiredCodes = async () => {
  try {
    const now = new Date()
    await db.delete(verificationCodes).where(lt(verificationCodes.expiresAt, now))
  } catch (error) {
    console.error("Error cleaning up expired codes:", error)
  }
}

// Gets called ones per day via Vercel Cron jobs (see api)
export const cleanupVerificationAttempts = async () => {
  try {
    const now = new Date()
    await db.delete(verificationAttempts).where(lt(verificationAttempts.expiresAt, now))
  } catch (error) {
    console.error("Error cleaning up expired codes:", error)
  }
}

// export const incrementPrinterMessageStats = async (userId: string, associatedPrinterId: string) => {
//   const exists = await checkIfPrinterIsAssociated(userId, associatedPrinterId)
//   if (!exists) {
//     return
//   }

//   // Global message counter
//   await db
//     .update(users)
//     .set({ messagesSend: sql`${users.messagesSend} + 1` })
//     .where(eq(users.id, userId))

//   // Message counter per associated printer ID
//   await db
//     .update(usersAssociatedPrinters)
//     .set({
//       lastSendMessage: new Date().toISOString(),
//       messagesSendToAssociatedPrinter: sql`${usersAssociatedPrinters.messagesSendToAssociatedPrinter} + 1`,
//     })
//     .where(
//       and(
//         eq(usersAssociatedPrinters.userId, userId),
//         eq(usersAssociatedPrinters.associatedPrinterId, associatedPrinterId)
//       )
//     )
// }

export const incrementVerificationAttempt = async (userId: string) => {
  const now = new Date()
  const maxAttemptsPerHour = 10
  return await db.transaction(async (tx) => {
    const currentAttempt = await tx
      .select()
      .from(verificationAttempts)
      .where(and(eq(verificationAttempts.userId, userId), gt(verificationAttempts.expiresAt, now)))
      .limit(1)

    // If there was a previous attempt
    if (currentAttempt.length > 0) {
      const updatedCount = (currentAttempt[0].countLastHour || 0) + 1

      await tx
        .update(verificationAttempts)
        .set({
          countLastHour: updatedCount,
          updatedAt: now.toISOString(),
        })
        .where(eq(verificationAttempts.id, currentAttempt[0].id))
      return {
        attemptsRemaining: Math.max(maxAttemptsPerHour - updatedCount, 0),
        blocked: updatedCount >= maxAttemptsPerHour,
        expiresAt: currentAttempt[0].expiresAt,
      }
    } else {
      // No current attempt record - create new one
      const newVerificationAttempt: newVerificationAttempts = {
        userId: userId,
        countLastHour: 1,
      }
      const validationVerificationAttempt = InsertVerificationAttempts.parse(newVerificationAttempt)
      const result = await tx
        .insert(verificationAttempts)
        .values(validationVerificationAttempt)
        .returning()

      return {
        attemptsRemaining: maxAttemptsPerHour - 1,
        blocked: false,
        expiresAt: result[0].expiresAt,
      }
    }
  })
}
