import { Injector, common } from "replugged";
const { parser } = common;
import { ParserRule, SingleASTNode } from "simple-markdown"
import "./style.css"

// | Table h1 | table H2 |
// |--------|--|
// | Bad table | HEHHE

const tableCellReg = /((?<!\||\\)\|(?!\|)).+?((?<!(\||\\))\|(?!\|))/g
const tableHeadingReg = /^:?-+?:?$/

// Thanks, SO! https://stackoverflow.com/a/20835462/13862631
/**
 * MUST USE A GLOBAL REGEX
 */
function matchOverlap(input: string, re: RegExp): string[] {
  const r: string[] = []
  let m = re.exec(input)
  
  while (m) {
      re.lastIndex -= m[0].length - 1;
      r.push(m[0]);
      m = re.exec(input)
  }

  return r;
}

enum Justification {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right"
}

type RenderASTNode = SingleASTNode | SingleASTNode[]

interface Table {
  content: RenderASTNode[],
  type: "table"
}

export function createTableParser(inject: Injector): void {
  inject.after(parser, "parse", (args) => {
    return parser.reactParserFor({
      tableCell: {
        order: 9999,
        match() {
          return null
        },
        parse() {
          return {}
        },
        react(capture: {content: RenderASTNode, isTableHeading: boolean, align: Justification}, render, state) {
          let alignClass = `md-col-${capture.align}`
          
          if (capture.isTableHeading) {
            return <th className={`md-table-h ${alignClass}`}>
              {render(capture.content, state)}
            </th>
          }

          return <td className={alignClass}>
              {
                render(capture.content, state)
              }
          </td>
        }
      },
      tableRow: {
        order: 9999,
        match() {
          return null
        },
        parse() {
          return {}
        },
        react(capture: {content: RenderASTNode[]}, render, state) {
          return <tr className="md-table-row">
              {
                render(capture.content, state)
              }
          </tr>
        }
      },
      table: {
        order: 2,
        match(source, state, prevCapture) {
          if (prevCapture || !source.startsWith("|") || !source.trim().endsWith("|")) {
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
            0: source.slice(0, lastIndex),
            1: table,
            index: 0,
            input: source,
          };
        },
        parse(capture, parse, state) {
          const table = capture[1] as unknown as string[][]
          
          state.inline = true

          const just = table[1].map(v => {
            const l = v.startsWith(":")
            const r = v.endsWith(":")

            return l && r ? Justification.CENTER : r ? Justification.RIGHT : Justification.LEFT
          })

          const parsedTable: Table = {
            content: [
              table[0],
              ...table.slice(2),
            ].map((row, rowI) => {
              return {
                type: "tableRow",
                content: row.map((v, col) => {
                  return {
                    type: "tableCell",
                    content: parse(v, state),
                    isTableHeading: rowI == 0,
                    align: just[col]
                  }
                })
              }
            }),
            type: "table"
          }
          
          return parsedTable
        },
        react({content}: Table, render, state) {
          return <table className="md-table">
            {
              render(content, state)
            }
          </table>
        },
      },
      ...parser.defaultRules,
    } as Record<string, ParserRule>)(...args);
  });
}
