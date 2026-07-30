import { ADMIN_NAV } from '@/lib/constants';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar navItems={ADMIN_NAV} role="admin" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
