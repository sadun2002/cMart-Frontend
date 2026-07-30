import { EMPLOYEE_NAV } from '@/lib/constants';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F4F7F6] dark:bg-slate-900 overflow-hidden relative">
      {/* cMart theme background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]" />
      </div>
      <DashboardSidebar navItems={EMPLOYEE_NAV} role="employee" />
      <main className="flex-1 overflow-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
