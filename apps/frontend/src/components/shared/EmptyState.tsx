import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-text-muted mb-4">
        {icon || (
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="20" x2="44" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="28" x2="44" y2="28" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </div>
      <h3 className="text-h3 text-text-primary mb-2">{title}</h3>
      <p className="text-body text-text-secondary mb-6 max-w-xs">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
