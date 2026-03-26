import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Invoice } from '@yoavchu/shared';

export function InvoiceSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = location.state?.invoice as Invoice | undefined;

  if (!invoice) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent-muted mb-6"
        >
          <CheckCircle className="h-12 w-12 text-accent-primary" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-display font-bold text-accent-primary mb-6"
        >
          Invoice Sent!
        </motion.h1>

        {/* Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-surface rounded-lg border border-border-default p-5 mb-8 space-y-2"
        >
          <p className="text-body-sm text-text-secondary">Invoice #{invoice.invoiceNumber}</p>
          <p className="text-body font-semibold text-text-primary">
            {invoice.client.name}
          </p>
          <p className="text-h1 font-bold text-accent-primary tabular-nums">
            {formatCurrency(invoice.total)}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate('/invoices/create', { replace: true })}
          >
            Create Another Invoice
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/dashboard', { replace: true })}
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
