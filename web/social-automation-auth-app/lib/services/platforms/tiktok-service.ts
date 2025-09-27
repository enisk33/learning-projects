/**
 * TikTok Service
 * TikTok Content Posting API (Video Upload & Publish)
 * 
 * TikTok API v2 kullanılıyor:
 * - Direct Post: Video URL'den çekilip yayınlanır
 * - File Upload: Video dosyası chunk'lar halinde yüklenir
 * 
 * Gerekli scope: video.upload, video.publish
 */

import { PlatformService, PublishOptions, PublishResult } from './base-platform-service';
import { tokenRepository } from '@/lib/repositories/token-repository';
import { fileService } from '@/lib/services/file-service';
import { ExternalServiceError, TokenError, ValidationError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

// TikTok API response types
interface TikTokApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    log_id?: string;
  };
}

interface VideoInitResponse {
  publish_id: string;
  upload_url?: string;
}

interface PublishStatusResponse {
  status: 'PROCESSING_DOWNLOAD' | 'PROCESSING_UPLOAD' | 'SEND_TO_USER_INBOX' | 'PUBLISH_COMPLETE' | 'FAILED';
  fail_reason?: string;
  publicaly_available_post_id?: string[];
}

export class TikTokService implements PlatformService {
  private readonly apiBaseUrl = 'https://open.tiktokapis.com/v2';
  private readonly requestTimeout = 60000; // 60 saniye (video upload için daha uzun)
  
  // TikTok video gereksinimleri
  private readonly maxVideoSize = 4 * 1024 * 1024 * 1024; // 4GB
  private readonly maxVideoDuration = 10 * 60; // 10 dakika (saniye)
  private readonly supportedFormats = ['video/mp4', 'video/webm', 'video/quicktime'];
  private readonly minChunkSize = 5 * 1024 * 1024; // 5MB minimum chunk
  private readonly maxChunkSize = 64 * 1024 * 1024; // 64MB maximum chunk

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
        throw new ExternalServiceError('TikTok API', 'İstek zaman aşımına uğradı', error);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Video dosyasını validate et
   */
  private validateVideo(file: File): void {
    // Format kontrolü
    if (!this.supportedFormats.includes(file.type)) {
      throw new ValidationError(
        `Desteklenmeyen video formatı: ${file.type}. ` +
        `Desteklenen formatlar: ${this.supportedFormats.join(', ')}`
      );
    }

    // Boyut kontrolü
    if (file.size > this.maxVideoSize) {
      throw new ValidationError(
        `Video boyutu çok büyük: ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB. ` +
        `Maksimum: ${this.maxVideoSize / (1024 * 1024 * 1024)}GB`
      );
    }

    // Minimum boyut kontrolü
    if (file.size < 1024) {
      throw new ValidationError('Video dosyası çok küçük');
    }
  }

  /**
   * PlatformService interface implementasyonu
   * TikTok hesap ID'sini getir (open_id)
   */
  async getAccountId(userId: string): Promise<string> {
    try {
      const token = await tokenRepository.getValidToken(userId, 'tiktok');
      
      // TikTok user info endpoint
      const response = await this.fetchWithTimeout(
        `${this.apiBaseUrl}/user/info/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: ['open_id', 'display_name', 'avatar_url'],
          }),
        }
      );

      const data: TikTokApiResponse<{ user: { open_id: string } }> = await response.json();

      // TikTok API başarılı yanıtlarda bile error objesi dönebilir (code: "ok")
      if (!response.ok || (data.error && data.error.code !== 'ok')) {
        logger.error('TikTok user info hatası', {
          error: data.error,
          status: response.status,
        });
        throw new ExternalServiceError(
          'TikTok',
          data.error?.message || 'Kullanıcı bilgisi alınamadı'
        );
      }

      return data.data?.user?.open_id || '';
    } catch (error) {
      if (error instanceof TokenError || error instanceof ExternalServiceError) {
        throw error;
      }
      logger.error('TikTokService: Hesap ID getirme hatası', error, { userId });
      throw new ExternalServiceError('TikTok', 'Hesap bilgisi alınamadı', error);
    }
  }

  /**
   * Direct Post - Video URL'den yükle ve yayınla
   * Küçük videolar için önerilir (< 50MB)
   */
  private async publishDirectPost(
    accessToken: string,
    videoUrl: string,
    description?: string
  ): Promise<PublishResult> {
    logger.info('TikTok Direct Post başlatılıyor', {
      hasDescription: !!description,
    });

    // Video init request
    const initResponse = await this.fetchWithTimeout(
      `${this.apiBaseUrl}/post/publish/video/init/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          post_info: {
            title: description?.substring(0, 150) || 'Video', // TikTok max title 150 char
            privacy_level: 'MUTUAL_FOLLOW_FRIENDS', // Sandbox mode için gerekli
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000, // 1 saniyedeki frame'i kapak olarak kullan
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: videoUrl,
          },
        }),
      }
    );

    const initData: TikTokApiResponse<VideoInitResponse> = await initResponse.json();

    logger.info('TikTok video init response', {
      status: initResponse.status,
      ok: initResponse.ok,
      hasPublishId: !!initData.data?.publish_id,
      error: initData.error,
    });

    // TikTok API başarılı yanıtlarda bile error objesi dönebilir (code: "ok")
    if (!initResponse.ok || (initData.error && initData.error.code !== 'ok')) {
      throw new ExternalServiceError(
        'TikTok',
        initData.error?.message || 'Video yükleme başlatılamadı'
      );
    }

    const publishId = initData.data?.publish_id;
    if (!publishId) {
      throw new ExternalServiceError('TikTok', 'Publish ID alınamadı');
    }

    // Publish status kontrol et
    const finalStatus = await this.waitForPublishComplete(accessToken, publishId);
    
    return {
      success: true,
      postId: finalStatus.publicaly_available_post_id?.[0] || publishId,
    };
  }

  /**
   * File Upload - Video dosyasını chunk'lar halinde yükle
   * Büyük videolar için (> 50MB)
   */
  private async publishFileUpload(
    accessToken: string,
    file: File,
    description?: string
  ): Promise<PublishResult> {
    logger.info('TikTok File Upload başlatılıyor', {
      fileSize: file.size,
      fileName: file.name,
      hasDescription: !!description,
    });

    // Chunk sayısını hesapla
    // NOT: Chunk size video boyutundan büyük olamaz!
    // Küçük videolar için (< 5MB) chunk_size = video_size olmalı
    const chunkSize = file.size < this.minChunkSize
      ? file.size // Küçük videolar için tek chunk kullan
      : Math.min(this.maxChunkSize, Math.max(this.minChunkSize, Math.ceil(file.size / 10)));
    const totalChunkCount = Math.ceil(file.size / chunkSize);
    
    logger.debug('TikTok chunk hesaplama', {
      fileSize: file.size,
      chunkSize,
      totalChunkCount,
      minChunkSize: this.minChunkSize,
    });

    // Video init request (FILE_UPLOAD source) - post_info ile description dahil
    const initResponse = await this.fetchWithTimeout(
      `${this.apiBaseUrl}/post/publish/inbox/video/init/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          post_info: {
            title: description?.substring(0, 150) || 'Video',
            privacy_level: 'MUTUAL_FOLLOW_FRIENDS',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: file.size,
            chunk_size: chunkSize,
            total_chunk_count: totalChunkCount,
          },
        }),
      }
    );

    const initData: TikTokApiResponse<VideoInitResponse> = await initResponse.json();

    logger.info('TikTok file upload init response', {
      status: initResponse.status,
      hasPublishId: !!initData.data?.publish_id,
      hasUploadUrl: !!initData.data?.upload_url,
      error: initData.error,
    });

    // TikTok API başarılı yanıtlarda bile error objesi dönebilir (code: "ok")
    if (!initResponse.ok || (initData.error && initData.error.code !== 'ok')) {
      throw new ExternalServiceError(
        'TikTok',
        initData.error?.message || 'Video upload başlatılamadı'
      );
    }

    const { publish_id, upload_url } = initData.data || {};
    
    if (!publish_id || !upload_url) {
      throw new ExternalServiceError('TikTok', 'Upload bilgileri alınamadı');
    }

    // Video'yu chunk'lar halinde yükle
    await this.uploadVideoChunks(upload_url, file, chunkSize, totalChunkCount);

    logger.info('TikTok video başarıyla yüklendi (Creator Inbox)', {
      publishId: publish_id,
      description: description?.substring(0, 50),
    });

    // Sandbox modunda video Creator's Inbox'a gider, kullanıcı oradan publish eder
    // Production'da da bu akış geçerli - video inbox'a düşer
    return {
      success: true,
      postId: publish_id,
      message: 'Video TikTok Creator Inbox\'a başarıyla gönderildi. TikTok uygulamasından yayınlayabilirsiniz.',
    };
  }

  /**
   * Video'yu chunk'lar halinde upload et
   */
  private async uploadVideoChunks(
    uploadUrl: string,
    file: File,
    chunkSize: number,
    totalChunkCount: number
  ): Promise<void> {
    const videoBuffer = await file.arrayBuffer();
    
    for (let chunkIndex = 0; chunkIndex < totalChunkCount; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = videoBuffer.slice(start, end);
      
      const contentRange = `bytes ${start}-${end - 1}/${file.size}`;
      
      logger.debug('TikTok chunk upload', {
        chunkIndex,
        totalChunks: totalChunkCount,
        start,
        end,
        contentRange,
      });

      const uploadResponse = await this.fetchWithTimeout(
        uploadUrl,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Range': contentRange,
            'Content-Length': chunk.byteLength.toString(),
          },
          body: chunk,
        },
        120000 // Chunk upload için 2 dakika timeout
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        logger.error('TikTok chunk upload hatası', {
          chunkIndex,
          status: uploadResponse.status,
          error: errorText,
        });
        throw new ExternalServiceError('TikTok', `Chunk ${chunkIndex + 1} yüklenemedi`);
      }
    }

    logger.info('TikTok video upload tamamlandı', { totalChunks: totalChunkCount });
  }

  /**
   * Yüklenen video'yu publish et
   */
  private async publishUploadedVideo(
    accessToken: string,
    publishId: string,
    description?: string
  ): Promise<PublishResult> {
    const publishResponse = await this.fetchWithTimeout(
      `${this.apiBaseUrl}/post/publish/video/init/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          post_info: {
            title: description?.substring(0, 150) || 'Video',
            privacy_level: 'MUTUAL_FOLLOW_FRIENDS',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_upload_id: publishId,
          },
        }),
      }
    );

    const publishData: TikTokApiResponse<VideoInitResponse> = await publishResponse.json();

    // TikTok API başarılı yanıtlarda bile error objesi dönebilir (code: "ok")
    if (!publishResponse.ok || (publishData.error && publishData.error.code !== 'ok')) {
      throw new ExternalServiceError(
        'TikTok',
        publishData.error?.message || 'Video yayınlanamadı'
      );
    }

    const finalPublishId = publishData.data?.publish_id;
    if (!finalPublishId) {
      throw new ExternalServiceError('TikTok', 'Final publish ID alınamadı');
    }

    // Publish status kontrol et
    const finalStatus = await this.waitForPublishComplete(accessToken, finalPublishId);

    return {
      success: true,
      postId: finalStatus.publicaly_available_post_id?.[0] || finalPublishId,
    };
  }

  /**
   * Publish işleminin tamamlanmasını bekle
   */
  private async waitForPublishComplete(
    accessToken: string,
    publishId: string,
    maxAttempts: number = 30,
    delayMs: number = 5000
  ): Promise<PublishStatusResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const statusResponse = await this.fetchWithTimeout(
        `${this.apiBaseUrl}/post/publish/status/fetch/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify({
            publish_id: publishId,
          }),
        }
      );

      const statusData: TikTokApiResponse<PublishStatusResponse> = await statusResponse.json();

      logger.debug('TikTok publish status', {
        attempt: attempt + 1,
        status: statusData.data?.status,
      });

      // TikTok API başarılı yanıtlarda bile error objesi dönebilir (code: "ok")
      if (statusData.error && statusData.error.code !== 'ok') {
        logger.warn('TikTok publish status error', { error: statusData.error });
        // API hatası varsa yine de devam et
      }

      const status = statusData.data?.status;

      switch (status) {
        case 'PUBLISH_COMPLETE':
          logger.info('TikTok video başarıyla yayınlandı', {
            publishId,
            postId: statusData.data?.publicaly_available_post_id,
          });
          return statusData.data!;

        case 'FAILED':
          throw new ExternalServiceError(
            'TikTok',
            statusData.data?.fail_reason || 'Video yayınlama başarısız'
          );

        case 'PROCESSING_DOWNLOAD':
        case 'PROCESSING_UPLOAD':
        case 'SEND_TO_USER_INBOX':
          // Hala işleniyor, bekle
          logger.debug('TikTok video işleniyor', { status, attempt });
          await new Promise(resolve => setTimeout(resolve, delayMs));
          break;

        default:
          logger.warn('TikTok bilinmeyen status', { status });
          await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // Max attempts'e ulaşıldı ama hata yok - muhtemelen hala işleniyor
    logger.warn('TikTok publish timeout - video hala işleniyor olabilir', { publishId });
    return {
      status: 'PROCESSING_UPLOAD',
    };
  }

  /**
   * PlatformService interface implementasyonu
   * TikTok'a video yayınla
   * 
   * NOT: Direct Post (PULL_FROM_URL) yöntemi domain doğrulama gerektirdiği için
   * ngrok gibi geçici URL'ler ile çalışmıyor.
   * Bu nedenle her zaman FILE_UPLOAD yöntemini kullanıyoruz.
   */
  async publish(userId: string, options: PublishOptions): Promise<PublishResult> {
    try {
      // Video dosyası kontrolü
      if (!options.file) {
        throw new ValidationError('TikTok için video dosyası gereklidir');
      }

      // Video mu kontrol et
      if (!fileService.isVideo(options.file)) {
        throw new ValidationError('TikTok sadece video destekler. Lütfen bir video dosyası yükleyin.');
      }

      // Video validate et
      this.validateVideo(options.file);

      // Token al
      const token = await tokenRepository.getValidToken(userId, 'tiktok');
      
      logger.info('TikTok publish başlatılıyor (File Upload)', {
        userId,
        fileSize: options.file.size,
        fileName: options.file.name,
        hasDescription: !!options.description,
      });

      // Her zaman File Upload kullan (Direct Post domain doğrulama gerektiriyor)
      // File Upload, video'yu TikTok'un sunucularına chunk'lar halinde yükler
      // ve domain doğrulama gerektirmez
      return this.publishFileUpload(
        token.accessToken,
        options.file,
        options.description
      );
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof ExternalServiceError ||
        error instanceof TokenError
      ) {
        throw error;
      }
      logger.error('TikTokService: Video yayınlama hatası', error, { userId });
      throw new ExternalServiceError('TikTok', 'Video yayınlanamadı', error);
    }
  }
}

// Singleton instance
export const tiktokService = new TikTokService();
