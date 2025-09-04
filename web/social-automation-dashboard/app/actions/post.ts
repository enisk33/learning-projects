'use server';

import { uploadInstagramAction } from './instagram';
import { uploadVideoAction } from './fb-video';

export async function publishMedia(formData: FormData) {
  const platforms = formData.getAll('platforms') as string[];

  // Öncelik: Instagram (varsa), değilse Facebook
  if (platforms.includes('instagram')) {
    return await uploadInstagramAction(formData);
  }

  if (platforms.includes('facebook')) {
    // Facebook action bekliyorsa 'video' anahtarı kullanıyor olabilir.
    // Kopyalayarak 'video' anahtarını ekleyelim (varsa file) to avoid breaking.
    try {
      const file = formData.get('file');
      if (file) {
        const fbForm = new FormData();
        for (const [key, value] of Array.from(formData.entries())) {
          fbForm.append(key, value as any);
        }
        // Eğer 'video' alanı yoksa, 'file' içeriğini 'video' olarak da ekle
        if (!fbForm.has('video')) {
          fbForm.append('video', file as any);
        }
        return await uploadVideoAction(fbForm);
      }
    } catch (err) {
      console.error('publishMedia (facebook wrapper) hata:', err);
      return { success: false, error: 'Facebook için form hazırlanırken hata oluştu.' };
    }
  }

  return { success: false, error: 'Desteklenen bir platform seçilmedi.' };
}
