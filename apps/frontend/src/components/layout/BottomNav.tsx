import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Plus, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/invoices/create', icon: Plus, label: 'New', isAction: true },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border-default md:hidden">
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-center w-[52px] h-[52px] rounded-[16px] bg-accent-primary shadow-fab -mt-4 active:scale-95 transition-transform"
              >
                <Icon className="h-6 w-6 text-bg-base" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-1 min-w-[44px] min-h-[44px] rounded-md',
                'transition-colors duration-150',
                isActive ? 'text-accent-primary' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-caption font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
