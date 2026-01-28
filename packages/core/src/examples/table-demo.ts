import {
  type CliRenderer,
  createCliRenderer,
  BoxRenderable,
  ScrollBoxRenderable,
  TableRenderable,
  TableHeadRenderable,
  TableBodyRenderable,
  TableRowRenderable,
  TableHeaderCellRenderable,
  TableDataCellRenderable,
} from "../index"
import { TextRenderable } from "../renderables/Text"
import { setupCommonDemoKeys } from "./lib/standalone-keys"

let renderer: CliRenderer | null = null
let mainContainer: ScrollBoxRenderable | null = null

const languages = [
  { name: "JavaScript", year: 1995, creator: "Brendan Eich" },
  { name: "Python", year: 1991, creator: "Guido van Rossum" },
  { name: "Rust", year: 2010, creator: "Graydon Hoare" },
  { name: "Go", year: 2009, creator: "Rob Pike" },
  { name: "TypeScript", year: 2012, creator: "Anders Hejlsberg" },
]

function createBasicTable(ctx: CliRenderer): BoxRenderable {
  const container = new BoxRenderable(ctx, {
    id: "basic-table-container",
    border: true,
    title: "Basic Table (no borders)",
    marginBottom: 1,
    flexDirection: "column",
  })

  const table = new TableRenderable(ctx, {
    id: "basic-table",
  })

  const thead = new TableHeadRenderable(ctx, { id: "basic-thead" })
  const headerRow = new TableRowRenderable(ctx, { id: "basic-header-row" })
  headerRow.add(new TableHeaderCellRenderable(ctx, { id: "basic-th1", content: "Language" }))
  headerRow.add(new TableHeaderCellRenderable(ctx, { id: "basic-th2", content: "Year" }))
  headerRow.add(new TableHeaderCellRenderable(ctx, { id: "basic-th3", content: "Creator" }))
  thead.add(headerRow)

  const tbody = new TableBodyRenderable(ctx, { id: "basic-tbody" })
  languages.slice(0, 3).forEach((lang, index) => {
    const row = new TableRowRenderable(ctx, { id: `basic-row-${index}` })
    row.add(new TableDataCellRenderable(ctx, { id: `basic-td1-${index}`, content: lang.name }))
    row.add(new TableDataCellRenderable(ctx, { id: `basic-td2-${index}`, content: String(lang.year) }))
    row.add(new TableDataCellRenderable(ctx, { id: `basic-td3-${index}`, content: lang.creator }))
    tbody.add(row)
  })

  table.add(thead)
  table.add(tbody)
  container.add(table)

  return container
}

function createBorderedTable(ctx: CliRenderer): BoxRenderable {
  const container = new BoxRenderable(ctx, {
    id: "bordered-table-container",
    border: true,
    title: "Bordered Table (single)",
    marginBottom: 1,
    flexDirection: "column",
  })

  const table = new TableRenderable(ctx, {
    id: "bordered-table",
    border: true,
    borderStyle: "single",
  })

  const thead = new TableHeadRenderable(ctx, { id: "bordered-thead" })
  const headerRow = new TableRowRenderable(ctx, { id: "bordered-header-row" })
  headerRow.add(new TableHeaderCellRenderable(ctx, { id: "bordered-th1", content: "Language" }))
  headerRow.add(new TableHeaderCellRenderable(ctx, { id: "bordered-th2", content: "Year" }))
  headerRow.add(new TableHeaderCellRenderable(ctx, { id: "bordered-th3", content: "Creator" }))
  thead.add(headerRow)

  const tbody = new TableBodyRenderable(ctx, { id: "bordered-tbody" })
  languages.slice(0, 3).forEach((lang, index) => {
    const row = new TableRowRenderable(ctx, { id: `bordered-row-${index}` })
    row.add(new TableDataCellRenderable(ctx, { id: `bordered-td1-${index}`, content: lang.name }))
    row.add(new TableDataCellRenderable(ctx, { id: `bordered-td2-${index}`, content: String(lang.year) }))
    row.add(new TableDataCellRenderable(ctx, { id: `bordered-td3-${index}`, content: lang.creator }))
    tbody.add(row)
  })

  table.add(thead)
  table.add(tbody)
  container.add(table)

  return container
}

function createStyledTable(ctx: CliRenderer): BoxRenderable {
  const container = new BoxRenderable(ctx, {
    id: "styled-table-container",
    border: true,
    title: "Styled Table (separators, colors, alignment)",
    marginBottom: 1,
    flexDirection: "column",
  })

  const table = new TableRenderable(ctx, {
    id: "styled-table",
    border: true,
    borderStyle: "rounded",
    borderColor: "#00AAFF",
    showHeaderSeparator: true,
    showRowSeparators: true,
    cellPadding: 2,
  })

  const thead = new TableHeadRenderable(ctx, { id: "styled-thead", backgroundColor: "#003355" })
  const headerRow = new TableRowRenderable(ctx, { id: "styled-header-row" })
  headerRow.add(
    new TableHeaderCellRenderable(ctx, { id: "styled-th1", content: "Language", textAlign: "left", color: "#FFFF00" }),
  )
  headerRow.add(
    new TableHeaderCellRenderable(ctx, { id: "styled-th2", content: "Year", textAlign: "center", color: "#FFFF00" }),
  )
  headerRow.add(
    new TableHeaderCellRenderable(ctx, { id: "styled-th3", content: "Creator", textAlign: "right", color: "#FFFF00" }),
  )
  thead.add(headerRow)

  const tbody = new TableBodyRenderable(ctx, { id: "styled-tbody" })
  languages.forEach((lang, index) => {
    const row = new TableRowRenderable(ctx, {
      id: `styled-row-${index}`,
      backgroundColor: index % 2 === 0 ? "#112233" : "#1a2a3a",
    })
    row.add(
      new TableDataCellRenderable(ctx, {
        id: `styled-td1-${index}`,
        content: lang.name,
        textAlign: "left",
        color: "#66CCFF",
      }),
    )
    row.add(
      new TableDataCellRenderable(ctx, {
        id: `styled-td2-${index}`,
        content: String(lang.year),
        textAlign: "center",
        color: "#AAAAAA",
      }),
    )
    row.add(
      new TableDataCellRenderable(ctx, {
        id: `styled-td3-${index}`,
        content: lang.creator,
        textAlign: "right",
        color: "#88FF88",
      }),
    )
    tbody.add(row)
  })

  table.add(thead)
  table.add(tbody)
  container.add(table)

  return container
}

function createBorderStylesShowcase(ctx: CliRenderer): BoxRenderable {
  const container = new BoxRenderable(ctx, {
    id: "border-styles-container",
    border: true,
    title: "Border Styles",
    marginBottom: 1,
    flexDirection: "column",
  })

  const innerContainer = new BoxRenderable(ctx, {
    id: "border-styles-inner",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  })

  const borderStyles = ["single", "double", "rounded"] as const
  const colors = ["#FFFFFF", "#FF6B6B", "#51CF66", "#FFD43B", "#748FFC"]

  borderStyles.forEach((style, i) => {
    const table = new TableRenderable(ctx, {
      id: `border-style-table-${style}`,
      border: true,
      borderStyle: style,
      borderColor: colors[i],
      cellPadding: 1,
    })

    const thead = new TableHeadRenderable(ctx, { id: `border-style-thead-${style}` })
    const headerRow = new TableRowRenderable(ctx, { id: `border-style-header-row-${style}` })
    headerRow.add(new TableHeaderCellRenderable(ctx, { id: `border-style-th-${style}`, content: style }))
    thead.add(headerRow)

    const tbody = new TableBodyRenderable(ctx, { id: `border-style-tbody-${style}` })
    const row1 = new TableRowRenderable(ctx, { id: `border-style-row1-${style}` })
    row1.add(new TableDataCellRenderable(ctx, { id: `border-style-td1-${style}`, content: "Row 1" }))
    tbody.add(row1)

    const row2 = new TableRowRenderable(ctx, { id: `border-style-row2-${style}` })
    row2.add(new TableDataCellRenderable(ctx, { id: `border-style-td2-${style}`, content: "Row 2" }))
    tbody.add(row2)

    table.add(thead)
    table.add(tbody)
    innerContainer.add(table)
  })

  container.add(innerContainer)

  return container
}

export function run(rendererInstance: CliRenderer): void {
  renderer = rendererInstance
  renderer.setBackgroundColor("#001122")

  mainContainer = new ScrollBoxRenderable(renderer, {
    id: "table-demo-scrollbox",
    flexGrow: 1,
    padding: 1,
  })
  mainContainer.focus()
  renderer.root.add(mainContainer)

  const contentContainer = new BoxRenderable(renderer, {
    id: "table-demo-content",
    flexDirection: "column",
  })

  const instructionsText = new TextRenderable(renderer, {
    id: "table-demo-instructions",
    content: "Table Component Demo - Use arrow keys to scroll, Escape to return",
    fg: "#AAAAAA",
    marginBottom: 1,
  })
  contentContainer.add(instructionsText)

  contentContainer.add(createBasicTable(renderer))
  contentContainer.add(createBorderedTable(renderer))
  contentContainer.add(createStyledTable(renderer))
  contentContainer.add(createBorderStylesShowcase(renderer))

  mainContainer.add(contentContainer)
}

export function destroy(rendererInstance: CliRenderer): void {
  rendererInstance.root.getRenderable("table-demo-scrollbox")?.destroyRecursively()
  mainContainer = null
  renderer = null
}

if (import.meta.main) {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  })

  run(renderer)
  setupCommonDemoKeys(renderer)
  renderer.start()
}
