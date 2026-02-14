import type Database from "better-sqlite3";
import type { Category } from "../shared/types";

type CategoryRow = {
  id: number;
  name: string;
  password: string;
};

export class CategoryRepository {
  constructor(private readonly db: Database.Database) {}

  list(): Category[] {
    const rows = this.db
      .prepare("SELECT id, name, password FROM categories ORDER BY id ASC")
      .all() as CategoryRow[];
    return rows.map(mapCategoryRow);
  }

  getById(categoryId: number): Category | null {
    const row = this.db
      .prepare("SELECT id, name, password FROM categories WHERE id = ?")
      .get(categoryId) as CategoryRow | undefined;
    return row ? mapCategoryRow(row) : null;
  }

  create(name: string, passwordHash: string): number {
    const result = this.db
      .prepare("INSERT INTO categories (name, password) VALUES (?, ?)")
      .run(name, passwordHash);
    return Number(result.lastInsertRowid);
  }

  updatePassword(categoryId: number, passwordHash: string): boolean {
    const result = this.db
      .prepare("UPDATE categories SET password = ? WHERE id = ?")
      .run(passwordHash, categoryId);
    return result.changes > 0;
  }
}

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    password: row.password
  };
}

