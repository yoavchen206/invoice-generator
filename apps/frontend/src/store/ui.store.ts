import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PeriodFilter, InvoiceStatus } from '@yoavchu/shared';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Dashboard filters
  dashboardPeriod: PeriodFilter;
  dashboardClientId: string | undefined;
  setDashboardPeriod: (period: PeriodFilter) => void;
  setDashboardClientId: (clientId: string | undefined) => void;

  // Invoice list filters
  invoiceStatusFilter: InvoiceStatus | 'all';
  invoiceClientFilter: string | undefined;
  invoicePeriodFilter: PeriodFilter | undefined;
  setInvoiceStatusFilter: (status: InvoiceStatus | 'all') => void;
  setInvoiceClientFilter: (clientId: string | undefined) => void;
  setInvoicePeriodFilter: (period: PeriodFilter | undefined) => void;
  clearInvoiceFilters: () => void;

  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      dashboardPeriod: 'this_month',
      dashboardClientId: undefined,
      setDashboardPeriod: (period) => set({ dashboardPeriod: period }),
      setDashboardClientId: (clientId) => set({ dashboardClientId: clientId }),

      invoiceStatusFilter: 'all',
      invoiceClientFilter: undefined,
      invoicePeriodFilter: undefined,
      setInvoiceStatusFilter: (status) => set({ invoiceStatusFilter: status }),
      setInvoiceClientFilter: (clientId) => set({ invoiceClientFilter: clientId }),
      setInvoicePeriodFilter: (period) => set({ invoicePeriodFilter: period }),
      clearInvoiceFilters: () => set({
        invoiceStatusFilter: 'all',
        invoiceClientFilter: undefined,
        invoicePeriodFilter: undefined,
      }),

      toast: null,
      showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3000);
      },
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        dashboardPeriod: state.dashboardPeriod,
      }),
    }
  )
);
