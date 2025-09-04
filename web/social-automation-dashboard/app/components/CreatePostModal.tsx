'use client';

import { useState } from 'react';
import {
  Modal,
  Button,
  Textarea,
  Checkbox,
  Group,
  Text,
  FileButton,
  SegmentedControl,
  Loader,
} from '@mantine/core';
import { IconUpload, IconBrandFacebook, IconBrandInstagram, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { publishMedia } from '../actions/post';

interface CreatePostModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreatePostModal({ opened, onClose }: CreatePostModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploadType, setUploadType] = useState('reels');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      notifications.show({
        title: 'Hata',
        message: 'Lütfen bir dosya seçin',
        color: 'red',
      });
      return;
    }

    if (platforms.length === 0) {
      notifications.show({
        title: 'Hata',
        message: 'En az bir platform seçmelisiniz',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('uploadType', uploadType);
      platforms.forEach((platform) => {
        formData.append('platforms', platform);
      });

      const result = await publishMedia(formData);

      if (result.success) {
        notifications.show({
          title: 'Başarılı!',
          message: result.error || 'Gönderi başarıyla yayınlandı',
          color: 'teal',
        });
        
        // Formu temizle
        setFile(null);
        setDescription('');
        setPlatforms([]);
        onClose();
      } else {
        notifications.show({
          title: 'Hata',
          message: result.error || 'Yükleme başarısız',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message: error instanceof Error ? error.message : 'Bir hata oluştu',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      className="[&_.mantine-Modal-content]:!max-w-2xl [&_.mantine-Modal-content]:!rounded-2xl [&_.mantine-Modal-content]:!shadow-xl [&_.mantine-Modal-content]:!bg-white [&_.mantine-Modal-content]:!p-0"
      title={null}
      withCloseButton={false}
      centered
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Yeni Gönderi Oluştur</h2>
          <Button
            onClick={onClose}
            disabled={loading}
            className="!w-8 !h-8 !p-0 !bg-transparent hover:!bg-gray-100 rounded-lg !border-0 !m-0 inline-flex items-center justify-center"
          >
            <IconX size={18} className="text-gray-500" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Dosya Yükleme */}
          <div>
            <Text className="text-sm font-medium text-gray-700 mb-2">Medya Dosyası</Text>
            <FileButton onChange={setFile} accept="image/*,video/*">
              {(props) => (
                <Button
                  {...props}
                  className="!w-full !h-32 !border-2 !border-dashed !border-border hover:!border-primary-400 hover:!bg-primary-50 rounded-xl transition-colors flex flex-col items-center justify-center gap-2 !bg-transparent !p-0 !m-0"
                >
                  {file ? (
                    <>
                      <IconUpload size={24} className="text-primary-600" />
                      <span className="text-sm font-medium text-primary-600">{file.name}</span>
                      <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </>
                  ) : (
                    <>
                      <IconUpload size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Dosya seç veya sürükle</span>
                    </>
                  )}
                </Button>
              )}
            </FileButton>
          </div>

          {/* Açıklama */}
          <div>
            <Text className="text-sm font-medium text-gray-700 mb-2">Açıklama</Text>
            <Textarea
              placeholder="Gönderiniz için bir açıklama yazın..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={4}
              className="[&_.mantine-Textarea-input]:!resize-none [&_.mantine-Textarea-input]:!border-border [&_.mantine-Textarea-input]:!rounded-xl [&_.mantine-Textarea-input]:focus:!border-primary-500 [&_.mantine-Textarea-input]:focus:!ring-2 [&_.mantine-Textarea-input]:focus:!ring-primary-200 [&_.mantine-Textarea-input]:!m-0"
            />
          </div>

          {/* Yükleme Tipi */}
          <div>
            <Text className="text-sm font-medium text-gray-700 mb-2">Gönderi Tipi</Text>
            <SegmentedControl
              value={uploadType}
              onChange={setUploadType}
              data={[
                { label: 'Reels', value: 'reels' },
                { label: 'Post', value: 'post' },
              ]}
              className="!w-full [&_.mantine-SegmentedControl-control[data-active]]:!bg-primary-600 [&_.mantine-SegmentedControl-control[data-active]]:!text-white"
            />
          </div>

          {/* Platform Seçimi */}
          <div>
            <Text className="text-sm font-medium text-gray-700 mb-2">Platformlar</Text>
            <div className="space-y-2">
              <Checkbox
                label={
                  <Group gap="xs" className="ml-2">
                    <IconBrandFacebook size={18} className="text-primary-600" />
                    <Text className="text-sm text-gray-700">Facebook</Text>
                  </Group>
                }
                checked={platforms.includes('facebook')}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    setPlatforms([...platforms, 'facebook']);
                  } else {
                    setPlatforms(platforms.filter((p) => p !== 'facebook'));
                  }
                }}
                className="[&_.mantine-Checkbox-input]:!border-border [&_.mantine-Checkbox-input:checked]:!bg-primary-600 [&_.mantine-Checkbox-input:checked]:!border-primary-600 [&_.mantine-Checkbox-input]:!m-0"
              />
              <Checkbox
                label={
                  <Group gap="xs" className="ml-2">
                    <IconBrandInstagram size={18} className="text-instagram-purple" />
                    <Text className="text-sm text-gray-700">Instagram</Text>
                  </Group>
                }
                checked={platforms.includes('instagram')}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    setPlatforms([...platforms, 'instagram']);
                  } else {
                    setPlatforms(platforms.filter((p) => p !== 'instagram'));
                  }
                }}
                className="[&_.mantine-Checkbox-input]:!border-border [&_.mantine-Checkbox-input:checked]:!bg-gradient-instagram [&_.mantine-Checkbox-input:checked]:!border-transparent [&_.mantine-Checkbox-input]:!m-0"
              />
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              disabled={loading}
              className="!bg-transparent !text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !font-medium !px-4 !py-2 !m-0 !border-0"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !file || platforms.length === 0}
              leftSection={loading ? <Loader size={16} /> : null}
              className="!bg-gradient-to-r !from-primary-600 !to-purple-600 hover:!from-primary-700 hover:!to-purple-700 !text-white !font-medium !px-6 !py-2.5 !rounded-lg !m-0 !border-0"
            >
              {loading ? 'Yükleniyor...' : 'Yayınla'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
