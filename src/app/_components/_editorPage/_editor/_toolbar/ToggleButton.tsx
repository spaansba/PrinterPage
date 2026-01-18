import { Toggle } from "@radix-ui/react-toggle";
import type { Editor } from "@tiptap/core";
import { type LucideIcon } from "lucide-react";
import React, { useState, useEffect } from "react";

type ToggleButtonProps = {
  editor: Editor;
  Icon: LucideIcon;
  onPressedChange: () => void;
  name: string;
};

function ToggleButton({
  editor,
  Icon,
  onPressedChange,
  name,
}: ToggleButtonProps) {
  const [isButtonPressed, setIsButtonPressed] = useState(editor.isActive(name));

  // Sync the button state with editor's isActive state
  useEffect(() => {
    const updateState = () => {
      setIsButtonPressed(editor.isActive(name));
    };

    // Update initial state
    updateState();

    // Subscribe to editor changes and selection changes
    editor.on("update", updateState);
    editor.on("selectionUpdate", updateState);

    return () => {
      editor.off("update", updateState);
      editor.off("selectionUpdate", updateState);
    };
  }, [editor, name]);

  const handlePressedChange = (pressed: boolean) => {
    setIsButtonPressed(pressed);
    onPressedChange();
  };

  return (
    <Toggle
      className={`${
        isButtonPressed
          ? "border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#bdb9b3] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]"
          : "border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
      } size-7 flex items-center justify-center bg-toastPrimary border`}
      onPressedChange={handlePressedChange}
      pressed={isButtonPressed}
    >
      <Icon size={15} />
    </Toggle>
  );
}

export default ToggleButton;
