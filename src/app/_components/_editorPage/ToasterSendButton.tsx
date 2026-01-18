import { useUser } from "@clerk/nextjs";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import { useEditorContext } from "../../context/editorContext";
import {
  getVisualLinesFromHTML,
  type Lines,
} from "../../_helpers/getVisualLines";
import { incrementPrinterMessageStats } from "@/lib/queries";
import type { messageStatus } from "../MainWrapper";
import type { Friend } from "@/app/types/printer";
import { useToasterUser } from "@/app/context/userDataContext";
import { PrepareTextToSend } from "@/app/_helpers/PrepareTextToSend";

type ToasterSendButtonProps = {
  setMessageStatus: Dispatch<SetStateAction<messageStatus>>;
  hTMLContent: string;
  selectedFriends: Friend[];
};

function ToasterSendButton({
  setMessageStatus,
  hTMLContent,
  selectedFriends,
}: ToasterSendButtonProps) {
  const { editor, editorForm } = useEditorContext();
  const [buttonClickable, setButtonClickable] = useState(true);
  const { user } = useUser();
  const { currentUser } = useToasterUser();

  async function sendToast(
    userId: string,
    friend: Friend,
    content: Uint8Array,
  ) {
    try {
      const response = await fetch(
        `https://${friend.printerId}.toasttexter.com/print`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: Array.from(content),
          }),
        },
      );
      const responseText = await response.text();
      await incrementPrinterMessageStats(userId, friend.printerId);

      if (!response.ok) {
        return {
          friend: friend.name,
          success: false,
          errorMessage: `HTTP error! status: ${response.status}, body: ${responseText}`,
        };
      }
    } catch (error) {
      return {
        friend: friend.name,
        success: false,
        errorMessage:
          "Error sending to printer: " +
          (error instanceof Error ? error.message : String(error)),
      };
    } finally {
      return {
        friend: friend.name,
        success: true,
        errorMessage: "",
      };
    }
  }

  async function handlePrinterClick() {
    if (!user) {
      return;
    }
    editor?.setEditable(false);
    setButtonClickable(false);
    setMessageStatus((prev) => ({ ...prev, editorStatus: "Sending..." }));
    const editorElement = editor!.view.dom as HTMLElement;
    const lines = getVisualLinesFromHTML(editorElement);
    const htmlContentWithLineBreaks = addLineBreaksToHTML(hTMLContent, lines);

    const content = await PrepareTextToSend(
      htmlContentWithLineBreaks,
      currentUser.username,
      user.imageUrl,
    );

    if (!selectedFriends) {
      return;
    }
    // editor?.setEditable(true)
    // return
    const printResults = await Promise.all(
      selectedFriends.map((friend) => sendToast(user.id, friend, content)),
    );

    setMessageStatus(() => ({ editorStatus: "", sendStatus: printResults }));
    const hasPartialFailed = printResults.some((result) => !result.success);
    if (!hasPartialFailed) {
      editor?.commands.clearContent();
    }
    if (editor) {
      editor.commands.focus();
      editor.setEditable(true);
    }
    setTimeout(() => {
      setButtonClickable(true);
    }, 1000);
  }

  function addLineBreaksToHTML(htmlContent: string, lines: Lines): string {
    let result = "";
    let insideTag = false;
    let insideEntity = false;
    let currentLineIndex = 0;
    let visibleCharCount = 0;
    let nextBreakAt = lines[0]?.characterCount || 0;

    const checkAndAddLineBreak = () => {
      if (
        visibleCharCount === nextBreakAt &&
        currentLineIndex < lines.length - 1
      ) {
        result += "<line-break>";
        currentLineIndex++;
        nextBreakAt += lines[currentLineIndex].characterCount;
      }
    };

    for (let i = 0; i < htmlContent.length; i++) {
      const char = htmlContent[i];

      if (char === "<") {
        insideTag = true;
        result += char;
        continue;
      }

      if (char === ">") {
        insideTag = false;
        result += char;
        continue;
      }

      if (insideTag) {
        result += char;
        continue;
      }

      // Regular character - add to result and increment counter
      result += char;

      // If we're inside an entity and hit a semicolon, the entity is complete
      if (insideEntity && char === ";") {
        insideEntity = false;
        visibleCharCount++;
        checkAndAddLineBreak();
        continue;
      }

      // Start of an entity
      if (char === "&") {
        insideEntity = true;
        continue;
      }

      // Only count character if we're not inside an entity
      if (!insideEntity) {
        visibleCharCount++;
        checkAndAddLineBreak();
      }
    }

    // Handle any remaining characters at the end
    if (visibleCharCount > 0 && currentLineIndex < lines.length - 1) {
      result += "<line-break>";
    }
    return result;
  }
  return (
    <div
      className=""
      title={
        selectedFriends.length > 0
          ? `Toast ${selectedFriends.map((friend) => friend.name).join(", ")}`
          : "Choose Recipient"
      }
    >
      <button
        disabled={!buttonClickable}
        onClick={editorForm.handleSubmit(handlePrinterClick)}
        className="w-full h-8 border-t truncate px-4 bg-toastPrimaryHover border border-b-transparent border-l-transparent border-r-transparent border-[#808080] hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
      >
        {selectedFriends.length > 0 ? `Send Toast!` : "Choose Recipient"}
      </button>
    </div>
  );
}

export default ToasterSendButton;
