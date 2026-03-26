import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  ClientListResponse,
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from '@yoavchu/shared';

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params?: { search?: string; page?: number }) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

export function useClients(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<ClientListResponse>('/clients', { params });
      return data;
    },
  });
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: async () => {
      const { data } = await apiClient.get<ClientResponse>(`/clients/${clientId}`);
      return data.client;
    },
    enabled: !!clientId,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateClientRequest) => {
      const { data } = await apiClient.post<ClientResponse>('/clients', payload);
      return data.client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, payload }: { clientId: string; payload: UpdateClientRequest }) => {
      const { data } = await apiClient.put<ClientResponse>(`/clients/${clientId}`, payload);
      return data.client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      await apiClient.delete(`/clients/${clientId}`);
      return clientId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
