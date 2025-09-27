/**
 * Post Validation Schemas
 * Zod ile form data validation
 */

import { z } from 'zod';

export const publishMediaSchema = z.object({
  platforms: z.array(z.enum(['facebook', 'instagram', 'tiktok'])).min(1, 'En az bir platform seçilmelidir'),
  file: z.instanceof(File).optional(),
  description: z.string().max(2200, 'Açıklama maksimum 2200 karakter olabilir').optional(),
  uploadType: z.enum(['post', 'reels']).default('post'),
});

export type PublishMediaInput = z.infer<typeof publishMediaSchema>;

/**
 * FormData'dan publish media input'unu parse et
 */
export function parsePublishMediaFormData(formData: FormData): PublishMediaInput {
  const platforms = formData.getAll('platforms') as string[];
  const file = formData.get('file') as File | null;
  const description = formData.get('description') as string | null;
  const uploadType = (formData.get('uploadType') as string) || 'post';

  return publishMediaSchema.parse({
    platforms: platforms.filter(p => p === 'facebook' || p === 'instagram' || p === 'tiktok'),
    file: file && file.size > 0 ? file : undefined,
    description: description || undefined,
    uploadType,
  });
}
