'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { COMPANY_NAME, PLANS } from '@/lib/constants';
import { toast } from 'sonner';
import { ArrowRight, Check, Store, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const step1Schema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const step2Schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  subdomain: z
    .string()
    .min(3, 'Store URL must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

const PLANS_INFO = [
  { plan: 'FREE', label: 'Free Forever', desc: `${PLANS.FREE.maxProducts} products, ${PLANS.FREE.maxEmployees} employees` },
  { plan: 'PRO', label: 'Pro — Rs. 2,500/mo', desc: `${PLANS.PRO.maxProducts} products, ${PLANS.PRO.maxEmployees} employees` },
  { plan: 'ENT', label: 'Enterprise — Rs. 10,000/mo', desc: 'Unlimited everything' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const step1 = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const step2 = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { businessName: '', subdomain: '' },
  });

  const updateSubdomain = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    step2.setValue('subdomain', slug);
    step2.trigger('subdomain');
  };

  const handleNext = async () => {
    const valid = await step1.trigger();
    if (!valid) return;
    setStep(2);
  };

  const handleSubmit = async (data: Step2Form) => {
    const step1Data = step1.getValues();
    try {
      const { redirectTo } = await registerUser({
        name: step1Data.name,
        email: step1Data.email,
        password: step1Data.password,
        businessName: data.businessName,
        subdomain: data.subdomain,
        phone: step1Data.phone,
      });
      toast.success(`Welcome to ${COMPANY_NAME}! Your store is ready`);
      router.push(redirectTo);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      const errorMessage = Array.isArray(msg) ? msg[0] : msg;
      step2.setError('root', { message: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Left Panel — Branding */}
      <div
        className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)' }}
      >
        {/* Decorative blobs matching home page */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-white/10 rounded-full blur-[120px] -translate-y-40 translate-x-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-blue-300/20 rounded-full blur-[100px] translate-y-40 -translate-x-20 pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-300/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-1 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-blue-700 font-black text-lg">c</span>
            </div>
            <span className="text-2xl font-black tracking-tight">{COMPANY_NAME}</span>
          </Link>
          <p className="text-blue-200 text-sm">The Smart Way to Run Your Store</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Start your free {14}-day trial</h2>
            <p className="text-blue-200 text-sm">No credit card required. Cancel anytime.</p>
          </div>

          <div className="space-y-3">
            {PLANS_INFO.map((p) => (
              <div key={p.plan} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/5">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xs font-bold shrink-0">
                  {p.plan}
                </div>
                <div>
                  <div className="text-sm font-semibold">{p.label}</div>
                  <div className="text-xs text-blue-200 mt-0.5">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-blue-300/70 text-xs">
          &copy; {new Date().getFullYear()} {COMPANY_NAME}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 transition-colors overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-base">c</span>
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">{COMPANY_NAME}</span>
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className={`h-0.5 w-16 transition-colors ${step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`} />}
              </div>
            ))}
            <span className="text-sm text-gray-500 dark:text-slate-400 ml-2">
              {step === 1 ? 'Account Info' : 'Store Setup'}
            </span>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-none border border-gray-100 dark:border-slate-800 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                {step === 1 ? 'Create your account' : 'Set up your store'}
              </h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                {step === 1 ? 'Your personal login details' : 'Your store information'}
              </p>
            </div>

            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Full name *</label>
                  <input
                    type="text"
                    {...step1.register('name')}
                    placeholder="John Silva"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  {step1.formState.errors.name && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step1.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email address *</label>
                  <input
                    type="email"
                    {...step1.register('email')}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  {step1.formState.errors.email && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step1.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    {...step1.register('phone')}
                    placeholder="+94 77 000 0000"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Password * (min 8 chars)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...step1.register('password')}
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
                  {step1.formState.errors.password && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step1.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Confirm password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...step1.register('confirmPassword')}
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
                  {step1.formState.errors.confirmPassword && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step1.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 dark:shadow-none hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Store Setup */}
            {step === 2 && (
              <form onSubmit={step2.handleSubmit(handleSubmit)} className="space-y-4">
                {step2.formState.errors.root && (
                  <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{step2.formState.errors.root.message}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Business name *</label>
                  <input
                    type="text"
                    {...step2.register('businessName', {
                      onChange: (e) => updateSubdomain(e.target.value),
                    })}
                    placeholder="John's Fashion Store"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  {step2.formState.errors.businessName && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step2.formState.errors.businessName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Store URL (subdomain) *</label>
                  <div className="flex rounded-xl border-2 border-gray-200 dark:border-slate-700 overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                    <input
                      type="text"
                      {...step2.register('subdomain')}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        step2.setValue('subdomain', val);
                        step2.trigger('subdomain');
                      }}
                      placeholder="johnsfashion"
                      className="flex-1 px-4 py-3 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none"
                    />
                    <div className="bg-gray-100 dark:bg-slate-700 px-4 flex items-center text-gray-500 dark:text-slate-300 text-sm border-l border-gray-200 dark:border-slate-600">
                      .cmart.lk
                    </div>
                  </div>
                  {step2.formState.errors.subdomain && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step2.formState.errors.subdomain.message}</p>
                  )}
                  {step2.watch('subdomain') && !step2.formState.errors.subdomain && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
                      Your store: https://{step2.watch('subdomain')}.cmart.lk
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold rounded-xl text-sm transition-all"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 dark:shadow-none hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating store...
                      </>
                    ) : (
                      <>
                        Create my store <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Login link */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors">
                Sign in
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}