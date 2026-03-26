import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label uppercase tracking-[0.06em] text-text-secondary"
          >
            {label}
            {props.required && <span className="text-color-error ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-[52px] w-full rounded-md bg-bg-input border border-border-default px-4 py-3.5',
            'text-body text-text-primary placeholder:text-text-muted',
            'transition-all duration-150',
            'focus:outline-none focus:border-border-focus focus:shadow-glow',
            'disabled:cursor-not-allowed disabled:opacity-40',
            error && 'border-color-error shadow-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-body-sm text-color-error flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
