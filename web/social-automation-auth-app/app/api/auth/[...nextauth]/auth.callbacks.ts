/**
 * NextAuth Callbacks
 * Includes Instagram Business Account ID fetching logic
 */

import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

// NextAuth v5 type definitions
type Account = {
  provider: string;
  access_token?: string;
  refresh_token?: string | null;
  expires_at?: number | null;
  providerAccountId?: string;
};
import { MongoClient } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { env } from "@/lib/config/env";
import { tokenRepository } from "@/lib/repositories/token-repository";
import { logger } from "@/lib/utils/logger";

interface JWTParams {
  token: JWT;
  user?: User;
  account?: Account | null;
}

interface SessionParams {
  session: Session;
  token: JWT;
}

const GRAPH_API_VERSION = 'v24.0';
const REQUEST_TIMEOUT = 10000; // 10 saniye

/**
 * Instagram Business Account ID'sini al ve kaydet (non-blocking)
 */
function fetchAndSaveInstagramAccountId(userId: string, accessToken: string): void {
  // Non-blocking execution - Promise.resolve().then() ile async çalışır
  Promise.resolve().then(async () => {
    try {
      // 1. Facebook sayfalarını al
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const pagesResponse = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/me/accounts?access_token=${accessToken}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!pagesResponse.ok) {
        logger.warn("Facebook sayfaları alınamadı", { 
          userId, 
          status: pagesResponse.status 
        });
        return;
      }
      
      const pagesData = await pagesResponse.json();
      
      if (pagesData.error) {
        logger.warn("Facebook sayfaları API hatası", { 
          userId, 
          error: pagesData.error 
        });
        return;
      }
      
      if (!pagesData.data || pagesData.data.length === 0) {
        logger.warn("Facebook sayfası bulunamadı", { userId });
        return;
      }
      
      // 2. İlk sayfanın Instagram Business Account'unu al
      const firstPage = pagesData.data[0];
      const pageController = new AbortController();
      const pageTimeoutId = setTimeout(() => pageController.abort(), REQUEST_TIMEOUT);
      
      const pageResponse = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${firstPage.id}?fields=instagram_business_account&access_token=${firstPage.access_token}`,
        { signal: pageController.signal }
      );
      
      clearTimeout(pageTimeoutId);
      
      if (!pageResponse.ok) {
        logger.warn("Instagram Business Account bilgisi alınamadı", { 
          userId, 
          pageId: firstPage.id 
        });
        return;
      }
      
      const pageData = await pageResponse.json();
      
      if (!pageData.instagram_business_account?.id) {
        logger.warn("Instagram Business Account ID bulunamadı", { 
          userId, 
          pageId: firstPage.id 
        });
        return;
      }
      
      const instagramBusinessAccountId = pageData.instagram_business_account.id;
      
      // 3. Instagram Business Account ID'yi kaydet
      try {
        const client = await (clientPromise as Promise<MongoClient>);
        const db = client.db(env.MONGODB_DB);
        await db.collection('user_tokens').updateOne(
          { userId, provider: 'instagram' },
          { 
            $set: { 
              instagramBusinessAccountId,
              updatedAt: new Date(),
            } 
          }
        );
        
        logger.info("Instagram Business Account ID kaydedildi", { 
          userId, 
          instagramAccountId: instagramBusinessAccountId,
          pageId: firstPage.id
        });
      } catch (dbError) {
        logger.warn("Instagram Business Account ID kaydedilemedi", { 
          userId, 
          error: dbError 
        });
      }
      
    } catch (error) {
      // Timeout veya network hatası
      if (error instanceof Error && error.name === 'AbortError') {
        logger.warn("Instagram Business Account ID alınırken timeout", { userId });
      } else {
        logger.warn("Instagram Business Account ID alınamadı", { 
          userId, 
          error 
        });
      }
    }
  });
}

/**
 * SignIn callback - OAuth provider'ları için email kontrolü yap
 * Kayıtlı olmayan kullanıcılar da OAuth ile giriş yapabilir
 * MongoDBAdapter otomatik olarak kullanıcı oluşturacak
 */
export async function signInCallback({ 
  account, 
  user, 
  profile 
}: { 
  account?: Account | null;
  user?: User;
  profile?: Record<string, unknown> & { email?: string };
}): Promise<boolean> {
  // Credentials provider için her zaman izin ver (email/şifre ile giriş)
  if (!account || account.provider === "credentials") {
    return true;
  }

  // OAuth provider'lar için (Facebook, Instagram, TikTok)
  if (account.provider === "facebook" || account.provider === "instagram" || account.provider === "tiktok") {
    // Email kontrolü - Facebook varsayılan olarak email verir
    // TikTok ve Instagram için email olmayabilir
    // Eğer email yoksa bile girişe izin ver (MongoDBAdapter kullanıcı oluşturacak)
    const email = profile?.email || user?.email;
    
    logger.info("OAuth: Giriş yapılıyor", { 
      email: email || "email yok",
      provider: account.provider,
      hasUser: !!user,
      hasProfile: !!profile
    });
    
    // Email olsun ya da olmasın girişe izin ver
    // MongoDBAdapter otomatik olarak kullanıcı oluşturacak
    return true;
  }

  // Diğer provider'lar için varsayılan olarak izin ver
  return true;
}

/**
 * JWT callback - Token'ları kaydet ve Instagram Business ID'yi al
 */
export async function jwtCallback({ token, user, account }: JWTParams): Promise<JWT> {
  // User bilgilerini token'a ekle
  if (user) {
    token.sub = user.id;
    token.email = user.email;
    token.name = user.name;
    token.picture = user.image || null;
  }
  
  // OAuth token'ları kaydet (Facebook, Instagram, TikTok)
  if (account && 
      (account.provider === "facebook" || account.provider === "instagram" || account.provider === "tiktok") && 
      account.access_token) {
    try {
      const userId = user?.id || token.sub;
      
      if (!userId) {
        logger.error("Token kaydedilemedi: Kullanıcı ID bulunamadı", { 
          provider: account.provider 
        });
        return token;
      }
      
      // Token'ı repository ile kaydet
      await tokenRepository.upsertToken(
        userId,
        account.provider as 'facebook' | 'instagram' | 'tiktok',
        account.access_token,
        account.refresh_token || null,
        account.expires_at ? new Date(account.expires_at * 1000) : null
      );
      
      logger.info(`${account.provider} token kaydedildi`, { 
        userId, 
        provider: account.provider 
      });
      
      // Instagram provider için Business Account ID'sini al (non-blocking)
      if (account.provider === "instagram") {
        fetchAndSaveInstagramAccountId(userId, account.access_token);
      }
      
    } catch (error) {
      logger.error("Token kaydetme hatası", { 
        error, 
        provider: account.provider 
      });
      // Hata olsa bile token döndür (kullanıcı girişi engellenmez)
    }
  }
  
  return token;
}

/**
 * Session callback - Session'a user bilgilerini ekle
 */
export async function sessionCallback({ session, token }: SessionParams): Promise<Session> {
  if (session.user && token.sub) {
    session.user.id = token.sub;
    session.user.email = token.email as string;
    session.user.name = token.name as string | null;
    session.user.image = token.picture as string | null;
  }
  return session;
}
