/**
 * Security Utilities
 * Güvenlik yardımcı fonksiyonları
 */

import crypto from 'crypto';

/**
 * Input sanitization - XSS koruması
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML tag'lerini kaldır
    .trim()
    .slice(0, 10000); // Maksimum uzunluk
}

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password strength check
 */
export function isStrongPassword(password: string): boolean {
  // En az 6 karakter, bir büyük harf, bir küçük harf, bir rakam
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    password.length >= minLength &&
    (hasUpperCase || hasLowerCase) &&
    hasNumber
  );
}

/**
 * File type validation
 */
export function isValidFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(crypto.randomInt(0, chars.length));
  }
  
  return result;
}
