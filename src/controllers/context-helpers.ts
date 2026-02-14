import { Context } from "grammy";
import { AdminAccessService } from "../services/admin-access.service";

export function getUserId(ctx: Context): number | null {
  return ctx.from?.id ?? null;
}

export async function ensureAdmin(
  ctx: Context,
  adminAccessService: AdminAccessService
): Promise<{ ok: true; userId: number } | { ok: false }> {
  const userId = getUserId(ctx);
  if (adminAccessService.isAdmin(userId) && userId !== null) {
    return { ok: true, userId };
  }

  await ctx.reply("Команда доступна только администратору.");
  return { ok: false };
}

