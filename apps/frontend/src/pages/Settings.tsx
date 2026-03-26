import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="sticky top-0 z-30 bg-bg-base border-b border-border-default px-4 h-14 flex items-center">
        <h1 className="text-h2 font-semibold text-text-primary">Settings</h1>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* User Info */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center">
                <span className="text-h3 text-accent-primary font-semibold">
                  {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div>
                {user?.displayName && (
                  <p className="text-body font-semibold text-text-primary">{user.displayName}</p>
                )}
                <p className="text-body-sm text-text-secondary">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex justify-between">
              <span className="text-body-sm text-text-secondary">Version</span>
              <span className="text-body-sm text-text-primary">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-sm text-text-secondary">Data source</span>
              <span className="text-body-sm text-text-primary">invoice4u API</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
