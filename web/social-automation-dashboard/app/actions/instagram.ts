'use server';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// --- TİP TANIMLAMALARI (TypeScript Uyumluluğu İçin) ---

interface MetaError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id: string;
}

interface MetaContainerResponse {
  id?: string;
  error?: MetaError;
}

interface MetaStatusResponse {
  status_code: 'FINISHED' | 'IN_PROGRESS' | 'ERROR' | 'EXPIRED';
  id: string;
}

interface ContainerParams {
  caption: string;
  media_type?: 'IMAGE' | 'VIDEO' | 'REELS';
  image_url?: string;
  video_url?: string;
  share_to_feed?: string;
}

interface ActionResponse {
  success: boolean;
  instagramId?: string;
  error?: string;
}

// --- YARDIMCI FONKSİYONLAR ---

/**
 * 1. Dosyayı sunucuya kaydeder ve erişilebilir URL döner
 */
async function saveFileToLocal(file: File, ngrokUrl: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const publicPath = path.join(process.cwd(), 'public', 'temp-uploads');
  
  if (!fs.existsSync(publicPath)) {
    await mkdir(publicPath, { recursive: true });
  }
  
  const filePath = path.join(publicPath, safeFileName);
  await writeFile(filePath, buffer);
  
  const cleanNgrokUrl = ngrokUrl.replace(/\/$/, "");
  return `${cleanNgrokUrl}/temp-uploads/${safeFileName}`;
}

/**
 * 2. Meta Container (Taslak) Oluşturur
 */
async function createMetaContainer(
  userId: string, 
  token: string, 
  params: ContainerParams
): Promise<MetaContainerResponse> {
  // URLSearchParams sadece string değerler kabul ettiği için dönüşüm yapıyoruz
  const bodyParams: Record<string, string> = {
    access_token: token,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    )
  };

  const res = await fetch(`https://graph.facebook.com/v24.0/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(bodyParams)
  });
  
  return res.json();
}
  
/**
 * 3. Video işleme durumunu takip eder (Polling)
 */
async function waitForVideoProcessing(creationId: string, token: string): Promise<boolean> {
  let attempts = 0;
  const maxAttempts = 20;

  // Döngü şartını sadece deneme sayısına bağlayalım, içeride kontrol yapalım
  while (attempts < maxAttempts) {
    await new Promise(res => setTimeout(res, 5000)); 
    
    const res = await fetch(
      `https://graph.facebook.com/v24.0/${creationId}?fields=status_code&access_token=${token}`
    );
    const data: MetaStatusResponse = await res.json();
    
    // Status'u burada güncelliyoruz
    const currentStatus = data.status_code;
    console.log(`Video İşleme Durumu (Deneme ${attempts + 1}): ${currentStatus}`);

    if (currentStatus === 'FINISHED') {
      return true;
    }

    if (currentStatus === 'ERROR' || currentStatus === 'EXPIRED') {
      throw new Error(`Meta sistemi hatası: ${currentStatus}`);
    }
    
    // Eğer hala FINISHED değilse devam et
    attempts++;
  }

  return false;
}

// --- ANA AKSİYON (Exported) ---

export async function uploadInstagramAction(formData: FormData): Promise<ActionResponse> {
  // Çevresel değişkenleri oku
  const IG_USER_ID = process.env.NEXT_PUBLIC_IG_ACCOUNT_ID?.trim();
  const IG_TOKEN = process.env.NEXT_PUBLIC_IG_ACCESS_TOKEN?.trim();
  const NGROK_URL = process.env.NEXT_PUBLIC_NGROK_URL?.trim();

  // Eksik ayar kontrolü
  if (!IG_USER_ID || !IG_TOKEN || !NGROK_URL) {
    return { success: false, error: 'Sunucu yapılandırması eksik (.env kontrol et).' };
  }

  try {
    const file = formData.get('file') as File | null;
    const description = (formData.get('description') as string) || '';
    const uploadType = (formData.get('uploadType') as string) || 'reels';

    if (!file || file.size === 0) {
      return { success: false, error: 'Geçerli bir dosya seçilmedi.' };
    }

    // ADIM 1: Yerel sunucuya kaydet ve dış URL al
    const mediaUrl = await saveFileToLocal(file, NGROK_URL);
    const isVideo = file.type.startsWith('video');

    // ADIM 2: Meta parametrelerini hazırla
    const containerParams: ContainerParams = { caption: description };
    
    if (isVideo) {
      containerParams.media_type = uploadType.toUpperCase() === 'POST' ? 'VIDEO' : 'REELS';
      containerParams.video_url = mediaUrl;
      if (containerParams.media_type === 'REELS') {
        containerParams.share_to_feed = 'true';
      }
    } else {
      containerParams.media_type = 'IMAGE';
      containerParams.image_url = mediaUrl;
    }

    // ADIM 3: Meta Container oluştur
    const containerData = await createMetaContainer(IG_USER_ID, IG_TOKEN, containerParams);
    
    if (containerData.error || !containerData.id) {
      return { 
        success: false, 
        error: `Meta Container Hatası: ${containerData.error?.message || 'ID alınamadı'}` 
      };
    }

    // ADIM 4: Eğer video ise işlenmesini bekle
    if (isVideo) {
      const isFinished = await waitForVideoProcessing(containerData.id, IG_TOKEN);
      if (!isFinished) {
        return { success: false, error: 'Video işleme zaman aşımına uğradı (Meta tarafı).' };
      }
    }

    // ADIM 5: Medyayı Yayınla
    const publishRes = await fetch(`https://graph.facebook.com/v24.0/${IG_USER_ID}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        access_token: IG_TOKEN,
        creation_id: containerData.id,
      }),
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok) {
      return { 
        success: false, 
        error: `Yayınlama Hatası: ${publishData.error?.message || 'Bilinmeyen hata'}` 
      };
    }

    return { success: true, instagramId: publishData.id };

  } catch (error: unknown) {
    console.error("Instagram Yükleme Kritik Hata:", error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası oluştu.';
    return { success: false, error: errorMessage };
  }
}
