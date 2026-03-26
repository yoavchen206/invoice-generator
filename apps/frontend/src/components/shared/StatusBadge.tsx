import type { InvoiceStatus } from '@yoavchu/shared';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={status}>
      {status === 'paid' ? 'Paid' : status === 'unpaid' ? 'Unpaid' : 'Overdue'}
    </Badge>
  );
}
