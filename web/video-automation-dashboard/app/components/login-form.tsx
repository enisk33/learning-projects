'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginAction } from '@/app/actions/auth';
import { toast } from 'sonner';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold h-10"
    >
      {pending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
    </Button>
  );
}

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setFormError(null);

    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const result = await loginAction(data);

    if (result.success) {
      toast.success(result.message);
      // Redirect would happen here
    } else if (result.errors) {
      const errorMessages = Object.entries(result.errors)
        .map(([field, messages]: [string, unknown]) => {
          const msgs = messages as string[] | undefined;
          return `${field}: ${msgs?.join(', ') || 'Bilinmeyen hata'}`;
        })
        .join('\n');
      setFormError(errorMessages);
      toast.error('Forma hata var, kontrol et');
    } else {
      setFormError(result.message || 'Bir hata oluştu');
      toast.error(result.message || 'Bir hata oluştu');
    }
  }

  return (
    <Card className="border-2 border-primary-200 shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-primary-600">Giriş Yap</CardTitle>
        <CardDescription>
          Hesabınıza giriş yaparak videoları paylaşmaya başlayın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="ornek@email.com"
              required
              className="border-2 border-neutral-300 focus:border-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Şifre</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••"
              required
              className="border-2 border-neutral-300 focus:border-primary-500"
            />
          </div>

          <SubmitButton />

          <div className="text-center text-sm text-neutral-600">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Kayıt Ol
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
