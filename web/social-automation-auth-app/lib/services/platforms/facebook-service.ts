/**
 * Facebook Service
 * Facebook API işlemleri (Graph API v24.0)
 */

import { PlatformService, PublishOptions, PublishResult } from './base-platform-service';
import { tokenRepository } from '@/lib/repositories/token-repository';
import { fileService } from '@/lib/services/file-service';
import { ExternalServiceError, TokenError, ValidationError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

export class FacebookService implements PlatformService {
  private readonly graphApiVersion = 'v24.0';
  private readonly requestTimeout = 30000; // 30 saniye

  /**
   * Fetch wrapper with timeout ve error handling
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = this.requestTimeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ExternalServiceError('Facebook Graph API', 'İstek zaman aşımına uğradı', error);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Facebook sayfalarını getir
   */
  async getFacebookPages(userId: string): Promise<FacebookPage[]> {
    try {
      const token = await tokenRepository.getValidToken(userId, 'facebook');
      
      const response = await this.fetchWithTimeout(
        `https://graph.facebook.com/${this.graphApiVersion}/me/accounts?access_token=${token.accessToken}`
      );

      const data = await response.json();

      if (!response.ok || !data.data || data.data.length === 0) {
        logger.error('Facebook sayfaları alınamadı', { userId, error: data.error });
        throw new ExternalServiceError(
          'Facebook',
          data.error?.message || 'Facebook sayfaları alınamadı'
        );
      }

      return data.data.map((page: { id: string; name: string; access_token: string }) => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
      }));
    } catch (error) {
      if (error instanceof TokenError || error instanceof ExternalServiceError) {
        throw error;
      }
      logger.error('FacebookService: Facebook sayfaları getirme hatası', error, { userId });
      throw new ExternalServiceError('Facebook', 'Sayfalar alınamadı', error);
    }
  }

  /**
   * PlatformService interface implementasyonu
   * İlk sayfanın ID'sini döndürür
   */
  async getAccountId(userId: string): Promise<string> {
    const pages = await this.getFacebookPages(userId);
    if (pages.length === 0) {
      throw new ExternalServiceError('Facebook', 'Facebook sayfası bulunamadı');
    }
    return pages[0].id;
  }

  /**
   * Facebook'a text-only post yayınla
   */
  private async publishTextPost(
    pageId: string,
    pageAccessToken: string,
    description: string
  ): Promise<PublishResult> {
    const response = await this.fetchWithTimeout(
      `https://graph.facebook.com/${this.graphApiVersion}/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: pageAccessToken,
          message: description || '',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new ExternalServiceError('Facebook', data.error?.message || 'Post yayınlanamadı');
    }

    return { success: true, postId: data.id };
  }

  /**
   * Facebook'a image post yayınla
   */
  private async publishImagePost(
    pageId: string,
    pageAccessToken: string,
    fileUrl: string,
    description?: string
  ): Promise<PublishResult> {
    const response = await this.fetchWithTimeout(
      `https://graph.facebook.com/${this.graphApiVersion}/${pageId}/photos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: pageAccessToken,
          url: fileUrl,
          message: description || '',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new ExternalServiceError('Facebook', data.error?.message || 'Image yüklenemedi');
    }

    return { success: true, postId: data.id };
  }

  /**
   * Facebook'a normal video post yayınla
   */
  private async publishVideoPost(
    pageId: string,
    pageAccessToken: string,
    fileUrl: string,
    description?: string
  ): Promise<PublishResult> {
    const response = await this.fetchWithTimeout(
      `https://graph.facebook.com/${this.graphApiVersion}/${pageId}/videos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: pageAccessToken,
          file_url: fileUrl,
          description: description || '',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new ExternalServiceError('Facebook', data.error?.message || 'Video yayınlanamadı');
    }

    return { success: true, videoId: data.id };
  }

  /**
   * Facebook'a Reels yayınla (Resumable Upload API)
   */
  private async publishReels(
    pageId: string,
    pageAccessToken: string,
    file: File,
    fileUrl: string,
    description?: string
  ): Promise<PublishResult> {
    logger.info('Facebook Reels upload başlatılıyor', {
      pageId,
      fileSize: file.size,
      fileName: file.name,
    });

    // 1. Upload session başlat
    const startResponse = await this.fetchWithTimeout(
      `https://graph.facebook.com/${this.graphApiVersion}/${pageId}/video_reels`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          access_token: pageAccessToken,
          upload_phase: 'start',
          file_size: file.size.toString(),
        }),
      }
    );

    const startData = await startResponse.json();

    if (!startResponse.ok || !startData.video_id) {
      logger.error('Facebook Reels upload başlatma hatası', {
        error: startData.error,
        response: startData,
      });
      throw new ExternalServiceError(
        'Facebook',
        startData.error?.message || 'Reels upload başlatılamadı'
      );
    }

    logger.debug('Facebook Reels upload session oluşturuldu', {
      video_id: startData.video_id,
      upload_url: startData.upload_url ? 'var' : 'yok',
    });

    // 2. Video'yu yükle (eğer upload_url varsa)
    if (startData.upload_url) {
      const videoBuffer = await file.arrayBuffer();
      
      const uploadResponse = await this.fetchWithTimeout(
        startData.upload_url,
        {
          method: 'POST',
          body: videoBuffer,
          headers: {
            // Authorization header'ı kaldırıldı - upload_url'e yükleme için gerekli değil
            // Facebook'un upload_url'i zaten authenticated bir URL
            'Content-Type': 'application/octet-stream',
            'Content-Length': videoBuffer.byteLength.toString(), // Video boyutu (zorunlu)
            'Offset': '0', // İlk chunk için offset 0
          },
        },
        60000 // Video upload için 60 saniye timeout
      );

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text();
        logger.error('Facebook Reels video yükleme hatası', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: uploadError,
        });
        throw new ExternalServiceError('Facebook', 'Video yüklenemedi');
      }

      logger.debug('Facebook Reels video yüklendi');
    }

    // 3. Upload'u tamamla ve publish et
    const finishParams: Record<string, string> = {
      access_token: pageAccessToken,
      upload_phase: 'finish',
      video_id: startData.video_id,
    };

    if (description && description.trim()) {
      finishParams.caption = description.trim();
    }

    // Eğer upload_url yoksa, file_url ekle
    if (!startData.upload_url) {
      finishParams.file_url = fileUrl;
    }

    const finishResponse = await this.fetchWithTimeout(
      `https://graph.facebook.com/${this.graphApiVersion}/${pageId}/video_reels`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(finishParams),
      }
    );

    const finishData = await finishResponse.json();

    if (!finishResponse.ok) {
      logger.error('Facebook Reels publish hatası', {
        error: finishData.error,
        response: finishData,
      });
      throw new ExternalServiceError(
        'Facebook',
        finishData.error?.message || 'Reels yayınlanamadı'
      );
    }

    logger.info('Facebook Reels başarıyla yayınlandı', {
      videoId: finishData.id,
    });

    return { success: true, videoId: finishData.id };
  }

  /**
   * PlatformService interface implementasyonu
   * Facebook'a post yayınla
   */
  async publish(userId: string, options: PublishOptions): Promise<PublishResult> {
    try {
      if (!options.file && !options.description) {
        throw new ValidationError('Dosya veya açıklama gereklidir');
      }

      // Facebook sayfalarını getir
      const pages = await this.getFacebookPages(userId);
      if (pages.length === 0) {
        throw new ExternalServiceError('Facebook', 'Facebook sayfası bulunamadı');
      }

      const pageId = pages[0].id;
      const pageAccessToken = pages[0].access_token;

      // Text-only post
      if (!options.file) {
        return this.publishTextPost(pageId, pageAccessToken, options.description || '');
      }

      // Media post
      const isVideo = fileService.isVideo(options.file);
      const isImage = fileService.isImage(options.file);

      if (!isVideo && !isImage) {
        throw new ValidationError('Desteklenmeyen dosya tipi. Sadece image ve video destekleniyor.');
      }

      // Dosyayı kaydet ve URL al
      const fileResult = await fileService.saveFile(options.file);

      if (isImage) {
        // Image post
        return this.publishImagePost(pageId, pageAccessToken, fileResult.publicUrl, options.description);
      }

      // Video post (Reels veya normal video)
      if (options.uploadType === 'reels') {
        return this.publishReels(pageId, pageAccessToken, options.file, fileResult.publicUrl, options.description);
      } else {
        // Normal video
        return this.publishVideoPost(pageId, pageAccessToken, fileResult.publicUrl, options.description);
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ExternalServiceError || error instanceof TokenError) {
        throw error;
      }
      logger.error('FacebookService: Post yayınlama hatası', error, { userId });
      throw new ExternalServiceError('Facebook', 'Post yayınlanamadı', error);
    }
  }
}

// Singleton instance
export const facebookService = new FacebookService();
