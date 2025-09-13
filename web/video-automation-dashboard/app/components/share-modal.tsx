'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Media {
  id: string;
  type: 'video' | 'photo';
  name: string;
  thumbnail: string;
  size: string;
  date: string;
}

interface ShareModalProps {
  media: Media | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ media, isOpen, onClose }: ShareModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<('facebook' | 'instagram')[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !media) return null;

  const togglePlatform = (platform: 'facebook' | 'instagram') => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleShare = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Lütfen en az bir platform seçin');
      return;
    }

    setIsUploading(true);
    try {
      // Simulated upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`${media.name} ${selectedPlatforms.join(' ve ')}'a başarıyla gönderildi!`);
      setSelectedPlatforms([]);
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md border-2 border-primary-200 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b-2 border-primary-100 bg-gradient-to-r from-primary-50 to-accent-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-primary-900">Paylaş</h3>
                <p className="text-sm text-neutral-600 mt-1">{media.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Preview */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center h-40">
              <div className="text-6xl">{media.thumbnail}</div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-neutral-900">Nereye paylaşmak istersiniz?</p>

              {/* Facebook Option */}
              <button
                onClick={() => togglePlatform('facebook')}
                className={`w-full p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                  selectedPlatforms.includes('facebook')
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-blue-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes('facebook')}
                  onChange={() => {}}
                  className="w-5 h-5 rounded-md cursor-pointer accent-blue-600"
                />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-neutral-900">Facebook</p>
                  <p className="text-xs text-neutral-600">Facebook sayfasına yayınla</p>
                </div>
                <span className="text-2xl">f</span>
              </button>

              {/* Instagram Option */}
              <button
                onClick={() => togglePlatform('instagram')}
                className={`w-full p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                  selectedPlatforms.includes('instagram')
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-neutral-200 hover:border-pink-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes('instagram')}
                  onChange={() => {}}
                  className="w-5 h-5 rounded-md cursor-pointer accent-pink-600"
                />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-neutral-900">Instagram</p>
                  <p className="text-xs text-neutral-600">Instagram hesabına yayınla</p>
                </div>
                <span className="text-2xl">📷</span>
              </button>
            </div>

            {/* Details */}
            {selectedPlatforms.length > 0 && (
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold">Açıklama:</span>
                </p>
                <textarea
                  placeholder="Paylaş açıklaması ekleyin..."
                  className="w-full mt-2 p-3 border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none text-sm"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t-2 border-primary-100 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-neutral-300 text-neutral-700"
            >
              İptal
            </Button>
            <Button
              onClick={handleShare}
              disabled={selectedPlatforms.length === 0 || isUploading}
              className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Paylaş
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
