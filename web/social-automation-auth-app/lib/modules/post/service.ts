/**
 * Post Service
 * Post iş mantığı
 */

import { postRepository, CreatePostDTO } from './repository';
import { createPostSchema } from './validations';
import { ValidationError } from '@/lib/errors/app-errors';

export class PostService {
  async getUserPosts(userId: string) {
    return await postRepository.findByUserId(userId);
  }
  
  async createPost(userId: string, userEmail: string | undefined, data: CreatePostDTO) {
    // Validation
    const validated = createPostSchema.parse(data);
    
    // Create
    return await postRepository.create(userId, userEmail, {
      title: validated.title.trim(),
      content: validated.content.trim(),
      description: validated.description?.trim() || null,
      platform: validated.platform || null,
      mediaUrl: validated.mediaUrl || null,
      uploadType: validated.uploadType || null,
    });
  }

  async getPostById(id: string, userId: string) {
    return await postRepository.findById(id, userId);
  }

  async deletePost(id: string, userId: string) {
    return await postRepository.delete(id, userId);
  }
}

export const postService = new PostService();
