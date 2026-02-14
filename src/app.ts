import { Bot, Context } from "grammy";
import type { AppConfig } from "./config/env";
import { CallbackController } from "./controllers/callback.controller";
import { CommandController } from "./controllers/command.controller";
import type { ControllerDeps } from "./controllers/controller.types";
import { MessageController } from "./controllers/message.controller";
import { SqliteClient } from "./infrastructure/sqlite";
import { CategoryRepository } from "./repositories/category.repository";
import { UserStateRepository } from "./repositories/user-state.repository";
import { VideoRepository } from "./repositories/video.repository";
import { AdminAccessService } from "./services/admin-access.service";
import { CategoryService } from "./services/category.service";
import { NavigationService } from "./services/navigation.service";
import { PasswordService } from "./services/password.service";
import { UserStateService } from "./services/user-state.service";
import { VideoService } from "./services/video.service";

export interface BotApplication {
  bot: Bot<Context>;
  close: () => void;
}

export function createBotApplication(config: AppConfig): BotApplication {
  const sqliteClient = new SqliteClient(config.dbPath);

  const categoryRepository = new CategoryRepository(sqliteClient.db);
  const videoRepository = new VideoRepository(sqliteClient.db);
  const userStateRepository = new UserStateRepository(sqliteClient.db);

  const passwordService = new PasswordService();
  const categoryService = new CategoryService(categoryRepository, passwordService);
  const videoService = new VideoService(videoRepository);
  const userStateService = new UserStateService(userStateRepository);
  const adminAccessService = new AdminAccessService(config.adminIds);
  const navigationService = new NavigationService(categoryService);

  const deps: ControllerDeps = {
    adminAccessService,
    categoryService,
    videoService,
    userStateService,
    navigationService
  };

  const bot = new Bot<Context>(config.botToken);
  new CommandController(deps).register(bot);
  new CallbackController(deps).register(bot);
  new MessageController(deps).register(bot);

  bot.catch((error) => {
    console.error("Bot runtime error:", error.error);
  });

  return {
    bot,
    close: () => sqliteClient.close()
  };
}

