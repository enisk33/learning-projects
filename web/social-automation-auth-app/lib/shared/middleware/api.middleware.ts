/**
 * API Middleware
 * Auth, error handling, rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { AuthenticationError, formatErrorResponse } from '@/lib/errors/app-errors';
import { logger } from '@/lib/utils/logger';
import { getRateLimitKey, apiRateLimiter } from '@/lib/middleware/rate-limit';

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  userEmail?: string;
}

/**
 * Auth middleware - Session kontrolü yapar
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.userId = session.user.id;
    authenticatedReq.userEmail = session.user.email || undefined;

    return await handler(authenticatedReq);
  } catch (error) {
    logger.error('Auth middleware hatası', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.code === 'AUTHENTICATION_ERROR' ? 401 : 500 }
    );
  }
}

/**
 * Rate limiting middleware
 */
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  limitType: 'api' | 'auth' | 'upload' = 'api'
): Promise<NextResponse> {
  const limiter = apiRateLimiter; // Şimdilik hepsi aynı limiter

  const identifier = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
  const key = getRateLimitKey(identifier, limitType);
  
  const { allowed, remaining, resetTime } = limiter.check(key);

  if (!allowed) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return await handler(req);
}

/**
 * Error handling wrapper
 */
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error('API route hatası', error, {
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      const errorResponse = formatErrorResponse(error);
      const statusCode = 
        errorResponse.code === 'VALIDATION_ERROR' ? 400 :
        errorResponse.code === 'AUTHENTICATION_ERROR' ? 401 :
        errorResponse.code === 'AUTHORIZATION_ERROR' ? 403 :
        errorResponse.code === 'NOT_FOUND' ? 404 :
        errorResponse.code === 'CONFLICT_ERROR' ? 409 :
        500;

      return NextResponse.json(errorResponse, { status: statusCode });
    }
  };
}
