/**
 * Get Social Accounts Action
 * Refactored with repository pattern
 */

'use server';

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { tokenRepository } from '@/lib/repositories/token-repository';
import { formatErrorResponse } from '@/lib/errors/app-errors';
import { AuthenticationError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

export interface SocialAccount {
  provider: 'facebook' | 'instagram' | 'tiktok';
  providerAccountId: string;
  name: string;
  picture: string | null;
}

export interface GetSocialAccountsResult {
  success: boolean;
  error?: string;
  accounts?: SocialAccount[];
}

export async function getSocialAccounts(): Promise<GetSocialAccountsResult> {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    // 2. Get Facebook, Instagram and TikTok tokens from repository
    const facebookToken = await tokenRepository.getToken(session.user.id, 'facebook');
    const instagramToken = await tokenRepository.getToken(session.user.id, 'instagram');
    const tiktokToken = await tokenRepository.getToken(session.user.id, 'tiktok');

    const accounts: SocialAccount[] = [];

    // Facebook hesabı
    if (facebookToken) {
      accounts.push({
        provider: 'facebook',
        providerAccountId: facebookToken.userId,
        name: 'Facebook',
        picture: null,
      });
    }

    // Instagram hesabı
    if (instagramToken) {
      try {
        // TokenRepository'den token'ı tekrar al (instagramBusinessAccountId ile birlikte)
        const instagramTokenWithId = await tokenRepository.getToken(session.user.id, 'instagram');
        
        if (instagramTokenWithId && 'instagramBusinessAccountId' in instagramTokenWithId && instagramTokenWithId.instagramBusinessAccountId) {
          accounts.push({
            provider: 'instagram',
            providerAccountId: instagramTokenWithId.instagramBusinessAccountId,
            name: 'Instagram Business',
            picture: null,
          });
        } else {
          // Instagram token varsa ama ID yoksa, token'dan ID'yi al
          accounts.push({
            provider: 'instagram',
            providerAccountId: instagramToken.userId,
            name: 'Instagram Business',
            picture: null,
          });
        }
      } catch (igError) {
        logger.warn('Instagram Business Account ID kontrol edilemedi', { userId: session.user.id, error: igError });
        // Hata olsa bile token varsa hesabı ekle
        accounts.push({
          provider: 'instagram',
          providerAccountId: instagramToken.userId,
          name: 'Instagram Business',
          picture: null,
        });
      }
    }

    // TikTok hesabı
    if (tiktokToken) {
      accounts.push({
        provider: 'tiktok',
        providerAccountId: tiktokToken.userId,
        name: 'TikTok',
        picture: null,
      });
    }

    logger.info('Sosyal medya hesapları getirildi', {
      userId: session.user.id,
      accountCount: accounts.length,
    });

    return {
      success: true,
      accounts,
    };
  } catch (error) {
    logger.error('Get social accounts action hatası', error);
    return formatErrorResponse(error);
  }
}
