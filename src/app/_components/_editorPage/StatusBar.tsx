import { getVisualLinesFromHTML } from "@/app/_helpers/getVisualLines"
import { useEditorContext } from "@/app/context/editorContext"
import React, { useState } from "react"
import type { messageStatus, SendStatus } from "../MainWrapper"
import { CheckCircle, XCircle, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type ToasterPageProps = {
  messageStatus: messageStatus
}

export default function ToasterStatusBar({ messageStatus }: ToasterPageProps) {
  const { editor } = useEditorContext()
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null)

  function updateLineCount() {
    if (!editor?.view?.dom) {
      return { lines: [], count: 0 }
    }
    const lines = getVisualLinesFromHTML(editor.view.dom)
    return {
      lines,
      count: lines.length,
    }
  }

  function renderSendStatus(status: SendStatus) {
    const isOpen = openTooltipId === status.friend

    return (
      <div key={status.friend} className="flex w-full items-center flex-shrink-0 gap-2 px-1 py-1">
        {status.success ? (
          <CheckCircle className="size-4 text-green-600" />
        ) : (
          <XCircle className="size-4 text-toastError" />
        )}

        <span className="text-sm">{status.friend}</span>

        {!status.success && (
          <TooltipProvider>
            <Tooltip
              open={isOpen}
              onOpenChange={(open) => setOpenTooltipId(open ? status.friend : null)}
            >
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="ml-auto cursor-pointer"
                  onClick={() => setOpenTooltipId(isOpen ? null : status.friend)}
                >
                  <HelpCircle className="size-4 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-sm">{status.errorMessage || "Failed"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  return (
    <div className="bg-toastPrimary px-2 text-xs py-1 text-[11px]">
      {messageStatus.sendStatus.length > 0 ? (
        <div className="flex flex-wrap items-center">
          {messageStatus.sendStatus.map(renderSendStatus)}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {(() => {
              const { lines, count } = updateLineCount()
              const totalChars = lines.reduce((total, line) => total + line.characterCount, 0)
              return (
                <>
                  <span className="pr-4 min-w-[115px]">Characters: {totalChars}</span>
                  <span>Lines: {count}</span>
                </>
              )
            })()}
          </div>
          {messageStatus && <span className="ml-auto mr-1">{messageStatus.editorStatus}</span>}
        </div>
      )}
    </div>
  )
}
