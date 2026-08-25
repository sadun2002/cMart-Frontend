'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { COMPANY_NAME, COMPANY_TAGLINE } from '@/lib/constants';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ChevronRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[\W_]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      router.push('/login');
    }
  }, [token, router]);

  const onSubmit = async (data: ResetForm) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      const errorMessage = Array.isArray(msg) ? msg[0] : msg;
      setError('root', { message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-950 md:bg-gray-50 transition-colors w-full min-h-screen">
      <Link href="/" className="hidden md:flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <span className="text-white font-black text-lg">c</span>
        </div>
        <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{COMPANY_NAME}</span>
      </Link>

      <div className="w-full max-w-[420px]">
        <div className="md:bg-white md:dark:bg-slate-900 md:rounded-3xl md:shadow-xl md:shadow-blue-900/5 md:border md:border-gray-100 md:dark:border-slate-800 md:p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Password reset!</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Your password has been changed successfully. You can now log in with your new password.
              </p>
              <Link
                href="/login"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center shadow-lg shadow-blue-600/25"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Create new password</h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1.5">
                  Your new password must be different from previous used passwords.
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors p-1"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>
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
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset password <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
