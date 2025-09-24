/**
 * TikTok Manuel OAuth - Callback Route
 * HMAC imzalı state doğrulama ve token exchange
 * Cross-origin cookie sorunu nedeniyle state URL'den okunuyor
 */

import { NextRequest, NextResponse } from 'next/server';
import { env, getAuthSecret } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { tokenRepository } from '@/lib/repositories/token-repository';
import crypto from 'crypto';

// TikTok OAuth Configuration
const TIKTOK_CLIENT_KEY = env.TIKTOK_CLIENT_ID;
const TIKTOK_CLIENT_SECRET = env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = env.NGROK_URL 
  ? `${env.NGROK_URL}/api/auth/tiktok/callback`
  : 'http://localhost:3000/api/auth/tiktok/callback';

// Redirect için her zaman localhost kullan (cookie'ler localhost'ta)
// ngrok sadece TikTok callback almak için kullanılıyor
const BASE_URL = 'http://localhost:3000';

interface StateData {
  userId: string;
  nonce: string;
  timestamp: number;
}

interface TikTokTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  open_id?: string;
  scope?: string;
  token_type?: string;
  // Nested format (TikTok API v2)
  data?: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    open_id?: string;
    scope?: string;
    token_type?: string;
  };
  error?: string;
  error_description?: string;
}

// HMAC ile state doğrulama
function verifyState(payload: string, signature: string): boolean {
  const secret = getAuthSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // 1. Hata kontrolü
    if (error) {
      logger.error('TikTok OAuth: TikTok hatası döndürdü', { error, errorDescription });
      return NextResponse.redirect(new URL(`/dashboard?error=tiktok_${error}`, BASE_URL));
    }

    // 2. Code ve state kontrolü
    if (!code || !state) {
      logger.error('TikTok OAuth: Code veya state eksik', { hasCode: !!code, hasState: !!state });
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_missing_params', BASE_URL));
    }

    // 3. State formatını kontrol et (payload.signature)
    const stateParts = state.split('.');
    if (stateParts.length !== 2) {
      logger.error('TikTok OAuth: State format hatası', { state: state.substring(0, 50) });
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_invalid_state_format', BASE_URL));
    }

    const [statePayload, stateSignature] = stateParts;

    // 4. HMAC imzasını doğrula (CSRF koruması)
    try {
      const isValid = verifyState(statePayload, stateSignature);
      if (!isValid) {
        logger.error('TikTok OAuth: State imza doğrulaması başarısız (CSRF attack olabilir)');
        return NextResponse.redirect(new URL('/dashboard?error=tiktok_invalid_signature', BASE_URL));
      }
    } catch (signatureError) {
      logger.error('TikTok OAuth: State imza doğrulama hatası', signatureError);
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_signature_error', BASE_URL));
    }

    // 5. State'den userId'yi çıkar
    let stateData: StateData;
    try {
      stateData = JSON.parse(Buffer.from(statePayload, 'base64url').toString());
    } catch {
      logger.error('TikTok OAuth: State parse hatası');
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_invalid_state', BASE_URL));
    }

    // 6. State zaman kontrolü (10 dakika)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      logger.error('TikTok OAuth: State süresi dolmuş', {
        stateTimestamp: stateData.timestamp,
        now: Date.now(),
        diff: Date.now() - stateData.timestamp,
      });
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_state_expired', BASE_URL));
    }

    const userId = stateData.userId;

    if (!userId) {
      logger.error('TikTok OAuth: State içinde userId yok');
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_no_user', BASE_URL));
    }

    logger.info('TikTok OAuth: State doğrulandı', { userId });

    // 7. TikTok credentials kontrolü
    if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
      logger.error('TikTok OAuth: Client credentials eksik');
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_not_configured', BASE_URL));
    }

    logger.info('TikTok OAuth: Token exchange başlıyor', {
      userId,
      redirectUri: TIKTOK_REDIRECT_URI,
      codePreview: code.substring(0, 30) + '...',
    });

    // 8. Token Exchange
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
      }),
    });

    const tokenResponseText = await tokenResponse.text();
    
    logger.info('TikTok OAuth: Token response alındı', {
      status: tokenResponse.status,
      ok: tokenResponse.ok,
      bodyPreview: tokenResponseText.substring(0, 200),
    });

    let tokenData: TikTokTokenResponse;
    try {
      tokenData = JSON.parse(tokenResponseText);
    } catch {
      logger.error('TikTok OAuth: Token response parse hatası', { response: tokenResponseText });
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_parse_error', BASE_URL));
    }

    // 9. Token hatası kontrolü
    if (tokenData.error) {
      logger.error('TikTok OAuth: Token exchange hatası', {
        error: tokenData.error,
        description: tokenData.error_description,
      });
      return NextResponse.redirect(new URL(`/dashboard?error=tiktok_token_${tokenData.error}`, BASE_URL));
    }

    // 10. Access token'ı çıkar (TikTok nested veya flat format döndürebilir)
    const accessToken = tokenData.data?.access_token || tokenData.access_token;
    const refreshToken = tokenData.data?.refresh_token || tokenData.refresh_token || null;
    const expiresIn = tokenData.data?.expires_in || tokenData.expires_in || 86400; // Default 24 saat

    if (!accessToken) {
      logger.error('TikTok OAuth: Access token alınamadı', { tokenData });
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_no_token', BASE_URL));
    }

    logger.info('TikTok OAuth: Token başarıyla alındı', {
      userId,
      hasRefreshToken: !!refreshToken,
      expiresIn,
    });

    // 11. Token'ı database'e kaydet
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    await tokenRepository.upsertToken(
      userId,
      'tiktok',
      accessToken,
      refreshToken,
      expiresAt
    );

    logger.info('TikTok OAuth: Token database\'e kaydedildi', { userId });

    // 12. Başarılı - Dashboard'a yönlendir
    return NextResponse.redirect(new URL('/dashboard?success=tiktok_connected', BASE_URL));

  } catch (error) {
    logger.error('TikTok OAuth: Callback hatası', error);
    return NextResponse.redirect(new URL('/dashboard?error=tiktok_callback_error', BASE_URL));
  }
}
