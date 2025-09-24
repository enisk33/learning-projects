/**
 * NextAuth Providers Configuration
 * 
 * NOT: TikTok provider NextAuth'dan KALDIRILDI.
 * TikTok için manuel OAuth flow kullanılıyor:
 * - /api/auth/tiktok (authorization)
 * - /api/auth/tiktok/callback (token exchange)
 * 
 * Sebep: NextAuth v5, TikTok'un non-standard OAuth2 formatını desteklemiyor.
 * TikTok, client_key kullanıyor ve token'ları data.access_token içinde döndürüyor.
 */

import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import { env } from "@/lib/config/env";
import { userRepository } from "@/lib/repositories/user-repository";
import { loginSchema } from "@/lib/validations/auth-schemas";
import { logger } from "@/lib/utils/logger";
import bcrypt from "bcryptjs";

export function getProviders() {
  return [
    // Facebook Provider - Minimal scope, auth_type kaldırıldı
    FacebookProvider({
      id: "facebook",
      clientId: env.FB_APP_ID,
      clientSecret: env.FB_APP_SECRET,
      authorization: {
        params: {
          scope: "pages_show_list", // Sadece gerekli scope - email varsayılan olarak gelir
          response_type: "code",
          // auth_type kaldırıldı - bu cancel'a neden oluyordu
        },
      },
      checks: ["pkce", "state"],
    }),
    
    // Instagram Provider - Minimal scope, auth_type kaldırıldı
    FacebookProvider({
      id: "instagram",
      clientId: env.FB_APP_ID,
      clientSecret: env.FB_APP_SECRET,
      authorization: {
        params: {
          scope: "pages_show_list,instagram_content_publish", // email scope'u kaldırıldı
          response_type: "code",
          // auth_type kaldırıldı - bu cancel'a neden oluyordu
        },
      },
      checks: ["pkce", "state"],
    }),
    
    // TikTok: NextAuth'dan KALDIRILDI - Manuel OAuth flow kullanılıyor
    // Bkz: /api/auth/tiktok ve /api/auth/tiktok/callback
    
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn("Auth: Email veya şifre eksik");
          return null;
        }

        try {
          const validated = loginSchema.parse({
            email: credentials.email,
            password: credentials.password,
          });

          const user = await userRepository.findByEmail(validated.email);

          if (!user || !user.password) {
            logger.warn("Auth: Kullanıcı bulunamadı veya şifre yok", { email: validated.email });
            return null;
          }

          const isValid = await bcrypt.compare(validated.password, user.password);

          if (!isValid) {
            logger.warn("Auth: Şifre hatalı", { email: validated.email });
            return null;
          }

          logger.info("Auth: Giriş başarılı", { email: user.email });
          return {
            id: user._id!.toString(),
            email: user.email,
            name: user.name || null,
          };
        } catch (error) {
          logger.error("Auth: Credentials authorize hatası", error);
          return null;
        }
      },
    }),
  ];
}
