/**
 * Post Validation Schemas
 */

import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').max(200, 'Başlık çok uzun'),
  content: z.string().min(1, 'İçerik gereklidir').max(5000, 'İçerik çok uzun'),
  description: z.string().max(2200, 'Açıklama çok uzun').optional().nullable(),
  platform: z.enum(['facebook', 'instagram']).optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
  uploadType: z.enum(['post', 'reels']).optional().nullable(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
