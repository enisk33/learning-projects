'use server';

import { videoUploadSchema } from '@/lib/validations';
import { UploadVideoUseCase } from '@/src/core/use-cases/upload-video';
import { FacebookVideoAdapter } from '@/src/infrastructure/adapters/facebook-adapter';
import { z } from 'zod';

export async function uploadVideoAction(data: unknown) {
  try {
    const validatedData = videoUploadSchema.parse(data);

    // Dependency injection
    const videoAdapter = new FacebookVideoAdapter(process.env.FACEBOOK_API_KEY || '');
    const uploadVideoUseCase = new UploadVideoUseCase(videoAdapter);

    // Execute use case
    const result = await uploadVideoUseCase.execute({
      title: validatedData.title,
      description: validatedData.description,
      videoUrl: validatedData.videoUrl,
      platforms: validatedData.platforms,
    });

    return {
      success: true,
      message: 'Video başarıyla yüklendi ve paylaşıldı',
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: 'Bilinmeyen bir hata oluştu',
    };
  }
}
