'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#071026]/80 backdrop-blur-md border-b border-border">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-xl font-bold">📱</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:inline group-hover:text-accent-500 transition">
              MediaHub
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-neutral-600 dark:text-neutral-300">
              Nasıl Çalışır
            </Button>
            <Button variant="ghost" className="text-neutral-600 dark:text-neutral-300">
              Fiyatlandırma
            </Button>
            <Button variant="ghost" className="text-neutral-600 dark:text-neutral-300">
              Destek
            </Button>
            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn('p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800')}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-neutral-700" />}
              </button>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-primary-300 text-primary-700 hover:bg-primary-50"
                >
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="md:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-neutral-700" />}
            </button>
            <button
              className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4 border-border">
            <Button variant="ghost" className="w-full justify-start text-neutral-700 dark:text-neutral-300">
              Nasıl Çalışır
            </Button>
            <Button variant="ghost" className="w-full justify-start text-neutral-700 dark:text-neutral-300">
              Fiyatlandırma
            </Button>
            <Button variant="ghost" className="w-full justify-start text-neutral-700 dark:text-neutral-300">
              Destek
            </Button>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full border-primary-300 text-primary-700">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
