import { Context, InlineKeyboard } from "grammy";
import { getLocale, t, type BotLocale } from "../i18n/messages";
import type { Category, Video } from "../shared/types";
import { CategoryService } from "./category.service";

export class NavigationService {
  constructor(private readonly categoryService: CategoryService) {}

  buildCategoriesKeyboard(prefix: string, categories?: Category[]): InlineKeyboard {
    const source = categories ?? this.categoryService.listCategories();
    const keyboard = new InlineKeyboard();

    source.forEach((category) => {
      keyboard.text(category.name, `${prefix}:${category.id}`).row();
    });

    return keyboard;
  }

  buildBackToSectionsKeyboard(locale: BotLocale): InlineKeyboard {
    return new InlineKeyboard().text(t(locale, "backToSectionsButton"), "back_to_sections");
  }

  formatVideoCaption(video: Video, locale: BotLocale): string {
    const safeTitle = video.title.trim() || t(locale, "untitled");
    const safeDescription = video.description.trim() || t(locale, "noDescription");
    return `${safeTitle}\n${safeDescription}`;
  }

  async showSections(ctx: Context): Promise<void> {
    const locale = getLocale(ctx);
    const categories = this.categoryService.listCategories();
    if (categories.length === 0) {
      await ctx.reply(t(locale, "noSectionsYet"));
      return;
    }

    await ctx.reply(t(locale, "welcomeSelectSection"), {
      reply_markup: this.buildCategoriesKeyboard("select_category", categories)
    });
  }
}
