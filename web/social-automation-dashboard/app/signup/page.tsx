'use client';

import { useState } from 'react';
import { Button, TextInput } from '@mantine/core';
import { IconMail, IconLock, IconUser, IconBrandFacebook } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Ad Soyad gereklidir';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Ad Soyad en az 2 karakter olmalıdır';
    }
    
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
      const response = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          rememberMe: true,
        }),
      });

      // Response'un boş olup olmadığını kontrol et
      const contentType = response.headers.get('content-type');
      let data: { user?: unknown; token?: string; message?: string; error?: { message?: string } } = {};
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const text = await response.text();
          if (text) {
            data = JSON.parse(text);
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          notifications.show({
            title: 'Hata',
            message: 'Sunucudan geçersiz yanıt alındı',
            color: 'red',
          });
          return;
        }
      } else {
        // JSON değilse text olarak al
        const text = await response.text();
        if (!response.ok) {
          notifications.show({
            title: 'Hata',
            message: text || 'Kayıt başarısız',
            color: 'red',
          });
          return;
        }
      }

      if (!response.ok) {
        // Better Auth hata formatı
        const errorMessage: string = typeof data?.message === 'string' 
          ? data.message 
          : typeof data?.error?.message === 'string'
          ? data.error.message
          : typeof data?.error === 'string'
          ? data.error
          : 'Kayıt başarısız';
        
        if (errorMessage.includes('email') || errorMessage.includes('Email') || errorMessage.includes('already exists')) {
          setErrors({ email: errorMessage.includes('already') ? 'Bu email adresi zaten kullanılıyor' : errorMessage });
        } else if (errorMessage.includes('password') || errorMessage.includes('Password')) {
          setErrors({ password: errorMessage });
        } else if (errorMessage.includes('name') || errorMessage.includes('Name')) {
          setErrors({ name: errorMessage });
        } else {
          notifications.show({
            title: 'Hata',
            message: errorMessage,
            color: 'red',
          });
        }
        return;
      }

      // Başarılı kayıt
      if (data.user || data.token) {
        notifications.show({
          title: 'Başarılı!',
          message: 'Hesabınız oluşturuldu',
          color: 'teal',
        });
        
        // Session'ın set olması için kısa bir bekleme
        await new Promise(resolve => setTimeout(resolve, 300));
        
        router.push('/dashboard');
        router.refresh();
      } else {
        notifications.show({
          title: 'Hata',
          message: 'Kayıt başarısız. Lütfen tekrar deneyin.',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      notifications.show({
        title: 'Hata',
        message: error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignup = () => {
    const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID || '';
    if (!fbAppId) {
      notifications.show({
        title: 'Hata',
        message: 'Facebook App ID yapılandırılmamış',
        color: 'red',
      });
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/callback/facebook`;
    const authUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email&response_type=code`;
    window.location.href = authUrl;
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kayıt Ol</h1>
            <p className="text-sm text-gray-600">Yeni hesap oluşturun</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <TextInput
                type="text"
                placeholder="Ad Soyad"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                error={errors.name}
                required
                leftSection={<IconUser size={18} className="text-gray-400" />}
                className="[&_.mantine-TextInput-input]:!rounded-xl [&_.mantine-TextInput-input]:!border-border [&_.mantine-TextInput-input]:focus:!border-primary-500 [&_.mantine-TextInput-input]:focus:!ring-2 [&_.mantine-TextInput-input]:focus:!ring-primary-200"
              />
            </div>

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
                minLength={6}
                leftSection={<IconLock size={18} className="text-gray-400" />}
                className="[&_.mantine-TextInput-input]:!rounded-xl [&_.mantine-TextInput-input]:!border-border [&_.mantine-TextInput-input]:focus:!border-primary-500 [&_.mantine-TextInput-input]:focus:!ring-2 [&_.mantine-TextInput-input]:focus:!ring-primary-200"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="!w-full !bg-gradient-to-r !from-primary-600 !to-purple-600 hover:!from-primary-700 hover:!to-purple-700 !text-white !font-medium !px-6 !py-2.5 !rounded-xl !m-0 !border-0 disabled:!opacity-50"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">veya</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Facebook Signup */}
          <Button
            onClick={handleFacebookSignup}
            disabled={loading}
            className="!w-full !bg-primary-600 hover:!bg-primary-700 !text-white !font-medium !px-6 !py-2.5 !rounded-xl !m-0 !border-0 disabled:!opacity-50"
            leftSection={<IconBrandFacebook size={18} />}
          >
            Facebook ile Kayıt Ol
          </Button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
