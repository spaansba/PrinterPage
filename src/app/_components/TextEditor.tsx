"use client"
import React, { useState } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
export default function TextEditor() {
  const [formattedValue, setFormattedValue] = useState("")
  const handleOnChange = (content: string) => {
    setFormattedValue(content)
    console.log(content)
  }

  return (
    <div>
      <ReactQuill
        theme="snow"
        onChange={handleOnChange}
        value={formattedValue}
        bounds={".app"}
        placeholder="hello"
      ></ReactQuill>
    </div>
  )
}
