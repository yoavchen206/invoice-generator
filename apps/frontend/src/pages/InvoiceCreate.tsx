import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, ChevronDown } from 'lucide-react';
import { useCreateInvoice } from '@/api/invoices';
import { useClients } from '@/api/clients';
import { useInvoiceTotals } from '@/hooks/useInvoiceTotals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatCurrency';
import { todayISO } from '@/lib/formatDate';
import type { Invoice } from '@yoavchu/shared';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().positive('Must be greater than 0'),
  unitPrice: z.coerce.number().positive('Must be greater than 0'),
});

const invoiceFormSchema = z.object({
  clientId: z.string().optional(),
  newClientName: z.string().optional(),
  newClientEmail: z.string().optional(),
  newClientBusinessName: z.string().optional(),
  newClientPhone: z.string().optional(),
  newClientAddress: z.string().optional(),
  newClientTaxId: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export function InvoiceCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateFrom = location.state?.duplicateFrom as Invoice | undefined;

  const [clientMode, setClientMode] = useState<'select' | 'new'>('select');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: clientsData } = useClients({ search: clientSearch || undefined, limit: 50 });
  const createInvoice = useCreateInvoice();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      lineItems: duplicateFrom
        ? duplicateFrom.lineItems.map(li => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
          }))
        : [{ description: '', quantity: 1, unitPrice: 0 }],
      issueDate: todayISO(),
      clientId: duplicateFrom?.client.id,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const watchedLineItems = useWatch({ control, name: 'lineItems' });
  const selectedClientId = watch('clientId');

  const { subtotal, taxAmount, taxRate, total, itemTotals } = useInvoiceTotals(
    watchedLineItems || []
  );

  const selectedClient = clientsData?.clients.find(c => c.id === selectedClientId);

  // Handle duplicate pre-fill
  useEffect(() => {
    if (duplicateFrom) {
      setValue('clientId', duplicateFrom.client.id);
      setClientSearch(duplicateFrom.client.name);
    }
  }, [duplicateFrom, setValue]);

  // Confirm before navigating away
  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('Discard invoice? Your changes will be lost.')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setApiError(null);
    try {
      let payload;

      if (clientMode === 'select' && data.clientId) {
        payload = {
          clientId: data.clientId,
          lineItems: data.lineItems.map(li => ({
            description: li.description,
            quantity: Number(li.quantity),
            unitPrice: Number(li.unitPrice),
          })),
          issueDate: data.issueDate,
          dueDate: data.dueDate || undefined,
        };
      } else {
        payload = {
          clientData: {
            name: data.newClientName || '',
            email: data.newClientEmail || '',
            businessName: data.newClientBusinessName,
            phone: data.newClientPhone,
            address: data.newClientAddress,
            taxId: data.newClientTaxId,
          },
          lineItems: data.lineItems.map(li => ({
            description: li.description,
            quantity: Number(li.quantity),
            unitPrice: Number(li.unitPrice),
          })),
          issueDate: data.issueDate,
          dueDate: data.dueDate || undefined,
        };
      }

      const invoice = await createInvoice.mutateAsync(payload);
      navigate('/invoices/success', { state: { invoice }, replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setApiError(
        error?.response?.data?.error?.message ||
        'We couldn\'t submit your invoice. Check your connection and try again.'
      );
    }
  };

  const filteredClients = clientsData?.clients.filter(c =>
    !clientSearch || c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.businessName && c.businessName.toLowerCase().includes(clientSearch.toLowerCase()))
  ) || [];

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg-base border-b border-border-default flex items-center justify-between px-4 h-14 flex-shrink-0">
        <h1 className="text-h3 font-semibold text-text-primary">New Invoice</h1>
        <button
          onClick={handleClose}
          className="text-text-muted hover:text-text-primary transition-colors p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable form area */}
      <div className="flex-1 overflow-y-auto pb-[180px]">
        <form id="invoice-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
            {/* API Error */}
            {apiError && (
              <div className="rounded-lg bg-color-error-bg border border-color-error p-4">
                <p className="text-body-sm text-color-error">⚠ {apiError}</p>
                <button
                  type="button"
                  onClick={() => setApiError(null)}
                  className="text-body-sm text-color-error underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Client Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-label uppercase tracking-[0.06em] text-text-secondary">Client</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setClientMode('select')}
                    className={`text-body-sm px-3 py-1 rounded-pill transition-colors ${
                      clientMode === 'select'
                        ? 'bg-accent-muted text-accent-primary'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    Saved Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode('new')}
                    className={`text-body-sm px-3 py-1 rounded-pill transition-colors ${
                      clientMode === 'new'
                        ? 'bg-accent-muted text-accent-primary'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    New Client
                  </button>
                </div>
              </div>

              {clientMode === 'select' ? (
                <div className="relative">
                  <div
                    className={`
                      flex items-center h-[52px] rounded-md bg-bg-input border px-4 cursor-pointer
                      transition-all duration-150
                      ${clientSearchOpen ? 'border-border-focus shadow-glow' : 'border-border-default'}
                    `}
                    onClick={() => setClientSearchOpen(!clientSearchOpen)}
                  >
                    <input
                      type="text"
                      placeholder="Select a client..."
                      value={selectedClient?.name || clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setValue('clientId', undefined);
                        setClientSearchOpen(true);
                      }}
                      className="flex-1 bg-transparent text-body text-text-primary placeholder:text-text-muted outline-none"
                      onFocus={() => setClientSearchOpen(true)}
                    />
                    <ChevronDown className="h-4 w-4 text-text-secondary flex-shrink-0" />
                  </div>

                  {clientSearchOpen && (
                    <div className="absolute z-10 w-full mt-1 rounded-lg border border-border-default bg-bg-elevated shadow-lg max-h-60 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-bg-base transition-colors border-b border-border-default last:border-0"
                          onClick={() => {
                            setValue('clientId', client.id);
                            setClientSearch(client.name);
                            setClientSearchOpen(false);
                          }}
                        >
                          <p className="text-body text-text-primary">{client.name}</p>
                          {client.businessName && (
                            <p className="text-body-sm text-text-secondary">{client.businessName}</p>
                          )}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-accent-primary hover:bg-bg-base transition-colors flex items-center gap-2"
                        onClick={() => {
                          setClientMode('new');
                          setClientSearchOpen(false);
                        }}
                      >
                        <Plus className="h-4 w-4" /> New Client
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="p-4 space-y-4">
                  <Input
                    label="Full Name"
                    required
                    placeholder="Client or company name"
                    error={errors.newClientName?.message}
                    {...register('newClientName')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    required
                    placeholder="client@example.com"
                    error={errors.newClientEmail?.message}
                    {...register('newClientEmail')}
                  />
                  <Input
                    label="Business Name"
                    placeholder="Optional"
                    {...register('newClientBusinessName')}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+972-50-000-0000"
                    {...register('newClientPhone')}
                  />
                  <Input
                    label="Address"
                    placeholder="Street, City"
                    {...register('newClientAddress')}
                  />
                  <Input
                    label="Tax ID"
                    placeholder="Business registration number"
                    {...register('newClientTaxId')}
                  />
                </Card>
              )}
            </div>

            {/* Line Items */}
            <div>
              <p className="text-label uppercase tracking-[0.06em] text-text-secondary mb-3">Line Items</p>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <Input
                          label="Description"
                          placeholder="Service or product description"
                          error={errors.lineItems?.[index]?.description?.message}
                          {...register(`lineItems.${index}.description`)}
                        />
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="mt-6 text-text-muted hover:text-color-error transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Qty"
                        type="number"
                        min="0.01"
                        step="0.01"
                        error={errors.lineItems?.[index]?.quantity?.message}
                        {...register(`lineItems.${index}.quantity`)}
                      />
                      <Input
                        label="Unit Price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        error={errors.lineItems?.[index]?.unitPrice?.message}
                        {...register(`lineItems.${index}.unitPrice`)}
                      />
                      <div>
                        <p className="text-label uppercase tracking-[0.06em] text-text-secondary mb-1.5">Total</p>
                        <div className="flex items-center h-[52px] px-4 rounded-md bg-bg-surface border border-border-default">
                          <span className="text-body text-text-primary tabular-nums">
                            {formatCurrency(itemTotals[index] || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                className="mt-3 flex items-center gap-2 text-accent-primary hover:underline text-body-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Add Line Item
              </button>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Issue Date"
                type="date"
                required
                error={errors.issueDate?.message}
                {...register('issueDate')}
              />
              <Input
                label="Due Date"
                type="date"
                {...register('dueDate')}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Totals Panel */}
      <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-0 bg-bg-surface border-t border-border-default p-4 z-20 md:w-[calc(100%-220px)]">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-body-sm text-text-secondary">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-body-sm text-text-secondary">
              <span>Tax ({Math.round(taxRate * 100)}%)</span>
              <span className="tabular-nums">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-body font-bold text-accent-primary">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>
          <Button
            type="submit"
            form="invoice-form"
            className="w-full"
            size="lg"
            loading={createInvoice.isPending}
          >
            Send Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
