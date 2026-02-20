import { Bot, Context } from "grammy";
import { STATE } from "../constants/state-types";
import { getLocale, t } from "../i18n/messages";
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
    const locale = getLocale(ctx);
    await this.deps.navigationService.showSections(ctx);

    if (this.deps.adminAccessService.isAdmin(getUserId(ctx))) {
      await ctx.reply(t(locale, "adminCommands"));
    }
  }

  private async onCancel(ctx: Context): Promise<void> {
    const locale = getLocale(ctx);
    const userId = getUserId(ctx);
    if (userId === null) {
      return;
    }
    this.deps.userStateService.clear(userId);
    await ctx.reply(t(locale, "actionCancelled"));
  }

  private async onAddCategory(ctx: Context): Promise<void> {
    const locale = getLocale(ctx);
    const admin = await ensureAdmin(ctx, this.deps.adminAccessService);
    if (!admin.ok) {
      return;
    }

    this.deps.userStateService.set(admin.userId, STATE.AdminAddCategoryName, null);
    await ctx.reply(t(locale, "enterNewCategoryName"));
  }

  private async onAddVideo(ctx: Context): Promise<void> {
    const locale = getLocale(ctx);
    const admin = await ensureAdmin(ctx, this.deps.adminAccessService);
    if (!admin.ok) {
      return;
    }

    const categories = this.deps.categoryService.listCategories();
    if (categories.length === 0) {
      await ctx.reply(t(locale, "noCategoriesCreateFirst"));
      return;
    }

    this.deps.userStateService.set(admin.userId, STATE.AdminAddVideoCategory, null);
    await ctx.reply(t(locale, "selectCategoryForVideo"), {
      reply_markup: this.deps.navigationService.buildCategoriesKeyboard(
        "admin_add_video_category",
        categories
      )
    });
  }

  private async onChangePassword(ctx: Context): Promise<void> {
    const locale = getLocale(ctx);
    const admin = await ensureAdmin(ctx, this.deps.adminAccessService);
    if (!admin.ok) {
      return;
    }

    const categories = this.deps.categoryService.listCategories();
    if (categories.length === 0) {
      await ctx.reply(t(locale, "noCategoriesToChange"));
      return;
    }

    this.deps.userStateService.set(admin.userId, STATE.AdminChangePasswordCategory, null);
    await ctx.reply(t(locale, "selectCategoryForPasswordChange"), {
      reply_markup: this.deps.navigationService.buildCategoriesKeyboard(
        "admin_change_password_category",
        categories
      )
    });
  }

  private async onDeleteVideo(ctx: Context): Promise<void> {
    const locale = getLocale(ctx);
    const admin = await ensureAdmin(ctx, this.deps.adminAccessService);
    if (!admin.ok) {
      return;
    }

    const categories = this.deps.categoryService.listCategories();
    if (categories.length === 0) {
      await ctx.reply(t(locale, "noCategories"));
      return;
    }

    this.deps.userStateService.set(admin.userId, STATE.AdminDeleteVideoCategory, null);
    await ctx.reply(t(locale, "selectCategoryForDelete"), {
      reply_markup: this.deps.navigationService.buildCategoriesKeyboard(
        "admin_delete_video_category",
        categories
      )
    });
  }
}
