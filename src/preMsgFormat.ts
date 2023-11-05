import { Injector, common } from "replugged";
import { formatTable, parseTable } from "./utils";

const { messages } = common

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
          let str = formatTable(table.table).split("\n");

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
