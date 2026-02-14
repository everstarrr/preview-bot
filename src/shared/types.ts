export type MediaType = "video" | "video_note";

export interface Category {
  id: number;
  name: string;
  password: string;
}

export interface Video {
  id: number;
  categoryId: number;
  fileId: string;
  mediaType: MediaType;
  title: string;
  description: string;
  order: number;
}

export type StatePayload = Record<string, unknown> | null;

export interface UserState {
  userId: number;
  stateType: string;
  payload: StatePayload;
}

