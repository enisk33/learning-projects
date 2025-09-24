/**
 * Post Action (Orchestrator)
 * Tüm platformları yöneten ana action
 * Her platform kendi action dosyasında izole edilmiştir
 * 
 * ⚠️ ÖNEMLİ: Bu dosya orchestrator görevi görür
 * - Platform-specific logic: app/actions/platforms/ klasöründe
 * - Service logic: lib/services/platforms/ klasöründe
 * 
 * Bu dosyayı değiştirirken dikkatli olun:
 * - publishMedia() fonksiyonunun signature'ını değiştirmeyin
 * - Return type'ı değiştirmeyin: { success: boolean; error?: string }
 * - Platform action'larını çağırmayı koruyun
 */

'use server';

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { formatErrorResponse } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';
import { parsePublishMediaFormData } from '@/lib/validations/post-schemas';
import { publishToInstagram } from './platforms/instagram-post';
import { publishToFacebook } from './platforms/facebook-post';
import { publishToTikTok } from './platforms/tiktok-post';

/**
 * Tüm platformlara içerik yayınla (orchestrator)
 * Frontend'den çağrılan ana fonksiyon
 */
export async function publishMedia(formData: FormData) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Oturum açmanız gerekiyor' };
    }

    // 2. FormData'yı parse et
    const input = parsePublishMediaFormData(formData);
    
    // 3. Platform'ları filtrele ve paralel işleme hazırla
    const validPlatforms = input.platforms.filter(p => 
      ['instagram', 'facebook', 'tiktok'].includes(p)
    );

    if (validPlatforms.length === 0) {
      return { success: false, error: 'Desteklenen bir platform seçilmedi.' };
    }

    // 4. Tüm platform'ları paralel olarak işle (Promise.all ile performans artışı)
    const platformPromises = validPlatforms.map(async (platform) => {
      try {
        let result: { success: boolean; error?: string; postId?: string; videoId?: string };

        // Platform-specific action'ı çağır
        switch (platform) {
          case 'instagram':
            result = await publishToInstagram(formData);
            break;
          case 'facebook':
            result = await publishToFacebook(formData);
            break;
          case 'tiktok':
            result = await publishToTikTok(formData);
            break;
          default:
            logger.warn('Bilinmeyen platform', { platform });
            return {
              platform,
              result: {
                success: false,
                error: 'Bilinmeyen platform',
              },
            };
        }

        return { platform, result };
      } catch (error) {
        logger.error('Platform publish hatası', error, { platform, userId: session.user.id });
        return {
          platform,
          result: {
            success: false,
            error: error instanceof Error ? error.message : 'Bilinmeyen hata',
          },
        };
      }
    });

    // Tüm platform işlemlerini paralel olarak bekle
    const results = await Promise.all(platformPromises);

    // 4. Hiç platform seçilmemişse
    if (results.length === 0) {
      return { success: false, error: 'Desteklenen bir platform seçilmedi.' };
    }

    // 5. Tüm sonuçları kontrol et
    const failedPlatforms = results.filter(r => !r.result.success);
    
    if (failedPlatforms.length > 0) {
      const errorMessages = failedPlatforms.map(r => `${r.platform}: ${r.result.error}`).join(', ');
      return { 
        success: false, 
        error: `Bazı platformlarda hata oluştu: ${errorMessages}` 
      };
    }

    // 6. Tümü başarılı
    const successMessages = results.map(r => `${r.platform} başarılı`).join(', ');
    return { 
      success: true, 
      error: successMessages // Burada 'error' field'ı aslında mesaj için kullanılıyor
    };
  } catch (error) {
    logger.error('Publish media action hatası', error);
    return formatErrorResponse(error);
  }
}
