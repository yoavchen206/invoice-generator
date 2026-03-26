import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr: string | undefined | null, pattern = 'MMM d, yyyy'): string {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    return format(date, pattern);
  } catch {
    return '—';
  }
}

export function formatDateShort(dateStr: string | undefined | null): string {
  return formatDate(dateStr, 'MMM d');
}

export function formatDateInput(dateStr: string | undefined | null): string {
  return formatDate(dateStr, 'yyyy-MM-dd');
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return toISODate(new Date());
}
