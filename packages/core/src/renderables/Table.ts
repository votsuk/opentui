import { Renderable, type RenderableOptions } from "../Renderable"
import type { OptimizedBuffer } from "../buffer"
import { type BorderStyle, type BorderCharacters, BorderChars, parseBorderStyle } from "../lib/border"
import { type ColorInput, RGBA, parseColor } from "../lib/RGBA"
import { isStyledText, type StyledText } from "../lib/styled-text"
import type { RenderContext } from "../types"
import { TextRenderable } from "./Text"

export type TextAlign = "left" | "center" | "right"
export type VerticalAlign = "top" | "middle" | "bottom"

export interface TableOptions extends RenderableOptions<TableRenderable> {
  border?: boolean
  borderStyle?: BorderStyle
  borderColor?: ColorInput
  backgroundColor?: ColorInput
  cellPadding?: number
  showRowSeparators?: boolean
  showHeaderSeparator?: boolean
}

export interface TableSectionOptions extends RenderableOptions<TableHeadRenderable | TableBodyRenderable> {
  backgroundColor?: ColorInput
}

export interface TableRowOptions extends RenderableOptions<TableRowRenderable> {
  backgroundColor?: ColorInput
}

export interface TableCellOptions extends RenderableOptions<TableHeaderCellRenderable | TableDataCellRenderable> {
  textAlign?: TextAlign
  verticalAlign?: VerticalAlign
  padding?: number
  color?: ColorInput
  backgroundColor?: ColorInput
  width?: number | "auto"
  content?: string
}

interface ColumnInfo {
  width: number
  explicitWidth: boolean
}

function getTable(renderable: Renderable): TableRenderable | null {
  let current: Renderable | null = renderable
  while (current) {
    if (current instanceof TableRenderable) {
      return current
    }
    current = current.parent
  }
  return null
}

interface ExtractedTextInfo {
  text: string
  fg?: RGBA
  attributes?: number
}

function extractTextFromStyledText(styledText: StyledText): string {
  if (!styledText || !styledText.chunks) return ""
  return styledText.chunks.map((chunk) => chunk.text || "").join("")
}

function extractTextFromRenderable(renderable: Renderable): string {
  const info = extractStyledTextFromRenderable(renderable)
  return info.text
}

function extractStyledTextFromRenderable(renderable: Renderable): ExtractedTextInfo {
  if (renderable instanceof TextRenderable) {
    // Get styling from the TextRenderable
    const fg = (renderable as any)._defaultFg as RGBA | undefined
    const attributes = (renderable as any)._defaultAttributes as number | undefined

    // Try to get text from the TextBuffer which has the actual rendered text
    const textBuffer = (renderable as any).textBuffer
    if (textBuffer && typeof textBuffer.getPlainText === "function") {
      const text = textBuffer.getPlainText()
      if (text) {
        return { text, fg, attributes }
      }
    }

    // Fallback: try to gather from text nodes
    const chunks = renderable.textNode.gatherWithInheritedStyle({
      fg: undefined,
      bg: undefined,
      attributes: 0,
      link: undefined,
    })
    if (chunks && chunks.length > 0) {
      return { text: chunks.map((chunk) => chunk.text || "").join(""), fg, attributes }
    }

    const content = renderable.content
    if (typeof content === "string") {
      return { text: content, fg, attributes }
    }
    if (isStyledText(content)) {
      return { text: extractTextFromStyledText(content), fg, attributes }
    }
  }

  if ("content" in renderable) {
    const content = (renderable as any).content
    if (typeof content === "string") {
      return { text: content }
    }
    if (isStyledText(content)) {
      return { text: extractTextFromStyledText(content) }
    }
  }

  return { text: "" }
}

export class TableRenderable extends Renderable {
  protected _border: boolean
  protected _borderStyle: BorderStyle
  protected _borderColor: RGBA
  protected _backgroundColor: RGBA
  protected _cellPadding: number
  protected _showRowSeparators: boolean
  protected _showHeaderSeparator: boolean
  protected _borderChars: BorderCharacters

  private _columnWidths: number[] = []
  private _rowHeights: number[] = []

  protected _defaultOptions = {
    backgroundColor: "transparent",
    borderStyle: "single" as BorderStyle,
    border: false,
    borderColor: "#FFFFFF",
    cellPadding: 1,
    showRowSeparators: false,
    showHeaderSeparator: false,
  }

  constructor(ctx: RenderContext, options: TableOptions) {
    super(ctx, { ...options, flexDirection: "column" })

    this._border = options.border ?? this._defaultOptions.border
    this._borderStyle = parseBorderStyle(options.borderStyle, this._defaultOptions.borderStyle)
    this._borderColor = parseColor(options.borderColor || this._defaultOptions.borderColor)
    this._backgroundColor = parseColor(options.backgroundColor || this._defaultOptions.backgroundColor)
    this._cellPadding = options.cellPadding ?? this._defaultOptions.cellPadding
    this._showRowSeparators = options.showRowSeparators ?? this._defaultOptions.showRowSeparators
    this._showHeaderSeparator = options.showHeaderSeparator ?? this._defaultOptions.showHeaderSeparator
    this._borderChars = BorderChars[this._borderStyle]
  }

  public get border(): boolean {
    return this._border
  }

  public set border(value: boolean) {
    if (this._border !== value) {
      this._border = value
      this.requestRender()
    }
  }

  public get borderStyle(): BorderStyle {
    return this._borderStyle
  }

  public set borderStyle(value: BorderStyle) {
    const parsed = parseBorderStyle(value, this._defaultOptions.borderStyle)
    if (this._borderStyle !== parsed) {
      this._borderStyle = parsed
      this._borderChars = BorderChars[parsed]
      this.requestRender()
    }
  }

  public get borderColor(): RGBA {
    return this._borderColor
  }

  public set borderColor(value: ColorInput) {
    const newColor = parseColor(value || this._defaultOptions.borderColor)
    if (this._borderColor !== newColor) {
      this._borderColor = newColor
      this.requestRender()
    }
  }

  public get backgroundColor(): RGBA {
    return this._backgroundColor
  }

  public set backgroundColor(value: ColorInput) {
    const newColor = parseColor(value || this._defaultOptions.backgroundColor)
    if (this._backgroundColor !== newColor) {
      this._backgroundColor = newColor
      this.requestRender()
    }
  }

  public get cellPadding(): number {
    return this._cellPadding
  }

  public set cellPadding(value: number) {
    if (this._cellPadding !== value) {
      this._cellPadding = value
      this.requestRender()
    }
  }

  public get showRowSeparators(): boolean {
    return this._showRowSeparators
  }

  public set showRowSeparators(value: boolean) {
    if (this._showRowSeparators !== value) {
      this._showRowSeparators = value
      this.requestRender()
    }
  }

  public get showHeaderSeparator(): boolean {
    return this._showHeaderSeparator
  }

  public set showHeaderSeparator(value: boolean) {
    if (this._showHeaderSeparator !== value) {
      this._showHeaderSeparator = value
      this.requestRender()
    }
  }

  public get borderChars(): BorderCharacters {
    return this._borderChars
  }

  public get columnWidths(): number[] {
    return this._columnWidths
  }

  public get rowHeights(): number[] {
    return this._rowHeights
  }

  public markColumnsDirty(): void {
    this.requestRender()
  }

  protected _getVisibleChildren(): number[] {
    return []
  }

  public add(obj: any, index?: number): number {
    const result = super.add(obj, index)
    this.markColumnsDirty()
    return result
  }

  public remove(id: string): void {
    super.remove(id)
    this.markColumnsDirty()
  }

  private getAllRows(): TableRowRenderable[] {
    const rows: TableRowRenderable[] = []
    for (const child of this._childrenInLayoutOrder) {
      if (child instanceof TableSectionRenderable) {
        for (const sectionChild of child.getSectionChildren()) {
          if (sectionChild instanceof TableRowRenderable) {
            rows.push(sectionChild)
          }
        }
      } else if (child instanceof TableRowRenderable) {
        rows.push(child)
      }
    }
    return rows
  }

  private calculateColumnWidths(): void {
    const rows = this.getAllRows()
    if (rows.length === 0) {
      this._columnWidths = []
      this._rowHeights = []
      return
    }

    const columnInfos: ColumnInfo[] = []
    this._rowHeights = []

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      const cells = row.getCells()
      let maxRowHeight = 1

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i]
        const cellPadding = cell._padding ?? this._cellPadding
        const contentText = cell.getTextContent()
        const contentWidth = contentText.length + cellPadding * 2

        if (!columnInfos[i]) {
          columnInfos[i] = { width: 0, explicitWidth: false }
        }

        if (cell._explicitWidth !== undefined) {
          columnInfos[i].width = Math.max(columnInfos[i].width, cell._explicitWidth)
          columnInfos[i].explicitWidth = true
        } else if (!columnInfos[i].explicitWidth) {
          columnInfos[i].width = Math.max(columnInfos[i].width, contentWidth)
        }
      }

      this._rowHeights.push(maxRowHeight)
    }

    this._columnWidths = columnInfos.map((info) => Math.max(info.width, 3))
  }

  public getTotalWidth(): number {
    this.calculateColumnWidths()
    if (this._columnWidths.length === 0) return this._border ? 2 : 0
    const contentWidth = this._columnWidths.reduce((sum, w) => sum + w, 0)
    if (this._border) {
      // Add border chars: left border (1) + separators between columns (columnCount - 1) + right border (1)
      return contentWidth + this._columnWidths.length + 1
    }
    return contentWidth
  }

  public getTotalHeight(): number {
    this.calculateColumnWidths()
    // Start with border height (2 for top+bottom) if border is enabled, otherwise 0
    let height = this._border ? 2 : 0

    let hasHead = false
    let bodyRowCount = 0

    for (const child of this._childrenInLayoutOrder) {
      if (child instanceof TableHeadRenderable) {
        hasHead = true
        for (const sectionChild of child.getSectionChildren()) {
          if (sectionChild instanceof TableRowRenderable) {
            height += 1
          }
        }
      } else if (child instanceof TableBodyRenderable) {
        for (const sectionChild of child.getSectionChildren()) {
          if (sectionChild instanceof TableRowRenderable) {
            height += 1
            bodyRowCount++
          }
        }
      } else if (child instanceof TableRowRenderable) {
        height += 1
        bodyRowCount++
      }
    }

    // Only add separator heights if borders are enabled
    if (this._border) {
      if (hasHead && this._showHeaderSeparator) {
        height += 1
      }

      if (this._showRowSeparators && bodyRowCount > 1) {
        height += bodyRowCount - 1
      }
    }

    return height
  }

  protected onUpdate(): void {
    this.calculateColumnWidths()

    // Set explicit dimensions based on content
    const totalWidth = this.getTotalWidth()
    const totalHeight = this.getTotalHeight()

    this.yogaNode.setWidth(totalWidth)
    this.yogaNode.setHeight(totalHeight)
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    this.calculateColumnWidths()

    const x = this.x
    const y = this.y
    const chars = this._borderChars
    const borderColor = this._borderColor
    const bgColor = this._backgroundColor
    const hasBorder = this._border

    if (bgColor.a > 0) {
      buffer.fillRect(x, y, this.width, this.height, bgColor)
    }

    const rows = this.getAllRows()

    if (rows.length === 0 || this._columnWidths.length === 0) {
      return
    }

    // Draw top border if enabled
    if (hasBorder) {
      buffer.drawText(chars.topLeft, x, y, borderColor)
      let colX = x + 1
      for (let i = 0; i < this._columnWidths.length; i++) {
        const colWidth = this._columnWidths[i]
        for (let j = 0; j < colWidth; j++) {
          buffer.drawText(chars.horizontal, colX + j, y, borderColor)
        }
        colX += colWidth
        if (i < this._columnWidths.length - 1) {
          buffer.drawText(chars.topT, colX, y, borderColor)
          colX += 1
        }
      }
      buffer.drawText(chars.topRight, colX, y, borderColor)
    }

    let rowY = hasBorder ? y + 1 : y
    let headRowCount = 0

    for (const child of this._childrenInLayoutOrder) {
      if (child instanceof TableHeadRenderable) {
        for (const sectionChild of child.getSectionChildren()) {
          if (sectionChild instanceof TableRowRenderable) {
            this.renderRow(buffer, sectionChild, x, rowY)
            rowY++
            headRowCount++
          }
        }

        if (this._showHeaderSeparator && headRowCount > 0 && hasBorder) {
          this.renderHorizontalSeparator(buffer, x, rowY)
          rowY++
        }
      } else if (child instanceof TableBodyRenderable) {
        const bodyRows = child
          .getSectionChildren()
          .filter((c) => c instanceof TableRowRenderable) as TableRowRenderable[]

        for (let i = 0; i < bodyRows.length; i++) {
          const row = bodyRows[i]
          this.renderRow(buffer, row, x, rowY)
          rowY++

          if (this._showRowSeparators && i < bodyRows.length - 1 && hasBorder) {
            this.renderHorizontalSeparator(buffer, x, rowY)
            rowY++
          }
        }
      } else if (child instanceof TableRowRenderable) {
        this.renderRow(buffer, child, x, rowY)
        rowY++
      }
    }

    // Draw bottom border if enabled
    if (hasBorder) {
      buffer.drawText(chars.bottomLeft, x, rowY, borderColor)
      let colX = x + 1
      for (let i = 0; i < this._columnWidths.length; i++) {
        const colWidth = this._columnWidths[i]
        for (let j = 0; j < colWidth; j++) {
          buffer.drawText(chars.horizontal, colX + j, rowY, borderColor)
        }
        colX += colWidth
        if (i < this._columnWidths.length - 1) {
          buffer.drawText(chars.bottomT, colX, rowY, borderColor)
          colX += 1
        }
      }
      buffer.drawText(chars.bottomRight, colX, rowY, borderColor)
    }
  }

  private renderRow(buffer: OptimizedBuffer, row: TableRowRenderable, x: number, y: number): void {
    const chars = this._borderChars
    const borderColor = this._borderColor
    const hasBorder = this._border

    if (hasBorder) {
      buffer.drawText(chars.vertical, x, y, borderColor)
    }

    let colX = hasBorder ? x + 1 : x
    const cells = row.getCells()

    for (let i = 0; i < this._columnWidths.length; i++) {
      const colWidth = this._columnWidths[i]
      const cell = cells[i]

      if (cell) {
        cell.renderInColumn(buffer, colX, y, colWidth, this._cellPadding)
      }

      colX += colWidth
      if (hasBorder) {
        buffer.drawText(chars.vertical, colX, y, borderColor)
        colX += 1
      }
    }
  }

  private renderHorizontalSeparator(buffer: OptimizedBuffer, x: number, y: number): void {
    const chars = this._borderChars
    const borderColor = this._borderColor

    buffer.drawText(chars.leftT, x, y, borderColor)

    let colX = x + 1
    for (let i = 0; i < this._columnWidths.length; i++) {
      const colWidth = this._columnWidths[i]
      for (let j = 0; j < colWidth; j++) {
        buffer.drawText(chars.horizontal, colX + j, y, borderColor)
      }
      colX += colWidth
      if (i < this._columnWidths.length - 1) {
        buffer.drawText(chars.cross, colX, y, borderColor)
        colX += 1
      }
    }
    buffer.drawText(chars.rightT, colX, y, borderColor)
  }
}

abstract class TableSectionRenderable extends Renderable {
  protected _backgroundColor: RGBA

  constructor(ctx: RenderContext, options: TableSectionOptions) {
    super(ctx, { ...options, flexDirection: "column" })
    this._backgroundColor = parseColor(options.backgroundColor || "transparent")
  }

  public get backgroundColor(): RGBA {
    return this._backgroundColor
  }

  public set backgroundColor(value: ColorInput) {
    const newColor = parseColor(value || "transparent")
    if (this._backgroundColor !== newColor) {
      this._backgroundColor = newColor
      this.requestRender()
    }
  }

  public getSectionChildren(): Renderable[] {
    return [...this._childrenInLayoutOrder]
  }

  protected _getVisibleChildren(): number[] {
    return []
  }

  public add(obj: any, index?: number): number {
    const result = super.add(obj, index)
    const table = getTable(this)
    if (table) {
      table.markColumnsDirty()
    }
    return result
  }

  public remove(id: string): void {
    super.remove(id)
    const table = getTable(this)
    if (table) {
      table.markColumnsDirty()
    }
  }
}

export class TableHeadRenderable extends TableSectionRenderable {
  constructor(ctx: RenderContext, options: TableSectionOptions) {
    super(ctx, options)
  }
}

export class TableBodyRenderable extends TableSectionRenderable {
  constructor(ctx: RenderContext, options: TableSectionOptions) {
    super(ctx, options)
  }
}

export class TableRowRenderable extends Renderable {
  protected _backgroundColor: RGBA

  constructor(ctx: RenderContext, options: TableRowOptions) {
    super(ctx, { ...options, flexDirection: "row" })
    this._backgroundColor = parseColor(options.backgroundColor || "transparent")
  }

  public get backgroundColor(): RGBA {
    return this._backgroundColor
  }

  public set backgroundColor(value: ColorInput) {
    const newColor = parseColor(value || "transparent")
    if (this._backgroundColor !== newColor) {
      this._backgroundColor = newColor
      this.requestRender()
    }
  }

  public getCells(): (TableHeaderCellRenderable | TableDataCellRenderable)[] {
    return this._childrenInLayoutOrder.filter(
      (child) => child instanceof TableHeaderCellRenderable || child instanceof TableDataCellRenderable,
    ) as (TableHeaderCellRenderable | TableDataCellRenderable)[]
  }

  protected _getVisibleChildren(): number[] {
    return []
  }

  public add(obj: any, index?: number): number {
    const result = super.add(obj, index)
    const table = getTable(this)
    if (table) {
      table.markColumnsDirty()
    }
    return result
  }

  public remove(id: string): void {
    super.remove(id)
    const table = getTable(this)
    if (table) {
      table.markColumnsDirty()
    }
  }
}

abstract class TableCellRenderable extends Renderable {
  protected _textAlign: TextAlign
  protected _verticalAlign: VerticalAlign
  public _padding: number | undefined
  protected _color: RGBA
  protected _backgroundColor: RGBA
  public _explicitWidth: number | undefined
  protected _content: string
  protected _isBold: boolean

  protected abstract getDefaultTextAlign(): TextAlign
  protected abstract getDefaultBold(): boolean

  constructor(ctx: RenderContext, options: TableCellOptions, defaultTextAlign: TextAlign, defaultBold: boolean) {
    super(ctx, options)

    this._textAlign = options.textAlign || defaultTextAlign
    this._verticalAlign = options.verticalAlign || "middle"
    this._padding = options.padding
    this._color = parseColor(options.color || "#FFFFFF")
    this._backgroundColor = parseColor(options.backgroundColor || "transparent")
    this._explicitWidth = typeof options.width === "number" ? options.width : undefined
    this._content = options.content || ""
    this._isBold = defaultBold
  }

  protected _getVisibleChildren(): number[] {
    return []
  }

  public get textAlign(): TextAlign {
    return this._textAlign
  }

  public set textAlign(value: TextAlign) {
    if (this._textAlign !== value) {
      this._textAlign = value
      this.requestRender()
    }
  }

  public get verticalAlign(): VerticalAlign {
    return this._verticalAlign
  }

  public set verticalAlign(value: VerticalAlign) {
    if (this._verticalAlign !== value) {
      this._verticalAlign = value
      this.requestRender()
    }
  }

  public get padding(): number | undefined {
    return this._padding
  }

  public set padding(value: number | undefined) {
    if (this._padding !== value) {
      this._padding = value
      const table = getTable(this)
      if (table) {
        table.markColumnsDirty()
      }
      this.requestRender()
    }
  }

  public get color(): RGBA {
    return this._color
  }

  public set color(value: ColorInput) {
    const newColor = parseColor(value || "#FFFFFF")
    if (this._color !== newColor) {
      this._color = newColor
      this.requestRender()
    }
  }

  public get backgroundColor(): RGBA {
    return this._backgroundColor
  }

  public set backgroundColor(value: ColorInput) {
    const newColor = parseColor(value || "transparent")
    if (this._backgroundColor !== newColor) {
      this._backgroundColor = newColor
      this.requestRender()
    }
  }

  public get content(): string {
    return this._content
  }

  public set content(value: string) {
    if (this._content !== value) {
      this._content = value
      const table = getTable(this)
      if (table) {
        table.markColumnsDirty()
      }
      this.requestRender()
    }
  }

  public getTextContent(): string {
    if (this._content) {
      return this._content
    }

    const textParts: string[] = []
    for (const child of this._childrenInLayoutOrder) {
      const text = extractTextFromRenderable(child)
      if (text) {
        textParts.push(text)
      }
    }
    return textParts.join("")
  }

  public getStyledTextContent(): ExtractedTextInfo {
    if (this._content) {
      return { text: this._content }
    }

    // If there's a single child, extract its styling
    if (this._childrenInLayoutOrder.length === 1) {
      return extractStyledTextFromRenderable(this._childrenInLayoutOrder[0])
    }

    // For multiple children, just extract text (mixed styles not supported)
    const textParts: string[] = []
    for (const child of this._childrenInLayoutOrder) {
      const text = extractTextFromRenderable(child)
      if (text) {
        textParts.push(text)
      }
    }
    return { text: textParts.join("") }
  }

  public getContentWidth(): number {
    return this.getTextContent().length
  }

  public renderInColumn(buffer: OptimizedBuffer, x: number, y: number, colWidth: number, defaultPadding: number): void {
    const padding = this._padding ?? defaultPadding
    const availableWidth = colWidth - padding * 2
    const bgColor = this._backgroundColor

    if (bgColor.a > 0) {
      buffer.fillRect(x, y, colWidth, 1, bgColor)
    }

    const styledContent = this.getStyledTextContent()
    let text = styledContent.text

    if (!text) return

    if (text.length > availableWidth) {
      text = text.slice(0, Math.max(0, availableWidth))
    }

    if (availableWidth <= 0) return

    let textX = x + padding
    switch (this._textAlign) {
      case "center":
        textX = x + padding + Math.floor((availableWidth - text.length) / 2)
        break
      case "right":
        textX = x + padding + availableWidth - text.length
        break
      case "left":
      default:
        textX = x + padding
        break
    }

    // Use child's styling if available, otherwise fall back to cell defaults
    const fgColor = styledContent.fg ?? this._color
    const defaultAttributes = this._isBold ? 1 : 0
    const attributes = styledContent.attributes ?? defaultAttributes

    buffer.drawText(text, textX, y, fgColor, undefined, attributes)
  }

  public add(obj: any, index?: number): number {
    const result = super.add(obj, index)
    const table = getTable(this)
    if (table) {
      table.markColumnsDirty()
    }
    return result
  }

  public remove(id: string): void {
    super.remove(id)
    const table = getTable(this)
    if (table) {
      table.markColumnsDirty()
    }
  }
}

export class TableHeaderCellRenderable extends TableCellRenderable {
  protected getDefaultTextAlign(): TextAlign {
    return "center"
  }

  protected getDefaultBold(): boolean {
    return true
  }

  constructor(ctx: RenderContext, options: TableCellOptions) {
    super(ctx, options, "center", true)
  }
}

export class TableDataCellRenderable extends TableCellRenderable {
  protected getDefaultTextAlign(): TextAlign {
    return "left"
  }

  protected getDefaultBold(): boolean {
    return false
  }

  constructor(ctx: RenderContext, options: TableCellOptions) {
    super(ctx, options, "left", false)
  }
}
