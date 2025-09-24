/**
 * TikTok Disconnect - Token silme endpoint'i
 * Kullanıcının TikTok bağlantısını kaldırır
 */

import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { tokenRepository } from '@/lib/repositories/token-repository';
import { logger } from '@/lib/utils/logger';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // TikTok token'ını sil
    await tokenRepository.deleteToken(session.user.id, 'tiktok');
    
    logger.info('TikTok bağlantısı kaldırıldı', { userId: session.user.id });

    return NextResponse.json({ success: true, message: 'TikTok bağlantısı kaldırıldı' });

  } catch (error) {
    logger.error('TikTok disconnect hatası', error);
    return NextResponse.json(
      { error: 'TikTok bağlantısı kaldırılamadı' },
      { status: 500 }
    );
  }
}
