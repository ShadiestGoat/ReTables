import { Injector, common } from "replugged";
import { Justification, createJustification, formatTable, parseTable } from "./utils";

const { messages } = common

const canvasCtx = (() => {
  const canvas = document.createElement("canvas")
  
  const ctx = canvas.getContext("2d")!;
  ctx.font = `400 16px "gg sans"`;
  return ctx
})()

function getTextWidth(t: string): number {
  return canvasCtx.measureText(t).width
}

function formatTableWithHTML(table: string[][]): string {
  if (!table.length || !table[0].length) {
    return ""
  }
  
  const just = createJustification(table[table.length == 1 ? 0 : 1])
  const colSizes: number[] = table[0].map(() => 0)

  table.forEach((row, rowI) => {
    if (rowI == 1) {
      // Don't change table size bc of the god damn splice
      return
    }

    row.forEach((v, i) => {
      const size = getTextWidth(v)
      if (size > colSizes[i]) {
        colSizes[i] = size
      }
    })
  })

  const spaceSize = getTextWidth(" ")
  const dashSize = getTextWidth("-")
  const colonSize = getTextWidth(":")

  return table.map((row, rowI) => {
    if (rowI == 1) {
      return `|${row.map((_, i) => {
        let sizeNeeded = colSizes[i] + spaceSize * 2 - colonSize

        if (just[i] == Justification.CENTER) {
          sizeNeeded -= colonSize
        }

        const dashStr = "-".repeat(Math.round(sizeNeeded/dashSize))

        switch (just[i]) {
          case Justification.LEFT:
            return `:${dashStr}`
          case Justification.RIGHT:
            return `${dashStr}:`
          case Justification.CENTER:
            return `:${dashStr}:`
        }
        return ""
      }).join("|")}|`
    }

    return `| ${row.map((v, i) => {
      const sizeNeeded = colSizes[i] - getTextWidth(v)
      const padSpaces = Math.round(sizeNeeded/spaceSize)

      if (just[i] == Justification.CENTER) {
        const half = padSpaces/2
        if (padSpaces % 2 == 0) {
          return " ".repeat(half) + v + " ".repeat(half)
        }
        
        return " ".repeat(Math.floor(half)) + v + " ".repeat(Math.ceil(half))
      }

      const pad = " ".repeat(padSpaces)

      if (just[i] == Justification.LEFT) {
        return v + pad
      }
      
      return pad + v
    }).join(" | ")} |`
  }).join("\n")
}

function format(content: string): string {
  let lines = content.split("\n");

  lines.push("")

  let lastI = 0,
    isBQ = false,
    isTable = false;

  lines.forEach((v, i) => {
    const bq = v.startsWith("> ");
    const possibleTable = v.startsWith("|", bq ? 2 : 0);

    if (possibleTable != isTable || isBQ != bq) {
      if (isTable) {
        if (lastI == i) {
          return;
        }

        // end of a table group
        let possibleLines = lines.slice(lastI, i).join("\n");
        if (isBQ) {
          possibleLines = possibleLines.replace(/^> /g, "");
        }

        const table = parseTable(possibleLines);
        if (table) {
          let str = formatTableWithHTML(table.table).split("\n");

          if (isBQ) {
            str = str.map((v) => `> ${v}`);
          }

          lines = [...lines.slice(0, lastI), ...str, ...lines.slice(i)];
        }
      }

      if (possibleTable) {
        lastI = i
      }

      isTable = possibleTable;
    }

    if (bq != isBQ) {
      isBQ = bq;
    }
  });

  return lines.slice(0, -1).join("\n")
}

export function createPreMsgFormatter(inject: Injector): void {
  inject.before(messages, "sendMessage", (args) => {
    args[1].content = format(args[1].content)
  })
}
