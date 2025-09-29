'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { SessionProvider } from 'next-auth/react';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head />
      <body className="bg-background antialiased">
        <SessionProvider>
          <MantineProvider>
            <Notifications 
              position="top-right" 
              zIndex={1000}
            />
            {children}
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}