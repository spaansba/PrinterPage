import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { wordleUserGames, dailyWordleWords } from "@/lib/schema/wordle";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // Get today's wordle
    const [todayWordle] = await db
      .select()
      .from(dailyWordleWords)
      .where(eq(dailyWordleWords.date, today))
      .limit(1);

    if (todayWordle) {
      // Delete user's game for today
      await db
        .delete(wordleUserGames)
        .where(
          and(
            eq(wordleUserGames.userId, userId),
            eq(wordleUserGames.wordleId, todayWordle.id)
          )
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset game:", error);
    return NextResponse.json(
      { error: "Failed to reset game" },
      { status: 500 }
    );
  }
}
