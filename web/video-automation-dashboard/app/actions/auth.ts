'use server';

import { loginSchema, registerSchema } from '@/lib/validations';
import { z } from 'zod';

export async function loginAction(data: unknown) {
  try {
    const validatedData = loginSchema.parse(data);

    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock response
    return {
      success: true,
      message: 'Başarıyla giriş yapıldı',
      user: {
        id: '1',
        email: validatedData.email,
        name: 'Kullanıcı',
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      message: 'Bir hata oluştu',
    };
  }
}

export async function registerAction(data: unknown) {
  try {
    const validatedData = registerSchema.parse(data);

    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock response
    return {
      success: true,
      message: 'Başarıyla kayıt olundu',
      user: {
        id: '1',
        email: validatedData.email,
        name: validatedData.name,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      message: 'Bir hata oluştu',
    };
  }
}
