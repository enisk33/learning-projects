/**
 * TikTok Manuel OAuth - Authorization Route
 * HMAC imzalı state parametresi ile CSRF koruması
 * Cross-origin cookie sorunu nedeniyle state URL'de taşınıyor
 */

import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { env, getAuthSecret } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import crypto from 'crypto';

// TikTok OAuth Configuration
const TIKTOK_CLIENT_KEY = env.TIKTOK_CLIENT_ID;
const TIKTOK_REDIRECT_URI = env.NGROK_URL 
  ? `${env.NGROK_URL}/api/auth/tiktok/callback`
  : 'http://localhost:3000/api/auth/tiktok/callback';

// HMAC ile state imzalama (CSRF koruması)
export function signState(data: string): string {
  const secret = getAuthSecret();
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export async function GET() {
  try {
    // 1. Kullanıcının oturum açmış olup olmadığını kontrol et
    const session = await auth();
    
    if (!session?.user?.id) {
      logger.warn('TikTok OAuth: Oturum açılmamış kullanıcı');
      return NextResponse.redirect(new URL('/login?error=unauthenticated', env.NGROK_URL || 'http://localhost:3000'));
    }

    // 2. TikTok credentials kontrolü
    if (!TIKTOK_CLIENT_KEY) {
      logger.error('TikTok OAuth: TIKTOK_CLIENT_ID tanımlanmamış');
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_not_configured', env.NGROK_URL || 'http://localhost:3000'));
    }

    // 3. CSRF koruması için HMAC imzalı state oluştur
    // State içinde userId, nonce ve timestamp var
    const stateData = {
      userId: session.user.id,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
    };
    const statePayload = Buffer.from(JSON.stringify(stateData)).toString('base64url');
    const signature = signState(statePayload);
    
    // State formatı: payload.signature
    const state = `${statePayload}.${signature}`;

    logger.info('TikTok OAuth: Authorization başlatıldı', {
      userId: session.user.id,
      redirectUri: TIKTOK_REDIRECT_URI,
    });

    // 4. TikTok Authorization URL'ini oluştur
    // Scope'lar: user.info.basic (kullanıcı bilgisi), video.publish (direkt yayınlama), video.upload (draft olarak yükleme)
    const authorizationUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authorizationUrl.searchParams.set('client_key', TIKTOK_CLIENT_KEY);
    authorizationUrl.searchParams.set('scope', 'user.info.basic,video.publish,video.upload');
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
    authorizationUrl.searchParams.set('state', state);

    // 5. TikTok'a yönlendir
    return NextResponse.redirect(authorizationUrl.toString());

  } catch (error) {
    logger.error('TikTok OAuth: Authorization hatası', error);
    return NextResponse.redirect(new URL('/dashboard?error=tiktok_auth_error', env.NGROK_URL || 'http://localhost:3000'));
  }
}
