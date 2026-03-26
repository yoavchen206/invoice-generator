import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { CreateClientSchema } from '@yoavchu/shared';
import type { CreateClientRequest } from '@yoavchu/shared';
import { useClient, useCreateClient, useUpdateClient } from '@/api/clients';
import { useUIStore } from '@/store/ui.store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ClientForm() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const isEdit = !!clientId;

  const { data: existingClient } = useClient(clientId || '');
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientRequest>({
    resolver: zodResolver(CreateClientSchema),
  });

  // Pre-fill form for edit mode
  useEffect(() => {
    if (existingClient) {
      reset({
        name: existingClient.name,
        email: existingClient.email,
        businessName: existingClient.businessName || '',
        phone: existingClient.phone || '',
        address: existingClient.address || '',
        taxId: existingClient.taxId || '',
      });
    }
  }, [existingClient, reset]);

  const onSubmit = async (data: CreateClientRequest) => {
    try {
      if (isEdit && clientId) {
        await updateClient.mutateAsync({ clientId, payload: data });
        showToast(`${data.name} updated.`, 'success');
      } else {
        await createClient.mutateAsync(data);
        showToast(`${data.name} saved.`, 'success');
      }
      navigate('/clients');
    } catch {
      showToast('Failed to save client. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-base border-b border-border-default flex items-center px-4 h-14">
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-text-primary mr-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-h3 font-semibold text-text-primary">
          {isEdit ? 'Edit Client' : 'New Client'}
        </h1>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Input
            label="Full Name"
            required
            placeholder="Client or company name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            required
            placeholder="client@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Business Name"
            placeholder="Optional"
            {...register('businessName')}
          />

          <Input
            label="Phone"
            type="tel"
            placeholder="+972-50-000-0000"
            {...register('phone')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-label uppercase tracking-[0.06em] text-text-secondary">Address</label>
            <textarea
              placeholder="Street, City"
              rows={2}
              className="w-full rounded-md bg-bg-input border border-border-default px-4 py-3.5 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:shadow-glow transition-all resize-y min-h-[80px]"
              {...register('address')}
            />
          </div>

          <Input
            label="Tax ID / Business Number"
            placeholder="Business registration number"
            {...register('taxId')}
          />

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting || createClient.isPending || updateClient.isPending}
            >
              {isEdit ? 'Save Changes' : 'Save Client'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/clients')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
