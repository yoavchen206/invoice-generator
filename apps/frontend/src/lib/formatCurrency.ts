const formatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return formatter.format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `₪${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₪${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}
