import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/shared/Skeleton';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/cn';

interface MetricCardProps {
  label: string;
  value: number | string;
  isCurrency?: boolean;
  variant?: 'primary' | 'default';
  onClick?: () => void;
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  isCurrency = true,
  variant = 'default',
  onClick,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
      </Card>
    );
  }

  const displayValue = isCurrency && typeof value === 'number'
    ? formatCurrency(value)
    : String(value);

  return (
    <Card
      className={cn(
        'p-5 space-y-2',
        onClick && 'cursor-pointer hover:border-border-focus transition-colors'
      )}
      onClick={onClick}
    >
      <p className="text-label uppercase tracking-[0.06em] text-text-secondary">{label}</p>
      <p
        className={cn(
          'text-h1 font-bold tabular-nums',
          variant === 'primary' ? 'text-accent-primary' : 'text-text-primary'
        )}
      >
        {displayValue}
      </p>
    </Card>
  );
}
