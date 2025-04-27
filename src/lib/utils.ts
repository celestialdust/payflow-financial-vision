
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

export function getPaymentStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'fully paid':
      return 'bg-status-paid';
    case 'partially paid':
      return 'bg-status-partial';
    case 'unpaid':
      return 'bg-status-unpaid';
    case 'overpaid':
      return 'bg-status-overpaid';
    default:
      return 'bg-gray-500';
  }
}

export function getPaymentStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'fully paid':
      return 'status-badge status-badge-paid';
    case 'partially paid':
      return 'status-badge status-badge-partial';
    case 'unpaid':
      return 'status-badge status-badge-unpaid';
    case 'overpaid':
      return 'status-badge status-badge-overpaid';
    default:
      return 'status-badge';
  }
}
