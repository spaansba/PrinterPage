import { getVisualLinesFromHTML } from "@/app/_helpers/getVisualLines"
import { useEditorContext } from "@/app/context/editorContext"
import React, { type Dispatch, type SetStateAction } from "react"

type ToasterPageProps = {
  status: string
}

export default function ToasterStatusBar({ status }: ToasterPageProps) {
  const { editor } = useEditorContext()
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
  return (
    <>
      <div className="bg-[#d4d0c8] flex items-center px-2 text-xs justify-between py-1 text-[11px]">
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
        {status && <span>{status}</span>}
      </div>
    </>
  )
}
