'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { uploadVideoAction } from '@/app/actions/video';
import { toast } from 'sonner';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold h-10"
    >
      {pending ? 'Yükleniyor...' : '🚀 Video Yükle ve Paylaş'}
    </Button>
  );
}

interface VideoUploadFormProps {
  onSuccess?: () => void;
}

export function VideoUploadForm({ onSuccess }: VideoUploadFormProps) {
  const [formError, setFormError] = useState<Record<string, string[] | undefined> | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setFormError(null);
    setGlobalError(null);

    const platforms = [];
    if (formData.get('facebook')) platforms.push('facebook');
    if (formData.get('instagram')) platforms.push('instagram');

    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      videoUrl: formData.get('videoUrl'),
      platforms,
    };

    const result = await uploadVideoAction(data);

    if (result.success) {
      toast.success(result.message);
      const form = document.querySelector('form') as HTMLFormElement;
      form?.reset();
      onSuccess?.();
    } else if (result.errors) {
      setFormError(result.errors);
      toast.error('Forma hata var, kontrol et');
    } else {
      setGlobalError(result.message || 'Bir hata oluştu');
      toast.error(result.message || 'Bir hata oluştu');
    }
  }

  return (
    <Card className="border-2 border-primary-200 shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-primary-600">Video Yükle</CardTitle>
        <CardDescription>
          Videoyu yükle ve Facebook veya Instagram&apos;a paylaş
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          {globalError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-sm text-red-700">
              <p className="font-semibold">Hata:</p>
              <p>{globalError}</p>
            </div>
          )}

          {/* Video Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Video Başlığı *</label>
            <Input
              type="text"
              name="title"
              placeholder="Örn: Harika bir gün"
              required
              className="border-2 border-neutral-300 focus:border-primary-500"
            />
            {formError?.title && (
              <p className="text-xs text-red-600">{formError.title[0]}</p>
            )}
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Video URL *</label>
            <Input
              type="url"
              name="videoUrl"
              placeholder="https://example.com/video.mp4"
              required
              className="border-2 border-neutral-300 focus:border-primary-500"
            />
            {formError?.videoUrl && (
              <p className="text-xs text-red-600">{formError.videoUrl[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Açıklama</label>
            <Textarea
              name="description"
              placeholder="Video hakkında kısa bir açıklama yazın..."
              className="border-2 border-neutral-300 focus:border-primary-500 min-h-[100px]"
            />
            {formError?.description && (
              <p className="text-xs text-red-600">{formError.description[0]}</p>
            )}
          </div>

          {/* Platform Selection */}
          <div className="space-y-3 bg-neutral-50 p-4 rounded-lg border-2 border-neutral-200">
            <p className="text-sm font-medium text-neutral-700">Platformları Seçin *</p>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="facebook"
                name="facebook"
                className="w-4 h-4 accent-primary-600 rounded cursor-pointer"
              />
              <label htmlFor="facebook" className="text-sm text-neutral-700 cursor-pointer flex-1">
                <span className="font-medium text-primary-600">f</span> Facebook
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="instagram"
                name="instagram"
                className="w-4 h-4 accent-accent-600 rounded cursor-pointer"
              />
              <label htmlFor="instagram" className="text-sm text-neutral-700 cursor-pointer flex-1">
                <span className="font-medium text-accent-600">📷</span> Instagram
              </label>
            </div>

            {formError?.platforms && (
              <p className="text-xs text-red-600">{formError.platforms[0]}</p>
            )}
          </div>

          {/* Submit Button */}
          <SubmitButton />

          {/* Info Box */}
          <div className="bg-accent-50 border-2 border-accent-200 rounded-lg p-4 text-sm text-neutral-700">
            <p className="font-semibold text-accent-700 mb-2">💡 İpucu:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Video başlığı en az 3 karakter olmalı</li>
              <li>Açıklama 500 karakteri geçmemelidir</li>
              <li>En az bir platform seçmelisiniz</li>
              <li>Geçerli bir video URL sağlayın</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
