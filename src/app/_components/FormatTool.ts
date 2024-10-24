import EditorJS, { type API } from "@editorjs/editorjs"
import {
  type InlineTool,
  type InlineToolConstructorOptions,
} from "@editorjs/editorjs/types/tools/inline-tool"

export default class FormatTool implements InlineTool {
  static get isInline() {
    return true
  }
  private tag: string = "U"
  private iconClasses: { base: string; active: string }
  static get CSS(): string {
    return "cdx-underline"
  }
  private button: HTMLButtonElement | null
  private state: boolean
  private api: API
  constructor(options: InlineToolConstructorOptions) {
    this.api = options.api
    this.button = null
    this.state = false
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive,
    }
  }
  render() {
    this.button = document.createElement("button")
    this.button.type = "button"
    this.button.textContent = "M"

    return this.button
  }

  surround(range: Range) {
    if (this.state) {
      // If format is already applied, return
      return
    }

    const selectedText = range.extractContents()
    const format = document.createElement("b")

    format.appendChild(selectedText)
    range.insertNode(format)
  }

  public checkState(): boolean {
    const termTag = this.api.selection.findParentTag(this.tag, "u")

    this.button?.classList.toggle(this.iconClasses.active, !!termTag)

    return !!termTag
  }
}
