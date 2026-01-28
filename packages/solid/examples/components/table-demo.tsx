import { render, useRenderer } from "@opentui/solid"
import { ConsolePosition } from "@opentui/core"
import { onMount } from "solid-js"

const languages = [
  { name: "JavaScript", year: 1995, creator: "Brendan Eich" },
  { name: "Python", year: 1991, creator: "Guido van Rossum" },
  { name: "Rust", year: 2010, creator: "Graydon Hoare" },
  { name: "Go", year: 2009, creator: "Rob Pike" },
  { name: "TypeScript", year: 2012, creator: "Anders Hejlsberg" },
]

function BasicTable() {
  return (
    <box title="Basic Table (no borders)" style={{ border: true, marginBottom: 1 }}>
      <table>
        <thead>
          <tr>
            <th content="Language" />
            <th content="Year" />
            <th content="Creator" />
          </tr>
        </thead>
        <tbody>
          {languages.slice(0, 3).map((lang) => (
            <tr>
              <td content={lang.name} />
              <td content={String(lang.year)} />
              <td content={lang.creator} />
            </tr>
          ))}
        </tbody>
      </table>
    </box>
  )
}

function BorderedTable() {
  return (
    <box title="Bordered Table (single)" style={{ border: true, marginBottom: 1 }}>
      <table border borderStyle="single">
        <thead>
          <tr>
            <th content="Language" />
            <th content="Year" />
            <th content="Creator" />
          </tr>
        </thead>
        <tbody>
          {languages.slice(0, 3).map((lang) => (
            <tr>
              <td content={lang.name} />
              <td content={String(lang.year)} />
              <td content={lang.creator} />
            </tr>
          ))}
        </tbody>
      </table>
    </box>
  )
}

function StyledTable() {
  return (
    <box title="Styled Table (separators, colors, alignment)" style={{ border: true, marginBottom: 1 }}>
      <table border borderStyle="rounded" borderColor="#00AAFF" showHeaderSeparator showRowSeparators cellPadding={2}>
        <thead backgroundColor="#003355">
          <tr>
            <th content="Language" textAlign="left" color="#FFFF00" />
            <th content="Year" textAlign="center" color="#FFFF00" />
            <th content="Creator" textAlign="right" color="#FFFF00" />
          </tr>
        </thead>
        <tbody>
          {languages.map((lang, index) => (
            <tr backgroundColor={index % 2 === 0 ? "#112233" : "#1a2a3a"}>
              <td content={lang.name} textAlign="left" color="#66CCFF" />
              <td content={String(lang.year)} textAlign="center" color="#AAAAAA" />
              <td content={lang.creator} textAlign="right" color="#88FF88" />
            </tr>
          ))}
        </tbody>
      </table>
    </box>
  )
}

function BorderStylesShowcase() {
  const borderStyles = ["single", "double", "rounded"] as const
  const colors = ["#FFFFFF", "#FF6B6B", "#51CF66", "#FFD43B", "#748FFC"]

  return (
    <box title="Border Styles" style={{ border: true, marginBottom: 1 }}>
      <box style={{ flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
        {borderStyles.map((style, i) => (
          <table border borderStyle={style} borderColor={colors[i]} cellPadding={1}>
            <thead>
              <tr>
                <th content={style} />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td content="Row 1" />
              </tr>
              <tr>
                <td content="Row 2" />
              </tr>
            </tbody>
          </table>
        ))}
      </box>
    </box>
  )
}

export function TableDemo() {
  const renderer = useRenderer()

  onMount(() => {
    renderer.useConsole = true
  })

  return (
    <scrollbox style={{ flexGrow: 1, padding: 1 }} focused>
      <box style={{ flexDirection: "column" }}>
        <text style={{ fg: "#AAAAAA", marginBottom: 1 }}>
          Table Component Demo - Use arrow keys to scroll, Escape to return
        </text>

        <BasicTable />
        <BorderedTable />
        <StyledTable />
        <BorderStylesShowcase />
      </box>
    </scrollbox>
  )
}

if (import.meta.main) {
  render(TableDemo, {
    consoleOptions: {
      position: ConsolePosition.BOTTOM,
      maxStoredLogs: 1000,
      sizePercent: 40,
    },
  })
}
