import {
  cleanupExpiredCodes,
  cleanupVerificationAttempts,
} from "@/lib/queries/printerVerificationCode";
import { NextResponse, type NextRequest } from "next/server";

// Get called ones a day by Vercel cron jobs (check vercel.json)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    // We combine it since you cant have many cron jobs in vercel
    await cleanupExpiredCodes();
    await cleanupVerificationAttempts();
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Cleanup failed:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
