/**
 * Token Repository
 * User token'ları için database işlemleri
 */

import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { env } from '@/lib/config/env';
import { NotFoundError, TokenError, DatabaseError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';
import { tokenCache } from '@/lib/utils/cache';

export interface TokenDocument {
  _id?: ObjectId;
  userId: string;
  provider: 'facebook' | 'instagram' | 'tiktok';
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  instagramBusinessAccountId?: string; // Instagram Business Account ID
  providerAccountId?: string; // Provider account ID
}

export class TokenRepository {
  private readonly collectionName = 'user_tokens';
  private readonly dbName = env.MONGODB_DB;
  private indexesCreated = false;

  private async getDb() {
    try {
      const client = await (clientPromise as Promise<MongoClient>);
      return client.db(this.dbName);
    } catch (error) {
      logger.error('TokenRepository: Database bağlantı hatası', error);
      throw new DatabaseError('Veritabanına bağlanılamadı', error);
    }
  }

  /**
   * Database index'lerini oluştur (performans için)
   */
  private async ensureIndexes() {
    if (this.indexesCreated) {
      return;
    }

    try {
      const db = await this.getDb();
      const collection = db.collection(this.collectionName);

      // userId ve provider üzerinde compound index (en çok kullanılan sorgu)
      await collection.createIndex(
        { userId: 1, provider: 1 },
        { unique: true, name: 'userId_provider_unique' }
      );

      // userId üzerinde index (kullanıcının tüm token'larını getirmek için)
      await collection.createIndex(
        { userId: 1 },
        { name: 'userId_index' }
      );

      // expiresAt üzerinde TTL index (otomatik temizleme için - opsiyonel)
      // await collection.createIndex(
      //   { expiresAt: 1 },
      //   { expireAfterSeconds: 0, name: 'expiresAt_ttl' }
      // );

      this.indexesCreated = true;
      logger.info('Token repository index\'leri oluşturuldu');
    } catch (error) {
      // Index zaten varsa hata vermez, sadece log
      logger.warn('Token repository index oluşturma hatası (index zaten var olabilir)', error);
    }
  }

  /**
   * Kullanıcının token'ını getir (cache'li)
   */
  async getToken(userId: string, provider: 'facebook' | 'instagram' | 'tiktok'): Promise<TokenDocument | null> {
    try {
      // Index'leri oluştur (ilk çağrıda)
      await this.ensureIndexes();

      // Cache'den kontrol et
      const cacheKey = `token:${userId}:${provider}`;
      const cachedToken = tokenCache.get<TokenDocument>(cacheKey);
      
      if (cachedToken) {
        logger.debug('Token cache hit', { userId, provider });
        return cachedToken;
      }

      logger.debug('Token cache miss, database\'den çekiliyor', { userId, provider });

      const db = await this.getDb();
      const token = await db.collection<TokenDocument>(this.collectionName).findOne({
        userId,
        provider,
      });

      // Cache'e kaydet (token null olsa bile kısa süre cache'le - cache stampede önleme)
      if (token) {
        tokenCache.set(cacheKey, token);
      } else {
        // Null değerleri de kısa süre cache'le (1 dakika) - gereksiz DB sorgularını önle
        tokenCache.set(cacheKey, null as unknown as TokenDocument, 60 * 1000);
      }

      return token;
    } catch (error) {
      logger.error('TokenRepository: Token getirme hatası', error, { userId, provider });
      throw new DatabaseError('Token getirilemedi', error);
    }
  }

  /**
   * Token'ın geçerli olup olmadığını kontrol et
   */
  async getValidToken(userId: string, provider: 'facebook' | 'instagram' | 'tiktok'): Promise<TokenDocument> {
    const token = await this.getToken(userId, provider);

    if (!token || !token.accessToken) {
      throw new NotFoundError(`${provider} token'ı`);
    }

    // Token süresi kontrolü
    if (token.expiresAt && new Date() > new Date(token.expiresAt)) {
      logger.warn('Token süresi dolmuş', { userId, provider, expiresAt: token.expiresAt });
      throw new TokenError(`${provider} token süresi dolmuş. Lütfen tekrar bağlayın.`);
    }

    return token;
  }

  /**
   * Token'ı kaydet veya güncelle (cache'i invalidate et)
   */
  async upsertToken(
    userId: string,
    provider: 'facebook' | 'instagram' | 'tiktok',
    accessToken: string,
    refreshToken?: string | null,
    expiresAt?: Date | null
  ): Promise<void> {
    try {
      // Index'leri oluştur (ilk çağrıda)
      await this.ensureIndexes();

      const db = await this.getDb();
      await db.collection<TokenDocument>(this.collectionName).updateOne(
        { userId, provider },
        {
          $set: {
            userId,
            provider,
            accessToken,
            refreshToken: refreshToken || null,
            expiresAt: expiresAt || null,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      // Cache'i invalidate et - bir sonraki çağrıda fresh data çekilecek
      const cacheKey = `token:${userId}:${provider}`;
      tokenCache.delete(cacheKey);

      // Account ID cache'ini de invalidate et (Instagram için)
      if (provider === 'instagram') {
        const { accountIdCache } = await import('@/lib/utils/cache');
        accountIdCache.delete(`instagram_account_id:${userId}`);
      }

      logger.info('Token kaydedildi', { userId, provider });
    } catch (error) {
      logger.error('TokenRepository: Token kaydetme hatası', error, { userId, provider });
      throw new DatabaseError('Token kaydedilemedi', error);
    }
  }

  /**
   * Token'ı sil
   */
  async deleteToken(userId: string, provider: 'facebook' | 'instagram' | 'tiktok'): Promise<void> {
    try {
      const db = await this.getDb();
      await db.collection(this.collectionName).deleteOne({ userId, provider });
      
      // Cache'i temizle
      const cacheKey = `token:${userId}:${provider}`;
      tokenCache.delete(cacheKey);

      // Account ID cache'ini de temizle (Instagram için)
      if (provider === 'instagram') {
        const { accountIdCache } = await import('@/lib/utils/cache');
        accountIdCache.delete(`instagram_account_id:${userId}`);
      }

      logger.info('Token silindi', { userId, provider });
    } catch (error) {
      logger.error('TokenRepository: Token silme hatası', error, { userId, provider });
      throw new DatabaseError('Token silinemedi', error);
    }
  }
}

// Singleton instance
export const tokenRepository = new TokenRepository();
