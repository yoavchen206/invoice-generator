import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyCompact } from './formatCurrency';

describe('formatCurrency', () => {
  it('should format zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('should format a positive amount with ILS symbol', () => {
    const result = formatCurrency(1000);
    expect(result).toMatch(/[₪\u20AA]/);
    expect(result).toContain('1');
  });

  it('should format decimals', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1');
  });
});

describe('formatCurrencyCompact', () => {
  it('should format large amounts with K suffix', () => {
    const result = formatCurrencyCompact(5000);
    expect(result).toContain('K');
  });

  it('should format millions with M suffix', () => {
    const result = formatCurrencyCompact(1_500_000);
    expect(result).toContain('M');
  });

  it('should use regular format for small amounts', () => {
    const result = formatCurrencyCompact(500);
    expect(result).not.toContain('K');
    expect(result).not.toContain('M');
  });
});
