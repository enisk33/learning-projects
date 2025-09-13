'use client';

import { Card } from '@/components/ui/card';

export function DashboardStats() {
  const stats = [
    { icon: '🎬', label: 'Toplam Video', value: '24', color: 'from-primary-600 to-primary-700' },
    { icon: '📷', label: 'Toplam Fotoğraf', value: '156', color: 'from-accent-600 to-accent-700' },
    { icon: '📤', label: 'Gönderilen', value: '180', color: 'from-blue-600 to-blue-700' },
    { icon: '❌', label: 'Başarısız', value: '2', color: 'from-red-600 to-red-700' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-2 border-neutral-200 hover:border-primary-300 transition p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-600 font-semibold">{stat.label}</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function RecentActivity() {
  const activities = [
    { type: 'upload', title: 'Eğlenceli Anlar', platform: 'Facebook', time: '2 dakika önce' },
    { type: 'upload', title: 'Tatil Vlogu', platform: 'Instagram', time: '1 saat önce' },
    { type: 'error', title: 'Müzik Klibim', platform: 'Facebook', time: '3 saat önce' },
    { type: 'upload', title: 'Doğa Fotoğrafları', platform: 'Facebook, Instagram', time: '6 saat önce' },
  ];

  return (
    <Card className="border-2 border-primary-200 overflow-hidden">
      <div className="p-6 border-b-2 border-primary-100 bg-gradient-to-r from-primary-50 to-accent-50">
        <h3 className="text-xl font-bold text-primary-900">Son Aktiviteler</h3>
      </div>
      <div className="divide-y-2 divide-neutral-200">
        {activities.map((activity, index) => (
          <div key={index} className="p-4 hover:bg-neutral-50 transition">
            <div className="flex items-start gap-4">
              <div className="text-2xl">
                {activity.type === 'upload' ? '✅' : '❌'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900">{activity.title}</p>
                <p className="text-sm text-neutral-600">
                  {activity.platform} • {activity.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
