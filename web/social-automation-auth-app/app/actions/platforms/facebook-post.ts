/**
 * Facebook Post Action
 * Facebook'a içerik yayınlama için server action
 */

'use server';

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { socialMediaService } from '@/lib/services/social-media-service';
import { formatErrorResponse } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

export interface FacebookPostResult {
  success: boolean;
  postId?: string;
  videoId?: string;
  error?: string;
}

/**
 * Facebook'a post yayınla
 */
export async function publishToFacebook(formData: FormData): Promise<FacebookPostResult> {
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

    // 3. Validation - Facebook için dosya veya açıklama gereklidir
    if (!file && !description) {
      return { success: false, error: 'Facebook için dosya veya açıklama gereklidir' };
    }

    // 4. Facebook servisini çağır
    const result = await socialMediaService.publishToPlatform(
      'facebook',
      session.user.id,
      {
        file: file && file.size > 0 ? file : undefined,
        description,
        uploadType: uploadType === 'reels' ? 'reels' : 'post',
      }
    );

    logger.info('Facebook post başarılı', {
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
    logger.error('Facebook post action hatası', error);
    const formatted = formatErrorResponse(error);
    return {
      success: false,
      error: formatted.error || 'Facebook post yayınlanamadı',
    };
  }
}
