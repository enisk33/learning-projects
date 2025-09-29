/**
 * Post Type Selector Component
 * Reels ve Post seçimi
 */

'use client';

import { Text, SegmentedControl, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

interface PostTypeSelectorProps {
  uploadType: string;
  onUploadTypeChange: (value: string) => void;
  isVideo: boolean;
  file: File | null;
}

export function PostTypeSelector({ uploadType, onUploadTypeChange, isVideo, file }: PostTypeSelectorProps) {
  // Fotoğraf seçildiyse ve Reels seçilmişse uyarı göster
  const showImageReelsWarning = file && !isVideo && uploadType === 'reels';

  return (
    <div>
      <Text className="text-sm font-medium text-gray-700 mb-2">Gönderi Tipi</Text>
      <SegmentedControl
        value={uploadType}
        onChange={onUploadTypeChange}
        data={[
          { label: 'Post', value: 'post' },
          { label: 'Reels', value: 'reels' },
        ]}
        className="!w-full [&_.mantine-SegmentedControl-control[data-active]]:!bg-primary-600 [&_.mantine-SegmentedControl-control[data-active]]:!text-white"
      />
      
      {showImageReelsWarning && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Uyarı"
          color="orange"
          className="mt-2"
        >
          Reels kısmına fotoğraf gönderemezsiniz. Lütfen video dosyası seçin veya Post seçeneğini kullanın.
        </Alert>
      )}
      
      {isVideo && uploadType === 'reels' && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Reels Standartları"
          color="blue"
          className="mt-2"
        >
          <Text size="xs" className="text-gray-700">
            • Süre: 3-90 saniye arası<br/>
            • Boyut: En az 500x500 piksel<br/>
            • Format: Dikey (9:16) veya Kare (1:1)
          </Text>
        </Alert>
      )}
      
      {isVideo && uploadType === 'post' && (
        <Text className="text-xs text-gray-500 mt-2">
          Video dosyası seçtiniz. Post olarak yayınlanacaktır.
        </Text>
      )}
    </div>
  );
}
