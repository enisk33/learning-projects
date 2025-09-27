/**
 * Custom Error Classes
 * Uygulama genelinde tutarlı hata yönetimi için
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Giriş yapmanız gerekiyor') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Bu işlem için yetkiniz yok') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Kayıt') {
    super(`${resource} bulunamadı`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR', 409);
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string,
    public readonly originalError?: unknown
  ) {
    super(`${service} hatası: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public readonly originalError?: unknown) {
    super(`Veritabanı hatası: ${message}`, 'DATABASE_ERROR', 500);
  }
}

export class TokenError extends AppError {
  constructor(message: string = 'Token geçersiz veya süresi dolmuş') {
    super(message, 'TOKEN_ERROR', 401);
  }
}

/**
 * Error'ı user-friendly mesaja çevir
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    // Production'da generic mesaj, development'da detaylı
    if (process.env.NODE_ENV === 'production') {
      return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
    }
    return error.message;
  }
  
  return 'Bilinmeyen bir hata oluştu.';
}

/**
 * Error'ı API response formatına çevir
 */
export function formatErrorResponse(error: unknown): {
  success: false;
  error: string;
  code?: string;
} {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
  
  return {
    success: false,
    error: getErrorMessage(error),
  };
}
