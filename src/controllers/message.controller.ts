import { Bot, Context } from "grammy";
import { STATE } from "../constants/state-types";
import type { MediaType, StatePayload } from "../shared/types";
import { getUserId } from "./context-helpers";
import type { ControllerDeps } from "./controller.types";
import { parseCategoryId } from "./payload-helpers";

export class MessageController {
  constructor(private readonly deps: ControllerDeps) {}

  register(bot: Bot<Context>): void {
    bot.on("message", async (ctx) => this.onMessage(ctx));
  }

  private async onMessage(ctx: Context): Promise<void> {
    if (!ctx.message) {
      return;
    }

    const userId = getUserId(ctx);
    if (userId === null) {
      return;
    }

    if (!("text" in ctx.message) && !("video" in ctx.message) && !("video_note" in ctx.message)) {
      return;
    }

    const state = this.deps.userStateService.get(userId);
    if (!state) {
      return;
    }

    const text = getMessageText(ctx);
    if (text.startsWith("/")) {
      return;
    }

    switch (state.stateType) {
      case STATE.WaitCategoryPassword:
        await this.handleCategoryPasswordInput(ctx, userId, text, state.payload);
        return;
      case STATE.AdminAddCategoryName:
        await this.handleAdminAddCategoryName(ctx, userId, text);
        return;
      case STATE.AdminAddCategoryPassword:
        await this.handleAdminAddCategoryPassword(ctx, userId, text, state.payload);
        return;
      case STATE.AdminAddVideoFile:
        await this.handleAdminAddVideoFile(ctx, userId, state.payload);
        return;
      case STATE.AdminAddVideoTitle:
        await this.handleAdminAddVideoTitle(ctx, userId, text, state.payload);
        return;
      case STATE.AdminAddVideoDescription:
        await this.handleAdminAddVideoDescription(ctx, userId, text, state.payload);
        return;
      case STATE.AdminChangePasswordValue:
        await this.handleAdminChangePasswordValue(ctx, userId, text, state.payload);
        return;
      default:
        return;
    }
  }

  private async handleCategoryPasswordInput(
    ctx: Context,
    userId: number,
    text: string,
    payload: StatePayload
  ): Promise<void> {
    if (!hasText(ctx)) {
      await ctx.reply("Введите пароль текстом.");
      return;
    }

    const categoryId = parseCategoryId(payload);
    if (categoryId === null) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Состояние сброшено. Нажмите /start и попробуйте снова.");
      return;
    }

    const access = this.deps.categoryService.verifyCategoryAccess(categoryId, text);
    if (access.status === "not_found") {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Категория не найдена. Нажмите /start.");
      return;
    }
    if (access.status === "invalid_password") {
      await ctx.reply("Неверный пароль. Попробуйте снова.");
      return;
    }

    this.deps.userStateService.clear(userId);
    const videos = this.deps.videoService.listByCategory(access.category.id);

    if (videos.length === 0) {
      await ctx.reply("В этом разделе пока нет видео.", {
        reply_markup: this.deps.navigationService.buildBackToSectionsKeyboard()
      });
      return;
    }

    await ctx.reply(`Раздел "${access.category.name}" открыт. Отправляю список превью:`);
    for (const video of videos) {
      if (video.mediaType === "video_note") {
        await ctx.replyWithVideoNote(video.fileId);
        await ctx.reply(this.deps.navigationService.formatVideoCaption(video));
      } else {
        await ctx.replyWithVideo(video.fileId, {
          caption: this.deps.navigationService.formatVideoCaption(video)
        });
      }
    }
    await ctx.reply("Конец списка.", {
      reply_markup: this.deps.navigationService.buildBackToSectionsKeyboard()
    });
  }

  private async handleAdminAddCategoryName(
    ctx: Context,
    userId: number,
    text: string
  ): Promise<void> {
    if (!hasText(ctx)) {
      await ctx.reply("Введите название категории текстом.");
      return;
    }
    if (!this.isAdmin(userId)) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Недостаточно прав.");
      return;
    }

    this.deps.userStateService.set(userId, STATE.AdminAddCategoryPassword, { name: text });
    await ctx.reply("Введите пароль для этой категории:");
  }

  private async handleAdminAddCategoryPassword(
    ctx: Context,
    userId: number,
    text: string,
    payload: StatePayload
  ): Promise<void> {
    if (!hasText(ctx)) {
      await ctx.reply("Введите пароль текстом.");
      return;
    }
    if (!this.isAdmin(userId)) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Недостаточно прав.");
      return;
    }

    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    if (!name) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Ошибка состояния. Запустите /add_category заново.");
      return;
    }

    try {
      this.deps.categoryService.createCategory(name, text);
      this.deps.userStateService.clear(userId);
      await ctx.reply(`Категория "${name}" успешно создана.`);
    } catch (error) {
      await ctx.reply("Не удалось создать категорию. Возможно, такое название уже существует.");
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    }
  }

  private async handleAdminAddVideoFile(
    ctx: Context,
    userId: number,
    payload: StatePayload
  ): Promise<void> {
    if (!this.isAdmin(userId)) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Недостаточно прав.");
      return;
    }

    const categoryId = parseCategoryId(payload);
    if (categoryId === null) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Ошибка состояния. Запустите /add_video заново.");
      return;
    }

    const media = parseIncomingMedia(ctx);
    if (!media) {
      await ctx.reply("Ожидаю видео или video_note.");
      return;
    }

    this.deps.userStateService.set(userId, STATE.AdminAddVideoTitle, {
      categoryId,
      fileId: media.fileId,
      mediaType: media.mediaType
    });
    await ctx.reply("Введите название видео:");
  }

  private async handleAdminAddVideoTitle(
    ctx: Context,
    userId: number,
    text: string,
    payload: StatePayload
  ): Promise<void> {
    if (!hasText(ctx)) {
      await ctx.reply("Введите название текстом.");
      return;
    }
    if (!this.isAdmin(userId)) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Недостаточно прав.");
      return;
    }

    const categoryId = parseCategoryId(payload);
    const fileId = typeof payload?.fileId === "string" ? payload.fileId : null;
    const mediaType = payload?.mediaType;

    if (
      categoryId === null ||
      fileId === null ||
      (mediaType !== "video" && mediaType !== "video_note")
    ) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Ошибка состояния. Запустите /add_video заново.");
      return;
    }

    this.deps.userStateService.set(userId, STATE.AdminAddVideoDescription, {
      categoryId,
      fileId,
      mediaType,
      title: text
    });
    await ctx.reply("Введите краткое описание:");
  }

  private async handleAdminAddVideoDescription(
    ctx: Context,
    userId: number,
    text: string,
    payload: StatePayload
  ): Promise<void> {
    if (!hasText(ctx)) {
      await ctx.reply("Введите описание текстом.");
      return;
    }
    if (!this.isAdmin(userId)) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Недостаточно прав.");
      return;
    }

    const categoryId = parseCategoryId(payload);
    const fileId = typeof payload?.fileId === "string" ? payload.fileId : null;
    const mediaType = payload?.mediaType;
    const title = typeof payload?.title === "string" ? payload.title : null;

    if (
      categoryId === null ||
      fileId === null ||
      title === null ||
      (mediaType !== "video" && mediaType !== "video_note")
    ) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Ошибка состояния. Запустите /add_video заново.");
      return;
    }

    try {
      this.deps.videoService.createVideo({
        categoryId,
        fileId,
        mediaType,
        title,
        description: text
      });
      this.deps.userStateService.clear(userId);
      await ctx.reply("Видео успешно добавлено.");
    } catch (error) {
      await ctx.reply("Не удалось сохранить видео.");
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    }
  }

  private async handleAdminChangePasswordValue(
    ctx: Context,
    userId: number,
    text: string,
    payload: StatePayload
  ): Promise<void> {
    if (!hasText(ctx)) {
      await ctx.reply("Введите пароль текстом.");
      return;
    }
    if (!this.isAdmin(userId)) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Недостаточно прав.");
      return;
    }

    const categoryId = parseCategoryId(payload);
    if (categoryId === null) {
      this.deps.userStateService.clear(userId);
      await ctx.reply("Ошибка состояния. Запустите /change_password заново.");
      return;
    }

    const changed = this.deps.categoryService.changeCategoryPassword(categoryId, text);
    this.deps.userStateService.clear(userId);
    if (!changed) {
      await ctx.reply("Категория не найдена.");
      return;
    }
    await ctx.reply("Пароль категории обновлен.");
  }

  private isAdmin(userId: number): boolean {
    return this.deps.adminAccessService.isAdmin(userId);
  }
}

function hasText(ctx: Context): boolean {
  return Boolean(getMessageText(ctx));
}

function getMessageText(ctx: Context): string {
  if (!ctx.message || !("text" in ctx.message) || typeof ctx.message.text !== "string") {
    return "";
  }
  return ctx.message.text.trim();
}

function parseIncomingMedia(ctx: Context): { mediaType: MediaType; fileId: string } | null {
  if (!ctx.message) {
    return null;
  }
  if ("video" in ctx.message && ctx.message.video) {
    return { mediaType: "video", fileId: ctx.message.video.file_id };
  }
  if ("video_note" in ctx.message && ctx.message.video_note) {
    return { mediaType: "video_note", fileId: ctx.message.video_note.file_id };
  }
  return null;
}

