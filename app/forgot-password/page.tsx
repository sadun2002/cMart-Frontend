'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COMPANY_NAME, COMPANY_TAGLINE } from '@/lib/constants';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Mail, ChevronRight, ChevronLeft, AlertCircle, CheckCircle, ShoppingCart, Globe, BarChart3, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

const FEATURES = [
  { icon: ShoppingCart, title: 'Point of Sale', desc: 'Fast, reliable POS for in-store sales' },
  { icon: Globe, title: 'Online Store', desc: 'Auto-generated e-commerce website' },
  { icon: BarChart3, title: 'Smart Reports', desc: 'Real-time analytics and insights' },
  { icon: Users, title: 'Team Management', desc: 'Employees, attendance & permissions' },
];

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      const errorMessage = Array.isArray(msg) ? msg[0] : msg;
      setError('root', { message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)' }}
      >
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-white/10 rounded-full blur-[120px] -translate-y-40 translate-x-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-blue-300/20 rounded-full blur-[100px] translate-y-40 -translate-x-20 pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-emerald-300/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-1 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-blue-700 font-black text-lg">c</span>
            </div>
            <span className="text-2xl font-black tracking-tight">{COMPANY_NAME}</span>
          </Link>
          <p className="text-blue-200 text-sm ml-[52px]">{COMPANY_TAGLINE}</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black leading-tight mb-3">
              Don&apos;t worry,<br />
              <span className="text-blue-300">we&apos;ll get you back.</span>
            </h2>
            <p className="text-blue-200 text-base leading-relaxed max-w-sm">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-400/20 text-blue-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{f.title}</div>
                    <div className="text-blue-200 text-xs mt-0.5">{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 text-blue-300/70 text-xs">
          &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-950 md:bg-gray-50 transition-colors">


        <div className="w-full max-w-[420px]">
          <div className="md:bg-white md:dark:bg-slate-900 md:rounded-3xl md:shadow-xl md:shadow-blue-900/5 md:border md:border-gray-100 md:dark:border-slate-800 md:p-8">
            {sent ? (
              /* Success state */
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Check your inbox</h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  We&apos;ve sent a password reset link to your email. It will expire in 15 minutes.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl flex items-start gap-3 text-left mb-6">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-0.5">Didn&apos;t receive the email?</p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                      Check your spam folder or try again with a different email address.
                    </p>
                  </div>
                </div>
                
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to login
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">Forgot password?</h1>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mt-1.5">
                    Enter the email address linked to your account &mdash; we&apos;ll send a reset link.
                  </p>
                </div>

                {errors.root && (
                  <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{errors.root.message}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                    {errors.email && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 dark:shadow-none hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending link...
                      </>
                    ) : (
                      <>
                        Send reset link <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
                  Remember your password?{' '}
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors">
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
              <ChevronLeft className="w-3 h-3 inline mr-1" /> Back to {COMPANY_NAME}.lk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}