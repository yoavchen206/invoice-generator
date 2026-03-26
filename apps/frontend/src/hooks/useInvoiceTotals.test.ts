import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInvoiceTotals } from './useInvoiceTotals';

describe('useInvoiceTotals', () => {
  it('should calculate zero totals for empty items', () => {
    const { result } = renderHook(() => useInvoiceTotals([]));
    expect(result.current.subtotal).toBe(0);
    expect(result.current.taxAmount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('should calculate correct totals for one item', () => {
    const { result } = renderHook(() =>
      useInvoiceTotals([{ quantity: 2, unitPrice: 500 }])
    );
    expect(result.current.subtotal).toBe(1000);
    expect(result.current.taxAmount).toBe(170);
    expect(result.current.total).toBe(1170);
  });

  it('should calculate correct totals for multiple items', () => {
    const { result } = renderHook(() =>
      useInvoiceTotals([
        { quantity: 1, unitPrice: 3500 },
        { quantity: 2, unitPrice: 350 },
      ])
    );
    expect(result.current.subtotal).toBe(4200);
    expect(result.current.taxAmount).toBe(714);
    expect(result.current.total).toBe(4914);
  });

  it('should handle string inputs', () => {
    const { result } = renderHook(() =>
      useInvoiceTotals([{ quantity: '2', unitPrice: '1000' }])
    );
    expect(result.current.subtotal).toBe(2000);
    expect(result.current.total).toBe(2340);
  });

  it('should handle zero/invalid inputs gracefully', () => {
    const { result } = renderHook(() =>
      useInvoiceTotals([{ quantity: '', unitPrice: '' }])
    );
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('should return correct item totals array', () => {
    const { result } = renderHook(() =>
      useInvoiceTotals([
        { quantity: 3, unitPrice: 100 },
        { quantity: 2, unitPrice: 200 },
      ])
    );
    expect(result.current.itemTotals).toEqual([300, 400]);
  });

  it('should set correct tax rate', () => {
    const { result } = renderHook(() =>
      useInvoiceTotals([{ quantity: 1, unitPrice: 100 }])
    );
    expect(result.current.taxRate).toBe(0.17);
  });
});
