import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

export function Toast() {
  const { toast, clearToast } = useUIStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(clearToast, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50"
        >
          <div className={`
            flex items-center gap-3 p-4 rounded-lg border shadow-lg
            ${toast.type === 'success' ? 'bg-accent-muted border-accent-primary text-accent-primary' : ''}
            ${toast.type === 'error' ? 'bg-color-error-bg border-color-error text-color-error' : ''}
            ${toast.type === 'info' ? 'bg-bg-elevated border-border-default text-text-primary' : ''}
          `}>
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
            {toast.type === 'error' && <XCircle className="h-5 w-5 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="h-5 w-5 flex-shrink-0" />}
            <p className="text-body-sm font-medium flex-1">{toast.message}</p>
            <button onClick={clearToast} className="flex-shrink-0 opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
