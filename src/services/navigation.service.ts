import { Context, InlineKeyboard } from "grammy";
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

  buildBackToSectionsKeyboard(): InlineKeyboard {
    return new InlineKeyboard().text("⬅ Назад к разделам", "back_to_sections");
  }

  formatVideoCaption(video: Video): string {
    const safeTitle = video.title.trim() || "Без названия";
    const safeDescription = video.description.trim() || "Без описания";
    return `${safeTitle}\n${safeDescription}`;
  }

  async showSections(ctx: Context): Promise<void> {
    const categories = this.categoryService.listCategories();
    if (categories.length === 0) {
      await ctx.reply("Пока нет доступных разделов.");
      return;
    }

    await ctx.reply("Добро пожаловать.\nВыберите раздел:", {
      reply_markup: this.buildCategoriesKeyboard("select_category", categories)
    });
  }
}

