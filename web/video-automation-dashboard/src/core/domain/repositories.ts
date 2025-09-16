// Interface for video upload
export interface IVideoRepository {
  uploadVideo(videoData: VideoUploadRequest): Promise<VideoUploadResponse>;
  shareToFacebook(videoId: string, description: string): Promise<ShareResponse>;
  shareToInstagram(videoId: string, description: string): Promise<ShareResponse>;
}

export interface VideoUploadRequest {
  title: string;
  description?: string;
  videoUrl: string;
  platforms: ('facebook' | 'instagram')[];
}

export interface VideoUploadResponse {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: Date;
}

export interface ShareResponse {
  success: boolean;
  message: string;
  externalId?: string;
}
