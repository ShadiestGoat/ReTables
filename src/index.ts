import { Injector } from "replugged";
import { createTableParser } from "./render";
import { createPreMsgFormatter } from "./preMsgFormat";


const inject = new Injector();

export function start(): void {
  // Renders a table in the messages
  createTableParser(inject)

  // Format tables bfr sending a message out
  createPreMsgFormatter(inject)
}

export function stop(): void {
  inject.uninjectAll();
}
