import type Database from "better-sqlite3";
import type { MediaType, Video } from "../shared/types";

type VideoRow = {
  id: number;
  category_id: number;
  file_id: string;
  media_type: MediaType;
  title: string;
  description: string;
  sort_order: number;
};

export class VideoRepository {
  constructor(private readonly db: Database.Database) {}

  listByCategory(categoryId: number): Video[] {
    const rows = this.db
      .prepare(
        `SELECT id, category_id, file_id, media_type, title, description, sort_order
         FROM videos
         WHERE category_id = ?
         ORDER BY sort_order ASC, id ASC`
      )
      .all(categoryId) as VideoRow[];

    return rows.map(mapVideoRow);
  }

  create(params: {
    categoryId: number;
    fileId: string;
    mediaType: MediaType;
    title: string;
    description: string;
  }): number {
    const nextOrder = this.getNextOrder(params.categoryId);
    const result = this.db
      .prepare(
        `INSERT INTO videos (category_id, file_id, media_type, title, description, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        params.categoryId,
        params.fileId,
        params.mediaType,
        params.title,
        params.description,
        nextOrder
      );
    return Number(result.lastInsertRowid);
  }

  delete(videoId: number): { deleted: boolean; categoryId: number | null } {
    const row = this.db
      .prepare("SELECT category_id FROM videos WHERE id = ?")
      .get(videoId) as { category_id: number } | undefined;

    if (!row) {
      return { deleted: false, categoryId: null };
    }

    const result = this.db.prepare("DELETE FROM videos WHERE id = ?").run(videoId);
    this.resequence(row.category_id);
    return { deleted: result.changes > 0, categoryId: row.category_id };
  }

  private getNextOrder(categoryId: number): number {
    const row = this.db
      .prepare("SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM videos WHERE category_id = ?")
      .get(categoryId) as { max_order: number };
    return row.max_order + 1;
  }

  private resequence(categoryId: number): void {
    const rows = this.db
      .prepare("SELECT id FROM videos WHERE category_id = ? ORDER BY sort_order ASC, id ASC")
      .all(categoryId) as Array<{ id: number }>;

    const update = this.db.prepare("UPDATE videos SET sort_order = ? WHERE id = ?");
    const tx = this.db.transaction(() => {
      rows.forEach((row, index) => update.run(index + 1, row.id));
    });
    tx();
  }
}

function mapVideoRow(row: VideoRow): Video {
  return {
    id: row.id,
    categoryId: row.category_id,
    fileId: row.file_id,
    mediaType: row.media_type,
    title: row.title,
    description: row.description,
    order: row.sort_order
  };
}

