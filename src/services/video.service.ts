import { VideoRepository } from "../repositories/video.repository";
import type { MediaType, Video } from "../shared/types";

export class VideoService {
  constructor(private readonly videoRepository: VideoRepository) {}

  listByCategory(categoryId: number): Video[] {
    return this.videoRepository.listByCategory(categoryId);
  }

  createVideo(params: {
    categoryId: number;
    fileId: string;
    mediaType: MediaType;
    title: string;
    description: string;
  }): number {
    return this.videoRepository.create(params);
  }

  deleteVideo(videoId: number): { deleted: boolean; categoryId: number | null } {
    return this.videoRepository.delete(videoId);
  }
}

