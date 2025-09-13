'use client';

import { useState } from 'react';
import { Navbar } from '@/app/components/navbar';
import { Sidebar } from '@/app/components/sidebar';
import { MediaPreview } from '@/app/components/media-preview';
import { ShareModal } from '@/app/components/share-modal';

interface Media {
  id: string;
  type: 'video' | 'photo';
  name: string;
  thumbnail: string;
  size: string;
  date: string;
}

export default function Home() {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Hidden on mobile, shown on lg screens */}
        <div className="hidden lg:flex w-80 flex-shrink-0 border-r-2 border-primary-100">
          <Sidebar
            onMediaSelect={setSelectedMedia}
            selectedMedia={selectedMedia}
          />
        </div>

        {/* Mobile Sidebar - Full screen overlay on small devices */}
        {isSidebarOpen && (
          <>
            <div
              className="lg:hidden absolute inset-0 bg-black/50 z-30"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="lg:hidden absolute left-0 top-0 bottom-0 w-80 bg-white z-40 overflow-y-auto">
              <Sidebar
                onMediaSelect={(media) => {
                  setSelectedMedia(media);
                  setIsSidebarOpen(false);
                }}
                selectedMedia={selectedMedia}
              />
            </div>
          </>
        )}

        {/* Media Preview */}
        <MediaPreview
          media={selectedMedia}
          onShareClick={() => setIsShareModalOpen(true)}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isSidebarOpen}
        />
      </div>

      {/* Share Modal */}
      <ShareModal
        media={selectedMedia}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
