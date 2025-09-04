'use client';

import { Button } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';

interface ConnectAccountButtonProps {
  provider: 'facebook' | 'instagram';
  connected?: boolean;
}

export function ConnectAccountButton({ provider, connected }: ConnectAccountButtonProps) {
  const handleConnect = async () => {
    if (provider === 'facebook') {
      await signIn('facebook', {
        callbackUrl: '/dashboard',
      });
    }
    // Instagram için şimdilik Facebook OAuth kullanıyoruz (Instagram Business Account bağlantısı için)
  };

  const icon = provider === 'facebook' ? <IconBrandFacebook size={16} /> : <IconBrandInstagram size={16} />;
  const label = provider === 'facebook' ? 'Facebook' : 'Instagram';
  
  // Tailwind class'ları
  const buttonClasses = connected
    ? '!bg-transparent !text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !border !border-gray-200 !text-sm !font-semibold !px-5 !py-2.5 !rounded-lg !m-0'
    : provider === 'facebook'
    ? '!bg-primary-600 hover:!bg-primary-700 !text-white !text-sm !font-semibold !px-5 !py-2.5 !rounded-lg !shadow-sm hover:!shadow !transition-all !m-0 !border-0'
    : '!bg-gradient-instagram hover:!opacity-90 !text-white !text-sm !font-semibold !px-5 !py-2.5 !rounded-lg !shadow-sm hover:!shadow !transition-all !m-0 !border-0';

  return (
    <Button
      onClick={handleConnect}
      disabled={connected}
      leftSection={icon}
      className={buttonClasses}
    >
      {connected ? `${label} Bağlı` : `${label} Bağla`}
    </Button>
  );
}
