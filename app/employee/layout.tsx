'use client';

import { useState, useEffect } from 'react';
import EmployeeSidebar from '@/components/layout/EmployeeSidebar';
import EmployeeTopbar from '@/components/layout/EmployeeTopbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        const isDesktop = typeof window !== 'undefined' && ('__TAURI__' in window || '__TAURI_INTERNALS__' in window);
        if (user.tenant?.plan === 'STARTUP' && !isDesktop) {
          router.replace('/offline-access');
        }
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const saved = localStorage.getItem('ownerSidebarCollapsed');
    if (saved === 'true') setSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('ownerSidebarCollapsed', String(sidebarCollapsed));
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

  const isTauri = typeof window !== 'undefined' && ('__TAURI__' in window || '__TAURI_INTERNALS__' in window);
  if (user?.tenant?.plan === 'STARTUP' && !isTauri) {
    return null; // Prevent flash while redirecting to offline-access
  }

  return (
    <div className="flex h-screen bg-[#F4F7F6] dark:bg-slate-900 overflow-hidden relative">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar wrapper */}
      <div className={`hidden md:block fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <EmployeeSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <EmployeeTopbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto relative z-10 flex flex-col min-h-0 pb-16 md:pb-0">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-20 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 left-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>
      
      <MobileBottomNav basePath="/employee" onMenuClick={() => setMobileMenuOpen(true)} />
    </div>
  );
}
