"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import PageBorderDiv from "../_helperComponents/PageBorderDiv";
import { useToasterUser } from "@/app/context/userDataContext";
import WordleGuessInput from "./WordleGuessInput";
import WordleGuessList from "./WordleGuessList";
import WordleStats from "./WordleStats";

type GameState = {
  guesses: string[];
  status: "playing" | "won" | "lost";
  answer?: string;
  printerId?: string;
};

type Stats = {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<string, number>;
};

function WordlePage() {
  const { user } = useUser();
  const { pairedToasters } = useToasterUser();
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    status: "playing",
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if game has secretly ended (user doesn't know yet)
  const gameEndedRef = useRef(false);
  const pendingRevealRef = useRef<{ status: "won" | "lost"; answer?: string } | null>(null);

  // Set default printer when toasters load
  useEffect(() => {
    if (pairedToasters.length > 0 && !selectedPrinterId) {
      setSelectedPrinterId(pairedToasters[0].id);
    }
  }, [pairedToasters, selectedPrinterId]);

  // Fetch game state and stats on mount
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        const [gameRes, statsRes] = await Promise.all([
          fetch("/api/wordle/today"),
          fetch("/api/wordle/stats"),
        ]);

        if (gameRes.ok) {
          const gameData = await gameRes.json();
          setGameState({
            guesses: gameData.guesses || [],
            status: gameData.status || "playing",
            answer: gameData.answer,
            printerId: gameData.printerId,
          });
          if (gameData.printerId) {
            setSelectedPrinterId(gameData.printerId);
          }
          // If game already ended on load, mark it
          if (gameData.status !== "playing") {
            gameEndedRef.current = true;
          }
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error("Failed to fetch wordle data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleGuessSubmit = async (guess: string): Promise<boolean> => {
    // Silently do nothing if game has already ended
    if (gameEndedRef.current) {
      return false;
    }

    if (!selectedPrinterId) {
      setError("Please select a toaster first");
      return false;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/wordle/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guess: guess.toLowerCase(),
          printerId: selectedPrinterId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit guess");
        return false;
      }

      // Update guesses only - UI looks exactly the same
      setGameState((prev) => ({
        ...prev,
        guesses: [...prev.guesses, guess.toLowerCase()],
      }));

      // If game ended, mark it internally but don't show anything different
      if (data.gameStatus !== "playing") {
        gameEndedRef.current = true;
        pendingRevealRef.current = { status: data.gameStatus, answer: data.answer };

        // Reveal game status and refresh stats after 90 seconds
        setTimeout(async () => {
          if (pendingRevealRef.current) {
            setGameState((prev) => ({
              ...prev,
              status: pendingRevealRef.current!.status,
              answer: pendingRevealRef.current!.answer,
            }));
            pendingRevealRef.current = null;
          }
          const statsRes = await fetch("/api/wordle/stats");
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        }, 90000);
      }

      return true;
    } catch (err) {
      console.error("Failed to submit guess:", err);
      setError("Failed to submit guess");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <PageBorderDiv>
        <div className="p-4 text-center text-sm text-gray-600">
          Please sign in to play Toastle
        </div>
      </PageBorderDiv>
    );
  }

  if (isLoading) {
    return (
      <PageBorderDiv>
        <div className="p-4 text-center text-sm text-gray-600">Loading...</div>
      </PageBorderDiv>
    );
  }

  if (pairedToasters.length === 0) {
    return (
      <PageBorderDiv>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            You need a paired toaster to play Toastle.
          </p>
          <p className="text-xs text-gray-500">
            Go to the Toaster tab to pair your toaster first.
          </p>
        </div>
      </PageBorderDiv>
    );
  }

  return (
    <PageBorderDiv>
      <div className="p-3 flex flex-col gap-3">
        {/* Toaster selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-700">
            Print to:
          </label>
          <select
            value={selectedPrinterId}
            onChange={(e) => setSelectedPrinterId(e.target.value)}
            disabled={gameState.guesses.length > 0}
            className="flex-1 text-xs p-1 border border-gray-400 bg-white disabled:bg-gray-100"
          >
            {pairedToasters.map((toaster) => (
              <option key={toaster.id} value={toaster.id}>
                {toaster.name}
              </option>
            ))}
          </select>
        </div>

        {/* Game complete message - only shown after 90s reveal */}
        {gameState.status !== "playing" && (
          <div className="flex flex-col items-center gap-2 py-4 px-3 bg-gray-100 border-2 border-gray-400">
            <div className="text-lg font-bold text-gray-800">Game Complete!</div>
            <div className="text-sm text-gray-600">
              Come back tomorrow for a new word
            </div>
          </div>
        )}

        {/* Guess list */}
        <WordleGuessList
          guessCount={gameState.guesses.length}
          maxGuesses={6}
        />

        {/* Guess input - always show when status appears to be playing */}
        {gameState.status === "playing" && (
          <WordleGuessInput
            onSubmit={handleGuessSubmit}
            isSubmitting={isSubmitting}
            disabled={gameState.guesses.length >= 6}
          />
        )}

        {/* Error message */}
        {error && (
          <div className="text-xs text-red-600 text-center">{error}</div>
        )}

        {/* Stats */}
        {stats && <WordleStats stats={stats} />}

        {/* Dev reset button */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={async () => {
              gameEndedRef.current = false;
              pendingRevealRef.current = null;
              await fetch("/api/wordle/reset", { method: "POST" });
              window.location.reload();
            }}
            className="mt-2 px-3 py-1 text-xs bg-red-500 text-white hover:bg-red-600"
          >
            [DEV] Reset Game
          </button>
        )}
      </div>
    </PageBorderDiv>
  );
}

export default WordlePage;
