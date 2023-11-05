import { settings } from "replugged";

interface Settings {
  formatter: "fontSize" | "character" | "compact" | "none"
  maxPXWidth: number
  autoCompactMode: boolean
  canvasFont: string
}

const defaultSettings = {
  formatter: "fontSize",
  maxPXWidth: 560,
  canvasFont: `400 16px "gg sans"`,
  autoCompactMode: true
} satisfies Partial<Settings>;

export const cfg = await settings.init<Settings, keyof typeof defaultSettings>("eu.shadygoat.Tables", defaultSettings);
