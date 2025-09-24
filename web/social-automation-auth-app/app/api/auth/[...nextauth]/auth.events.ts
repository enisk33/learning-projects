/**
 * NextAuth Events
 */

import type { User } from "next-auth";

// NextAuth v5 type definitions
type Account = {
  provider: string;
  access_token?: string;
  refresh_token?: string | null;
  expires_at?: number | null;
  providerAccountId?: string;
};
import { tokenRepository } from "@/lib/repositories/token-repository";
import { logger } from "@/lib/utils/logger";

interface LinkAccountParams {
  user: User;
  account: Account | null;
}

/**
 * Account link event - Token'ı kaydet
 */
export async function linkAccountEvent({ user, account }: LinkAccountParams): Promise<void> {
  if ((account?.provider === "facebook" || account?.provider === "instagram") && 
      account.access_token && 
      user?.id) {
    try {
      await tokenRepository.upsertToken(
        user.id,
        account.provider as 'facebook' | 'instagram',
        account.access_token,
        account.refresh_token || null,
        account.expires_at ? new Date(account.expires_at * 1000) : null
      );
      logger.info(`${account.provider} hesabı bağlandı ve token kaydedildi`, { 
        userId: user.id, 
        provider: account.provider 
      });
    } catch (error) {
      logger.error(`${account.provider} hesabı bağlanırken token kaydedilemedi`, { 
        error, 
        userId: user.id 
      });
    }
  }
}
