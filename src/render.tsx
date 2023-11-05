import { Injector, common } from "replugged";
const { parser } = common;
import { ParserRule, SingleASTNode } from "simple-markdown"
import "./style.css"
import {Justification, createJustification, parseTable} from "./utils"

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
          let alignClass = `md-table-col md-table-col-${capture.align}`
          
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
          if (prevCapture) {
            return null
          }
          const out = parseTable(source)

          if (!out) {
            return null
          }

          const {table, lastIndex} = out

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

          const just = createJustification(table[1])

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
