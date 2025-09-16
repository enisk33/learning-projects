import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email gerekli')
    .email('Geçerli bir email girin'),
  password: z
    .string()
    .min(1, 'Şifre gerekli')
    .min(6, 'Şifre en az 6 karakter olmalı'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Ad Soyad gerekli')
      .min(3, 'Ad en az 3 karakter olmalı'),
    email: z
      .string()
      .min(1, 'Email gerekli')
      .email('Geçerli bir email girin'),
    password: z
      .string()
      .min(1, 'Şifre gerekli')
      .min(6, 'Şifre en az 6 karakter olmalı'),
    confirmPassword: z.string().min(1, 'Şifre doğrulama gerekli'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const videoUploadSchema = z.object({
  title: z
    .string()
    .min(1, 'Başlık gerekli')
    .min(3, 'Başlık en az 3 karakter olmalı')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z
    .string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional(),
  platforms: z
    .array(z.enum(['facebook', 'instagram']))
    .min(1, 'En az bir platform seçin'),
  videoUrl: z
    .string()
    .min(1, 'Video URL gerekli')
    .url('Geçerli bir URL girin'),
});

export type VideoUploadData = z.infer<typeof videoUploadSchema>;
