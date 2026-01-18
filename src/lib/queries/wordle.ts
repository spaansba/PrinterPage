"use server";

import { db } from "@/lib";
import {
  dailyWordleWords,
  wordleUserGames,
  wordleUserStats,
  type WordleGameStatusType,
  type WordleUserGame,
  type WordleUserStats,
} from "@/lib/schema/wordle";
import { and, eq } from "drizzle-orm";
import { getAnswerForDate, isValidGuess } from "@/lib/wordle-dictionary";

// Generate a simple random ID
function generateId(length: number = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Letter result type for Wordle
export type LetterResult = {
  letter: string;
  status: "correct" | "present" | "absent";
};

// Get or create today's wordle word
export async function getOrCreateTodayWordle(): Promise<{
  success: boolean;
  wordleId?: string;
  error?: string;
}> {
  try {
    const today = getTodayDate();

    // Check if today's word exists
    const existing = await db
      .select()
      .from(dailyWordleWords)
      .where(eq(dailyWordleWords.date, today))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, wordleId: existing[0].id };
    }

    // Create today's word
    const todayWord = getAnswerForDate(new Date());
    const newId = generateId();

    await db.insert(dailyWordleWords).values({
      id: newId,
      word: todayWord,
      date: today,
    });

    return { success: true, wordleId: newId };
  } catch (error) {
    console.error("Failed to get/create today's wordle:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get user's game for today
export async function getUserTodayGame(userId: string): Promise<{
  success: boolean;
  game?: WordleUserGame;
  error?: string;
}> {
  try {
    const wordleResult = await getOrCreateTodayWordle();
    if (!wordleResult.success || !wordleResult.wordleId) {
      return { success: false, error: "Failed to get today's wordle" };
    }

    const game = await db
      .select()
      .from(wordleUserGames)
      .where(
        and(
          eq(wordleUserGames.userId, userId),
          eq(wordleUserGames.wordleId, wordleResult.wordleId),
        ),
      )
      .limit(1);

    if (game.length > 0) {
      return { success: true, game: game[0] };
    }

    return { success: true, game: undefined };
  } catch (error) {
    console.error("Failed to get user game:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Create a new game for user
export async function createUserGame(
  userId: string,
  printerId: string,
): Promise<{
  success: boolean;
  game?: WordleUserGame;
  error?: string;
}> {
  try {
    const wordleResult = await getOrCreateTodayWordle();
    if (!wordleResult.success || !wordleResult.wordleId) {
      return { success: false, error: "Failed to get today's wordle" };
    }

    const newId = generateId();

    const [game] = await db
      .insert(wordleUserGames)
      .values({
        id: newId,
        userId,
        wordleId: wordleResult.wordleId,
        guesses: [],
        status: "playing",
        printerId,
      })
      .returning();

    return { success: true, game };
  } catch (error) {
    console.error("Failed to create user game:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Evaluate a guess against the answer
export async function evaluateGuess(
  guess: string,
  answer: string,
): Promise<LetterResult[]> {
  const guessLower = guess.toLowerCase();
  const answerLower = answer.toLowerCase();
  const result: LetterResult[] = [];
  const answerLetters = answerLower.split("");
  const used: boolean[] = new Array(5).fill(false);

  // First pass: mark correct letters
  for (let i = 0; i < 5; i++) {
    if (guessLower[i] === answerLower[i]) {
      result[i] = { letter: guessLower[i], status: "correct" };
      used[i] = true;
    }
  }

  // Second pass: mark present/absent letters
  for (let i = 0; i < 5; i++) {
    if (result[i]) continue; // Already marked as correct

    const guessLetter = guessLower[i];
    let found = false;

    for (let j = 0; j < 5; j++) {
      if (!used[j] && answerLetters[j] === guessLetter) {
        result[i] = { letter: guessLetter, status: "present" };
        used[j] = true;
        found = true;
        break;
      }
    }

    if (!found) {
      result[i] = { letter: guessLetter, status: "absent" };
    }
  }

  return result;
}

// Submit a guess
export async function submitGuess(
  userId: string,
  guess: string,
  printerId: string,
): Promise<{
  success: boolean;
  error?: string;
  result?: LetterResult[];
  gameStatus?: WordleGameStatusType;
  guessNumber?: number;
  allGuessResults?: LetterResult[][];
  answer?: string;
}> {
  try {
    const guessLower = guess.toLowerCase().trim();

    // Validate guess is 5 letters
    if (guessLower.length !== 5) {
      return { success: false, error: "Guess must be 5 letters" };
    }

    // Validate guess is a valid word
    if (!isValidGuess(guessLower)) {
      return { success: false, error: "Not a valid word" };
    }

    // Get or create today's wordle
    const wordleResult = await getOrCreateTodayWordle();
    if (!wordleResult.success || !wordleResult.wordleId) {
      return { success: false, error: "Failed to get today's wordle" };
    }

    // Get the answer word
    const [wordleWord] = await db
      .select()
      .from(dailyWordleWords)
      .where(eq(dailyWordleWords.id, wordleResult.wordleId))
      .limit(1);

    if (!wordleWord) {
      return { success: false, error: "Failed to get wordle word" };
    }

    const answer = wordleWord.word;

    // Get or create user's game
    let gameResult = await getUserTodayGame(userId);
    if (!gameResult.success) {
      return { success: false, error: gameResult.error };
    }

    let game = gameResult.game;

    // Create game if it doesn't exist
    if (!game) {
      const createResult = await createUserGame(userId, printerId);
      if (!createResult.success || !createResult.game) {
        return { success: false, error: createResult.error };
      }
      game = createResult.game;
    }

    // Check if game is already over
    if (game.status !== "playing") {
      return {
        success: false,
        error:
          game.status === "won"
            ? "You already won today's Wordle!"
            : "You already completed today's Wordle",
        gameStatus: game.status,
      };
    }

    // Check if max guesses reached
    const guesses = (game.guesses as string[]) || [];
    if (guesses.length >= 6) {
      return { success: false, error: "Maximum guesses reached" };
    }

    // Evaluate the guess
    const result = await evaluateGuess(guessLower, answer);
    const isCorrect = result.every((r) => r.status === "correct");
    const newGuesses = [...guesses, guessLower];
    const isLastGuess = newGuesses.length >= 6;

    // Determine new game status
    let newStatus: WordleGameStatusType = "playing";
    if (isCorrect) {
      newStatus = "won";
    } else if (isLastGuess) {
      newStatus = "lost";
    }

    // Update the game
    await db
      .update(wordleUserGames)
      .set({
        guesses: newGuesses,
        status: newStatus,
        completedAt:
          newStatus !== "playing" ? new Date().toISOString() : undefined,
      })
      .where(eq(wordleUserGames.id, game.id));

    // Update stats if game ended
    if (newStatus !== "playing") {
      await updateUserStats(userId, newStatus === "won", newGuesses.length);
    }

    // Build all guess results for printing
    const allGuessResults = await Promise.all(
      newGuesses.map((g) => evaluateGuess(g, answer)),
    );

    return {
      success: true,
      result,
      gameStatus: newStatus,
      guessNumber: newGuesses.length,
      allGuessResults,
      answer: newStatus === "lost" ? answer : undefined,
    };
  } catch (error) {
    console.error("Failed to submit guess:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get or create user stats
export async function getUserStats(userId: string): Promise<{
  success: boolean;
  stats?: WordleUserStats;
  error?: string;
}> {
  try {
    const existing = await db
      .select()
      .from(wordleUserStats)
      .where(eq(wordleUserStats.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, stats: existing[0] };
    }

    // Create default stats
    const [stats] = await db
      .insert(wordleUserStats)
      .values({
        userId,
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 },
      })
      .returning();

    return { success: true, stats };
  } catch (error) {
    console.error("Failed to get user stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update user stats after game completion
async function updateUserStats(
  userId: string,
  won: boolean,
  guessCount: number,
): Promise<void> {
  try {
    const today = getTodayDate();
    const statsResult = await getUserStats(userId);

    if (!statsResult.success || !statsResult.stats) {
      // Create stats if they don't exist
      const distribution: Record<string, number> = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
      };

      if (won) {
        distribution[String(guessCount)] = 1;
      }

      await db.insert(wordleUserStats).values({
        userId,
        gamesPlayed: 1,
        gamesWon: won ? 1 : 0,
        currentStreak: won ? 1 : 0,
        maxStreak: won ? 1 : 0,
        guessDistribution: distribution,
        lastPlayedDate: today,
      });
      return;
    }

    const stats = statsResult.stats;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Calculate new streak
    let newStreak = stats.currentStreak;
    if (won) {
      if (stats.lastPlayedDate === yesterdayStr) {
        // Consecutive day
        newStreak = stats.currentStreak + 1;
      } else if (stats.lastPlayedDate !== today) {
        // Missed a day or first game
        newStreak = 1;
      }
    } else {
      newStreak = 0;
    }

    // Update guess distribution
    const distribution = (stats.guessDistribution as Record<
      string,
      number
    >) || {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
    };

    if (won) {
      distribution[String(guessCount)] =
        (distribution[String(guessCount)] || 0) + 1;
    }

    await db
      .update(wordleUserStats)
      .set({
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
        currentStreak: newStreak,
        maxStreak: Math.max(stats.maxStreak, newStreak),
        guessDistribution: distribution,
        lastPlayedDate: today,
      })
      .where(eq(wordleUserStats.userId, userId));
  } catch (error) {
    console.error("Failed to update user stats:", error);
  }
}

// Get today's game state for API response (hides the answer)
export async function getTodayGameState(userId: string): Promise<{
  success: boolean;
  gameId?: string;
  guesses?: string[];
  status?: WordleGameStatusType;
  answer?: string; // Only included if game is lost
  printerId?: string;
  error?: string;
}> {
  try {
    const gameResult = await getUserTodayGame(userId);

    if (!gameResult.success) {
      return { success: false, error: gameResult.error };
    }

    if (!gameResult.game) {
      // No game yet - return empty state
      return {
        success: true,
        guesses: [],
        status: "playing",
      };
    }

    const game = gameResult.game;
    let answer: string | undefined;

    // Only reveal answer if game is lost
    if (game.status === "lost") {
      const [wordleWord] = await db
        .select()
        .from(dailyWordleWords)
        .where(eq(dailyWordleWords.id, game.wordleId))
        .limit(1);
      answer = wordleWord?.word;
    }

    return {
      success: true,
      gameId: game.id,
      guesses: (game.guesses as string[]) || [],
      status: game.status,
      answer,
      printerId: game.printerId,
    };
  } catch (error) {
    console.error("Failed to get today's game state:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
