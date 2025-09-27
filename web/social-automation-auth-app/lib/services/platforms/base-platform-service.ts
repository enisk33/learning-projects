/**
 * Base Platform Service Interface
 * Tüm platform servisleri bu interface'i implement eder
 */

export interface PublishOptions {
  file?: File;
  description?: string;
  uploadType?: 'post' | 'reels';
  // Platform-specific ekstra parametreler için
  [key: string]: unknown;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  videoId?: string;
  error?: string;
}

export interface PlatformService {
  /**
   * Platform'a içerik yayınla
   */
  publish(
    userId: string,
    options: PublishOptions
  ): Promise<PublishResult>;

  /**
   * Platform hesap ID'sini getir
   */
  getAccountId(userId: string): Promise<string>;
}
