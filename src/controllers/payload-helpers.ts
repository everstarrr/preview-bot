import type { StatePayload } from "../shared/types";

export function parseCategoryId(payload: StatePayload): number | null {
  const value = payload?.categoryId;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }
  return value;
}

