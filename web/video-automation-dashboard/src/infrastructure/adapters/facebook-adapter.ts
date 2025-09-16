import type { IVideoRepository, VideoUploadRequest, VideoUploadResponse, ShareResponse } from '@/src/core/domain/repositories';

export class FacebookVideoAdapter implements IVideoRepository {
  constructor(private apiKey: string) {}

  async uploadVideo(videoData: VideoUploadRequest): Promise<VideoUploadResponse> {
    // Simulate API call to Facebook
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id: `fb_${Date.now()}`,
      title: videoData.title,
      status: 'completed',
      uploadedAt: new Date(),
    };
  }

  async shareToFacebook(_videoId: string, _description: string): Promise<ShareResponse> {
    // Simulate API call to Facebook
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      message: 'Video başarıyla Facebook\'a paylaşıldı',
      externalId: `fb_share_${Date.now()}`,
    };
  }

  async shareToInstagram(_videoId: string, _description: string): Promise<ShareResponse> {
    // Simulate API call to Instagram via Facebook
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      message: 'Video başarıyla Instagram\'a paylaşıldı',
      externalId: `ig_share_${Date.now()}`,
    };
  }
}
