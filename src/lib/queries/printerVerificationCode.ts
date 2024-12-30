"use server"
import { and, eq, gt, lt } from "drizzle-orm"
import { InsertVerificationCode, verificationCodes, type newVerificationCode } from "../schema"
import { db } from ".."

export const createVerificationCode = async (printerId: string, code: string) => {
  const newCode: newVerificationCode = {
    code: code,
    printerId: printerId,
  }
  const validateInsert = InsertVerificationCode.parse(newCode)
  await deletePreviouslyCreatedVerificationCode(printerId)

  const result = await db
    .insert(verificationCodes)
    .values(validateInsert)
    .returning({ code: verificationCodes.code, expiresAt: verificationCodes.expiresAt })
  return result
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
