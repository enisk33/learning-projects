/**
 * Social Media Service (Facade)
 * Tüm platform servislerini yöneten ana servis
 * Her platform kendi servis dosyasında izole edilmiştir
 */

import { PlatformService, PublishOptions, PublishResult } from './platforms/base-platform-service';
import { instagramService } from './platforms/instagram-service';
import { facebookService } from './platforms/facebook-service';
import { tiktokService } from './platforms/tiktok-service';
import { ExternalServiceError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

// Platform tipi
export type Platform = 'instagram' | 'facebook' | 'tiktok';

// Export types
export type { PublishResult, PublishOptions } from './platforms/base-platform-service';
export type { FacebookPage } from './platforms/facebook-service';

export class SocialMediaService {
  private platforms: Record<Platform, PlatformService> = {
    instagram: instagramService,
    facebook: facebookService,
    tiktok: tiktokService,
  };

  /**
   * Belirtilen platforma içerik yayınla
   */
  async publishToPlatform(
    platform: Platform,
    userId: string,
    options: PublishOptions
  ): Promise<PublishResult> {
    const service = this.platforms[platform];
    
    if (!service) {
      throw new ExternalServiceError(
        platform,
        `Desteklenmeyen platform: ${platform}`
      );
    }

    try {
      logger.info('Platform publish başlatılıyor', {
        platform,
        userId,
        hasFile: !!options.file,
        uploadType: options.uploadType,
      });

      const result = await service.publish(userId, options);

      logger.info('Platform publish tamamlandı', {
        platform,
        userId,
        success: result.success,
      });

      return result;
    } catch (error) {
      logger.error('Platform publish hatası', error, {
        platform,
        userId,
      });
      throw error;
    }
  }

  /**
   * Platform hesap ID'sini getir
   */
  async getPlatformAccountId(platform: Platform, userId: string): Promise<string> {
    const service = this.platforms[platform];
    
    if (!service) {
      throw new ExternalServiceError(
        platform,
        `Desteklenmeyen platform: ${platform}`
      );
    }

    return service.getAccountId(userId);
  }

  /**
   * Facebook sayfalarını getir (backward compatibility)
   */
  async getFacebookPages(userId: string) {
    return facebookService.getFacebookPages(userId);
  }

  /**
   * Instagram Business Account ID'sini getir (backward compatibility)
   */
  async getInstagramAccountId(pageId: string, pageAccessToken: string): Promise<string> {
    // Bu metod artık kullanılmıyor, ama backward compatibility için bırakıldı
    // Yeni kodda instagramService.getAccountId() kullanılmalı
    logger.warn('getInstagramAccountId deprecated, use instagramService.getAccountId() instead');
    throw new Error('Bu metod deprecated. instagramService.getAccountId() kullanın.');
  }

  /**
   * Instagram'a post yayınla (backward compatibility wrapper)
   * @deprecated publishToPlatform kullanın
   */
  async publishToInstagram(
    userId: string,
    instagramAccountId: string,
    pageAccessToken: string,
    options: {
      file: File;
      caption?: string;
      uploadType?: 'post' | 'reels';
    }
  ): Promise<PublishResult> {
    logger.warn('publishToInstagram deprecated, use publishToPlatform instead');
    return this.publishToPlatform('instagram', userId, {
      file: options.file,
      description: options.caption,
      uploadType: options.uploadType,
    });
  }

  /**
   * Facebook'a post yayınla (backward compatibility wrapper)
   * @deprecated publishToPlatform kullanın
   */
  async publishToFacebook(
    userId: string,
    pageId: string,
    pageAccessToken: string,
    options: {
      file?: File;
      description?: string;
      uploadType?: 'post' | 'reels';
    }
  ): Promise<PublishResult> {
    logger.warn('publishToFacebook deprecated, use publishToPlatform instead');
    return this.publishToPlatform('facebook', userId, {
      file: options.file,
      description: options.description,
      uploadType: options.uploadType,
    });
  }
}

// Singleton instance
export const socialMediaService = new SocialMediaService();
