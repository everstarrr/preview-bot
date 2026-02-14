import { createBotApplication } from "./app";
import { loadConfig } from "./config/env";

const shutdown = (signal: string): void => {
  console.log(`Received ${signal}, stopping bot...`);
  bot.stop();
  app.close();
};

const app = createBotApplication(loadConfig());
const { bot } = app;

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

bot
  .start()
  .then(() => {
    console.log("Bot started.");
  })
  .catch((error) => {
    console.error("Failed to start bot:", error);
    app.close();
    process.exit(1);
  });
