"use client";

import { Printer } from "lucide-react";

type WordleGuessListProps = {
  guessCount: number;
  maxGuesses: number;
};

function WordleGuessList({ guessCount, maxGuesses }: WordleGuessListProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-800">
          {guessCount} / {maxGuesses}
        </span>
        <span className="text-sm text-gray-600">guesses</span>
      </div>
      {guessCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Printer size={14} />
          <span>Check your toaster for results!</span>
        </div>
      )}
    </div>
  );
}

export default WordleGuessList;
