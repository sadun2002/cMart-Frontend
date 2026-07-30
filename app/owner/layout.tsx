'use client';

import { useState, useEffect } from 'react';
import OwnerSidebar from '@/components/layout/OwnerSidebar';
import OwnerTopbar from '@/components/layout/OwnerTopbar';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  return (
    <div className="flex h-screen bg-[#F4F7F6] dark:bg-slate-900 overflow-hidden">
      <OwnerSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OwnerTopbar />
        <main className="flex-1 overflow-auto relative z-10 flex flex-col min-h-0">
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-20 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px]" />
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
