'use client';

import Link from 'next/link';
import { ArrowRight, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

interface AuthCtaButtonProps {
  className?: string;
}

export function AuthCtaButton({ className }: AuthCtaButtonProps) {
  const { user, isLoading } = useAuthStore();
  const isLoggedIn = !!user && !isLoading;

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.type === 'super_admin' || user.adminRole) return '/admin/dashboard';
    if (user.role === 'STORE_OWNER') {
      return user.tenant?.active === false ? '/pending' : '/owner/dashboard';
    }
    return '/employee/dashboard';
  };

  if (isLoggedIn) {
    return (
      <Link 
        href={getDashboardUrl()} 
        className={className || "inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 gap-2"}
      >
        Go to Dashboard <LayoutDashboard className="w-5 h-5 ml-1" />
      </Link>
    );
  }

  return (
    <Link 
      href="/register" 
      className={className || "inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 gap-2"}
    >
      Start 30-Day Free Trial <ChevronRight className="w-5 h-5 ml-1" />
    </Link>
  );
}
