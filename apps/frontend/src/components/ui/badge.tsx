import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-pill px-2.5 py-1 text-label font-semibold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        paid: 'bg-status-paid-bg text-status-paid',
        unpaid: 'bg-status-unpaid-bg text-status-unpaid',
        overdue: 'bg-status-overdue-bg text-status-overdue',
        default: 'bg-bg-elevated text-text-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
