import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { submitGuess } from "@/lib/queries/wordle";
import { wordleCardBytes } from "@/app/_helpers/imageCreating/wordleCard";
import { sendSubscription } from "@/lib/queries/subscriptions/generalSubscription";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guess, printerId } = body;

    if (!guess || typeof guess !== "string") {
      return NextResponse.json(
        { error: "Guess is required" },
        { status: 400 },
      );
    }

    if (!printerId || typeof printerId !== "string") {
      return NextResponse.json(
        { error: "Printer ID is required" },
        { status: 400 },
      );
    }

    // Submit the guess
    const result = await submitGuess(userId, guess, printerId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to submit guess" },
        { status: 400 },
      );
    }

    // Generate and send print card
    let printed = false;
    if (result.allGuessResults && result.guessNumber && result.gameStatus) {
      try {
        const printContent = await wordleCardBytes(
          result.allGuessResults,
          result.guessNumber,
          result.gameStatus,
        );

        const printResult = await sendSubscription(printContent, printerId);
        printed = printResult.success;

        if (!printResult.success) {
          console.error("Failed to print wordle card:", printResult.error);
        }
      } catch (printError) {
        console.error("Error generating/sending print card:", printError);
      }
    }

    return NextResponse.json({
      success: true,
      gameStatus: result.gameStatus,
      guessNumber: result.guessNumber,
      printed,
      answer: result.answer, // Only included if game is lost
    });
  } catch (error) {
    console.error("Error in /api/wordle/guess:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
