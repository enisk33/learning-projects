/**
 * NextAuth Configuration
 * Main entry point - imports modular components
 */

import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { env, getAuthSecret } from "@/lib/config/env";
import { getProviders } from "./auth.providers";
import { signInCallback, jwtCallback, sessionCallback } from "./auth.callbacks";
import { linkAccountEvent } from "./auth.events";
import "./auth.types"; // Type extensions

const config = {
  adapter: MongoDBAdapter(clientPromise as Promise<MongoClient>),
  trustHost: true,
  secret: getAuthSecret(),
  debug: env.NODE_ENV === 'development',
  providers: getProviders(),
  session: {
    strategy: "jwt",
  },
  events: {
    linkAccount: linkAccountEvent,
  },
  callbacks: {
    signIn: signInCallback,
    jwt: jwtCallback,
    session: sessionCallback,
    // Redirect callback - her zaman dashboard'a yönlendir (hata durumları hariç)
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Sadece gerçek OAuth hataları için login'e yönlendir
      if (url.includes('error=OAuthAccountNotLinked') || url.includes('error=AccessDenied')) {
        return `${baseUrl}/login?error=oauth_error`;
      }
      
      // Kullanıcı cancel'a bastıysa (error=access_denied veya user_denied)
      if (url.includes('error=access_denied') || url.includes('error_reason=user_denied')) {
        return `${baseUrl}/dashboard?info=cancelled`;
      }
      
      // /dashboard ile başlayan URL'ler için direkt yönlendir
      if (url.startsWith('/dashboard') || url.includes('/dashboard')) {
        return `${baseUrl}/dashboard`;
      }
      
      // Relative URL'leri baseUrl ile birleştir
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Aynı origin ise izin ver
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // URL parse hatası - dashboard'a yönlendir
      }
      
      // Varsayılan olarak dashboard'a yönlendir
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error page
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { handlers, auth, signIn, signOut } = (NextAuth as any)(config);

export const GET = handlers.GET;
export const POST = handlers.POST;