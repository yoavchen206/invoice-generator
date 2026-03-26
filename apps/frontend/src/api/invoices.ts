import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  InvoiceListResponse,
  InvoiceResponse,
  CreateInvoiceRequest,
  InvoiceListQueryParams,
} from '@yoavchu/shared';

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (params: InvoiceListQueryParams) => [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

export function useInvoices(params: InvoiceListQueryParams = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<InvoiceListResponse>('/invoices', { params });
      return data;
    },
  });
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(invoiceId),
    queryFn: async () => {
      const { data } = await apiClient.get<InvoiceResponse>(`/invoices/${invoiceId}`);
      return data.invoice;
    },
    enabled: !!invoiceId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInvoiceRequest) => {
      const { data } = await apiClient.post<InvoiceResponse>('/invoices', payload);
      return data.invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}
