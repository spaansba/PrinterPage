"use client"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"

type RetroTextEditorProps = {
  setTextContent: Dispatch<SetStateAction<string>>
  textContent: string
  setHTMLContent: Dispatch<SetStateAction<string>>
  hTMLContent: string
  setStatus: Dispatch<SetStateAction<string>>
  status: string
}

const extraStyles = `
  .color-white {
    color: #fff9f9d1 !important;
  }
  .custom-span-class {
    color: yellow !important;
  }
`
export type Lines = { characters: string; characterCount: number }[]

const RetroTextEditor = ({ status, setStatus, hTMLContent }: RetroTextEditorProps) => {
  return (
    <>
      {/* filter style */}
      <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.1"
              numOctaves="1"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 1" />
            </feComponentTransfer>
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>
      <style>{extraStyles}</style>
    </>
  )
}

export default RetroTextEditor
