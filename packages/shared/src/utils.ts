export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return formatDate(date);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateTableToken(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let token = '';
  for (let i = 0; i < 7; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function getCustomerBaseUrl(): string {
  const envUrl =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CUSTOMER_APP_URL) ||
    (typeof process !== 'undefined' && (process as any).env?.VITE_CUSTOMER_APP_URL);
  if (envUrl) return envUrl.replace(/\/+$/, '');

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes(':3000')) {
      return origin.replace(':3000', ':3001');
    }
    return origin;
  }

  return 'http://localhost:3001';
}

export function buildPublicRestaurantUrl(restaurantSlug: string): string {
  return `${getCustomerBaseUrl()}/r/${restaurantSlug}`;
}

export function buildPublicTableUrl(restaurantSlug: string, tableToken: string): string {
  return `${getCustomerBaseUrl()}/r/${restaurantSlug}/t/${tableToken}`;
}

export function buildQRCodeUrl(restaurantSlug: string, tableToken: string): string {
  return buildPublicTableUrl(restaurantSlug, tableToken);
}

export function buildMenuUrl(restaurantSlug: string, tableToken: string): string {
  return `/r/${restaurantSlug}/t/${tableToken}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
