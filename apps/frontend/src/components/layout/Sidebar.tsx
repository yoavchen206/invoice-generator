import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Plus, Users, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40',
        'bg-bg-surface border-r border-border-default',
        'transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16 border-b border-border-default overflow-hidden">
        <div className="w-8 h-8 rounded-md bg-accent-primary flex items-center justify-center flex-shrink-0">
          <span className="text-bg-base font-bold text-sm">Y</span>
        </div>
        {!sidebarCollapsed && (
          <span className="text-h3 text-text-primary font-semibold truncate">
            Yoavchu
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 min-h-[44px]',
                'transition-colors duration-150',
                isActive
                  ? 'bg-accent-muted text-accent-primary border-l-2 border-accent-primary'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
                sidebarCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-body font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* New Invoice Button */}
      <div className="p-2 border-t border-border-default">
        <Link to="/invoices/create">
          <Button
            className={cn('w-full', sidebarCollapsed && 'px-0')}
            size={sidebarCollapsed ? 'icon' : 'default'}
          >
            <Plus className="h-5 w-5" />
            {!sidebarCollapsed && <span>New Invoice</span>}
          </Button>
        </Link>

        <button
          onClick={() => void logout()}
          className={cn(
            'mt-2 flex items-center gap-3 w-full rounded-md px-3 py-2.5',
            'text-text-muted hover:text-color-error transition-colors',
            sidebarCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-body-sm">Log Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
