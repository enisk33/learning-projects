/**
 * Instagram Service
 * Instagram API işlemleri (Graph API v24.0)
 */

import { PlatformService, PublishOptions, PublishResult } from './base-platform-service';
import { tokenRepository } from '@/lib/repositories/token-repository';
import { fileService } from '@/lib/services/file-service';
import { ExternalServiceError, TokenError, ValidationError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';
import { accountIdCache } from '@/lib/utils/cache';

export class InstagramService implements PlatformService {
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
        throw new ExternalServiceError('Instagram Graph API', 'İstek zaman aşımına uğradı', error);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Instagram Business Account ID'sini getir (cache'li)
   */
  async getAccountId(userId: string): Promise<string> {
    try {
      // Cache'den kontrol et
      const cacheKey = `instagram_account_id:${userId}`;
      const cachedAccountId = accountIdCache.get<string>(cacheKey);
      
      if (cachedAccountId) {
        logger.debug('Instagram Account ID cache hit', { userId });
        return cachedAccountId;
      }

      logger.debug('Instagram Account ID cache miss, API\'den çekiliyor', { userId });

      // Instagram token'ı al
      const instagramToken = await tokenRepository.getValidToken(userId, 'instagram');
      
      // Eğer token'da zaten Instagram Business Account ID varsa, onu kullan ve cache'e kaydet
      if (instagramToken.instagramBusinessAccountId) {
        accountIdCache.set(cacheKey, instagramToken.instagramBusinessAccountId);
        return instagramToken.instagramBusinessAccountId;
      }

      // Facebook Page'den Instagram Business Account ID'yi getir
      const facebookToken = await tokenRepository.getValidToken(userId, 'facebook');
      
      // Facebook sayfalarını getir
      const pagesResponse = await this.fetchWithTimeout(
        `https://graph.facebook.com/${this.graphApiVersion}/me/accounts?access_token=${facebookToken.accessToken}`
      );

      const pagesData = await pagesResponse.json();

      if (!pagesResponse.ok || !pagesData.data || pagesData.data.length === 0) {
        throw new ExternalServiceError(
          'Instagram',
          'Facebook sayfaları alınamadı. Instagram Business hesabınızın bir Facebook sayfasına bağlı olduğundan emin olun.'
        );
      }

      // İlk sayfadan Instagram Business Account ID'yi al
      const pageId = pagesData.data[0].id;
      const pageAccessToken = pagesData.data[0].access_token;

      const accountResponse = await this.fetchWithTimeout(
        `https://graph.facebook.com/${this.graphApiVersion}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
      );

      const accountData = await accountResponse.json();

      if (!accountResponse.ok || !accountData.instagram_business_account?.id) {
        throw new ExternalServiceError(
          'Instagram',
          accountData.error?.message || 'Instagram Business Account bulunamadı'
        );
      }

      const accountId = accountData.instagram_business_account.id;
      
      // Cache'e kaydet
      accountIdCache.set(cacheKey, accountId);
      
      return accountId;
    } catch (error) {
      if (error instanceof TokenError || error instanceof ExternalServiceError) {
        throw error;
      }
      logger.error('InstagramService: Account ID getirme hatası', error, { userId });
      throw new ExternalServiceError('Instagram', 'Instagram hesabı bulunamadı', error);
    }
  }

  /**
   * Instagram için ortak dosya validasyonu ve URL hazırlama
   */
  private async prepareInstagramMedia(
    file: File,
    isVideo: boolean
  ): Promise<{ mediaUrl: string; fileSizeMB: number }> {
    const fileSizeMB = file.size / (1024 * 1024);
    
    // Instagram API limitleri
    const INSTAGRAM_IMAGE_SIZE_LIMIT = 8; // MB
    const INSTAGRAM_VIDEO_SIZE_LIMIT = 100; // MB
    
    // Dosya boyutu kontrolü
    if (isVideo && fileSizeMB > INSTAGRAM_VIDEO_SIZE_LIMIT) {
      throw new ValidationError(
        `Video dosyası çok büyük (${fileSizeMB.toFixed(2)}MB). ` +
        `Instagram için maksimum ${INSTAGRAM_VIDEO_SIZE_LIMIT}MB olmalıdır. ` +
        `Lütfen videoyu sıkıştırın veya daha küçük bir dosya kullanın.`
      );
    }
    
    if (!isVideo && fileSizeMB > INSTAGRAM_IMAGE_SIZE_LIMIT) {
      throw new ValidationError(
        `Resim dosyası çok büyük (${fileSizeMB.toFixed(2)}MB). ` +
        `Instagram için maksimum ${INSTAGRAM_IMAGE_SIZE_LIMIT}MB olmalıdır.`
      );
    }

    // Dosyayı kaydet - Ngrok URL'i kullanılacak
    const fileResult = await fileService.saveFile(file);
    const mediaUrl = fileResult.publicUrl;
    
    // URL'nin HTTPS olduğunu kontrol et
    if (!mediaUrl.startsWith('https://')) {
      throw new ExternalServiceError(
        'Instagram',
        'Medya URL\'si HTTPS olmalıdır. Ngrok URL\'inizi kontrol edin.'
      );
    }

    // URL erişilebilirliğini test et (sadece development için)
    if (process.env.NODE_ENV === 'development') {
      try {
        const urlTestResponse = await fetch(mediaUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        if (!urlTestResponse.ok) {
          logger.warn('URL erişilebilirlik testi başarısız', {
            url: mediaUrl,
            status: urlTestResponse.status,
            statusText: urlTestResponse.statusText,
          });
        } else {
          logger.debug('URL erişilebilirlik testi başarılı', { url: mediaUrl });
        }
      } catch (urlError) {
        logger.warn('URL erişilebilirlik testi hatası', {
          url: mediaUrl,
          error: urlError instanceof Error ? urlError.message : 'Bilinmeyen hata',
        });
      }
    }

    return { mediaUrl, fileSizeMB };
  }

  /**
   * Instagram container oluştur ve publish et (ortak logic)
   */
  private async createAndPublishInstagramContainer(
    instagramAccountId: string,
    pageAccessToken: string,
    containerParams: Record<string, string>,
    isVideo: boolean,
    fileSizeMB: number,
    fileName: string,
    fileType: string
  ): Promise<PublishResult> {
    logger.info('Instagram container oluşturuluyor (v24.0)', {
      instagramAccountId,
      media_type: containerParams.media_type,
      has_caption: !!containerParams.caption,
      url: containerParams.image_url || containerParams.video_url,
      fileSizeMB: fileSizeMB.toFixed(2),
      fileName,
      fileType,
      share_to_feed: containerParams.share_to_feed,
      allParams: containerParams,
    });

    const containerResponse = await this.fetchWithTimeout(
      `https://graph.facebook.com/${this.graphApiVersion}/${instagramAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(containerParams),
      }
    );

    const containerData = await containerResponse.json();

    if (!containerResponse.ok || !containerData.id) {
      const errorMessage = containerData.error?.message || 'Container oluşturulamadı';
      const errorCode = containerData.error?.code;
      const errorType = containerData.error?.type;
      const errorSubcode = containerData.error?.error_subcode;
      
      logger.error('Instagram container oluşturma hatası', {
        error: containerData.error,
        errorCode,
        errorType,
        errorSubcode,
        instagramAccountId,
        isVideo,
        params: containerParams,
      });
      
      let userFriendlyMessage = errorMessage;
      
      if (errorCode === 100) {
        userFriendlyMessage = 'Geçersiz parametre. ';
        if (isVideo) {
          userFriendlyMessage += 'Video formatını kontrol edin (MP4, H.264 codec). ';
          userFriendlyMessage += 'URL\'nin erişilebilir olduğundan emin olun.';
        } else {
          userFriendlyMessage += 'Resim formatını kontrol edin (JPEG, PNG). ';
          userFriendlyMessage += 'URL\'nin erişilebilir olduğundan emin olun.';
        }
      } else if (errorCode === 200) {
        userFriendlyMessage = 'İzin hatası. Instagram Business hesabınızın doğru bağlandığından emin olun.';
      } else if (errorSubcode === 2207007) {
        userFriendlyMessage = 'Medya dosyasına erişilemiyor. URL\'nin geçerli ve erişilebilir olduğundan emin olun.';
      }
      
      throw new ExternalServiceError('Instagram', userFriendlyMessage);
    }

    // Video ise işlenmesini bekle
    if (isVideo) {
      const isFinished = await this.waitForVideoProcessing(containerData.id, pageAccessToken);
      if (!isFinished) {
        throw new ExternalServiceError('Instagram', 'Video işleme zaman aşımına uğradı');
      }
    }

    // Publish
    const publishResponse = await this.fetchWithTimeout(
      `https://graph.facebook.com/${this.graphApiVersion}/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          access_token: pageAccessToken,
          creation_id: containerData.id,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      throw new ExternalServiceError('Instagram', publishData.error?.message || 'Yayınlanamadı');
    }

    return { success: true, postId: publishData.id };
  }

  /**
   * Instagram'a image post yayınla
   */
  private async publishInstagramImagePost(
    userId: string,
    instagramAccountId: string,
    pageAccessToken: string,
    options: {
      file: File;
      caption?: string;
    }
  ): Promise<PublishResult> {
    try {
      const { mediaUrl, fileSizeMB } = await this.prepareInstagramMedia(options.file, false);

      const containerParams: Record<string, string> = {
        access_token: pageAccessToken,
        media_type: 'IMAGE',
        image_url: mediaUrl,
      };

      if (options.caption && options.caption.trim()) {
        containerParams.caption = options.caption.trim();
      }

      return await this.createAndPublishInstagramContainer(
        instagramAccountId,
        pageAccessToken,
        containerParams,
        false,
        fileSizeMB,
        options.file.name,
        options.file.type
      );
    } catch (error) {
      if (error instanceof ExternalServiceError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('InstagramService: Image post yayınlama hatası', error, { userId, instagramAccountId });
      throw new ExternalServiceError('Instagram', 'Image post yayınlanamadı', error);
    }
  }

  /**
   * Instagram'a video post yayınla (feed'de görünür)
   * Instagram API v24.0'da VIDEO media_type kaldırıldı, REELS kullanılıyor
   * share_to_feed: true ile feed'de de görünür
   */
  private async publishInstagramVideoPost(
    userId: string,
    instagramAccountId: string,
    pageAccessToken: string,
    options: {
      file: File;
      caption?: string;
    }
  ): Promise<PublishResult> {
    try {
      const { mediaUrl, fileSizeMB } = await this.prepareInstagramMedia(options.file, true);

      const containerParams: Record<string, string> = {
        access_token: pageAccessToken,
        media_type: 'REELS',
        video_url: mediaUrl,
        share_to_feed: 'true', // Feed'de görünür (normal post gibi)
      };
      
      logger.debug('Instagram Video Post parametreleri', {
        share_to_feed: containerParams.share_to_feed,
        media_type: containerParams.media_type,
      });

      if (options.caption && options.caption.trim()) {
        containerParams.caption = options.caption.trim();
      }

      return await this.createAndPublishInstagramContainer(
        instagramAccountId,
        pageAccessToken,
        containerParams,
        true,
        fileSizeMB,
        options.file.name,
        options.file.type
      );
    } catch (error) {
      if (error instanceof ExternalServiceError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('InstagramService: Video post yayınlama hatası', error, { userId, instagramAccountId });
      throw new ExternalServiceError('Instagram', 'Video post yayınlanamadı', error);
    }
  }

  /**
   * Instagram'a Reels yayınla (sadece Reels'te görünür)
   * Instagram API v24.0'da sadece REELS media_type var
   * share_to_feed: false ile sadece Reels'te görünür
   */
  private async publishInstagramReels(
    userId: string,
    instagramAccountId: string,
    pageAccessToken: string,
    options: {
      file: File;
      caption?: string;
    }
  ): Promise<PublishResult> {
    try {
      const { mediaUrl, fileSizeMB } = await this.prepareInstagramMedia(options.file, true);

      const containerParams: Record<string, string> = {
        access_token: pageAccessToken,
        media_type: 'REELS',
        video_url: mediaUrl,
        share_to_feed: 'false', // Sadece Reels'te görünür
      };
      
      logger.debug('Instagram Reels parametreleri', {
        share_to_feed: containerParams.share_to_feed,
        media_type: containerParams.media_type,
      });

      if (options.caption && options.caption.trim()) {
        containerParams.caption = options.caption.trim();
      }

      return await this.createAndPublishInstagramContainer(
        instagramAccountId,
        pageAccessToken,
        containerParams,
        true,
        fileSizeMB,
        options.file.name,
        options.file.type
      );
    } catch (error) {
      if (error instanceof ExternalServiceError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('InstagramService: Reels yayınlama hatası', error, { userId, instagramAccountId });
      throw new ExternalServiceError('Instagram', 'Reels yayınlanamadı', error);
    }
  }

  /**
   * Video işleme durumunu takip et
   */
  private async waitForVideoProcessing(creationId: string, accessToken: string): Promise<boolean> {
    const maxAttempts = 20;
    const delayMs = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, delayMs));

      const response = await this.fetchWithTimeout(
        `https://graph.facebook.com/${this.graphApiVersion}/${creationId}?fields=status_code&access_token=${accessToken}`
      );

      const data = await response.json();
      const status = data.status_code;

      logger.debug('Video işleme durumu', { creationId, status, attempt: attempt + 1 });

      if (status === 'FINISHED') {
        return true;
      }

      if (status === 'ERROR' || status === 'EXPIRED') {
        throw new ExternalServiceError('Instagram', `Video işleme hatası: ${status}`);
      }
    }

    return false;
  }

  /**
   * PlatformService interface implementasyonu
   * Instagram'a post yayınla
   */
  async publish(userId: string, options: PublishOptions): Promise<PublishResult> {
    try {
      if (!options.file) {
        throw new ValidationError('Instagram için dosya gereklidir');
      }

      // Instagram Business Account ID ve Page Access Token al
      const instagramAccountId = await this.getAccountId(userId);
      
      // Facebook token'dan page access token al
      const facebookToken = await tokenRepository.getValidToken(userId, 'facebook');
      const pagesResponse = await this.fetchWithTimeout(
        `https://graph.facebook.com/${this.graphApiVersion}/me/accounts?access_token=${facebookToken.accessToken}`
      );
      const pagesData = await pagesResponse.json();
      
      if (!pagesResponse.ok || !pagesData.data || pagesData.data.length === 0) {
        throw new ExternalServiceError('Instagram', 'Facebook sayfaları alınamadı');
      }
      
      const pageAccessToken = pagesData.data[0].access_token;

      const isVideo = fileService.isVideo(options.file);
      
      logger.info('Instagram publish çağrıldı', {
        uploadType: options.uploadType,
        isVideo,
        fileName: options.file.name,
      });

      // Image post
      if (!isVideo) {
        logger.debug('Image post seçildi');
        return this.publishInstagramImagePost(userId, instagramAccountId, pageAccessToken, {
          file: options.file,
          caption: options.description,
        });
      }

      // Video post veya Reels
      const uploadType = options.uploadType?.toLowerCase().trim();
      
      logger.info('Video için uploadType kontrolü', {
        originalUploadType: options.uploadType,
        normalizedUploadType: uploadType,
        isReels: uploadType === 'reels',
      });
      
      // Sadece açıkça 'reels' seçilmişse Reels fonksiyonunu çağır
      if (uploadType === 'reels') {
        logger.info('✅ Reels seçildi - publishInstagramReels çağrılıyor (share_to_feed: false)');
        return this.publishInstagramReels(userId, instagramAccountId, pageAccessToken, {
          file: options.file,
          caption: options.description,
        });
      } else {
        // uploadType === 'post' veya undefined veya başka bir değer → Video Post
        logger.info('✅ Video Post seçildi - publishInstagramVideoPost çağrılıyor (share_to_feed: true)');
        return this.publishInstagramVideoPost(userId, instagramAccountId, pageAccessToken, {
          file: options.file,
          caption: options.description,
        });
      }
    } catch (error) {
      if (error instanceof ExternalServiceError || error instanceof ValidationError || error instanceof TokenError) {
        throw error;
      }
      logger.error('InstagramService: Publish hatası', error, { userId });
      throw new ExternalServiceError('Instagram', 'Post yayınlanamadı', error);
    }
  }
}

// Singleton instance
export const instagramService = new InstagramService();
