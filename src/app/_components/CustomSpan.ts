import { Extension } from "@tiptap/core"
import { RawCommands } from "@tiptap/core"
import "@tiptap/extension-text-style"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    spanClass: {
      /**
       * Toggle a span class
       */
      toggleSpanClass: (spanClass: string) => ReturnType
      /**
       * Unset a span class
       */
      unsetSpanClass: () => ReturnType
    }
  }
}

export const SpanClass = Extension.create({
  name: "spanClass",

  defaultOptions: {
    types: ["textStyle"],
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          spanClass: {
            default: null,
            renderHTML: (attributes) => {
              if (!attributes.spanClass) {
                return {}
              }
              return {
                class: attributes.spanClass,
              }
            },
            parseHTML: (element) => ({
              spanClass: element.classList.value || null,
            }),
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      toggleSpanClass:
        (spanClass: string) =>
        ({ chain, editor }) => {
          // Check if the current selection has the exact spanClass we want to toggle
          const isActive = editor.isActive("textStyle", { spanClass })

          if (isActive) {
            // If the class is already applied, remove the textStyle mark completely
            return chain().unsetMark("textStyle").run()
          }

          // If the class isn't applied, add it
          return chain().setMark("textStyle", { spanClass }).run()
        },
      unsetSpanClass:
        () =>
        ({ chain }) => {
          return chain().unsetMark("textStyle").run()
        },
    } as Partial<RawCommands>
  },
})
