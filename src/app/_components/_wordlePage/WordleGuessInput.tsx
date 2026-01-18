"use client";

import { useState } from "react";

type WordleGuessInputProps = {
  onSubmit: (guess: string) => Promise<boolean>;
  isSubmitting: boolean;
  disabled: boolean;
};

function WordleGuessInput({
  onSubmit,
  isSubmitting,
  disabled,
}: WordleGuessInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value.length !== 5 || isSubmitting || disabled) return;

    const success = await onSubmit(value);
    // Only clear input if submission was successful
    if (success) {
      setValue("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 5);
    setValue(newValue.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Enter 5 Letter Word"
        disabled={isSubmitting || disabled}
        maxLength={5}
        className="w-full px-2 py-1 pr-14 text-sm font-mono uppercase tracking-widest border border-gray-400 focus:outline-none focus:border-gray-600 disabled:bg-gray-100"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <button
        type="submit"
        disabled={value.length !== 5 || isSubmitting || disabled}
        className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "..." : "Send"}
      </button>
    </form>
  );
}

export default WordleGuessInput;
