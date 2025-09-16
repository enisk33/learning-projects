export interface IVideoRepository {
  upload(videoUrl: string, title: string, description: string): Promise<string>;
}
