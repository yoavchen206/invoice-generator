import { useEffect, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { apiClient } from '@/api/client';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, setUser } = useAuthStore();
  const navigate = useNavigate();

  // Listen for session expiry events
  useEffect(() => {
    const handleExpiry = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:expired', handleExpiry);
    return () => window.removeEventListener('auth:expired', handleExpiry);
  }, [navigate, setUser]);

  // Verify session on mount
  useEffect(() => {
    if (isAuthenticated) {
      apiClient.get('/auth/me').catch(() => {
        setUser(null);
      });
    }
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
