import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { LoginSchema } from '@yoavchu/shared';
import type { LoginRequest } from '@yoavchu/shared';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    clearError();
    try {
      await login(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[16px] bg-accent-primary mb-4">
            <span className="text-bg-base font-bold text-2xl">Y</span>
          </div>
          <h1 className="text-h1 text-text-primary">Yoavchu's Invoices</h1>
          <p className="text-body-sm text-text-secondary mt-1">Your invoicing dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-label uppercase tracking-[0.06em] text-text-secondary">
              Password <span className="text-color-error ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`
                  flex h-[52px] w-full rounded-md bg-bg-input border px-4 py-3.5 pr-12
                  text-body text-text-primary placeholder:text-text-muted
                  transition-all duration-150
                  focus:outline-none focus:border-border-focus focus:shadow-glow
                  ${errors.password ? 'border-color-error shadow-error' : 'border-border-default'}
                `}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-body-sm text-color-error flex items-center gap-1">
                <span>⚠</span> {errors.password.message}
              </p>
            )}
          </div>

          {/* API Error */}
          {error && (
            <div className="rounded-md bg-color-error-bg border border-color-error p-3">
              <p className="text-body-sm text-color-error">⚠ {error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isLoading}
          >
            Log In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-caption text-text-muted text-center mt-8">
          Your data is stored securely on invoice4u
        </p>
      </div>
    </div>
  );
}
