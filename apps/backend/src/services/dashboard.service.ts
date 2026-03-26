import type { Invoice, DashboardMetrics, TrendDataPoint, PeriodFilter } from '@yoavchu/shared';
import { getPeriodDateRange, isWithinDateRange, getTrailing12Months } from '../lib/dateUtils';
import { Invoice4uService } from './invoice4u.service';

export class DashboardService {
  constructor(private invoice4uService: Invoice4uService) {}

  async getDashboardData(params: {
    period?: PeriodFilter;
    clientId?: string;
  }): Promise<{
    metrics: DashboardMetrics;
    recentInvoices: Invoice[];
    periodLabel: string;
    lastRefreshedAt: string;
  }> {
    const period = params.period || 'this_month';
    const dateRange = getPeriodDateRange(period);

    // Fetch all invoices (no pagination for aggregation)
    const { invoices: allInvoices } = await this.invoice4uService.getInvoices({
      clientId: params.clientId,
    });

    const today = new Date();
    const filteredInvoices = allInvoices.filter(inv =>
      isWithinDateRange(inv.issueDate, dateRange)
    );

    const totalEarned = filteredInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const outstanding = filteredInvoices
      .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    const overdueCount = allInvoices.filter(inv => {
      if (inv.status === 'paid') return false;
      if (!inv.dueDate) return false;
      return new Date(inv.dueDate) < today;
    }).length;

    const invoiceCount = filteredInvoices.length;

    // Recent invoices - last 10, sorted by date desc
    const recentInvoices = [...allInvoices]
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .slice(0, 10);

    return {
      metrics: {
        totalEarned: Math.round(totalEarned * 100) / 100,
        outstanding: Math.round(outstanding * 100) / 100,
        overdueCount,
        invoiceCount,
      },
      recentInvoices,
      periodLabel: dateRange.label,
      lastRefreshedAt: new Date().toISOString(),
    };
  }

  async getTrendData(params: { clientId?: string }): Promise<{ trend: TrendDataPoint[] }> {
    const { invoices: allInvoices } = await this.invoice4uService.getInvoices({
      clientId: params.clientId,
    });

    const months = getTrailing12Months();
    const trend: TrendDataPoint[] = months.map(({ key, label, year, month }) => {
      const monthInvoices = allInvoices.filter(inv => {
        const date = new Date(inv.issueDate);
        return date.getFullYear() === year && (date.getMonth() + 1) === month && inv.status === 'paid';
      });

      const earned = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

      return {
        month: key,
        label,
        earned: Math.round(earned * 100) / 100,
        invoiceCount: monthInvoices.length,
      };
    });

    return { trend };
  }
}
