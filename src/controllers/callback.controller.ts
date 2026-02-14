import { Bot, Context, InlineKeyboard } from "grammy";
import { STATE } from "../constants/state-types";
import { getUserId } from "./context-helpers";
import type { ControllerDeps } from "./controller.types";
import { parseCategoryId } from "./payload-helpers";

export class CallbackController {
  constructor(private readonly deps: ControllerDeps) {}

  register(bot: Bot<Context>): void {
    bot.callbackQuery(/^back_to_sections$/, async (ctx) => this.onBackToSections(ctx));
    bot.callbackQuery(/^select_category:(\d+)$/, async (ctx) => this.onSelectCategory(ctx));
    bot.callbackQuery(/^admin_add_video_category:(\d+)$/, async (ctx) =>
      this.onAdminAddVideoCategory(ctx)
    );
    bot.callbackQuery(/^admin_change_password_category:(\d+)$/, async (ctx) =>
      this.onAdminChangePasswordCategory(ctx)
    );
    bot.callbackQuery(/^admin_delete_video_category:(\d+)$/, async (ctx) =>
      this.onAdminDeleteVideoCategory(ctx)
    );
    bot.callbackQuery(/^admin_delete_video_item:(\d+)$/, async (ctx) =>
      this.onAdminDeleteVideoItem(ctx)
    );

    bot.callbackQuery(/.*/, async (ctx) => {
      await ctx.answerCallbackQuery();
    });
  }

  private async onBackToSections(ctx: Context): Promise<void> {
    const userId = getUserId(ctx);
    if (userId !== null) {
      this.deps.userStateService.clear(userId);
    }
    await ctx.answerCallbackQuery();
    await this.deps.navigationService.showSections(ctx);
  }

  private async onSelectCategory(ctx: Context): Promise<void> {
    const userId = getUserId(ctx);
    if (userId === null) {
      return;
    }

    const categoryId = getMatchGroupAsNumber(ctx, 1);
    if (categoryId === null) {
      await ctx.answerCallbackQuery({ text: "Некорректный запрос", show_alert: true });
      return;
    }
    const category = this.deps.categoryService.getCategoryById(categoryId);
    await ctx.answerCallbackQuery();

    if (!category) {
      await ctx.reply("Категория не найдена.");
      return;
    }

    this.deps.userStateService.set(userId, STATE.WaitCategoryPassword, { categoryId });
    await ctx.reply("Введите пароль для доступа к разделу:");
  }

  private async onAdminAddVideoCategory(ctx: Context): Promise<void> {
    const userId = await this.getAdminUserIdFromCallback(ctx);
    if (userId === null) {
      return;
    }

    const state = this.deps.userStateService.get(userId);
    if (state?.stateType !== STATE.AdminAddVideoCategory) {
      await ctx.answerCallbackQuery({ text: "Действие неактуально", show_alert: true });
      return;
    }

    const categoryId = getMatchGroupAsNumber(ctx, 1);
    if (categoryId === null) {
      await ctx.answerCallbackQuery({ text: "Некорректный запрос", show_alert: true });
      return;
    }
    const category = this.deps.categoryService.getCategoryById(categoryId);
    await ctx.answerCallbackQuery();

    if (!category) {
      await ctx.reply("Категория не найдена.");
      return;
    }

    this.deps.userStateService.set(userId, STATE.AdminAddVideoFile, { categoryId });
    await ctx.reply(`Отправьте видео или video_note для категории "${category.name}":`);
  }

  private async onAdminChangePasswordCategory(ctx: Context): Promise<void> {
    const userId = await this.getAdminUserIdFromCallback(ctx);
    if (userId === null) {
      return;
    }

    const state = this.deps.userStateService.get(userId);
    if (state?.stateType !== STATE.AdminChangePasswordCategory) {
      await ctx.answerCallbackQuery({ text: "Действие неактуально", show_alert: true });
      return;
    }

    const categoryId = getMatchGroupAsNumber(ctx, 1);
    if (categoryId === null) {
      await ctx.answerCallbackQuery({ text: "Некорректный запрос", show_alert: true });
      return;
    }
    const category = this.deps.categoryService.getCategoryById(categoryId);
    await ctx.answerCallbackQuery();

    if (!category) {
      await ctx.reply("Категория не найдена.");
      return;
    }

    this.deps.userStateService.set(userId, STATE.AdminChangePasswordValue, { categoryId });
    await ctx.reply(`Введите новый пароль для категории "${category.name}":`);
  }

  private async onAdminDeleteVideoCategory(ctx: Context): Promise<void> {
    const userId = await this.getAdminUserIdFromCallback(ctx);
    if (userId === null) {
      return;
    }

    const state = this.deps.userStateService.get(userId);
    if (state?.stateType !== STATE.AdminDeleteVideoCategory) {
      await ctx.answerCallbackQuery({ text: "Действие неактуально", show_alert: true });
      return;
    }

    const categoryId = getMatchGroupAsNumber(ctx, 1);
    if (categoryId === null) {
      await ctx.answerCallbackQuery({ text: "Некорректный запрос", show_alert: true });
      return;
    }
    const videos = this.deps.videoService.listByCategory(categoryId);
    await ctx.answerCallbackQuery();

    if (videos.length === 0) {
      await ctx.reply("В этой категории нет видео.");
      return;
    }

    this.deps.userStateService.set(userId, STATE.AdminDeleteVideoItem, { categoryId });
    await ctx.reply("Выберите видео для удаления:", {
      reply_markup: this.buildVideoDeleteKeyboard(videos)
    });
  }

  private async onAdminDeleteVideoItem(ctx: Context): Promise<void> {
    const userId = await this.getAdminUserIdFromCallback(ctx);
    if (userId === null) {
      return;
    }

    const state = this.deps.userStateService.get(userId);
    if (state?.stateType !== STATE.AdminDeleteVideoItem) {
      await ctx.answerCallbackQuery({ text: "Действие неактуально", show_alert: true });
      return;
    }

    const categoryId = parseCategoryId(state.payload);
    if (categoryId === null) {
      this.deps.userStateService.clear(userId);
      await ctx.answerCallbackQuery({ text: "Состояние сброшено", show_alert: true });
      return;
    }

    const videoId = getMatchGroupAsNumber(ctx, 1);
    if (videoId === null) {
      await ctx.answerCallbackQuery({ text: "Некорректный запрос", show_alert: true });
      return;
    }
    const result = this.deps.videoService.deleteVideo(videoId);
    await ctx.answerCallbackQuery();

    if (!result.deleted) {
      await ctx.reply("Видео не найдено.");
      return;
    }

    const remainingVideos = this.deps.videoService.listByCategory(categoryId);
    if (remainingVideos.length === 0) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Видео удалено. В категории больше нет видео.");
      return;
    }

    await ctx.reply("Видео удалено. Можете удалить следующее:", {
      reply_markup: this.buildVideoDeleteKeyboard(remainingVideos)
    });
  }

  private buildVideoDeleteKeyboard(
    videos: Array<{ id: number; title: string }>
  ): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    videos.forEach((video) => {
      keyboard.text(video.title.slice(0, 45), `admin_delete_video_item:${video.id}`).row();
    });
    return keyboard;
  }

  private async getAdminUserIdFromCallback(ctx: Context): Promise<number | null> {
    const userId = getUserId(ctx);
    if (!this.deps.adminAccessService.isAdmin(userId)) {
      await ctx.answerCallbackQuery({ text: "Недостаточно прав", show_alert: true });
      return null;
    }
    return userId;
  }
}

function getMatchGroupAsNumber(ctx: Context, index: number): number | null {
  const match = "match" in ctx ? ctx.match : undefined;
  if (!match || typeof match[index] !== "string") {
    return null;
  }

  const parsed = Number(match[index]);
  return Number.isFinite(parsed) ? parsed : null;
}
