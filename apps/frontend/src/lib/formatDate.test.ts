import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, todayISO } from './formatDate';

describe('formatDate', () => {
  it('should return em dash for null/undefined', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('should format a valid ISO date', () => {
    expect(formatDate('2026-03-15')).toBe('Mar 15, 2026');
  });

  it('should return em dash for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });
});

describe('formatDateShort', () => {
  it('should format without year', () => {
    expect(formatDateShort('2026-03-15')).toBe('Mar 15');
  });
});

describe('todayISO', () => {
  it('should return a string in YYYY-MM-DD format', () => {
    const today = todayISO();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
