import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useInvoices } from '@/api/invoices';
import { useClients } from '@/api/clients';
import { useUIStore } from '@/store/ui.store';
import { InvoiceCard } from '@/components/invoice/InvoiceCard';
import { FilterChips } from '@/components/shared/FilterChips';
import { EmptyState } from '@/components/shared/EmptyState';
import { InvoiceRowSkeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InvoiceStatus, PeriodFilter } from '@yoavchu/shared';
import { useEffect } from 'react';

const statusChips = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
];

const periodOptions = [
  { value: '', label: 'All Time' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_12_months', label: 'Last 12 Months' },
];

export function InvoiceList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    invoiceStatusFilter,
    invoiceClientFilter,
    invoicePeriodFilter,
    setInvoiceStatusFilter,
    setInvoiceClientFilter,
    setInvoicePeriodFilter,
    clearInvoiceFilters,
  } = useUIStore();

  // Support URL-based filter initialization
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setInvoiceStatusFilter(status as InvoiceStatus | 'all');
    }
  }, []);

  const { data, isLoading, error } = useInvoices({
    status: invoiceStatusFilter,
    clientId: invoiceClientFilter,
    period: invoicePeriodFilter,
    limit: 25,
  });

  const { data: clientsData } = useClients({ limit: 200 });

  const hasActiveFilters = invoiceStatusFilter !== 'all' || invoiceClientFilter || invoicePeriodFilter;

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-base border-b border-border-default">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-h2 font-semibold text-text-primary">Invoices</h1>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/invoices/create')}
            className="hidden md:flex"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>

        {/* Status Filter Chips */}
        <div className="px-4 py-2 overflow-x-auto">
          <FilterChips
            chips={statusChips}
            value={invoiceStatusFilter}
            onChange={(v) => setInvoiceStatusFilter(v as InvoiceStatus | 'all')}
          />
        </div>

        {/* Secondary Filters */}
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          <Select
            value={invoiceClientFilter || 'all'}
            onValueChange={(v) => setInvoiceClientFilter(v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="h-9 w-40 text-body-sm">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clientsData?.clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={invoicePeriodFilter || ''}
            onValueChange={(v) => setInvoicePeriodFilter(v ? v as PeriodFilter : undefined)}
          >
            <SelectTrigger className="h-9 w-40 text-body-sm">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value || 'all_time'}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              onClick={clearInvoiceFilters}
              className="flex items-center gap-1 text-body-sm text-accent-primary hover:underline"
            >
              <X className="h-3 w-3" /> Clear Filters
            </button>
          )}
        </div>

        {/* Results count */}
        {data && (
          <div className="px-4 pb-2">
            <p className="text-caption text-text-muted">
              Showing {data.invoices.length} of {data.pagination.total} invoices
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-4 max-w-3xl mx-auto">
        {error && (
          <div className="rounded-lg bg-color-error-bg border border-color-error p-4 mb-4">
            <p className="text-body-sm text-color-error">Could not load invoices. Please try again.</p>
          </div>
        )}

        <Card>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <InvoiceRowSkeleton key={i} />)
          ) : data?.invoices.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No invoices match your filters"
                description="Try adjusting your filters to find what you're looking for."
                action={{ label: 'Clear Filters', onClick: clearInvoiceFilters }}
              />
            ) : (
              <EmptyState
                title="No invoices yet"
                description="Your invoice history will appear here."
                action={{
                  label: 'Create Invoice',
                  onClick: () => navigate('/invoices/create'),
                }}
              />
            )
          ) : (
            data?.invoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))
          )}
        </Card>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <p className="text-body-sm text-text-muted">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
