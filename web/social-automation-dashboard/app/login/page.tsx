'use client';

import { useState } from 'react';
import { Button, TextInput } from '@mantine/core';
import { IconMail, IconLock, IconBrandFacebook } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Geçerli bir email adresi girin';
    }
    
    if (!password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        notifications.show({
          title: 'Hata',
          message: 'Email veya şifre hatalı',
          color: 'red',
        });
        setErrors({ password: 'Email veya şifre hatalı' });
      } else if (result?.ok) {
        notifications.show({
          title: 'Başarılı!',
          message: 'Giriş yapıldı',
          color: 'teal',
        });
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      notifications.show({
        title: 'Hata',
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      await signIn('facebook', {
        callbackUrl: '/dashboard',
      });
    } catch (error) {
      console.error('Facebook login error:', error);
      notifications.show({
        title: 'Hata',
        message: 'Facebook ile giriş başarısız',
        color: 'red',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-background-card border border-border rounded-2xl shadow-lg p-8">
          {/* Logo ve Başlık */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-white font-bold text-xl">SM</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Giriş Yap</h1>
            <p className="text-sm text-gray-600">Hesabınıza giriş yapın</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <TextInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                error={errors.email}
                required
                leftSection={<IconMail size={18} className="text-gray-400" />}
                className="[&_.mantine-TextInput-input]:!rounded-xl [&_.mantine-TextInput-input]:!border-border [&_.mantine-TextInput-input]:focus:!border-primary-500 [&_.mantine-TextInput-input]:focus:!ring-2 [&_.mantine-TextInput-input]:focus:!ring-primary-200"
              />
            </div>

            <div>
              <TextInput
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                error={errors.password}
                required
                leftSection={<IconLock size={18} className="text-gray-400" />}
                className="[&_.mantine-TextInput-input]:!rounded-xl [&_.mantine-TextInput-input]:!border-border [&_.mantine-TextInput-input]:focus:!border-primary-500 [&_.mantine-TextInput-input]:focus:!ring-2 [&_.mantine-TextInput-input]:focus:!ring-primary-200"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="!w-full !bg-gradient-to-r !from-primary-600 !to-purple-600 hover:!from-primary-700 hover:!to-purple-700 !text-white !font-medium !px-6 !py-2.5 !rounded-xl !m-0 !border-0 disabled:!opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">veya</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Facebook Login */}
          <Button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="!w-full !bg-primary-600 hover:!bg-primary-700 !text-white !font-medium !px-6 !py-2.5 !rounded-xl !m-0 !border-0 disabled:!opacity-50"
            leftSection={<IconBrandFacebook size={18} />}
          >
            Facebook ile Giriş
          </Button>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
