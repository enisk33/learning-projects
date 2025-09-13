'use client';

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

interface MediaPreviewProps {
  media: Media | null;
  onShareClick: () => void;
  onMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

export function MediaPreview({ media, onShareClick, onMenuClick, isMobileMenuOpen }: MediaPreviewProps) {
  if (!media) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b-2 border-primary-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onMenuClick}
            className={`p-2 rounded-lg transition ${
              isMobileMenuOpen ? 'bg-primary-100' : 'hover:bg-neutral-100'
            }`}
          >
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-primary-900">Dashboard</span>
          <div className="w-10" />
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gradient-to-br from-neutral-50 to-white">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="bg-white border-2 border-primary-200 rounded-lg p-8 bg-gradient-to-br from-primary-50 to-accent-50">
              <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-primary-900">Hoşgeldiniz! 👋</h2>
                  <p className="text-neutral-600 mt-2">Sol taraftan bir medya seçerek başlayın veya yeni medya yükleyin.</p>
                </div>
                <div className="text-6xl hidden sm:block">📱</div>
              </div>
            </div>

            {/* Stats Section */}
            <div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">İstatistikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { icon: '🎬', label: 'Videolar', value: '24', color: 'from-primary-600 to-primary-700' },
                  { icon: '📷', label: 'Fotoğraflar', value: '156', color: 'from-accent-600 to-accent-700' },
                  { icon: '📤', label: 'Gönderilen', value: '180', color: 'from-blue-600 to-blue-700' },
                  { icon: '🔄', label: 'Aktif', value: '12', color: 'from-green-600 to-green-700' },
                ].map((stat, idx) => (
                  <Card key={idx} className="border-2 border-neutral-200 p-4 bg-white hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600 font-semibold">{stat.label}</p>
                        <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: '📤', title: 'Medya Yükle', desc: 'Yeni video veya fotoğraf yükleyin' },
                  { icon: '🚀', title: 'Toplu Paylaş', desc: 'Birden fazla medyayı paylaşın' },
                  { icon: '📊', title: 'Rapor Görüntüle', desc: 'Paylaşım istatistiklerini inceleyin' },
                ].map((action, idx) => (
                  <Card key={idx} className="border-2 border-primary-200 p-4 bg-white hover:border-accent-500 hover:shadow-md transition cursor-pointer">
                    <div className="text-4xl mb-2">{action.icon}</div>
                    <p className="font-bold text-primary-900">{action.title}</p>
                    <p className="text-sm text-neutral-600 mt-1">{action.desc}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Son Aktiviteler</h3>
              <Card className="border-2 border-primary-200 overflow-hidden">
                <div className="divide-y-2 divide-neutral-200">
                  {[
                    { icon: '✅', text: 'Video "Tatil2024.mp4" Facebook&apos;a gönderildi', time: '2 saat önce' },
                    { icon: '✅', text: 'Fotoğraf "Doğa.jpg" Facebook ve Instagram&apos;a gönderildi', time: '5 saat önce' },
                    { icon: '⚠️', text: 'Video "Proje.mov" Instagram&apos;a gönderilme başarısız', time: '1 gün önce' },
                    { icon: '✅', text: 'Fotoğraf "Portre.jpg" Facebook&apos;a gönderildi', time: '2 gün önce' },
                  ].map((activity, idx) => (
                    <div key={idx} className="p-4 hover:bg-neutral-50 transition">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-1">{activity.icon}</span>
                        <div className="flex-1">
                          <p className="text-neutral-900 font-medium">{activity.text}</p>
                          <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b-2 border-primary-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className={`p-2 rounded-lg transition ${
            isMobileMenuOpen ? 'bg-primary-100' : 'hover:bg-neutral-100'
          }`}
        >
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-primary-900">{media?.name || 'MediaHub'}</span>
        <div className="w-10" />
      </div>
      {/* Preview Area */}
      <div className="flex-1 p-6 sm:p-8 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="w-full max-w-2xl">
          <Card className="border-2 border-primary-200 overflow-hidden shadow-xl">
            {/* Media Display */}
            <div className="aspect-video bg-gradient-to-br from-primary-200 to-accent-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-9xl mb-4">{media.thumbnail}</div>
                <p className="text-2xl font-bold text-white drop-shadow-lg">{media.name}</p>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Dosya Bilgileri</p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600">Tür</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">
                      {media.type === 'video' ? '🎬 Video' : '📷 Fotoğraf'}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600">Boyut</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">{media.size}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-600">Tarih</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">{media.date}</p>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="pt-4 border-t-2 border-neutral-200">
                <p className="text-sm font-semibold text-neutral-900">Açıklama</p>
                <p className="text-neutral-700 mt-2 leading-relaxed">
                  Bu {media.type === 'video' ? 'video' : 'fotoğraf'} Facebook ve Instagram&apos;a gönderilebilir.
                  Paylaş butonuna tıklayarak hangi platformlara göndermek istediğinizi seçebilirsiniz.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t-2 border-neutral-200 bg-neutral-50 flex gap-3">
              <Button variant="outline" className="flex-1 border-primary-300 text-primary-700">
                <span className="mr-2">📥</span>
                İndir
              </Button>
              <Button
                onClick={onShareClick}
                className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white"
              >
                <span className="mr-2">🚀</span>
                Paylaş
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-white border-t-2 border-primary-100 px-6 sm:px-8 py-4">
        <div className="flex justify-between items-center max-w-2xl mx-auto text-sm">
          <div className="text-neutral-600">
            <span className="font-semibold text-primary-900">📊</span> Son güncelleme: {media.date}
          </div>
          <div className="text-neutral-600">
            <span className="font-semibold text-primary-900">💾</span> {media.size}
          </div>
        </div>
      </div>
    </div>
  );
}
