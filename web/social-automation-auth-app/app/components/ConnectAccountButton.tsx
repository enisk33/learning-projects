'use client';

import { Button } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTiktok, IconLogout } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

interface ConnectAccountButtonProps {
  provider: 'facebook' | 'instagram' | 'tiktok';
  connected?: boolean;
  onDisconnect?: () => void;
}

export function ConnectAccountButton({ provider, connected, onDisconnect }: ConnectAccountButtonProps) {
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = async () => {
    // Facebook ve Instagram için NextAuth kullanılıyor
    // TikTok için manuel OAuth flow kullanılıyor (NextAuth v5 uyumsuzluğu nedeniyle)
    if (provider === 'facebook') {
      await signIn('facebook', {
        callbackUrl: '/dashboard',
      });
    } else if (provider === 'instagram') {
      await signIn('instagram', {
        callbackUrl: '/dashboard',
      });
    } else if (provider === 'tiktok') {
      // TikTok için manuel OAuth route'a yönlendir
      window.location.href = '/api/auth/tiktok';
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const response = await fetch(`/api/auth/${provider}/disconnect`, {
        method: 'POST',
      });
      
      if (response.ok) {
        onDisconnect?.();
      } else {
        console.error('Çıkış yapılamadı');
      }
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      setDisconnecting(false);
    }
  };

  const icon = 
    provider === 'facebook' ? <IconBrandFacebook size={16} /> : 
    provider === 'instagram' ? <IconBrandInstagram size={16} /> : 
    <IconBrandTiktok size={16} />;
  
  const label = 
    provider === 'facebook' ? 'Facebook' : 
    provider === 'instagram' ? 'Instagram' : 
    'TikTok';
  
  // Bağlı durumunda "Çıkış Yap" kırmızı butonu göster
  if (connected) {
    return (
      <Button
        onClick={handleDisconnect}
        loading={disconnecting}
        leftSection={<IconLogout size={16} />}
        className="!bg-red-500 hover:!bg-red-600 !text-white !text-sm !font-semibold !px-4 !py-2 !rounded-lg !shadow-sm hover:!shadow !transition-all !m-0 !border-0"
      >
        Çıkış Yap
      </Button>
    );
  }

  // Bağlı değilken "Bağla" butonu göster
  const buttonClasses = provider === 'facebook'
    ? '!bg-primary-600 hover:!bg-primary-700 !text-white !text-sm !font-semibold !px-5 !py-2.5 !rounded-lg !shadow-sm hover:!shadow !transition-all !m-0 !border-0'
    : provider === 'instagram'
    ? '!bg-gradient-instagram hover:!opacity-90 !text-white !text-sm !font-semibold !px-5 !py-2.5 !rounded-lg !shadow-sm hover:!shadow !transition-all !m-0 !border-0'
    : '!bg-black hover:!bg-gray-900 !text-white !text-sm !font-semibold !px-5 !py-2.5 !rounded-lg !shadow-sm hover:!shadow !transition-all !m-0 !border-0';

  return (
    <Button
      onClick={handleConnect}
      leftSection={icon}
      className={buttonClasses}
    >
      {label} Bağla
    </Button>
  );
}
