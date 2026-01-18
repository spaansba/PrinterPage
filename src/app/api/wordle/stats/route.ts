import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserStats } from "@/lib/queries/wordle";

export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getUserStats(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get stats" },
        { status: 500 },
      );
    }

    const stats = result.stats;

    return NextResponse.json({
      gamesPlayed: stats?.gamesPlayed || 0,
      gamesWon: stats?.gamesWon || 0,
      currentStreak: stats?.currentStreak || 0,
      maxStreak: stats?.maxStreak || 0,
      guessDistribution: stats?.guessDistribution || {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
      },
    });
  } catch (error) {
    console.error("Error in /api/wordle/stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
