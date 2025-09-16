import { IVideoRepository } from '@/src/core/repositories/video-repository.interface';

export class UploadVideoUseCase {
  constructor(private videoRepository: IVideoRepository) {}

  async execute(videoUrl: string, title: string, description: string): Promise<string> {
    if (!videoUrl || !title || !description) {
      throw new Error('Video URL, title, and description are required');
    }

    return await this.videoRepository.upload(videoUrl, title, description);
  }
}
