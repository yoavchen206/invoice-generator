import { cn } from '@/lib/cn';

interface FilterChip {
  value: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterChips({ chips, value, onChange, className }: FilterChipsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1 scrollbar-hide', className)}>
      {chips.map((chip) => (
        <button
          key={chip.value}
          onClick={() => onChange(chip.value)}
          className={cn(
            'flex-shrink-0 rounded-pill px-4 py-2 text-body-sm font-medium',
            'border transition-all duration-150 cursor-pointer whitespace-nowrap',
            value === chip.value
              ? 'bg-accent-muted border-accent-primary text-accent-primary'
              : 'bg-bg-elevated border-border-default text-text-secondary hover:border-border-focus'
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
