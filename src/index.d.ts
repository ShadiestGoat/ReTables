declare global {
  declare module "simple-markdown" {
    export interface State {
      isTableHeading?: boolean,
    }
    export interface ParserRule {
      react: (capture: unknown, render: (v: unknown, state?: State) => React.ReactElement, state: State) => React.ReactElement
    }
  }
}
