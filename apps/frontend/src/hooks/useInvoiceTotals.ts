import { useMemo } from 'react';

interface LineItemInput {
  quantity: string | number;
  unitPrice: string | number;
}

const TAX_RATE = 0.17;

export function useInvoiceTotals(lineItems: LineItemInput[]) {
  return useMemo(() => {
    const itemTotals = lineItems.map((item) => {
      const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity;
      const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice;
      return qty * price;
    });

    const subtotal = itemTotals.reduce((sum, t) => sum + t, 0);
    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = subtotal + taxAmount;

    return {
      itemTotals,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount,
      taxRate: TAX_RATE,
      total: Math.round(total * 100) / 100,
    };
  }, [lineItems]);
}
