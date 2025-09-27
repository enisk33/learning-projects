/**
 * File Service
 * Dosya yükleme ve yönetim işlemleri
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { env } from '@/lib/config/env';
import { ValidationError, ExternalServiceError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

export interface FileUploadResult {
  fileName: string;
  filePath: string;
  publicUrl: string;
}

export class FileService {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'temp-uploads');
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ];

  /**
   * Dosyayı doğrula
   */
  private validateFile(file: File): void {
    if (!file || file.size === 0) {
      throw new ValidationError('Geçerli bir dosya seçilmedi');
    }

    if (file.size > this.maxFileSize) {
      throw new ValidationError(`Dosya boyutu çok büyük. Maksimum ${this.maxFileSize / 1024 / 1024}MB olmalıdır.`);
    }

    if (!this.allowedMimeTypes.includes(file.type)) {
      throw new ValidationError('Desteklenmeyen dosya tipi. Sadece image ve video dosyaları destekleniyor.');
    }
  }

  /**
   * Dosyayı yerel diske kaydet ve public URL döndür
   */
  async saveFile(file: File, baseUrl?: string): Promise<FileUploadResult> {
    try {
      this.validateFile(file);

      // Upload dizinini oluştur
      if (!existsSync(this.uploadDir)) {
        await mkdir(this.uploadDir, { recursive: true });
      }

      // Güvenli dosya adı oluştur
      const timestamp = Date.now();
      const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
      const filePath = path.join(this.uploadDir, safeFileName);

      // Dosyayı kaydet
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      // Public URL oluştur
      // Instagram API v24.0 için HTTPS URL gereklidir
      // Önce baseUrl parametresini kontrol et, sonra env.NGROK_URL, sonra NEXT_PUBLIC_NGROK_URL (fallback)
      const ngrokUrl = env.NGROK_URL || process.env.NEXT_PUBLIC_NGROK_URL || '';
      let cleanBaseUrl = (baseUrl || ngrokUrl || '').replace(/\/$/, '');
      
      // Instagram için HTTPS URL zorunlu
      if (!cleanBaseUrl) {
        throw new ValidationError(
          'NGROK_URL tanımlanmamış. Instagram API için HTTPS URL gereklidir. ' +
          'Lütfen .env.local dosyanıza NGROK_URL=https://your-ngrok-url.ngrok-free.dev ekleyin.'
        );
      }

      // URL'nin HTTPS olduğunu kontrol et
      if (!cleanBaseUrl.startsWith('https://')) {
        logger.warn('Base URL HTTPS değil, Instagram API için sorun olabilir', { cleanBaseUrl });
      }

      const publicUrl = `${cleanBaseUrl}/temp-uploads/${safeFileName}`;
      
      logger.debug('Public URL oluşturuldu', {
        baseUrl: cleanBaseUrl,
        publicUrl,
        isHttps: publicUrl.startsWith('https://'),
      });

      logger.info('Dosya kaydedildi', {
        fileName: safeFileName,
        size: file.size,
        type: file.type,
      });

      return {
        fileName: safeFileName,
        filePath,
        publicUrl,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('FileService: Dosya kaydetme hatası', error);
      throw new ExternalServiceError('FileService', 'Dosya kaydedilemedi', error);
    }
  }

  /**
   * Dosya tipini kontrol et
   */
  isVideo(file: File): boolean {
    return file.type.startsWith('video/');
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }
}

// Singleton instance
export const fileService = new FileService();
