'use server';

import { FacebookVideoRepository } from '@/src/infrastructure/adapters/facebook-video-repository';
import { UploadVideoUseCase } from '@/src/core/use-cases/upload-video.use-case';

export async function uploadVideoAction(
  videoUrl: string,
  title: string,
  description: string
): Promise<{ success: boolean; videoId?: string; error?: string }> {
  try {
    // Initialize repository and use-case
    const videoRepository = new FacebookVideoRepository();
    const uploadVideoUseCase = new UploadVideoUseCase(videoRepository);

    // Execute the upload
    const videoId = await uploadVideoUseCase.execute(videoUrl, title, description);

    return {
      success: true,
      videoId,
    };
  } catch (error) {
    console.error('Video upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
