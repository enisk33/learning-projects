'use client';

import { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconBrandFacebook, 
  IconBrandInstagram, 
  IconCheck,
  IconPlus
} from '@tabler/icons-react';
import { MainLayout } from '@/app/components/Layout/MainLayout';
import { CreatePostModal } from '@/app/components/CreatePostModal';
import { ConnectAccountButton } from '@/app/components/ConnectAccountButton';


export default function DashboardPage() {
  const [createPostOpened, { open: openCreatePost, close: closeCreatePost }] = useDisclosure(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);


   
  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="p-8 max-w-7xl mx-auto pt-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-sm text-gray-600">Sosyal medya hesaplarınızı yönetin ve gönderilerinizi planlayın</p>
          </div>

          {/* Bağlı Hesaplar */}
          <div className="bg-background-card border border-border rounded-2xl shadow-sm mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light">
              <h2 className="text-base font-semibold text-gray-900">Bağlı Hesaplar</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {/* Facebook */}
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-background-hover transition-colors border border-border-light">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <IconBrandFacebook size={24} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Facebook</p>
                      <p className="text-xs text-gray-500">
                        {facebookConnected ? 'Bağlı' : 'Bağlı değil'}
                      </p>
                    </div>
                  </div>
                  {facebookConnected ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                      <IconCheck size={14} />
                      Bağlı
                    </div>
                  ) : (
                    <ConnectAccountButton provider="facebook" connected={false} />
                  )}
                </div>

                {/* Instagram */}
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-background-hover transition-colors border border-border-light">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-instagram flex items-center justify-center flex-shrink-0">
                      <IconBrandInstagram size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Instagram</p>
                      <p className="text-xs text-gray-500">
                        {instagramConnected ? 'Bağlı' : 'Bağlı değil'}
                      </p>
                    </div>
                  </div>
                  {instagramConnected ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                      <IconCheck size={14} />
                      Bağlı
                    </div>
                  ) : (
                    <ConnectAccountButton provider="instagram" connected={false} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={openCreatePost}
              className="bg-background-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer text-left p-6 hover:border-primary-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <IconPlus size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Yeni Gönderi</h3>
                  <p className="text-xs text-gray-500">Hemen yayınla veya planla</p>
                </div>
              </div>
            </button>

            <div className="bg-background-card border border-border rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <IconBrandFacebook size={28} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Planlanmış Gönderiler</h3>
                  <p className="text-xs text-gray-500">0 gönderi planlandı</p>
                </div>
              </div>
            </div>
          </div>

          {/* Son Gönderiler */}
          <div className="bg-background-card border border-border rounded-2xl shadow-sm">
            <div className="px-6 py-4 border-b border-border-light">
              <h2 className="text-base font-semibold text-gray-900">Son Gönderiler</h2>
            </div>
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500 mb-4">Henüz gönderi yok</p>
              <Button
                onClick={openCreatePost}
                className="!bg-transparent !text-primary-600 hover:!text-primary-700 hover:!bg-primary-50 !font-medium !px-4 !py-2 !m-0 !border-0"
              >
                İlk gönderinizi oluşturun
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal opened={createPostOpened} onClose={closeCreatePost} />
    </MainLayout>
  );
}
