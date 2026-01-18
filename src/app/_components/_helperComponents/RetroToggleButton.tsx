import React from "react";

interface RetroToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const RetroToggle: React.FC<RetroToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  className = "",
  "aria-label": ariaLabel = "Toggle switch",
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!disabled) {
      onChange();
    }
  };

  return (
    <div className="w-10">
      <button
        onClick={handleClick}
        className={`
        relative h-6 w-10
        ${checked ? "bg-gray-100" : "bg-gray-200"}
        border border-gray-300
        flex items-center justify-center
        text-xs font-medium
        focus:outline-none focus:ring-1 focus:ring-gray-400
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
        type="button"
        disabled={disabled}
        aria-pressed={checked}
        aria-label={ariaLabel}
      >
        <span className={`${checked ? "text-gray-700" : "text-gray-500"}`}>
          {checked ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
};

export default RetroToggle;
