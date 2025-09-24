/**
 * Register API Route
 * Refactored with service layer and validation
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userRepository } from '@/lib/repositories/user-repository';
import { registerSchema } from '@/lib/validations/auth-schemas';
import { formatErrorResponse } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Input validation
    const validated = registerSchema.parse(body);

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Kullanıcıyı repository ile oluştur
    const userId = await userRepository.create({
      email: validated.email,
      password: hashedPassword,
      name: validated.name || null,
    });

    logger.info('Kullanıcı kaydı başarılı', { userId, email: validated.email });

    return NextResponse.json(
      { id: userId, email: validated.email },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Register API hatası', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.code === 'VALIDATION_ERROR' ? 400 : errorResponse.code === 'CONFLICT_ERROR' ? 409 : 500 }
    );
  }
}
