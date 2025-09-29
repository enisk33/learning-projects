/**
 * Post Validation Utilities
 * Frontend validasyon fonksiyonları
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Video süresini kontrol et (Reels için)
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Video yüklenemedi'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Video boyutlarını kontrol et
 */
export async function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Video yüklenemedi'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Reels standartlarını kontrol et
 */
export async function validateReelsVideo(file: File): Promise<ValidationResult> {
  try {
    // 1. Video süresi kontrolü (3-90 saniye)
    const duration = await getVideoDuration(file);
    if (duration < 3) {
      return {
        isValid: false,
        error: 'Reels videoları en az 3 saniye olmalıdır',
      };
    }
    if (duration > 90) {
      return {
        isValid: false,
        error: 'Reels videoları en fazla 90 saniye olabilir',
      };
    }

    // 2. Video boyutları kontrolü
    const dimensions = await getVideoDimensions(file);
    if (dimensions.width < 500 || dimensions.height < 500) {
      return {
        isValid: false,
        error: 'Reels videoları en az 500x500 piksel olmalıdır',
      };
    }

    // 3. Aspect ratio kontrolü (9:16 veya 1:1 kabul edilir)
    const aspectRatio = dimensions.width / dimensions.height;
    const isVertical = aspectRatio >= 0.5 && aspectRatio <= 0.6; // 9:16 ≈ 0.5625
    const isSquare = aspectRatio >= 0.9 && aspectRatio <= 1.1; // 1:1 ≈ 1.0
    
    if (!isVertical && !isSquare) {
      return {
        isValid: false,
        error: 'Reels videoları dikey (9:16) veya kare (1:1) formatında olmalıdır',
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Video analiz edilemedi. Lütfen geçerli bir video dosyası seçin',
    };
  }
}

/**
 * Dosya tipi ve upload type uyumluluğunu kontrol et
 */
export function validateFileAndUploadType(
  file: File | null,
  uploadType: string
): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'Lütfen bir dosya seçin',
    };
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  // Reels seçildiyse sadece video kabul edilir
  if (uploadType === 'reels' && isImage) {
    return {
      isValid: false,
      error: 'Reels kısmına fotoğraf gönderemezsiniz. Lütfen video dosyası seçin',
    };
  }

  // Post seçildiyse hem image hem video kabul edilir (zaten doğru)
  return { isValid: true };
}

/**
 * Dosya boyutu kontrolü
 */
export function validateFileSize(file: File): ValidationResult {
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Dosya boyutu çok büyük. Maksimum ${maxSize / 1024 / 1024}MB olmalıdır`,
    };
  }
  return { isValid: true };
}
