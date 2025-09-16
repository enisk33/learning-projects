import type { IVideoRepository, VideoUploadRequest, VideoUploadResponse } from '@/src/core/domain/repositories';

export class UploadVideoUseCase {
  constructor(private videoRepository: IVideoRepository) {}

  async execute(request: VideoUploadRequest): Promise<VideoUploadResponse> {
    // Validate request
    if (!request.title || request.title.trim().length === 0) {
      throw new Error('Video başlığı gerekli');
    }

    if (!request.videoUrl || request.videoUrl.trim().length === 0) {
      throw new Error('Video URL gerekli');
    }

    if (request.platforms.length === 0) {
      throw new Error('En az bir platform seçin');
    }

    // Upload video
    const uploadResponse = await this.videoRepository.uploadVideo(request);

    // Share to selected platforms
    const sharePromises = request.platforms.map((platform) => {
      if (platform === 'facebook') {
        return this.videoRepository.shareToFacebook(uploadResponse.id, request.description || '');
      } else {
        return this.videoRepository.shareToInstagram(uploadResponse.id, request.description || '');
      }
    });

    await Promise.all(sharePromises);

    return uploadResponse;
  }
}
