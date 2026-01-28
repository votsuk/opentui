import { test, expect, describe, beforeEach, afterEach } from "bun:test"
import {
  TableRenderable,
  TableHeadRenderable,
  TableBodyRenderable,
  TableRowRenderable,
  TableHeaderCellRenderable,
  TableDataCellRenderable,
} from "./Table"
import { createTestRenderer, type TestRenderer } from "../testing/test-renderer"

let testRenderer: TestRenderer
let renderOnce: () => Promise<void>
let captureCharFrame: () => string

beforeEach(async () => {
  ;({
    renderer: testRenderer,
    renderOnce,
    captureCharFrame,
  } = await createTestRenderer({
    width: 40,
    height: 20,
  }))
})

afterEach(() => {
  testRenderer.destroy()
})

describe("TableRenderable", () => {
  test("creates a basic table with default options", async () => {
    const table = new TableRenderable(testRenderer, {
      id: "test-table",
    })

    testRenderer.root.add(table)
    await renderOnce()

    expect(table.borderStyle).toBe("single")
    expect(table.cellPadding).toBe(1)
    expect(table.showRowSeparators).toBe(false)
    expect(table.showHeaderSeparator).toBe(false)
    expect(table.isDestroyed).toBe(false)
  })

  test("renders table with header and body", async () => {
    const table = new TableRenderable(testRenderer, {
      id: "test-table",
      borderStyle: "single",
    })

    const thead = new TableHeadRenderable(testRenderer, { id: "thead" })
    const headerRow = new TableRowRenderable(testRenderer, { id: "header-row" })
    const th1 = new TableHeaderCellRenderable(testRenderer, { id: "th1", content: "Name" })
    const th2 = new TableHeaderCellRenderable(testRenderer, { id: "th2", content: "Age" })

    headerRow.add(th1)
    headerRow.add(th2)
    thead.add(headerRow)
    table.add(thead)

    const tbody = new TableBodyRenderable(testRenderer, { id: "tbody" })
    const dataRow = new TableRowRenderable(testRenderer, { id: "data-row" })
    const td1 = new TableDataCellRenderable(testRenderer, { id: "td1", content: "John" })
    const td2 = new TableDataCellRenderable(testRenderer, { id: "td2", content: "30" })

    dataRow.add(td1)
    dataRow.add(td2)
    tbody.add(dataRow)
    table.add(tbody)

    testRenderer.root.add(table)
    await renderOnce()

    const frame = captureCharFrame()

    // Verify table structure is rendered
    expect(frame).toContain("Name")
    expect(frame).toContain("Age")
    expect(frame).toContain("John")
    expect(frame).toContain("30")
  })

  test("calculates column widths based on content", async () => {
    const table = new TableRenderable(testRenderer, {
      id: "test-table",
      cellPadding: 1,
    })

    const tbody = new TableBodyRenderable(testRenderer, { id: "tbody" })
    const row1 = new TableRowRenderable(testRenderer, { id: "row1" })
    const td1 = new TableDataCellRenderable(testRenderer, { id: "td1", content: "Short" })
    const td2 = new TableDataCellRenderable(testRenderer, { id: "td2", content: "LongerContent" })

    row1.add(td1)
    row1.add(td2)
    tbody.add(row1)
    table.add(tbody)

    testRenderer.root.add(table)
    await renderOnce()

    // Column widths should accommodate content + padding
    const columnWidths = table.columnWidths
    expect(columnWidths.length).toBe(2)
    expect(columnWidths[0]).toBeGreaterThanOrEqual("Short".length + 2) // content + padding*2
    expect(columnWidths[1]).toBeGreaterThanOrEqual("LongerContent".length + 2)
  })

  test("supports different border styles", async () => {
    const table = new TableRenderable(testRenderer, {
      id: "test-table",
      borderStyle: "double",
    })

    expect(table.borderStyle).toBe("double")
    expect(table.borderChars.horizontal).toBe("═")
    expect(table.borderChars.vertical).toBe("║")

    table.borderStyle = "rounded"
    expect(table.borderStyle).toBe("rounded")
    expect(table.borderChars.topLeft).toBe("╭")
  })

  test("can disable row separators", async () => {
    const table = new TableRenderable(testRenderer, {
      id: "test-table",
      showRowSeparators: false,
    })

    expect(table.showRowSeparators).toBe(false)

    table.showRowSeparators = true
    expect(table.showRowSeparators).toBe(true)
  })

  test("can disable header separator", async () => {
    const table = new TableRenderable(testRenderer, {
      id: "test-table",
      showHeaderSeparator: false,
    })

    expect(table.showHeaderSeparator).toBe(false)

    table.showHeaderSeparator = true
    expect(table.showHeaderSeparator).toBe(true)
  })
})

describe("TableCellRenderable", () => {
  test("TableHeaderCellRenderable defaults to center alignment and bold", async () => {
    const th = new TableHeaderCellRenderable(testRenderer, {
      id: "th",
      content: "Header",
    })

    expect(th.textAlign).toBe("center")
  })

  test("TableDataCellRenderable defaults to left alignment", async () => {
    const td = new TableDataCellRenderable(testRenderer, {
      id: "td",
      content: "Data",
    })

    expect(td.textAlign).toBe("left")
  })

  test("cells support custom text alignment", async () => {
    const td = new TableDataCellRenderable(testRenderer, {
      id: "td",
      content: "Data",
      textAlign: "right",
    })

    expect(td.textAlign).toBe("right")

    td.textAlign = "center"
    expect(td.textAlign).toBe("center")
  })

  test("cells support custom padding", async () => {
    const td = new TableDataCellRenderable(testRenderer, {
      id: "td",
      content: "Data",
      padding: 2,
    })

    expect(td.padding).toBe(2)

    td.padding = 0
    expect(td.padding).toBe(0)
  })

  test("cells support explicit width", async () => {
    const table = new TableRenderable(testRenderer, { id: "table" })
    const tbody = new TableBodyRenderable(testRenderer, { id: "tbody" })
    const row = new TableRowRenderable(testRenderer, { id: "row" })

    const td1 = new TableDataCellRenderable(testRenderer, {
      id: "td1",
      content: "A",
      width: 10,
    })
    const td2 = new TableDataCellRenderable(testRenderer, {
      id: "td2",
      content: "B",
    })

    row.add(td1)
    row.add(td2)
    tbody.add(row)
    table.add(tbody)
    testRenderer.root.add(table)
    await renderOnce()

    // First column should use explicit width
    expect(table.columnWidths[0]).toBe(10)
  })

  test("cells can update content dynamically", async () => {
    const td = new TableDataCellRenderable(testRenderer, {
      id: "td",
      content: "Initial",
    })

    expect(td.content).toBe("Initial")

    td.content = "Updated"
    expect(td.content).toBe("Updated")
  })

  test("getContentWidth returns correct width", async () => {
    const td = new TableDataCellRenderable(testRenderer, {
      id: "td",
      content: "Hello",
    })

    expect(td.getContentWidth()).toBe(5)
  })
})

describe("TableRowRenderable", () => {
  test("getCells returns all cell children", async () => {
    const row = new TableRowRenderable(testRenderer, { id: "row" })
    const td1 = new TableDataCellRenderable(testRenderer, { id: "td1", content: "A" })
    const td2 = new TableDataCellRenderable(testRenderer, { id: "td2", content: "B" })
    const th = new TableHeaderCellRenderable(testRenderer, { id: "th", content: "C" })

    row.add(td1)
    row.add(td2)
    row.add(th)

    const cells = row.getCells()
    expect(cells.length).toBe(3)
    expect(cells[0]).toBe(td1)
    expect(cells[1]).toBe(td2)
    expect(cells[2]).toBe(th)
  })
})

describe("TableSectionRenderable", () => {
  test("TableHeadRenderable accepts backgroundColor", async () => {
    const thead = new TableHeadRenderable(testRenderer, {
      id: "thead",
      backgroundColor: "#FF0000",
    })

    expect(thead.backgroundColor.r).toBeCloseTo(1)
    expect(thead.backgroundColor.g).toBeCloseTo(0)
    expect(thead.backgroundColor.b).toBeCloseTo(0)
  })

  test("TableBodyRenderable accepts backgroundColor", async () => {
    const tbody = new TableBodyRenderable(testRenderer, {
      id: "tbody",
      backgroundColor: "#00FF00",
    })

    expect(tbody.backgroundColor.r).toBeCloseTo(0)
    expect(tbody.backgroundColor.g).toBeCloseTo(1)
    expect(tbody.backgroundColor.b).toBeCloseTo(0)
  })

  test("getSectionChildren returns children", async () => {
    const thead = new TableHeadRenderable(testRenderer, { id: "thead" })
    const row1 = new TableRowRenderable(testRenderer, { id: "row1" })
    const row2 = new TableRowRenderable(testRenderer, { id: "row2" })

    thead.add(row1)
    thead.add(row2)

    const children = thead.getSectionChildren()
    expect(children.length).toBe(2)
    expect(children[0]).toBe(row1)
    expect(children[1]).toBe(row2)
  })
})

describe("Table rendering output", () => {
  test("renders complete table with borders", async () => {
    const table = new TableRenderable(testRenderer, {
      id: "table",
      borderStyle: "single",
      border: true,
      showHeaderSeparator: true,
    })

    const thead = new TableHeadRenderable(testRenderer, { id: "thead" })
    const headerRow = new TableRowRenderable(testRenderer, { id: "header-row" })
    headerRow.add(new TableHeaderCellRenderable(testRenderer, { id: "th1", content: "Col1" }))
    headerRow.add(new TableHeaderCellRenderable(testRenderer, { id: "th2", content: "Col2" }))
    thead.add(headerRow)
    table.add(thead)

    const tbody = new TableBodyRenderable(testRenderer, { id: "tbody" })
    const dataRow = new TableRowRenderable(testRenderer, { id: "data-row" })
    dataRow.add(new TableDataCellRenderable(testRenderer, { id: "td1", content: "A" }))
    dataRow.add(new TableDataCellRenderable(testRenderer, { id: "td2", content: "B" }))
    tbody.add(dataRow)
    table.add(tbody)

    testRenderer.root.add(table)
    await renderOnce()

    const frame = captureCharFrame()

    // Check for border characters
    expect(frame).toContain("┌")
    expect(frame).toContain("┐")
    expect(frame).toContain("└")
    expect(frame).toContain("┘")
    expect(frame).toContain("│")
    expect(frame).toContain("─")
    expect(frame).toContain("┬")
    expect(frame).toContain("┴")
    expect(frame).toContain("├")
    expect(frame).toContain("┤")
    expect(frame).toContain("┼")
  })

  test("renders table with multiple body rows and separators", async () => {
    const table = new TableRenderable(testRenderer, {
      id: "table",
      showRowSeparators: true,
    })

    const tbody = new TableBodyRenderable(testRenderer, { id: "tbody" })

    for (let i = 1; i <= 3; i++) {
      const row = new TableRowRenderable(testRenderer, { id: `row${i}` })
      row.add(new TableDataCellRenderable(testRenderer, { id: `td${i}a`, content: `R${i}C1` }))
      row.add(new TableDataCellRenderable(testRenderer, { id: `td${i}b`, content: `R${i}C2` }))
      tbody.add(row)
    }

    table.add(tbody)
    testRenderer.root.add(table)
    await renderOnce()

    const frame = captureCharFrame()

    // Check all rows are rendered
    expect(frame).toContain("R1C1")
    expect(frame).toContain("R2C1")
    expect(frame).toContain("R3C1")
    expect(frame).toContain("R1C2")
    expect(frame).toContain("R2C2")
    expect(frame).toContain("R3C2")
  })
})
