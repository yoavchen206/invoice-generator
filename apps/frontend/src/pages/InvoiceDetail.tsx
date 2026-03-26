import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy } from 'lucide-react';
import { useInvoice } from '@/api/invoices';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatDate } from '@/lib/formatDate';

export function InvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading, error } = useInvoice(invoiceId || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base px-4 py-4">
        <Skeleton className="h-6 w-24 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-bg-base px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Invoices
        </button>
        <div className="rounded-lg bg-color-error-bg border border-color-error p-4">
          <p className="text-body-sm text-color-error">Invoice not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-base border-b border-border-default px-4 h-14 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Invoices
        </button>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Invoice Header Card */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-caption text-text-muted mb-1">Invoice</p>
                <h1 className="text-h1 font-bold text-text-primary tabular-nums">
                  #{invoice.invoiceNumber}
                </h1>
              </div>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-text-muted mb-0.5">Issued</p>
                <p className="text-body text-text-primary">{formatDate(invoice.issueDate)}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <p className="text-caption text-text-muted mb-0.5">Due</p>
                  <p className="text-body text-text-primary">{formatDate(invoice.dueDate)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-body-sm uppercase tracking-wider text-text-secondary">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body font-semibold text-text-primary">{invoice.client.name}</p>
            {invoice.client.businessName && (
              <p className="text-body-sm text-text-secondary">{invoice.client.businessName}</p>
            )}
            {invoice.client.email && (
              <p className="text-body-sm text-text-secondary mt-1">{invoice.client.email}</p>
            )}
            {invoice.client.address && (
              <p className="text-body-sm text-text-muted mt-1">{invoice.client.address}</p>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-body-sm uppercase tracking-wider text-text-secondary">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoice.lineItems.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-text-primary">{item.description}</p>
                    <p className="text-body-sm text-text-secondary">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-body font-medium text-text-primary tabular-nums flex-shrink-0">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-border-default space-y-2">
              <div className="flex justify-between text-body-sm text-text-secondary">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-sm text-text-secondary">
                <span>Tax ({Math.round(invoice.taxRate * 100)}%)</span>
                <span className="tabular-nums">{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-body font-bold text-accent-primary pt-1">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigate('/invoices/create', { state: { duplicateFrom: invoice } })}
        >
          <Copy className="h-4 w-4" />
          Duplicate Invoice
        </Button>
      </div>
    </div>
  );
}
