import { Link } from 'react-router-dom';
import type { Invoice } from '@yoavchu/shared';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatDate } from '@/lib/formatDate';

interface InvoiceCardProps {
  invoice: Invoice;
  compact?: boolean;
}

export function InvoiceCard({ invoice, compact = false }: InvoiceCardProps) {
  return (
    <Link
      to={`/invoices/${invoice.id}`}
      className="block px-4 py-3.5 hover:bg-bg-elevated transition-colors cursor-pointer border-b border-border-default last:border-0"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {!compact && (
              <span className="text-caption text-text-muted tabular-nums">#{invoice.invoiceNumber}</span>
            )}
            <span className="text-body font-medium text-text-primary truncate">
              {invoice.client.name}
            </span>
          </div>
          <span className="text-body-sm text-text-secondary">
            {formatDate(invoice.issueDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={invoice.status} />
          <span className="text-body font-semibold text-text-primary tabular-nums">
            {formatCurrency(invoice.total)}
          </span>
        </div>
      </div>
    </Link>
  );
}
