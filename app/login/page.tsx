'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { COMPANY_NAME, COMPANY_TAGLINE } from '@/lib/constants';
import { toast } from 'sonner';
import { Eye, EyeOff, ShoppingCart, Globe, BarChart3, Users, ArrowRight, ShieldCheck, Smile, AlertCircle, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: ShoppingCart, title: 'Point of Sale', desc: 'Fast, reliable POS for in-store sales' },
  { icon: Globe, title: 'Online Store', desc: 'Auto-generated e-commerce website' },
  { icon: BarChart3, title: 'Smart Reports', desc: 'Real-time analytics and insights' },
  { icon: Users, title: 'Team Management', desc: 'Employees, attendance & permissions' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@cmart.lk', password: 'owner123' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const { redirectTo } = await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push(redirectTo);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      const errorMessage = Array.isArray(msg) ? msg[0] : msg;
      setError('root', { message: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)' }}
      >
        {/* Decorative blobs matching home page */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-white/10 rounded-full blur-[120px] -translate-y-40 translate-x-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-blue-300/20 rounded-full blur-[100px] translate-y-40 -translate-x-20 pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-emerald-300/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-1 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-blue-700 font-black text-lg">c</span>
            </div>
            <span className="text-2xl font-black tracking-tight">{COMPANY_NAME}</span>
          </Link>
          <p className="text-blue-200 text-sm ml-[52px]">{COMPANY_TAGLINE}</p>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black leading-tight mb-3">
              Run your store<br />
              <span className="text-blue-300">smarter, faster.</span>
            </h2>
            <p className="text-blue-200 text-base leading-relaxed max-w-sm">
              Everything you need to manage your business — in one powerful platform built for Sri Lanka.
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

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {['11', '47', '12', '44'].map((img, i) => (
                <img key={i} src={`https://i.pravatar.cc/40?img=${img}`} className="w-8 h-8 rounded-full border-2 border-blue-600 object-cover" alt="" />
              ))}
            </div>
            <div className="text-sm">
              <span className="font-bold text-white">500+ stores</span>
              <span className="text-blue-200"> already running on {COMPANY_NAME}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-blue-300/70 text-xs">
          &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 transition-colors">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-base">c</span>
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white">{COMPANY_NAME}</span>
        </Link>

        <div className="w-full max-w-[420px]">
          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-none border border-gray-100 dark:border-slate-800 p-8">
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                Welcome back <Smile className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1.5">
                Sign in to your <span className="text-blue-600 dark:text-blue-400 font-semibold">{COMPANY_NAME}</span> account
              </p>
            </div>

            {/* Error */}
            {errors.root && (
              <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-600 dark:text-red-400 text-sm">{errors.root.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  placeholder="demo@cmart.lk"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password')}
                    placeholder="owner123"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Universal login info */}
            <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-0.5">Universal Login</p>
                <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                  Admins, Store Owners & Employees all use this page. You&apos;ll be automatically redirected to your dashboard.
                </p>
              </div>
            </div>

            {/* Register link */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
              Don&apos;t have a store yet?{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors">
                Start free trial &rarr;
              </Link>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
              &larr; Back to {COMPANY_NAME}.lk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}