import { IVideoRepository } from '@/src/core/repositories/video-repository.interface';

export class FacebookVideoRepository implements IVideoRepository {
  private pageId: string;
  private accessToken: string;
  private apiVersion: string = 'v24.0';

  constructor() {
    const pageId = process.env.FB_PAGE_ID;
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
      throw new Error('Missing Facebook API credentials: FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN are required');
    }

    this.pageId = pageId;
    this.accessToken = accessToken;
  }

  async upload(videoUrl: string, title: string, description: string): Promise<string> {
    try {
      const endpoint = `https://graph.facebook.com/${this.apiVersion}/${this.pageId}/videos`;

      const payload = {
        source: videoUrl,
        title,
        description,
        access_token: this.accessToken,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Facebook API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
