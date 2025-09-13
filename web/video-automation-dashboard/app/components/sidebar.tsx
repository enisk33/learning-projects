'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Media {
  id: string;
  type: 'video' | 'photo';
  name: string;
  thumbnail: string;
  size: string;
  date: string;
}

interface SidebarProps {
  onMediaSelect: (media: Media) => void;
  selectedMedia: Media | null;
}

const MOCK_MEDIA: Media[] = [
  { id: '1', type: 'video', name: 'Eğlenceli Anlar', thumbnail: '🎬', size: '125 MB', date: 'Bugün' },
  { id: '2', type: 'video', name: 'Tatil Vlogu', thumbnail: '✈️', size: '89 MB', date: 'Dün' },
  { id: '3', type: 'photo', name: 'Doğa Fotoğrafları', thumbnail: '🌄', size: '12 MB', date: '2 gün önce' },
  { id: '4', type: 'photo', name: 'Şehir Manzarası', thumbnail: '🏙️', size: '8 MB', date: '3 gün önce' },
  { id: '5', type: 'video', name: 'Müzik Klibim', thumbnail: '🎵', size: '156 MB', date: '1 hafta önce' },
  { id: '6', type: 'photo', name: 'Aile Anıları', thumbnail: '👨‍👩‍👧‍👦', size: '15 MB', date: '2 hafta önce' },
];

export function Sidebar({ onMediaSelect, selectedMedia }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'photos'>('all');

  const filteredMedia = MOCK_MEDIA.filter(media => {
    if (activeTab === 'all') return true;
    if (activeTab === 'videos') return media.type === 'video';
    if (activeTab === 'photos') return media.type === 'photo';
    return true;
  });

  return (
    <div className="w-full lg:w-80 bg-white border-r-2 border-primary-100 flex flex-col h-screen lg:h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b-2 border-primary-100">
        <h2 className="text-xl font-bold text-primary-900 mb-4">Medya Kütüphanesi</h2>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['all', 'videos', 'photos'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {tab === 'all' && '📁 Tümü'}
              {tab === 'videos' && '🎬 Videolar'}
              {tab === 'photos' && '📷 Fotoğraflar'}
            </button>
          ))}
        </div>
      </div>

      {/* Media List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {filteredMedia.map(media => (
          <button
            key={media.id}
            onClick={() => onMediaSelect(media)}
            className={`w-full p-3 rounded-lg border-2 transition group ${
              selectedMedia?.id === media.id
                ? 'border-accent-500 bg-accent-50'
                : 'border-neutral-200 hover:border-primary-300 bg-neutral-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-xl flex-shrink-0">
                {media.thumbnail}
              </div>

              {/* Info */}
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 truncate text-sm group-hover:text-primary-600">
                  {media.name}
                </p>
                <p className="text-xs text-neutral-500">{media.size}</p>
                <p className="text-xs text-neutral-400">{media.date}</p>
              </div>

              {/* Type Icon */}
              <div className="text-sm flex-shrink-0">
                {media.type === 'video' ? '🎬' : '📷'}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Upload Button */}
      <div className="p-4 sm:p-6 border-t-2 border-primary-100">
        <Button className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold py-3 h-auto">
          <span className="text-lg mr-2">➕</span>
          Yeni Medya Yükle
        </Button>
      </div>
    </div>
  );
}
