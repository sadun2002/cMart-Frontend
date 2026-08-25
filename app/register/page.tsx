'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { COMPANY_NAME, PLANS } from '@/lib/constants';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check, Store, AlertCircle, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';

const step1Schema = z
  .object({
    name: z.string().min(1, 'Full name is required').max(100, 'Name is too long'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email').max(100, 'Email is too long'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(50, 'Password is too long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[\W_]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const step2Schema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(100, 'Business name is too long'),
  businessType: z.string().min(1, 'Business type is required'),
  customBusinessType: z.string().max(50, 'Type is too long').optional(),
  subdomain: z
    .string()
    .min(3, 'Store URL must be at least 3 characters')
    .max(20, 'Store URL must be at most 20 characters')
    .regex(/^[a-z]+$/, 'Only lowercase English letters are allowed (no spaces, numbers, or symbols)'),
  acceptedTerms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and privacy policy' }),
}).superRefine((data, ctx) => {
  if (data.businessType === 'Other' && (!data.customBusinessType || data.customBusinessType.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please specify your business type',
      path: ['customBusinessType'],
    });
  }
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

const BUSINESS_TYPES = [
  'Retail Shop', 'Grocery', 'Pharmacy', 'Restaurant', 'Clothing',
  'Hardware', 'Electronics', 'Cosmetics', 'Bookstore', 'Stationery',
  'Jewelry', 'Furniture', 'Bakery', 'Cafe', 'Supermarket',
  'Toy Store', 'Pet Store', 'Auto Parts', 'Shoe Store', 'Sports Equipment',
  'Mobile Shop', 'Watch Shop', 'Optics', 'Flower Shop', 'Other'
];

const PLANS_INFO = [
  { plan: 'STARTUP', label: '30-Day Free Trial', desc: 'Local POS, fully offline capability' },
  { plan: 'PRO', label: 'Pro — Rs. 2,490/mo', desc: 'Cloud Sync, Online Store, Reports' },
  { plan: 'ENTERPRISE', label: 'Enterprise — Rs. 5,990/mo', desc: 'Unlimited everything, Multi-branch' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, register: registerUser, isLoading: isAuthLoading } = useAuthStore();
  
  useEffect(() => {
    if (!isAuthLoading && user) {
      if (user.type === 'super_admin' || user.adminRole) {
        router.replace('/admin/dashboard');
      } else if (user.role === 'STORE_OWNER') {
        router.replace(user.tenant?.active === false ? '/pending' : '/owner/dashboard');
      } else {
        router.replace('/employee/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginHref, setLoginHref] = useState('/login');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        setLoginHref(`/login?redirect=${encodeURIComponent(redirect)}`);
      }
    }
  }, []);

  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const [suggestedSubdomains, setSuggestedSubdomains] = useState<string[]>([]);
  const [hasManuallyEditedSubdomain, setHasManuallyEditedSubdomain] = useState(false);
  const subdomainTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (subdomainTimeoutRef.current) clearTimeout(subdomainTimeoutRef.current);
    };
  }, []);

  const step1 = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const step2 = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { businessName: '', businessType: '', customBusinessType: '', subdomain: '', acceptedTerms: false },
  });

  // Save form drafts to local storage
  useEffect(() => {
    const draftStep = localStorage.getItem('cMart_reg_step');
    const draftStep1 = localStorage.getItem('cMart_reg_step1');
    const draftStep2 = localStorage.getItem('cMart_reg_step2');

    if (draftStep) setStep(parseInt(draftStep, 10));
    if (draftStep1) step1.reset(JSON.parse(draftStep1));
    if (draftStep2) step2.reset(JSON.parse(draftStep2));
  }, []);

  useEffect(() => {
    const subscription = step1.watch((value) => {
      localStorage.setItem('cMart_reg_step1', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [step1.watch]);

  useEffect(() => {
    const subscription = step2.watch((value) => {
      localStorage.setItem('cMart_reg_step2', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [step2.watch]);

  useEffect(() => {
    localStorage.setItem('cMart_reg_step', step.toString());
  }, [step]);

  // Auto-fill subdomain based on business name
  useEffect(() => {
    const subscription = step2.watch((value, { name }) => {
      if (name === 'businessName' && !hasManuallyEditedSubdomain) {
        const businessName = value.businessName || '';
        const sanitized = businessName
          .toLowerCase()
          .replace(/[^a-z]/g, '')
          .slice(0, 20);
        
        step2.setValue('subdomain', sanitized, { shouldValidate: sanitized.length >= 3 });
        if (sanitized.length >= 3) {
          updateSubdomain(sanitized);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [step2.watch, hasManuallyEditedSubdomain]);

  const checkSubdomain = async (val: string): Promise<boolean> => {
    if (val.length < 3) {
      setSubdomainStatus('idle');
      setSuggestedSubdomains([]);
      return false;
    }
    setIsCheckingSubdomain(true);
    setSubdomainStatus('idle');
    
    try {
      const res: any = await api.get(`/auth/check-subdomain?subdomain=${val}`);
      
      // Backend TransformInterceptor wraps response in { success: true, data: { available: true } }
      // So res is { success: true, data: { available: true } }
      const isAvailable = res?.data?.available === true || res?.available === true;
      
      if (!isAvailable) {
        setSubdomainStatus('taken');
        setSuggestedSubdomains([`${val}store`, `${val}shop`, `my${val}`]);
      } else {
        setSubdomainStatus('available');
        setSuggestedSubdomains([]);
      }
      setIsCheckingSubdomain(false);
      return isAvailable;
    } catch (error: any) {
      console.error("Subdomain check error:", error);
      setIsCheckingSubdomain(false);
      
      // If the backend check fails (e.g. backend not running), assume it's available 
      // as requested by the user, so it doesn't block the UI with "taken"
      setSubdomainStatus('available');
      setSuggestedSubdomains([]);
      
      return true;
    }
  };

  const updateSubdomain = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 20);
    step2.setValue('subdomain', slug);
    step2.trigger('subdomain');
    
    if (subdomainTimeoutRef.current) clearTimeout(subdomainTimeoutRef.current);
    if (slug.length >= 3) {
      setIsCheckingSubdomain(true);
      setSubdomainStatus('idle');
      subdomainTimeoutRef.current = setTimeout(() => {
        checkSubdomain(slug);
      }, 500);
    } else {
      setSubdomainStatus('idle');
      setIsCheckingSubdomain(false);
    }
  };

  const handleNext = async () => {
    const valid = await step1.trigger();
    if (!valid) return;
    setStep(2);
  };

  const handleSubmit = async (data: Step2Form) => {
    const isAvailable = await checkSubdomain(data.subdomain);
    if (!isAvailable) {
      step2.setError('subdomain', { message: 'Subdomain is already taken or invalid.' });
      return;
    }

    const step1Data = step1.getValues();
    try {
      const { redirectTo } = await registerUser({
        name: step1Data.name,
        email: step1Data.email,
        password: step1Data.password,
        businessName: data.businessName,
        businessType: data.businessType === 'Other' ? data.customBusinessType : data.businessType,
        subdomain: data.subdomain,
        phone: step1Data.phone,
      });
      
      // Clear drafts on successful registration
      localStorage.removeItem('cMart_reg_step');
      localStorage.removeItem('cMart_reg_step1');
      localStorage.removeItem('cMart_reg_step2');
      
      if (redirectTo === '/pending') {
        toast.success('Your store request has been submitted for review.');
      } else {
        toast.success(`Welcome to ${COMPANY_NAME}! Your store is ready.`);
      }
      router.push(redirectTo);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      const errorMessage = Array.isArray(msg) ? msg[0] : msg;
      step2.setError('root', { message: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Prevent showing the registration form while redirecting logged-in users
  if (user || isAuthLoading) {
    return (
      <div className="font-sans min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-slate-400 font-medium">Redirecting to your dashboard...</p>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold mb-2">Start your free 30-day trial</h2>
            <p className="text-blue-200 text-sm">No credit card required. Cancel anytime.</p>
          </div>

          <div className="space-y-3">
            {PLANS_INFO.map((p) => (
              <div key={p.plan} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/5">
                <div className="w-24 h-9 bg-white/20 rounded-xl flex items-center justify-center text-[11px] font-black tracking-wider shrink-0">
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
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-950 md:bg-gray-50 transition-colors overflow-y-auto">
        <div className="w-full max-w-md py-8">


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
          <div className="md:bg-white md:dark:bg-slate-900 md:rounded-3xl md:shadow-xl md:shadow-blue-900/5 md:border md:border-gray-100 md:dark:border-slate-800 md:p-8">
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    {...step1.register('phone')}
                    placeholder="+94 77 000 0000"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  {step1.formState.errors.phone && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step1.formState.errors.phone.message}</p>
                  )}
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
                  Continue <ChevronRight className="w-4 h-4" />
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Business type *</label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all flex items-center justify-between"
                    >
                      <span className={step2.watch('businessType') ? '' : 'text-gray-400 dark:text-slate-500'}>
                        {step2.watch('businessType') || 'Select your business type'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {BUSINESS_TYPES.map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              step2.setValue('businessType', type);
                              step2.trigger('businessType');
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-300 transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {step2.formState.errors.businessType && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step2.formState.errors.businessType.message}</p>
                  )}
                </div>
                
                {step2.watch('businessType') === 'Other' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Specify your business type *</label>
                    <input
                      type="text"
                      {...step2.register('customBusinessType')}
                      placeholder="e.g. Graphic Design Studio"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                    {step2.formState.errors.customBusinessType && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step2.formState.errors.customBusinessType.message}</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Store URL (subdomain) *</label>
                  <div className="flex rounded-xl border-2 border-gray-200 dark:border-slate-700 overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                    <input
                      type="text"
                      {...step2.register('subdomain')}
                      onChange={(e) => {
                        setHasManuallyEditedSubdomain(true);
                        step2.setValue('subdomain', e.target.value);
                        updateSubdomain(e.target.value);
                      }}
                      placeholder="johnsfashion"
                      className="flex-1 px-4 py-3 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none min-w-0"
                    />
                    {isCheckingSubdomain && (
                      <div className="bg-white dark:bg-slate-800 px-3 flex items-center justify-center border-l-0">
                        <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                      </div>
                    )}
                    {!isCheckingSubdomain && subdomainStatus === 'available' && !step2.formState.errors.subdomain && (
                      <div className="bg-white dark:bg-slate-800 px-3 flex items-center justify-center text-emerald-500 border-l-0">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                    <div className="bg-gray-100 dark:bg-slate-700 px-4 flex items-center text-gray-500 dark:text-slate-300 text-sm border-l border-gray-200 dark:border-slate-600">
                      .cmart.lk
                    </div>
                  </div>
                  {step2.formState.errors.subdomain && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5">{step2.formState.errors.subdomain.message}</p>
                  )}
                  {!isCheckingSubdomain && subdomainStatus === 'taken' && (
                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl">
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5 font-semibold mb-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        This store URL is already taken. Try one of these:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSubdomains.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              step2.setValue('subdomain', s);
                              step2.trigger('subdomain');
                              checkSubdomain(s);
                            }}
                            className="text-xs bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800/50 hover:border-red-400 dark:hover:border-red-500 px-3 py-1.5 rounded-lg text-gray-700 dark:text-slate-300 transition-colors shadow-sm font-medium"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {subdomainStatus === 'idle' && !isCheckingSubdomain && step2.watch('subdomain') && !step2.formState.errors.subdomain && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
                      Your store: https://{step2.watch('subdomain')}.cmart.lk
                    </p>
                  )}
                </div>

                {/* Terms and Privacy Policy Checkbox */}
                <div className="pt-2 pb-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        {...step2.register('acceptedTerms')}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-slate-600 rounded-lg checked:border-blue-600 checked:bg-blue-600 dark:checked:border-blue-500 dark:checked:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
                      />
                      <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-slate-400 leading-snug select-none">
                      By creating an account, you agree to our{' '}
                      <Link href="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" target="_blank" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Privacy Policy
                      </Link>.
                    </span>
                  </label>
                  {step2.formState.errors.acceptedTerms && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-8">{step2.formState.errors.acceptedTerms.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold rounded-xl text-sm transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 inline mr-1" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthLoading || isCheckingSubdomain || subdomainStatus === 'taken'}
                    className={`flex-1 px-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${(isAuthLoading || isCheckingSubdomain || subdomainStatus === 'taken') ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isAuthLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                        Creating store...
                      </>
                    ) : (
                      <>
                        Create store <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Login link */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href={loginHref} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors">
                Sign in
              </Link>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <a 
              href="/" 
              onClick={async (e) => {
                e.preventDefault();
                const isDesktopEnv = typeof window !== 'undefined' && ('__TAURI__' in window || '__TAURI_INTERNALS__' in window);
                if (isDesktopEnv) {
                  try {
                    const { open } = await import('@tauri-apps/plugin-shell');
                    await open('https://cmart.lk');
                  } catch (err) {
                    console.error("Failed to open external URL", err);
                  }
                } else {
                  window.location.href = '/';
                }
              }}
              className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-3 h-3 inline mr-1" /> Back to {COMPANY_NAME}.lk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}