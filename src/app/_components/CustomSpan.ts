"use client"
import { Mark } from "@tiptap/core"
import { RawCommands } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customMark: {
      /**
       * Toggle a custom mark with class
       */
      toggleCustomMark: (className: string) => ReturnType
      /**
       * Unset custom mark
       */
      unsetCustomMark: () => ReturnType
    }
  }
}

export const CustomMark = Mark.create({
  name: "customMark",

  // defaultOptions: {
  //   HTMLAttributes: {},
  //   htmlTag: "my-tag",
  // },

  renderHTML({ HTMLAttributes }) {
    return [this.options.htmlTag, HTMLAttributes, 0]
  },

  parseHTML() {
    return [
      {
        tag: this.options.htmlTag,
      },
    ]
  },

  addCommands() {
    return {
      toggleCustomMark:
        (className: string) =>
        ({ chain, editor }) => {
          // Check if the current selection has the exact class we want to toggle
          const isActive = editor.isActive(this.name, { class: className })

          if (isActive) {
            // If the class is already applied, remove the mark completely
            return chain().unsetMark(this.name).run()
          }

          // If the class isn't applied, add it
          return chain().setMark(this.name, { class: className }).run()
        },
      unsetCustomMark:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run()
        },
    } as Partial<RawCommands>
  },

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {}
          }
          return {
            class: attributes.class,
          }
        },
      },
    }
  },
})
