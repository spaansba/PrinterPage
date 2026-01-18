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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 flex items-center gap-1">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="ENTER WORD"
          disabled={isSubmitting || disabled}
          maxLength={5}
          className="flex-1 px-2 py-1 text-sm font-mono uppercase tracking-widest border border-gray-400 focus:outline-none focus:border-gray-600 disabled:bg-gray-100"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
      <button
        type="submit"
        disabled={value.length !== 5 || isSubmitting || disabled}
        className="px-3 py-1 text-xs font-medium bg-toastTertiary text-white hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "..." : "Send"}
      </button>
    </form>
  );
}

export default WordleGuessInput;
