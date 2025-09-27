/**
 * Post Repository
 * Post veritabanı işlemleri
 */

import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { env } from '@/lib/config/env';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

export interface PostEntity {
  _id?: ObjectId;
  userId: string;
  userEmail?: string;
  title: string;
  content: string;
  description?: string | null;
  platform?: 'facebook' | 'instagram' | null;
  mediaUrl?: string | null;
  uploadType?: 'post' | 'reels' | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostDTO {
  title: string;
  content: string;
  description?: string | null;
  platform?: 'facebook' | 'instagram' | null;
  mediaUrl?: string | null;
  uploadType?: 'post' | 'reels' | null;
}

export class PostRepository {
  private readonly collectionName = 'posts';
  private readonly dbName = env.MONGODB_DB;

  private async getDb() {
    try {
      const client = await (clientPromise as Promise<MongoClient>);
      return client.db(this.dbName);
    } catch (error) {
      logger.error('PostRepository: Database bağlantı hatası', error);
      throw new DatabaseError('Veritabanına bağlanılamadı', error);
    }
  }

  async findByUserId(userId: string): Promise<PostEntity[]> {
    try {
      const db = await this.getDb();
      return await db.collection<PostEntity>(this.collectionName)
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      logger.error('PostRepository: Post getirme hatası', error, { userId });
      throw new DatabaseError('Postlar getirilemedi', error);
    }
  }

  async create(userId: string, userEmail: string | undefined, data: CreatePostDTO): Promise<string> {
    try {
      const db = await this.getDb();
      const now = new Date();
      const result = await db.collection<PostEntity>(this.collectionName).insertOne({
        userId,
        userEmail,
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      
      logger.info('Post oluşturuldu', { postId: result.insertedId.toString(), userId });
      return result.insertedId.toString();
    } catch (error) {
      logger.error('PostRepository: Post oluşturma hatası', error);
      throw new DatabaseError('Post oluşturulamadı', error);
    }
  }

  async findById(id: string, userId: string): Promise<PostEntity | null> {
    try {
      const db = await this.getDb();
      return await db.collection<PostEntity>(this.collectionName).findOne({
        _id: new ObjectId(id),
        userId,
      });
    } catch (error) {
      logger.error('PostRepository: Post bulma hatası', error, { id, userId });
      throw new DatabaseError('Post bulunamadı', error);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const db = await this.getDb();
      const result = await db.collection(this.collectionName).deleteOne({
        _id: new ObjectId(id),
        userId,
      });
      
      if (result.deletedCount === 0) {
        throw new NotFoundError('Post');
      }
      
      logger.info('Post silindi', { postId: id, userId });
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('PostRepository: Post silme hatası', error, { id, userId });
      throw new DatabaseError('Post silinemedi', error);
    }
  }
}

export const postRepository = new PostRepository();
