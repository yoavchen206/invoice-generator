import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Toast } from '@/components/shared/Toast';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/cn';

export function AppShell() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar />
      <main
        className={cn(
          'min-h-screen',
          'pb-24 md:pb-0',
          'transition-all duration-300',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-[220px]'
        )}
      >
        <Outlet />
      </main>
      <BottomNav />
      <Toast />
    </div>
  );
}
