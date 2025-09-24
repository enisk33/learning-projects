/**
 * Instagram Post Action
 * Instagram'a içerik yayınlama için server action
 */

'use server';

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { socialMediaService } from '@/lib/services/social-media-service';
import { formatErrorResponse } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

export interface InstagramPostResult {
  success: boolean;
  postId?: string;
  videoId?: string;
  error?: string;
}

/**
 * Instagram'a post yayınla
 */
export async function publishToInstagram(formData: FormData): Promise<InstagramPostResult> {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Oturum açmanız gerekiyor' };
    }

    // 2. FormData'dan verileri al
    const file = formData.get('file') as File | null;
    const description = (formData.get('description') as string) || undefined;
    const uploadType = (formData.get('uploadType') as string) || 'post';

    // 3. Validation
    if (!file || file.size === 0) {
      return { success: false, error: 'Instagram için dosya gereklidir' };
    }

    // 4. Instagram servisini çağır
    const result = await socialMediaService.publishToPlatform(
      'instagram',
      session.user.id,
      {
        file,
        description,
        uploadType: uploadType === 'reels' ? 'reels' : 'post',
      }
    );

    logger.info('Instagram post başarılı', {
      userId: session.user.id,
      postId: result.postId,
      videoId: result.videoId,
    });

    return {
      success: result.success,
      postId: result.postId,
      videoId: result.videoId,
      error: result.error,
    };
  } catch (error) {
    logger.error('Instagram post action hatası', error);
    const formatted = formatErrorResponse(error);
    return {
      success: false,
      error: formatted.error || 'Instagram post yayınlanamadı',
    };
  }
}
