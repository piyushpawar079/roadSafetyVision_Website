// ===========================================
// GENERAL UTILITY FUNCTIONS
// ===========================================

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get current timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format time to HH:MM:SS
 */
export function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0];
}

/**
 * Check if an OTP is expired (valid for 10 minutes)
 */
export function isOTPExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Get OTP expiry time (10 minutes from now)
 */
export function getOTPExpiry(): number {
  return Date.now() + 10 * 60 * 1000; // 10 minutes
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}