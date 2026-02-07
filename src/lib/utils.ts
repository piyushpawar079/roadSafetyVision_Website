// ===========================================
// UTILITY FUNCTIONS
// ===========================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | number | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | number | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getViolationTypeColor(type: string): string {
  const colors: Record<string, string> = {
    NO_HELMET: 'bg-orange-100 text-orange-800 border-orange-200',
    TRIPLE_RIDING: 'bg-red-100 text-red-800 border-red-200',
    SIGNAL_JUMP: 'bg-purple-100 text-purple-800 border-purple-200',
    ZEBRA_CROSSING: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
}

export function getPlateStatusColor(status: string): string {
  const colors: Record<string, string> = {
    VERIFIED: 'bg-green-100 text-green-800 border-green-200',
    MANUAL_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    UNIDENTIFIED: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PAID: 'bg-green-100 text-green-800 border-green-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}