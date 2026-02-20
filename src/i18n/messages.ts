import { Context } from "grammy";

export type BotLocale = "ru" | "en";

type MessageKey =
  | "adminCommands"
  | "actionCancelled"
  | "enterNewCategoryName"
  | "noCategoriesCreateFirst"
  | "selectCategoryForVideo"
  | "noCategoriesToChange"
  | "selectCategoryForPasswordChange"
  | "noCategories"
  | "selectCategoryForDelete"
  | "invalidRequest"
  | "categoryNotFound"
  | "enterSectionPassword"
  | "actionOutdated"
  | "sendVideoForCategory"
  | "enterNewPasswordForCategory"
  | "noVideosInCategory"
  | "selectVideoToDelete"
  | "stateReset"
  | "videoNotFound"
  | "videoDeletedNoMore"
  | "videoDeletedCanDeleteNext"
  | "insufficientRights"
  | "adminOnlyCommand"
  | "enterPasswordAsText"
  | "stateResetStartAgain"
  | "categoryNotFoundStart"
  | "wrongPasswordTryAgain"
  | "noVideosInSection"
  | "sectionOpenedSendingPreviews"
  | "endOfList"
  | "enterCategoryNameAsText"
  | "enterPasswordForCategory"
  | "stateErrorRestartAddCategory"
  | "categoryCreated"
  | "createCategoryFailedMaybeExists"
  | "stateErrorRestartAddVideo"
  | "expectVideoOrVideoNote"
  | "enterVideoTitle"
  | "enterTitleAsText"
  | "enterShortDescription"
  | "enterDescriptionAsText"
  | "videoAdded"
  | "videoSaveFailed"
  | "stateErrorRestartChangePassword"
  | "categoryPasswordUpdated"
  | "backToSectionsButton"
  | "untitled"
  | "noDescription"
  | "noSectionsYet"
  | "welcomeSelectSection";

type TemplateParams = Record<string, string | number>;
type LocaleMessages = Record<MessageKey, string>;

const messages: Record<BotLocale, LocaleMessages> = {
  ru: {
    adminCommands: "Админ-команды:\n/add_category\n/add_video\n/change_password\n/delete_video\n/cancel",
    actionCancelled: "Текущее действие отменено.",
    enterNewCategoryName: "Введите название новой категории:",
    noCategoriesCreateFirst: "Нет категорий. Сначала создайте категорию через /add_category.",
    selectCategoryForVideo: "Выберите категорию для видео:",
    noCategoriesToChange: "Нет категорий для изменения.",
    selectCategoryForPasswordChange: "Выберите категорию для смены пароля:",
    noCategories: "Нет категорий.",
    selectCategoryForDelete: "Выберите категорию, из которой удалить видео:",
    invalidRequest: "Некорректный запрос",
    categoryNotFound: "Категория не найдена.",
    enterSectionPassword: "Введите пароль для доступа к разделу:",
    actionOutdated: "Действие неактуально",
    sendVideoForCategory: 'Отправьте видео или video_note для категории "{categoryName}":',
    enterNewPasswordForCategory: 'Введите новый пароль для категории "{categoryName}":',
    noVideosInCategory: "В этой категории нет видео.",
    selectVideoToDelete: "Выберите видео для удаления:",
    stateReset: "Состояние сброшено",
    videoNotFound: "Видео не найдено.",
    videoDeletedNoMore: "Видео удалено. В категории больше нет видео.",
    videoDeletedCanDeleteNext: "Видео удалено. Можете удалить следующее:",
    insufficientRights: "Недостаточно прав.",
    adminOnlyCommand: "Команда доступна только администратору.",
    enterPasswordAsText: "Введите пароль текстом.",
    stateResetStartAgain: "Состояние сброшено. Нажмите /start и попробуйте снова.",
    categoryNotFoundStart: "Категория не найдена. Нажмите /start.",
    wrongPasswordTryAgain: "Неверный пароль. Попробуйте снова.",
    noVideosInSection: "В этом разделе пока нет видео.",
    sectionOpenedSendingPreviews: 'Раздел "{sectionName}" открыт. Отправляю список превью:',
    endOfList: "Конец списка.",
    enterCategoryNameAsText: "Введите название категории текстом.",
    enterPasswordForCategory: "Введите пароль для этой категории:",
    stateErrorRestartAddCategory: "Ошибка состояния. Запустите /add_category заново.",
    categoryCreated: 'Категория "{categoryName}" успешно создана.',
    createCategoryFailedMaybeExists:
      "Не удалось создать категорию. Возможно, такое название уже существует.",
    stateErrorRestartAddVideo: "Ошибка состояния. Запустите /add_video заново.",
    expectVideoOrVideoNote: "Ожидаю видео или video_note.",
    enterVideoTitle: "Введите название видео:",
    enterTitleAsText: "Введите название текстом.",
    enterShortDescription: "Введите краткое описание:",
    enterDescriptionAsText: "Введите описание текстом.",
    videoAdded: "Видео успешно добавлено.",
    videoSaveFailed: "Не удалось сохранить видео.",
    stateErrorRestartChangePassword: "Ошибка состояния. Запустите /change_password заново.",
    categoryPasswordUpdated: "Пароль категории обновлен.",
    backToSectionsButton: "⬅ Назад к разделам",
    untitled: "Без названия",
    noDescription: "Без описания",
    noSectionsYet: "Пока нет доступных разделов.",
    welcomeSelectSection: "Добро пожаловать.\nВыберите раздел:"
  },
  en: {
    adminCommands: "Admin commands:\n/add_category\n/add_video\n/change_password\n/delete_video\n/cancel",
    actionCancelled: "Current action canceled.",
    enterNewCategoryName: "Enter a new category name:",
    noCategoriesCreateFirst: "No categories. Create one first via /add_category.",
    selectCategoryForVideo: "Choose a category for the video:",
    noCategoriesToChange: "No categories to change.",
    selectCategoryForPasswordChange: "Choose a category to change password:",
    noCategories: "No categories.",
    selectCategoryForDelete: "Choose a category to delete a video from:",
    invalidRequest: "Invalid request",
    categoryNotFound: "Category not found.",
    enterSectionPassword: "Enter the section password:",
    actionOutdated: "This action is no longer valid",
    sendVideoForCategory: 'Send a video or video_note for category "{categoryName}":',
    enterNewPasswordForCategory: 'Enter a new password for category "{categoryName}":',
    noVideosInCategory: "There are no videos in this category.",
    selectVideoToDelete: "Choose a video to delete:",
    stateReset: "State reset",
    videoNotFound: "Video not found.",
    videoDeletedNoMore: "Video deleted. No more videos in this category.",
    videoDeletedCanDeleteNext: "Video deleted. You can delete the next one:",
    insufficientRights: "Insufficient permissions.",
    adminOnlyCommand: "This command is available to administrators only.",
    enterPasswordAsText: "Enter the password as text.",
    stateResetStartAgain: "State reset. Press /start and try again.",
    categoryNotFoundStart: "Category not found. Press /start.",
    wrongPasswordTryAgain: "Wrong password. Try again.",
    noVideosInSection: "There are no videos in this section yet.",
    sectionOpenedSendingPreviews: 'Section "{sectionName}" unlocked. Sending preview list:',
    endOfList: "End of list.",
    enterCategoryNameAsText: "Enter the category name as text.",
    enterPasswordForCategory: "Enter a password for this category:",
    stateErrorRestartAddCategory: "State error. Restart via /add_category.",
    categoryCreated: 'Category "{categoryName}" created successfully.',
    createCategoryFailedMaybeExists:
      "Failed to create category. A category with this name may already exist.",
    stateErrorRestartAddVideo: "State error. Restart via /add_video.",
    expectVideoOrVideoNote: "Waiting for a video or video_note.",
    enterVideoTitle: "Enter the video title:",
    enterTitleAsText: "Enter the title as text.",
    enterShortDescription: "Enter a short description:",
    enterDescriptionAsText: "Enter the description as text.",
    videoAdded: "Video added successfully.",
    videoSaveFailed: "Failed to save video.",
    stateErrorRestartChangePassword: "State error. Restart via /change_password.",
    categoryPasswordUpdated: "Category password updated.",
    backToSectionsButton: "⬅ Back to sections",
    untitled: "Untitled",
    noDescription: "No description",
    noSectionsYet: "No sections available yet.",
    welcomeSelectSection: "Welcome.\nChoose a section:"
  }
};

export function getLocale(ctx: Context): BotLocale {
  return resolveLocale(ctx.from?.language_code);
}

export function resolveLocale(languageCode: string | null | undefined): BotLocale {
  if (!languageCode) {
    return "en";
  }
  const normalized = languageCode.toLowerCase();
  if (normalized.startsWith("ru")) {
    return "ru";
  }
  return "en";
}

export function t(locale: BotLocale, key: MessageKey, params?: TemplateParams): string {
  return interpolate(messages[locale][key], params);
}

function interpolate(template: string, params?: TemplateParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}
