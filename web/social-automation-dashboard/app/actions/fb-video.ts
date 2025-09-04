'use server';

export async function uploadVideoAction(formData: FormData) {
  const PAGE_ID = process.env.FB_PAGE_ID;
  const TOKEN = process.env.FB_ACCESS_TOKEN;
  const uploadType = formData.get('uploadType') as string; // 'reels' veya 'post'

  if (!PAGE_ID || !TOKEN) return { success: false, error: "Ayarlar eksik!" };

  try {
    const videoFile = formData.get('video') as File;
    const description = formData.get('description') as string;

    const fbFormData = new FormData();
    fbFormData.append('access_token', TOKEN);
    fbFormData.append('source', videoFile);
    
    // Reels ve Post için farklı parametre isimlendirmeleri gerekebilir
    if (uploadType === 'reels') {
      fbFormData.append('caption', description); // Reels'ta açıklama genelde 'caption' olarak geçer
    } else {
      fbFormData.append('description', description);
    }

    // Reels için farklı, Normal Video için farklı endpoint
    const endpoint = uploadType === 'reels' 
      ? `https://graph.facebook.com/v21.0/${PAGE_ID}/video_reels` 
      : `https://graph.facebook.com/v21.0/${PAGE_ID}/videos`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: fbFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("FB Hata Detayı:", data);
      return { success: false, error: data.error?.message || `Facebook ${uploadType} yüklemesini reddetti.` };
    }

    return { success: true, videoId: data.id };
  } catch (error) {
    console.error('uploadVideoAction error:', error);
    return { success: false, error: "Sunucu bağlantı hatası oluştu." };
  }
}
