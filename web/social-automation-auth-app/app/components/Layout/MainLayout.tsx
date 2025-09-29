'use client';

import { Sidebar } from './Sidebar';
import { Header } from '../Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
