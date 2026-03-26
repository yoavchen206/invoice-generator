import { useNavigate } from 'react-router-dom';
import { Plus, LogOut } from 'lucide-react';
import { useDashboard, useDashboardTrend } from '@/api/dashboard';
import { useClients } from '@/api/clients';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { InvoiceCard } from '@/components/invoice/InvoiceCard';
import { FilterChips } from '@/components/shared/FilterChips';
import { EmptyState } from '@/components/shared/EmptyState';
import { InvoiceRowSkeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import type { PeriodFilter } from '@yoavchu/shared';

const periodChips = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3M' },
  { value: 'last_12_months', label: 'Last Year' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    dashboardPeriod,
    dashboardClientId,
    setDashboardPeriod,
    setDashboardClientId,
  } = useUIStore();

  const { data: dashboard, isLoading, error } = useDashboard({
    period: dashboardPeriod,
    clientId: dashboardClientId,
  });

  const { data: trendData } = useDashboardTrend({ clientId: dashboardClientId });
  const { data: clientsData } = useClients({ limit: 200 });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-base border-b border-border-default">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-accent-primary flex items-center justify-center md:hidden">
              <span className="text-bg-base font-bold text-sm">Y</span>
            </div>
            <h1 className="text-h3 font-semibold text-text-primary md:text-h2">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="hidden md:flex"
              onClick={() => navigate('/invoices/create')}
            >
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-text-muted hover:text-text-secondary transition-colors md:hidden"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-body-sm sr-only">
                {user?.displayName || user?.email}
              </span>
            </button>
          </div>
        </div>

        {/* Period Filter */}
        <div className="px-4 py-2 overflow-x-auto">
          <FilterChips
            chips={periodChips}
            value={dashboardPeriod}
            onChange={(v) => setDashboardPeriod(v as PeriodFilter)}
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* Client Filter */}
        <Select
          value={dashboardClientId || 'all'}
          onValueChange={(v) => setDashboardClientId(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="h-10 w-48 text-body-sm">
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

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-color-error-bg border border-color-error p-4">
            <p className="text-body-sm text-color-error">
              Could not load dashboard data. Please try again.
            </p>
          </div>
        )}

        {/* Metric Cards */}
        <div className="space-y-3">
          <MetricCard
            label="Total Earned"
            value={dashboard?.metrics.totalEarned ?? 0}
            variant="primary"
            loading={isLoading}
          />
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Outstanding"
              value={dashboard?.metrics.outstanding ?? 0}
              loading={isLoading}
              onClick={() => navigate('/invoices?status=unpaid')}
            />
            <MetricCard
              label="Overdue"
              value={dashboard?.metrics.overdueCount ?? 0}
              isCurrency={false}
              loading={isLoading}
              onClick={() => navigate('/invoices?status=overdue')}
            />
          </div>
        </div>

        {/* Recent Invoices */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h3 text-text-primary">Recent Invoices</h2>
            <button
              onClick={() => navigate('/invoices')}
              className="text-body-sm text-accent-primary hover:underline"
            >
              View All
            </button>
          </div>

          <Card>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <InvoiceRowSkeleton key={i} />)
            ) : dashboard?.recentInvoices.length === 0 ? (
              <EmptyState
                title="No invoices yet"
                description="Create your first invoice in 60 seconds."
                action={{
                  label: 'Create Invoice',
                  onClick: () => navigate('/invoices/create'),
                }}
              />
            ) : (
              dashboard?.recentInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} compact />
              ))
            )}
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        {trendData && trendData.trend.some(d => d.earned > 0) && (
          <div>
            <h2 className="text-h3 text-text-primary mb-3">Revenue Trend</h2>
            <Card className="p-5">
              <RevenueChart data={trendData.trend} />
            </Card>
          </div>
        )}
      </div>

      {/* FAB - Mobile only */}
      <button
        onClick={() => navigate('/invoices/create')}
        className="fixed bottom-[88px] right-4 w-14 h-14 rounded-[16px] bg-accent-primary shadow-fab flex items-center justify-center md:hidden active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6 text-bg-base" />
      </button>
    </div>
  );
}
