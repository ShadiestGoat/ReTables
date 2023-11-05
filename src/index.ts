import { Injector, Logger } from "replugged";
import { createTableParser } from "./render";

const inject = new Injector();
const logger = Logger.plugin("PluginTemplate");

export async function start(): Promise<void> {
  createTableParser(inject)
}

export function stop(): void {
  inject.uninjectAll();
}
