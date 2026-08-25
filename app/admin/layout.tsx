'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopbar from '@/components/layout/AdminTopbar';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    if (saved === 'true') setSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-[#F4F7F6] dark:bg-slate-900 overflow-hidden selection:bg-indigo-500/30">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />
        <main className="flex-1 overflow-auto relative z-10 flex flex-col min-h-0">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-20 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 left-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
