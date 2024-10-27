import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Toolbar } from "./Toolbar"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import TextStyle from "@tiptap/extension-text-style"
import { CustomMark } from "./CustomSpan"

type TiptapProps = {
  textEditorInput: string
  onChange: (inputText: string, inputHTML: string) => void
}

const extraStyles = `
  .color-white {
    color: #fff9f9d1 !important;
  }
  .custom-span-class{
    color: yellow !important;
  }
`

export default function Tiptap({ textEditorInput, onChange }: TiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Underline,
      Highlight.configure({ multicolor: true, HTMLAttributes: { class: "color-white" } }),
      TextStyle,
      CustomMark,
    ],
    content: textEditorInput,
    editorProps: {
      attributes: {
        class:
          "text-sm font-mono w-full px-4 py-2 min-h-[200px] bg-white border-2 border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none whitespace-pre-wrap",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getText(), editor.getHTML())
    },
  })

  return (
    <div className="flex flex-col justify-stretch min-h-[250px]">
      <style>{extraStyles}</style>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} spellCheck="false" />
    </div>
  )
}
