import type Database from "better-sqlite3";
import type { StatePayload, UserState } from "../shared/types";

type StateRow = {
  user_id: number;
  state_type: string;
  payload: string | null;
};

export class UserStateRepository {
  constructor(private readonly db: Database.Database) {}

  set(userId: number, stateType: string, payload: StatePayload): void {
    const serializedPayload = payload === null ? null : JSON.stringify(payload);
    this.db
      .prepare(
        `INSERT INTO user_states (user_id, state_type, payload)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
          state_type = excluded.state_type,
          payload = excluded.payload,
          updated_at = CURRENT_TIMESTAMP`
      )
      .run(userId, stateType, serializedPayload);
  }

  get(userId: number): UserState | null {
    const row = this.db
      .prepare("SELECT user_id, state_type, payload FROM user_states WHERE user_id = ?")
      .get(userId) as StateRow | undefined;

    if (!row) {
      return null;
    }

    return {
      userId: row.user_id,
      stateType: row.state_type,
      payload: deserializePayload(row.payload)
    };
  }

  clear(userId: number): void {
    this.db.prepare("DELETE FROM user_states WHERE user_id = ?").run(userId);
  }
}

function deserializePayload(payload: string | null): StatePayload {
  if (!payload) {
    return null;
  }
  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

