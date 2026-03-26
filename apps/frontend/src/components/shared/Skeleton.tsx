import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-bg-elevated',
        'bg-gradient-to-r from-bg-elevated via-bg-surface to-bg-elevated',
        'bg-[length:200%_100%] animate-shimmer',
        className
      )}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border border-border-default bg-bg-surface p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function InvoiceRowSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-pill" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

export function ClientCardSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}
