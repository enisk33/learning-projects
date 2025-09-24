import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { tokenRepository } from '@/lib/repositories/token-repository';
import { logger } from '@/lib/utils/logger';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      logger.warn('Facebook Disconnect: Oturum açılmamış kullanıcı');
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    await tokenRepository.deleteToken(session.user.id, 'facebook');
    logger.info('Facebook Disconnect: Token başarıyla silindi', { userId: session.user.id });

    return NextResponse.json({ success: true, message: 'Facebook hesabı başarıyla bağlantısı kesildi.' });
  } catch (error) {
    logger.error('Facebook Disconnect: Hata oluştu', error);
    return NextResponse.json({ success: false, message: 'Facebook hesabının bağlantısı kesilemedi.' }, { status: 500 });
  }
}
