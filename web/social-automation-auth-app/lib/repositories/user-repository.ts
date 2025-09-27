/**
 * User Repository
 * Kullanıcı veritabanı işlemleri
 */

import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { env } from '@/lib/config/env';
import { NotFoundError, ConflictError, DatabaseError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

export interface UserDocument {
  _id?: ObjectId;
  email: string;
  password?: string;
  name?: string | null;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserRepository {
  private readonly collectionName = 'users';
  private readonly dbName = env.MONGODB_DB;

  private async getDb() {
    try {
      const client = await (clientPromise as Promise<MongoClient>);
      return client.db(this.dbName);
    } catch (error) {
      logger.error('UserRepository: Database bağlantı hatası', error);
      throw new DatabaseError('Veritabanına bağlanılamadı', error);
    }
  }

  /**
   * Email ile kullanıcı bul
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      const db = await this.getDb();
      const normalizedEmail = email.toLowerCase().trim();
      return await db.collection<UserDocument>(this.collectionName).findOne({
        email: normalizedEmail,
      });
    } catch (error) {
      logger.error('UserRepository: Kullanıcı bulma hatası', error, { email });
      throw new DatabaseError('Kullanıcı bulunamadı', error);
    }
  }

  /**
   * ID ile kullanıcı bul
   */
  async findById(id: string): Promise<UserDocument | null> {
    try {
      const db = await this.getDb();
      return await db.collection<UserDocument>(this.collectionName).findOne({
        _id: new ObjectId(id),
      });
    } catch (error) {
      logger.error('UserRepository: Kullanıcı bulma hatası', error, { id });
      throw new DatabaseError('Kullanıcı bulunamadı', error);
    }
  }

  /**
   * Kullanıcı oluştur
   */
  async create(userData: {
    email: string;
    password: string;
    name?: string | null;
  }): Promise<string> {
    try {
      const db = await this.getDb();
      const normalizedEmail = userData.email.toLowerCase().trim();

      // Email kontrolü
      const existing = await this.findByEmail(normalizedEmail);
      if (existing) {
        throw new ConflictError('Bu email adresi zaten kullanılıyor');
      }

      const result = await db.collection<UserDocument>(this.collectionName).insertOne({
        email: normalizedEmail,
        password: userData.password,
        name: userData.name?.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info('Kullanıcı oluşturuldu', { userId: result.insertedId.toString(), email: normalizedEmail });
      return result.insertedId.toString();
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      logger.error('UserRepository: Kullanıcı oluşturma hatası', error, { email: userData.email });
      throw new DatabaseError('Kullanıcı oluşturulamadı', error);
    }
  }

  /**
   * Kullanıcı güncelle
   */
  async update(id: string, updates: Partial<UserDocument>): Promise<void> {
    try {
      const db = await this.getDb();
      await db.collection(this.collectionName).updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        }
      );
      logger.info('Kullanıcı güncellendi', { userId: id });
    } catch (error) {
      logger.error('UserRepository: Kullanıcı güncelleme hatası', error, { id });
      throw new DatabaseError('Kullanıcı güncellenemedi', error);
    }
  }
}

// Singleton instance
export const userRepository = new UserRepository();
