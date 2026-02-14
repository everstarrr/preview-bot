import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  botToken: string;
  adminIds: Set<number>;
  dbPath: string;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

function parseAdminIds(value: string): Set<number> {
  const ids = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isInteger(part) && part > 0);

  if (ids.length === 0) {
    throw new Error("ADMIN_IDS must contain at least one valid Telegram user ID");
  }

  return new Set(ids);
}

export function loadConfig(): AppConfig {
  return {
    botToken: required("BOT_TOKEN"),
    adminIds: parseAdminIds(required("ADMIN_IDS")),
    dbPath: path.resolve(process.cwd(), process.env.DB_PATH?.trim() || "./data/bot.db")
  };
}

