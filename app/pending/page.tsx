'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Clock, ChevronLeft, Mail, Phone, XCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PendingPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(typeof window !== 'undefined' && ('__TAURI__' in window || '__TAURI_INTERNALS__' in window));
  }, []);

  useEffect(() => {
    if (user?.role === 'STORE_OWNER' && user?.tenant?.active) {
      router.replace('/owner/dashboard');
    }
  }, [user, router]);

  const isRejected = user?.tenant?.suspended === true;
  const rejectReason = user?.tenant?.suspendReason || 'No specific reason provided. Please contact support for more details.';

  const handleReapply = () => {
    logout();
    router.push('/register');
  };

  const handleBackToLogin = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isRejected ? 'bg-red-50 dark:bg-red-500/10' : 'bg-blue-50 dark:bg-blue-500/10'}`}>
            {isRejected ? (
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            ) : (
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isRejected ? 'Store Request Rejected' : 'Store Under Review'}
          </h1>
          
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-5 leading-relaxed">
            {isRejected ? (
              <>Unfortunately, your store request for <strong className="text-gray-900 dark:text-slate-300">cMart</strong> was not approved.</>
            ) : (
              <>Thank you for registering! Your store request for <strong className="text-gray-900 dark:text-slate-300">cMart</strong> is currently pending approval.</>
            )}
          </p>

          {isRejected ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-red-800 dark:text-red-400 font-semibold mb-2 text-xs uppercase tracking-wide">Reason for Rejection</h3>
              <p className="text-red-700 dark:text-red-300/90 text-sm whitespace-pre-wrap">
                {rejectReason}
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-3 mb-6 text-left">
              <h3 className="text-amber-800 dark:text-amber-400 font-semibold mb-1.5 text-xs uppercase tracking-wide">What happens next?</h3>
              <ul className="text-amber-700 dark:text-amber-500/90 text-xs space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-amber-400 dark:bg-amber-500 rounded-full mt-1.5 shrink-0" />
                  Our team will review your application within 24-48 hours.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-amber-400 dark:bg-amber-500 rounded-full mt-1.5 shrink-0" />
                  We might contact you via phone or email for verification.
                </li>
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            {isRejected ? (
              <>
                {isDesktop ? (
                  <button onClick={handleBackToLogin} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <Link href="/contact" className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> Contact
                  </Link>
                )}
                <button onClick={handleReapply} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Re-apply
                </button>
              </>
            ) : (
              <>
                {isDesktop ? (
                  <button 
                    onClick={handleBackToLogin} 
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <>
                    <Link href="/" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                      <ChevronLeft className="w-4 h-4" /> Home
                    </Link>
                    
                    <Link 
                      href="/download"
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      Download App
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-800/50 p-6 border-t border-gray-100 dark:border-slate-800">
          <p className="text-center text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">
            Need help? Contact support
          </p>
          <div className="flex justify-center gap-6">
            <a href="tel:+94771234567" className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Phone className="w-4 h-4" /> +94 77 123 4567
            </a>
            <a href="mailto:support@cmart.lk" className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Mail className="w-4 h-4" /> support@cmart.lk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
