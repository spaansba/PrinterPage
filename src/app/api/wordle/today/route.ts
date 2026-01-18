import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTodayGameState } from "@/lib/queries/wordle";

export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getTodayGameState(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get game state" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      gameId: result.gameId,
      guesses: result.guesses,
      status: result.status,
      answer: result.answer,
      printerId: result.printerId,
    });
  } catch (error) {
    console.error("Error in /api/wordle/today:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
