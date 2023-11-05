export const tableCellReg = /((?<!\||\\)\|(?!\|)).+?((?<!(\||\\))\|(?!\|))/g
export const tableHeadingReg = /^:?-+?:?$/

// Thanks, SO! https://stackoverflow.com/a/20835462/13862631
/**
 * MUST USE A GLOBAL REGEX
 */
export function matchOverlap(input: string, re: RegExp): string[] {
  const r: string[] = []
  let m = re.exec(input)
  
  while (m) {
      re.lastIndex -= m[0].length - 1;
      r.push(m[0]);
      m = re.exec(input)
  }

  return r;
}

export enum Justification {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right"
}

export function parseTable(source: string): {
  table: string[][],
  lastIndex: number
} | null {
  if (!source.startsWith("|") || !source.trim().endsWith("|")) {
    return null
  }

  const lines = source.split("\n")

  let table: string[][] = [],
      lastIndex = 0

  for (let v of lines) {
    const l = v.trim()
    const cells = matchOverlap(l, tableCellReg).map(c => c.slice(1, -1).trim())
    if (table.length && cells.length != table[0].length) {
      break
    }
    if (table.length == 1) {
      for (let c of cells) {
        if (!tableHeadingReg.test(c)) {
          return null
        }
      }
    }

    table.push(cells)

    lastIndex += v.length + 1 // +1 for the newline
  }
  
  if (table.length <= 1) {
    return null
  }

  return {
    table,
    lastIndex
  }
}

export function createJustification(splitRow: string[]): Justification[] {
  return splitRow.map(v => {
    const l = v.startsWith(":")
    const r = v.endsWith(":")

    return l && r ? Justification.CENTER : r ? Justification.RIGHT : Justification.LEFT
  })
}

export function formatTable(table: string[][]): string {
  if (!table.length || !table[0].length) {
    return ""
  }
  
  const just = createJustification(table[table.length == 1 ? 0 : 1])
  const colSizes: number[] = table[0].map(v => v.length)

  table.forEach((row, rowI) => {
    if (rowI == 1) {
      // Don't change table size bc of the god damn splice
      return
    }

    row.forEach((v, i) => {
      if (colSizes[i] < v.length) {
        colSizes[i] = v.length
      }
    })
  })

  return table.map((row, rowI) => {
    if (rowI == 1) {
      return `|${row.map((_, i) => {
        const size = colSizes[i] + 2

        switch (just[i]) {
          case Justification.LEFT:
            return `:${"-".repeat(size - 1)}`
          case Justification.RIGHT:
            return `${"-".repeat(size - 1)}:`
          case Justification.CENTER:
            return `:${"-".repeat(size - 2)}:`
        }        
        return ""
      }).join("|")}|`
    }

    return `| ${row.map((v, i) => {
      const padSize = colSizes[i] - v.length

      if (just[i] == Justification.CENTER) {
        const half = padSize/2
        if (padSize % 2 == 0) {
          return " ".repeat(half) + v + " ".repeat(half)
        }
        return " ".repeat(Math.floor(half)) + v + " ".repeat(Math.ceil(half))
      }

      const pad = " ".repeat(padSize)

      if (just[i] == Justification.LEFT) {
        return v + pad
      }
      return pad + v
    }).join(" | ")} |`
  }).join("\n")
}
