import { Bot, Context } from "grammy";
import { STATE } from "../constants/state-types";
import { ensureAdmin, getUserId } from "./context-helpers";
import type { ControllerDeps } from "./controller.types";

export class CommandController {
  constructor(private readonly deps: ControllerDeps) {}

  register(bot: Bot<Context>): void {
    bot.command("start", async (ctx) => this.onStart(ctx));
    bot.command("cancel", async (ctx) => this.onCancel(ctx));
    bot.command("add_category", async (ctx) => this.onAddCategory(ctx));
    bot.command("add_video", async (ctx) => this.onAddVideo(ctx));
    bot.command("change_password", async (ctx) => this.onChangePassword(ctx));
    bot.command("delete_video", async (ctx) => this.onDeleteVideo(ctx));
  }

  private async onStart(ctx: Context): Promise<void> {
    await this.deps.navigationService.showSections(ctx);

    if (this.deps.adminAccessService.isAdmin(getUserId(ctx))) {
      await ctx.reply(
        "Админ-команды:\n/add_category\n/add_video\n/change_password\n/delete_video\n/cancel"
      );
    }
  }

  private async onCancel(ctx: Context): Promise<void> {
    const userId = getUserId(ctx);
    if (userId === null) {
      return;
    }
    this.deps.userStateService.clear(userId);
    await ctx.reply("Текущее действие отменено.");
  }

  private async onAddCategory(ctx: Context): Promise<void> {
    const admin = await ensureAdmin(ctx, this.deps.adminAccessService);
    if (!admin.ok) {
      return;
    }

    this.deps.userStateService.set(admin.userId, STATE.AdminAddCategoryName, null);
    await ctx.reply("Введите название новой категории:");
  }

  private async onAddVideo(ctx: Context): Promise<void> {
    const admin = await ensureAdmin(ctx, this.deps.adminAccessService);
    if (!admin.ok) {
      return;
    }

    const categories = this.deps.categoryService.listCategories();
    if (categories.length === 0) {
      await ctx.reply("Нет категорий. Сначала создайте категорию через /add_category.");
      return;
    }

    this.deps.userStateService.set(admin.userId, STATE.AdminAddVideoCategory, null);
    await ctx.reply("Выберите категорию для видео:", {
      reply_markup: this.deps.navigationService.buildCategoriesKeyboard(
        "admin_add_video_category",
        categories
      )
    });
  }

  private async onChangePassword(ctx: Context): Promise<void> {
    const admin = await ensureAdmin(ctx, this.deps.adminAccessService);
    if (!admin.ok) {
      return;
    }

    const categories = this.deps.categoryService.listCategories();
    if (categories.length === 0) {
      await ctx.reply("Нет категорий для изменения.");
      return;
    }

    this.deps.userStateService.set(admin.userId, STATE.AdminChangePasswordCategory, null);
    await ctx.reply("Выберите категорию для смены пароля:", {
      reply_markup: this.deps.navigationService.buildCategoriesKeyboard(
        "admin_change_password_category",
        categories
      )
    });
  }

  private async onDeleteVideo(ctx: Context): Promise<void> {
    const admin = await ensureAdmin(ctx, this.deps.adminAccessService);
    if (!admin.ok) {
      return;
    }

    const categories = this.deps.categoryService.listCategories();
    if (categories.length === 0) {
      await ctx.reply("Нет категорий.");
      return;
    }

    this.deps.userStateService.set(admin.userId, STATE.AdminDeleteVideoCategory, null);
    await ctx.reply("Выберите категорию, из которой удалить видео:", {
      reply_markup: this.deps.navigationService.buildCategoriesKeyboard(
        "admin_delete_video_category",
        categories
      )
    });
  }
}

