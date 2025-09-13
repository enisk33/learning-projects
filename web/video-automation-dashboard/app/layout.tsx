import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ThemeProviderWrapper from './components/theme-provider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MediaHub - Video & Foto Paylaşım Platformu",
  description: "Facebook ve Instagram'a kolayca video ve fotoğraf yükleyin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} antialiased`}>
        <ThemeProviderWrapper>
          <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 dark:from-[#071026] dark:to-[#07161a]">
            {children}
            <Toaster />
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
