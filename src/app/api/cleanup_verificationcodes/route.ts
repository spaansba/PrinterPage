import { cleanupExpiredCodes } from "@/lib/queries/printerVerificationCode"
import { NextResponse, type NextRequest } from "next/server"

export async function GET() {
  try {
    await cleanupExpiredCodes()
    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Cleanup failed:", error)
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
}
