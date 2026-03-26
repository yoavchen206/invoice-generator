import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useClients, useDeleteClient } from '@/api/clients';
import { useUIStore } from '@/store/ui.store';
import { EmptyState } from '@/components/shared/EmptyState';
import { ClientCardSkeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Client } from '@yoavchu/shared';

export function ClientList() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const { data, isLoading, error } = useClients({ search: search || undefined });
  const deleteClient = useDeleteClient();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClient.mutateAsync(deleteTarget.id);
      showToast(`${deleteTarget.name} deleted.`, 'success');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to delete client. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-base border-b border-border-default">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-h2 font-semibold text-text-primary">Clients</h1>
          <Button size="sm" onClick={() => navigate('/clients/new')}>
            <Plus className="h-4 w-4" />
            New Client
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-md bg-bg-input border border-border-default pl-9 pr-4 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:shadow-glow transition-all"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        {error && (
          <div className="rounded-lg bg-color-error-bg border border-color-error p-4 mb-4">
            <p className="text-body-sm text-color-error">Could not load clients.</p>
          </div>
        )}

        <Card>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <ClientCardSkeleton key={i} />)
          ) : data?.clients.length === 0 ? (
            <EmptyState
              title={search ? 'No clients found' : 'No clients yet'}
              description={
                search
                  ? 'Try a different search term.'
                  : 'Save a client once, select them in seconds on every future invoice.'
              }
              action={
                !search
                  ? { label: 'Add Your First Client', onClick: () => navigate('/clients/new') }
                  : undefined
              }
            />
          ) : (
            data?.clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between px-4 py-3.5 border-b border-border-default last:border-0 hover:bg-bg-elevated transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold text-text-primary truncate">{client.name}</p>
                  {client.businessName && (
                    <p className="text-body-sm text-text-secondary truncate">{client.businessName}</p>
                  )}
                  <p className="text-body-sm text-text-muted truncate">{client.email}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                  <button
                    onClick={() => navigate(`/clients/${client.id}/edit`)}
                    className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-base transition-colors"
                    aria-label={`Edit ${client.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(client)}
                    className="p-2 rounded-md text-text-muted hover:text-color-error hover:bg-bg-base transition-colors"
                    aria-label={`Delete ${client.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              This cannot be undone. The client will be removed from your list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleteClient.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
