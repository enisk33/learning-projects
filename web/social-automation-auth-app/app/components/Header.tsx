"use client";

import Image from 'next/image';
import { Button } from '@mantine/core';
import { IconUser, IconLogout } from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Çıkış hatası:', error);
      router.push('/login');
      router.refresh();
    }
  };

  // Login ve signup sayfalarında header gösterme
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  if (status === 'loading') {
    return (
      <header className="fixed top-0 right-0 left-16 h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 z-40">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      </header>
    );
  }

  return (
    <header className="fixed top-0 right-0 left-16 h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 z-40">
      {session?.user ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'Kullanıcı'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <IconUser size={18} className="text-primary-600" />
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {session.user.name || session.user.email}
            </span>
          </div>
          <Button
            onClick={handleLogout}
            className="!bg-transparent !text-gray-600 hover:!text-gray-900 hover:!bg-gray-100 !px-3 !py-1.5 !text-sm !m-0 !border-0"
          >
            <IconLogout size={16} className="mr-1.5" />
            Çıkış
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/login')}
            className="!bg-transparent !text-gray-700 hover:!text-gray-900 hover:!bg-gray-100 !px-4 !py-2 !text-sm !font-medium !m-0 !border-0"
          >
            Giriş Yap
          </Button>
          <Button
            onClick={() => router.push('/signup')}
            className="!bg-primary-600 hover:!bg-primary-700 !text-white !px-4 !py-2 !text-sm !font-medium !rounded-lg !m-0 !border-0"
          >
            Kayıt Ol
          </Button>
        </div>
      )}
    </header>
  );
}
