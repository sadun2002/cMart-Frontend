'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { PLANS, formatLKR } from '@/lib/constants';
import { CheckCircle, CreditCard, ShieldCheck, Zap, ArrowRight, Home, Lock, AlertCircle, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MotionBlurBackground } from '@/components/ui/motion-blur-background';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// Validation Schema
const checkoutSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .regex(/^[\d\s]{15,19}$/, 'Please enter a valid card number (15-19 digits)'),
  expiry: z
    .string()
    .min(1, 'Expiry date is required')
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format must be MM/YY'),
  cvc: z
    .string()
    .min(1, 'CVC is required')
    .regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits'),
  cardholderName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updatePlan } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user && user.role === 'STORE_OWNER' && user.tenant && user.tenant.active === false) {
      toast.error('Your account is pending review. You cannot upgrade yet.');
      router.push('/pending');
    }
  }, [user, router]);
  
  // Format Card Number (auto-space every 4 digits)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format Expiry (MM/YY) with Month Validation
  const formatExpiry = (value: string) => {
    let v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 1) {
      const firstDigit = parseInt(v[0]);
      if (firstDigit > 1) {
        v = `0${firstDigit}`;
      }
    }
    
    if (v.length >= 2) {
      const month = parseInt(v.substring(0, 2));
      if (month < 1 || month > 12) {
        v = v.substring(0, 1);
      } else {
        v = v.substring(0, 2) + '/' + v.substring(2, 4);
      }
    }
    return v;
  };
  
  // Get plan from URL or default to PRO
  const planParam = searchParams.get('plan') || 'PRO';
  const planKey = planParam.toUpperCase() as keyof typeof PLANS;
  const plan = PLANS[planKey] || PLANS.PRO;

  const billingParam = searchParams.get('billing') || 'monthly';
  const isYearly = billingParam === 'annual';
  
  // Calculate pricing
  const monthlyPrice = isYearly ? plan.price * 0.8 : plan.price;
  const totalDue = isYearly ? monthlyPrice * 12 : monthlyPrice;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardNumber: '',
      expiry: '',
      cvc: '',
      cardholderName: '',
    },
  });
  
  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);
    // Simulate payment processing securely
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsProcessing(false);
    updatePlan(planKey);
    setIsSuccess(true);
    toast.success('Payment completed successfully!');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors relative flex flex-col">
        <SiteHeader />
        
        <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4 relative z-10">
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl shadow-2xl shadow-emerald-500/10 border border-slate-100 dark:border-slate-800 max-w-lg w-full text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Payment Successful!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed">
                Thank you! Your subscription has been successfully upgraded to the <span className="font-bold text-slate-900 dark:text-white">{plan.name} plan</span>.
              </p>
              
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => router.push('/owner/dashboard')} 
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-blue-500/30 transition-all duration-300"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')} 
                  className="w-full h-14 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <Home className="w-5 h-5 mr-2" /> Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>

        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors relative flex flex-col">
      <MotionBlurBackground />
      <SiteHeader />

      <section className="flex-1 pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              Secure Checkout
            </h1>
            <p className="text-lg text-gray-500 dark:text-slate-400">
              Complete your upgrade to unlock premium features.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 shadow-2xl shadow-blue-500/5 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col-reverse lg:flex-row">
            
            {/* Left: Payment form */}
            <div className="lg:w-7/12 p-8 lg:p-12 relative z-10 border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-8">
                <Lock className="w-5 h-5 text-slate-400" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payment Details</h2>
              </div>
              
              <div className="space-y-5 max-w-md">
                
                {/* Express Checkout */}
                <div className="flex flex-col gap-3">
                  <button type="button" className="w-full h-[52px] flex items-center justify-center gap-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <svg className="h-9 w-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 256 256" xmlSpace="preserve">
                      <g style={{stroke: "none", strokeWidth: 0, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "none", fillRule: "nonzero", opacity: 1}} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                        <path d="M 42.54 44.553 v 10.459 h -3.374 V 29.145 h 8.772 c 2.137 0 4.161 0.787 5.736 2.249 c 1.575 1.35 2.362 3.374 2.362 5.511 s -0.787 4.049 -2.362 5.511 c -1.575 1.462 -3.486 2.249 -5.736 2.249 L 42.54 44.553 L 42.54 44.553 z M 42.54 32.294 v 8.997 h 5.623 c 1.237 0 2.474 -0.45 3.261 -1.35 c 1.799 -1.687 1.799 -4.499 0.112 -6.186 l -0.112 -0.112 c -0.9 -0.9 -2.024 -1.462 -3.261 -1.35 L 42.54 32.294 L 42.54 32.294 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(95,99,104)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 63.796 36.793 c 2.474 0 4.386 0.675 5.848 2.024 c 1.462 1.35 2.137 3.149 2.137 5.398 v 10.797 h -3.149 v -2.474 h -0.112 c -1.35 2.024 -3.261 3.037 -5.511 3.037 c -1.912 0 -3.599 -0.562 -4.948 -1.687 c -1.237 -1.125 -2.024 -2.699 -2.024 -4.386 c 0 -1.799 0.675 -3.261 2.024 -4.386 c 1.35 -1.125 3.261 -1.575 5.511 -1.575 c 2.024 0 3.599 0.337 4.836 1.125 v -0.787 c 0 -1.125 -0.45 -2.249 -1.35 -2.924 c -0.9 -0.787 -2.024 -1.237 -3.261 -1.237 c -1.912 0 -3.374 0.787 -4.386 2.362 l -2.924 -1.799 C 58.285 37.918 60.647 36.793 63.796 36.793 z M 59.522 49.614 c 0 0.9 0.45 1.687 1.125 2.137 c 0.787 0.562 1.687 0.9 2.587 0.9 c 1.35 0 2.699 -0.562 3.711 -1.575 c 1.125 -1.012 1.687 -2.249 1.687 -3.599 c -1.012 -0.787 -2.474 -1.237 -4.386 -1.237 c -1.35 0 -2.474 0.337 -3.374 1.012 C 59.972 47.815 59.522 48.602 59.522 49.614 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(95,99,104)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 90 37.355 l -11.134 25.53 h -3.374 L 79.653 54 l -7.31 -16.532 h 3.599 l 5.286 12.709 h 0.112 l 5.173 -12.709 H 90 V 37.355 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(95,99,104)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 29.157 42.304 c 0 -1.012 -0.112 -2.024 -0.225 -3.037 H 14.873 v 5.736 h 7.985 c -0.337 1.799 -1.35 3.486 -2.924 4.499 v 3.711 h 4.836 C 27.582 50.626 29.157 46.802 29.157 42.304 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(66,133,244)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 14.873 56.812 c 4.049 0 7.423 -1.35 9.897 -3.599 l -4.836 -3.711 c -1.35 0.9 -3.037 1.462 -5.061 1.462 c -3.824 0 -7.198 -2.587 -8.322 -6.186 H 1.603 v 3.824 C 4.189 53.663 9.25 56.812 14.873 56.812 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(52,168,83)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 6.551 44.778 c -0.675 -1.799 -0.675 -3.824 0 -5.736 v -3.824 H 1.603 c -2.137 4.161 -2.137 9.11 0 13.383 L 6.551 44.778 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(251,188,4)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 14.873 32.969 c 2.137 0 4.161 0.787 5.736 2.249 l 0 0 l 4.274 -4.274 c -2.699 -2.474 -6.298 -3.936 -9.897 -3.824 c -5.623 0 -10.797 3.149 -13.271 8.21 l 4.948 3.824 C 7.676 35.556 11.05 32.969 14.873 32.969 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(234,67,53)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                      </g>
                    </svg>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" className="w-full h-[52px] flex items-center justify-center gap-2 rounded-lg bg-black text-white hover:bg-gray-800 dark:hover:bg-slate-800 transition-colors">
                      <svg className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 256 256" xmlSpace="preserve">
                        <g style={{stroke: "none", strokeWidth: 0, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "none", fillRule: "nonzero", opacity: 1}} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                          <path d="M 16.445 31.287 c -1.055 1.248 -2.743 2.233 -4.43 2.092 c -0.211 -1.688 0.615 -3.481 1.582 -4.588 c 1.055 -1.283 2.901 -2.198 4.395 -2.268 C 18.168 28.281 17.482 30.004 16.445 31.287 M 17.974 33.714 c -2.444 -0.141 -4.536 1.389 -5.696 1.389 c -1.178 0 -2.953 -1.319 -4.887 -1.283 c -2.514 0.035 -4.852 1.459 -6.135 3.727 c -2.637 4.536 -0.686 11.251 1.863 14.943 c 1.248 1.828 2.743 3.832 4.711 3.762 c 1.863 -0.07 2.602 -1.213 4.852 -1.213 c 2.268 0 2.918 1.213 4.887 1.178 c 2.039 -0.035 3.323 -1.828 4.571 -3.657 c 1.424 -2.074 2.004 -4.096 2.039 -4.202 c -0.035 -0.035 -3.938 -1.529 -3.973 -6.03 c -0.035 -3.762 3.077 -5.555 3.217 -5.661 C 21.666 34.065 18.923 33.784 17.974 33.714 M 32.091 28.615 v 27.407 h 4.254 v -9.37 h 5.889 c 5.38 0 9.159 -3.692 9.159 -9.036 s -3.709 -9.001 -9.019 -9.001 L 32.091 28.615 L 32.091 28.615 z M 36.345 32.202 h 4.905 c 3.692 0 5.801 1.969 5.801 5.432 s -2.11 5.45 -5.819 5.45 h -4.887 V 32.202 z M 59.164 56.234 c 2.672 0 5.151 -1.354 6.276 -3.498 h 0.088 v 3.287 h 3.938 V 42.381 c 0 -3.956 -3.164 -6.505 -8.034 -6.505 c -4.518 0 -7.858 2.584 -7.981 6.135 h 3.832 c 0.316 -1.688 1.881 -2.795 4.026 -2.795 c 2.602 0 4.061 1.213 4.061 3.446 v 1.512 l -5.309 0.316 c -4.94 0.299 -7.612 2.321 -7.612 5.837 C 52.449 53.878 55.209 56.234 59.164 56.234 z M 60.307 52.981 c -2.268 0 -3.709 -1.09 -3.709 -2.76 c 0 -1.723 1.389 -2.725 4.043 -2.883 l 4.729 -0.299 v 1.547 C 65.37 51.153 63.19 52.981 60.307 52.981 z M 74.723 63.477 c 4.149 0 6.1 -1.582 7.806 -6.382 L 90 36.14 h -4.325 l -5.01 16.191 h -0.088 l -5.01 -16.191 h -4.448 l 7.208 19.953 l -0.387 1.213 c -0.65 2.057 -1.705 2.848 -3.586 2.848 c -0.334 0 -0.984 -0.035 -1.248 -0.07 v 3.287 C 73.352 63.442 74.406 63.477 74.723 63.477 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(255,255,255)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        </g>
                      </svg>
                    </button>
                    <button type="button" className="w-full h-[52px] flex items-center justify-center gap-2 rounded-lg bg-[#FFC439] hover:bg-[#F4BB33] transition-colors">
                      <svg className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 256 256" xmlSpace="preserve">
                        <g style={{stroke: "none", strokeWidth: 0, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "none", fillRule: "nonzero", opacity: 1}} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                          <path d="M 50.752 42.126 c -0.191 0 -0.327 0.187 -0.269 0.369 l 2.646 8.212 l -2.393 3.87 c -0.116 0.188 0.019 0.431 0.24 0.431 h 2.828 c 0.164 0 0.317 -0.086 0.402 -0.227 l 7.391 -12.226 c 0.113 -0.188 -0.022 -0.428 -0.242 -0.428 h -2.828 c -0.166 0 -0.32 0.088 -0.404 0.231 l -2.909 4.912 l -1.477 -4.875 c -0.048 -0.159 -0.195 -0.267 -0.36 -0.267 L 50.752 42.126 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                          <path d="M 87.11 37.841 c -0.185 0 -0.343 0.135 -0.372 0.318 l -2.145 13.596 c -0.03 0.19 0.099 0.368 0.289 0.398 c 0.018 0.003 0.036 0.004 0.055 0.004 h 2.543 c 0.185 0 0.343 -0.135 0.372 -0.318 l 2.144 -13.597 c 0.03 -0.19 -0.1 -0.368 -0.29 -0.398 c -0.018 -0.003 -0.035 -0.004 -0.053 -0.004 H 87.11 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,112,224)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                          <path d="M 7.581 37.841 c -0.338 0 -0.626 0.246 -0.679 0.581 L 5.773 45.58 c 0.053 -0.334 0.341 -0.581 0.679 -0.581 H 9.76 c 3.328 0 6.153 -2.428 6.669 -5.719 c 0.038 -0.246 0.06 -0.494 0.065 -0.742 c -0.846 -0.444 -1.84 -0.697 -2.928 -0.697 L 7.581 37.841 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,28,100)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                          <path d="M 16.494 38.539 c -0.005 0.249 -0.027 0.497 -0.065 0.742 C 15.913 42.571 13.088 45 9.76 45 H 6.453 c -0.338 0 -0.627 0.246 -0.679 0.581 l -1.038 6.578 l -0.65 4.127 c -0.048 0.304 0.159 0.59 0.463 0.639 c 0.029 0.005 0.059 0.007 0.088 0.007 h 3.59 c 0.338 0 0.626 -0.246 0.679 -0.581 l 0.946 -5.997 c 0.053 -0.334 0.341 -0.581 0.68 -0.581 h 2.113 c 3.328 0 6.153 -2.428 6.669 -5.719 C 19.68 41.718 18.504 39.593 16.494 38.539 L 16.494 38.539 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,112,224)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                          <path d="M 3.503 33.07 c -0.338 0 -0.627 0.246 -0.679 0.58 L 0.007 51.512 c -0.053 0.339 0.209 0.646 0.552 0.646 h 4.177 l 1.037 -6.578 l 1.129 -7.158 c 0.053 -0.334 0.341 -0.58 0.679 -0.581 h 5.984 c 1.089 0 2.082 0.254 2.928 0.697 c 0.058 -2.996 -2.414 -5.469 -5.813 -5.469 H 3.503 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                          <path d="M 68.343 37.841 h -4.805 c -0.185 0 -0.343 0.134 -0.372 0.318 l -2.144 13.597 c -0.03 0.19 0.1 0.368 0.29 0.398 c 0.018 0.003 0.036 0.004 0.054 0.004 h 2.543 c 0.185 0 0.343 -0.135 0.372 -0.318 l 0.63 -3.993 c 0.029 -0.183 0.186 -0.318 0.372 -0.318 h 2.312 c 2.701 0 4.994 -1.971 5.412 -4.641 C 73.429 40.195 71.325 37.847 68.343 37.841 z M 69.722 42.769 c -0.157 0.996 -0.927 1.729 -2.4 1.729 h -1.883 l 0.571 -3.621 h 1.85 C 69.383 40.877 69.879 41.775 69.722 42.769 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,112,224)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                          <path d="M 33.584 37.841 h -4.805 c -0.185 0 -0.343 0.134 -0.372 0.318 l -2.144 13.597 c -0.03 0.19 0.1 0.368 0.29 0.398 c 0.018 0.003 0.036 0.004 0.054 0.004 h 2.543 c 0.185 0 0.343 -0.135 0.372 -0.318 l 0.63 -3.993 c 0.029 -0.183 0.186 -0.318 0.372 -0.318 h 2.312 c 2.701 0 4.994 -1.971 5.413 -4.641 C 38.669 40.195 36.566 37.847 33.584 37.841 z M 34.962 42.769 c -0.157 0.996 -0.927 1.729 -2.4 1.729 H 30.68 l 0.571 -3.621 h 1.85 C 34.623 40.877 35.119 41.775 34.962 42.769 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                          <path d="M 84.078 42.131 c -0.018 -0.003 -0.036 -0.004 -0.055 -0.004 h -2.414 c -0.185 0 -0.343 0.135 -0.371 0.318 l -0.079 0.501 c 0 0 -1.054 -1.151 -2.981 -1.144 h 0 c -0.642 0.002 -1.381 0.134 -2.21 0.479 c -1.902 0.793 -2.816 2.432 -3.204 3.627 c 0 0 -1.234 3.645 1.556 5.648 c 0 0 2.587 1.928 5.5 -0.119 l -0.05 0.32 c -0.03 0.19 0.1 0.368 0.29 0.398 c 0.018 0.003 0.036 0.004 0.054 0.004 h 2.414 c 0.185 0 0.343 -0.135 0.372 -0.318 l 1.469 -9.311 C 84.397 42.339 84.268 42.161 84.078 42.131 z M 80.476 47.273 c -0.211 1.335 -1.306 2.319 -2.71 2.319 c -0.277 0 -0.53 -0.038 -0.758 -0.111 c -1.041 -0.334 -1.635 -1.335 -1.465 -2.419 c 0.211 -1.335 1.309 -2.319 2.714 -2.319 v 0 c 0.277 0 0.531 0.038 0.758 0.111 C 80.057 45.188 80.647 46.188 80.476 47.273 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,112,224)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                          <polygon points="43.42,41.8 43.42,41.8 43.42,41.8 " style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform="  matrix(1 0 0 1 0 0) "/>
                          <path d="M 49.317 42.131 c -0.018 -0.003 -0.036 -0.004 -0.054 -0.004 h -2.414 c -0.185 0 -0.343 0.135 -0.372 0.318 l -0.079 0.501 c 0 0 -1.054 -1.151 -2.981 -1.144 c -0.642 0.002 -1.381 0.134 -2.21 0.479 c -1.902 0.793 -2.816 2.432 -3.204 3.627 c 0 0 -1.235 3.645 1.555 5.648 c 0 0 2.588 1.928 5.5 -0.119 l -0.05 0.32 c -0.03 0.19 0.1 0.368 0.29 0.398 c 0.018 0.003 0.036 0.004 0.053 0.004 h 2.414 c 0.185 0 0.343 -0.135 0.372 -0.318 l 1.468 -9.311 C 49.637 42.339 49.507 42.161 49.317 42.131 z M 45.717 47.273 c -0.211 1.335 -1.306 2.319 -2.71 2.319 c -0.277 0 -0.53 -0.038 -0.758 -0.111 c -1.041 -0.334 -1.635 -1.335 -1.465 -2.419 c 0.211 -1.335 1.309 -2.319 2.714 -2.319 v 0 c 0.277 0 0.531 0.038 0.758 0.111 C 45.297 45.188 45.888 46.188 45.717 47.273 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-1">
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Or pay with card</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                </div>
                
                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Name on Card</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      {...register('cardholderName')}
                      placeholder="Jane Doe" 
                      className={`w-full px-3 py-2.5 rounded-lg border-2 ${errors.cardholderName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-4 transition-all text-sm`} 
                    />
                  </div>
                  {errors.cardholderName && (
                    <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{errors.cardholderName.message}</p>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Card Number</label>
                  <div className="relative">
                    <input 
                      id="card-input"
                      type="text" 
                      {...register('cardNumber')}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        setValue('cardNumber', formatted, { shouldValidate: true });
                        if (formatted.length === 19) {
                          document.getElementById('expiry-input')?.focus();
                        }
                      }}
                      placeholder="0000 0000 0000 0000" 
                      maxLength={19}
                      className={`w-full pl-10 pr-3 py-2.5 rounded-lg border-2 ${errors.cardNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-4 transition-all text-sm font-mono`} 
                    />
                    <CreditCard className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.cardNumber ? 'text-red-400' : 'text-slate-400'}`} />
                  </div>
                  {errors.cardNumber && (
                    <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{errors.cardNumber.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Expiry Date</label>
                    <div className="relative">
                      <input 
                        id="expiry-input"
                        type="text" 
                        {...register('expiry')}
                        onChange={(e) => {
                          const formatted = formatExpiry(e.target.value);
                          setValue('expiry', formatted, { shouldValidate: true });
                          if (formatted.length === 5) {
                            document.getElementById('cvc-input')?.focus();
                          }
                        }}
                        placeholder="MM/YY" 
                        maxLength={5}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border-2 ${errors.expiry ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-4 transition-all text-sm font-mono`} 
                      />
                      <Calendar className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.expiry ? 'text-red-400' : 'text-slate-400'}`} />
                    </div>
                    {errors.expiry && (
                      <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{errors.expiry.message}</p>
                    )}
                  </div>
                  
                  {/* CVC */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">CVC</label>
                    <div className="relative">
                      <input 
                        id="cvc-input"
                        type="text" 
                        {...register('cvc')}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setValue('cvc', val, { shouldValidate: true });
                        }}
                        placeholder="123" 
                        maxLength={4}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border-2 ${errors.cvc ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-4 transition-all text-sm font-mono`} 
                      />
                      <Hash className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.cvc ? 'text-red-400' : 'text-slate-400'}`} />
                    </div>
                    {errors.cvc && (
                      <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{errors.cvc.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-4 flex items-center justify-between w-full px-4">
                    {/* Mastercard */}
                    <svg className="h-9 w-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                      <g style={{stroke: "none", strokeWidth: 0, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "none", fillRule: "nonzero", opacity: 1}} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                        <path d="M 84.259 16.068 H 5.741 C 2.57 16.068 0 18.638 0 21.809 v 6.131 v 2 V 60.06 v 2 v 6.131 c 0 3.171 2.57 5.741 5.741 5.741 h 78.518 c 3.171 0 5.741 -2.57 5.741 -5.741 V 62.06 v -2 V 29.94 v -2 v -6.131 C 90 18.638 87.43 16.068 84.259 16.068 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(59,55,55)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 19.895 65.192 v -4.057 c 0 -1.552 -0.945 -2.568 -2.568 -2.568 c -0.811 0 -1.694 0.268 -2.3 1.15 c -0.473 -0.74 -1.15 -1.15 -2.166 -1.15 c -0.677 0 -1.355 0.205 -1.891 0.945 v -0.811 H 9.552 v 6.491 h 1.418 v -3.584 c 0 -1.15 0.607 -1.694 1.552 -1.694 c 0.945 0 1.418 0.607 1.418 1.694 v 3.584 h 1.418 v -3.584 c 0 -1.15 0.677 -1.694 1.552 -1.694 c 0.945 0 1.418 0.607 1.418 1.694 v 3.584 L 19.895 65.192 L 19.895 65.192 z M 40.928 58.701 h -2.3 V 56.74 H 37.21 v 1.962 h -1.284 v 1.284 h 1.284 v 2.978 c 0 1.489 0.607 2.363 2.229 2.363 c 0.607 0 1.284 -0.205 1.757 -0.473 l -0.41 -1.221 c -0.41 0.268 -0.882 0.339 -1.221 0.339 c -0.677 0 -0.945 -0.41 -0.945 -1.079 v -2.907 h 2.3 v -1.284 H 40.928 z M 52.965 58.559 c -0.811 0 -1.355 0.41 -1.694 0.945 v -0.811 h -1.418 v 6.491 h 1.418 v -3.655 c 0 -1.079 0.473 -1.694 1.355 -1.694 c 0.268 0 0.607 0.071 0.882 0.134 l 0.41 -1.355 C 53.634 58.559 53.232 58.559 52.965 58.559 L 52.965 58.559 z M 34.775 59.237 c -0.677 -0.473 -1.623 -0.677 -2.639 -0.677 c -1.623 0 -2.702 0.811 -2.702 2.095 c 0 1.079 0.811 1.694 2.229 1.891 l 0.677 0.071 c 0.74 0.134 1.15 0.339 1.15 0.677 c 0 0.473 -0.544 0.811 -1.489 0.811 c -0.945 0 -1.694 -0.339 -2.166 -0.677 l -0.677 1.079 c 0.74 0.544 1.757 0.811 2.773 0.811 c 1.891 0 2.978 -0.882 2.978 -2.095 c 0 -1.15 -0.882 -1.757 -2.229 -1.962 l -0.677 -0.071 c -0.607 -0.071 -1.079 -0.205 -1.079 -0.607 c 0 -0.473 0.473 -0.74 1.221 -0.74 c 0.811 0 1.623 0.339 2.032 0.544 L 34.775 59.237 L 34.775 59.237 z M 72.501 58.559 c -0.811 0 -1.355 0.41 -1.694 0.945 v -0.811 h -1.418 v 6.491 h 1.418 v -3.655 c 0 -1.079 0.473 -1.694 1.355 -1.694 c 0.268 0 0.607 0.071 0.882 0.134 l 0.41 -1.339 C 73.178 58.559 72.777 58.559 72.501 58.559 L 72.501 58.559 z M 54.383 61.947 c 0 1.962 1.355 3.379 3.45 3.379 c 0.945 0 1.623 -0.205 2.3 -0.74 l -0.677 -1.15 c -0.544 0.41 -1.079 0.607 -1.694 0.607 c -1.15 0 -1.962 -0.811 -1.962 -2.095 c 0 -1.221 0.811 -2.032 1.962 -2.095 c 0.607 0 1.15 0.205 1.694 0.607 l 0.677 -1.15 c -0.677 -0.544 -1.355 -0.74 -2.3 -0.74 C 55.738 58.559 54.383 59.985 54.383 61.947 L 54.383 61.947 L 54.383 61.947 z M 67.499 61.947 v -3.246 h -1.418 v 0.811 c -0.473 -0.607 -1.15 -0.945 -2.032 -0.945 c -1.828 0 -3.246 1.418 -3.246 3.379 s 1.418 3.379 3.246 3.379 c 0.945 0 1.623 -0.339 2.032 -0.945 v 0.811 h 1.418 V 61.947 L 67.499 61.947 z M 62.292 61.947 c 0 -1.15 0.74 -2.095 1.962 -2.095 c 1.15 0 1.962 0.882 1.962 2.095 c 0 1.15 -0.811 2.095 -1.962 2.095 C 63.04 63.971 62.292 63.089 62.292 61.947 L 62.292 61.947 z M 45.323 58.559 c -1.891 0 -3.246 1.355 -3.246 3.379 c 0 2.032 1.355 3.379 3.316 3.379 c 0.945 0 1.891 -0.268 2.639 -0.882 l -0.677 -1.016 c -0.544 0.41 -1.221 0.677 -1.891 0.677 c -0.882 0 -1.757 -0.41 -1.961 -1.552 h 4.797 c 0 -0.205 0 -0.339 0 -0.544 C 48.364 59.914 47.143 58.559 45.323 58.559 L 45.323 58.559 L 45.323 58.559 z M 45.323 59.78 c 0.882 0 1.489 0.544 1.623 1.552 h -3.379 C 43.701 60.458 44.307 59.78 45.323 59.78 L 45.323 59.78 z M 80.552 61.947 v -5.814 h -1.418 v 3.379 c -0.473 -0.607 -1.15 -0.945 -2.032 -0.945 c -1.828 0 -3.246 1.418 -3.246 3.379 s 1.418 3.379 3.246 3.379 c 0.945 0 1.623 -0.339 2.032 -0.945 v 0.811 h 1.418 V 61.947 L 80.552 61.947 z M 75.345 61.947 c 0 -1.15 0.74 -2.095 1.962 -2.095 c 1.15 0 1.962 0.882 1.962 2.095 c 0 1.15 -0.811 2.095 -1.962 2.095 C 76.085 63.971 75.345 63.089 75.345 61.947 L 75.345 61.947 z M 27.875 61.947 v -3.246 h -1.418 v 0.811 c -0.473 -0.607 -1.15 -0.945 -2.032 -0.945 c -1.828 0 -3.246 1.418 -3.246 3.379 s 1.418 3.379 3.246 3.379 c 0.945 0 1.623 -0.339 2.032 -0.945 v 0.811 h 1.418 V 61.947 L 27.875 61.947 z M 22.605 61.947 c 0 -1.15 0.74 -2.095 1.962 -2.095 c 1.15 0 1.962 0.882 1.962 2.095 c 0 1.15 -0.811 2.095 -1.962 2.095 C 23.345 63.971 22.605 63.089 22.605 61.947 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(212,212,212)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <rect x="38.6" y="26.91" rx="0" ry="0" width="12.72" height="22.86" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(255,90,0)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) "/>
                        <path d="M 39.451 38.339 c 0 -4.645 2.184 -8.767 5.534 -11.43 c -2.466 -1.939 -5.576 -3.111 -8.969 -3.111 c -8.038 0 -14.541 6.503 -14.541 14.541 S 27.978 52.88 36.015 52.88 c 3.393 0 6.503 -1.172 8.969 -3.111 C 41.629 47.143 39.451 42.983 39.451 38.339 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(235,0,27)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 68.495 38.339 c 0 8.038 -6.503 14.541 -14.541 14.541 c -3.393 0 -6.503 -1.172 -8.969 -3.111 c 3.393 -2.668 5.534 -6.786 5.534 -11.43 s -2.184 -8.767 -5.534 -11.43 c 2.461 -1.939 5.572 -3.111 8.965 -3.111 C 61.992 23.798 68.495 30.343 68.495 38.339 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(247,158,27)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 4 68.191 V 62.06 v -2 V 29.94 v -2 v -6.131 c 0 -3.171 2.57 -5.741 5.741 -5.741 h -4 C 2.57 16.068 0 18.638 0 21.809 v 6.131 V 62.06 v 6.131 c 0 3.171 2.57 5.741 5.741 5.741 h 4 C 6.57 73.932 4 71.362 4 68.191 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(46,42,42)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                      </g>
                    </svg>

                    {/* Visa */}
                    <div className="flex items-center justify-center dark:w-10 dark:h-6 dark:bg-white dark:rounded">
                      <svg className="h-9 w-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                      <g style={{stroke: "none", strokeWidth: 0, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "none", fillRule: "nonzero", opacity: 1}} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                        <path d="M 0 31.418 c 1.209 -0.622 2.591 -0.371 3.889 -0.395 c 2.973 0.078 5.953 -0.072 8.926 0.06 c 1.34 -0.006 2.489 1.107 2.674 2.405 c 0.933 4.523 1.789 9.064 2.704 13.599 c -1.514 -5.313 -5.51 -9.65 -10.207 -12.408 C 5.504 33.189 2.734 32.322 0 31.418 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(244,169,41)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 25.87 31.035 c 2.579 0.03 5.151 0.018 7.724 0 c -3.913 9.351 -7.562 18.81 -11.559 28.125 c -2.513 -0.078 -5.026 -0.042 -7.538 -0.042 c -2.226 -8.131 -4.302 -16.303 -6.509 -24.44 c 4.697 2.758 8.693 7.096 10.207 12.408 c 0.227 1.029 0.389 2.082 0.586 3.123 C 21.125 43.815 23.501 37.425 25.87 31.035 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(27,77,162)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 36.483 31.023 c 2.423 0.018 4.846 0.018 7.269 0 c -1.49 9.369 -3.057 18.726 -4.511 28.101 c -2.411 0.006 -4.822 0.006 -7.239 0 C 33.39 49.744 35.024 40.399 36.483 31.023 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(27,77,162)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 50.645 32.788 c 4.344 -2.854 10.021 -2.77 14.826 -1.191 c -0.221 2.076 -0.568 4.134 -0.927 6.186 c -2.555 -1.226 -5.534 -1.771 -8.31 -1.059 c -1.31 0.311 -2.603 1.938 -1.514 3.159 c 2.238 2.291 5.761 2.812 7.867 5.307 c 2.441 2.387 2.351 6.408 0.688 9.202 c -1.759 2.95 -5.145 4.493 -8.442 4.936 c -3.727 0.389 -7.61 0.156 -11.104 -1.286 c 0.371 -2.094 0.682 -4.2 1.059 -6.294 c 3.021 1.562 6.527 2.345 9.896 1.597 c 1.143 -0.383 2.321 -1.322 2.22 -2.662 c -0.377 -1.597 -2.046 -2.279 -3.344 -3.003 c -2.519 -1.238 -5.229 -2.758 -6.36 -5.48 C 45.793 38.759 47.653 34.733 50.645 32.788 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(27,77,162)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 84.119 31.059 c -2.226 0.042 -4.463 -0.09 -6.689 0.066 c -1.514 0.078 -2.471 1.484 -2.956 2.776 c -3.5 8.424 -7.042 16.83 -10.548 25.248 c 2.537 -0.006 5.073 -0.006 7.61 -0.006 c 0.532 -1.406 1.047 -2.824 1.544 -4.242 c 3.099 0.018 6.198 0.012 9.303 0.012 c 0.287 1.418 0.586 2.83 0.903 4.236 c 2.238 -0.006 4.475 -0.006 6.713 -0.012 C 88.038 49.78 86.111 40.416 84.119 31.059 z M 75.192 49.121 c 1.352 -3.476 2.459 -7.054 3.973 -10.464 c 0.449 3.53 1.328 6.988 2.052 10.47 C 79.207 49.127 77.203 49.127 75.192 49.121 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(27,77,162)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                      </g>
                    </svg>
                    </div>

                    {/* Google Pay */}
                    <div className="flex items-center justify-center dark:w-10 dark:h-6 dark:bg-white dark:rounded">
                      <svg className="h-9 w-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                      <g style={{stroke: "none", strokeWidth: 0, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "none", fillRule: "nonzero", opacity: 1}} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                        <path d="M 42.54 44.553 v 10.459 h -3.374 V 29.145 h 8.772 c 2.137 0 4.161 0.787 5.736 2.249 c 1.575 1.35 2.362 3.374 2.362 5.511 s -0.787 4.049 -2.362 5.511 c -1.575 1.462 -3.486 2.249 -5.736 2.249 L 42.54 44.553 L 42.54 44.553 z M 42.54 32.294 v 8.997 h 5.623 c 1.237 0 2.474 -0.45 3.261 -1.35 c 1.799 -1.687 1.799 -4.499 0.112 -6.186 l -0.112 -0.112 c -0.9 -0.9 -2.024 -1.462 -3.261 -1.35 L 42.54 32.294 L 42.54 32.294 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(95,99,104)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 63.796 36.793 c 2.474 0 4.386 0.675 5.848 2.024 c 1.462 1.35 2.137 3.149 2.137 5.398 v 10.797 h -3.149 v -2.474 h -0.112 c -1.35 2.024 -3.261 3.037 -5.511 3.037 c -1.912 0 -3.599 -0.562 -4.948 -1.687 c -1.237 -1.125 -2.024 -2.699 -2.024 -4.386 c 0 -1.799 0.675 -3.261 2.024 -4.386 c 1.35 -1.125 3.261 -1.575 5.511 -1.575 c 2.024 0 3.599 0.337 4.836 1.125 v -0.787 c 0 -1.125 -0.45 -2.249 -1.35 -2.924 c -0.9 -0.787 -2.024 -1.237 -3.261 -1.237 c -1.912 0 -3.374 0.787 -4.386 2.362 l -2.924 -1.799 C 58.285 37.918 60.647 36.793 63.796 36.793 z M 59.522 49.614 c 0 0.9 0.45 1.687 1.125 2.137 c 0.787 0.562 1.687 0.9 2.587 0.9 c 1.35 0 2.699 -0.562 3.711 -1.575 c 1.125 -1.012 1.687 -2.249 1.687 -3.599 c -1.012 -0.787 -2.474 -1.237 -4.386 -1.237 c -1.35 0 -2.474 0.337 -3.374 1.012 C 59.972 47.815 59.522 48.602 59.522 49.614 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(95,99,104)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 90 37.355 l -11.134 25.53 h -3.374 L 79.653 54 l -7.31 -16.532 h 3.599 l 5.286 12.709 h 0.112 l 5.173 -12.709 H 90 V 37.355 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(95,99,104)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 29.157 42.304 c 0 -1.012 -0.112 -2.024 -0.225 -3.037 H 14.873 v 5.736 h 7.985 c -0.337 1.799 -1.35 3.486 -2.924 4.499 v 3.711 h 4.836 C 27.582 50.626 29.157 46.802 29.157 42.304 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(66,133,244)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 14.873 56.812 c 4.049 0 7.423 -1.35 9.897 -3.599 l -4.836 -3.711 c -1.35 0.9 -3.037 1.462 -5.061 1.462 c -3.824 0 -7.198 -2.587 -8.322 -6.186 H 1.603 v 3.824 C 4.189 53.663 9.25 56.812 14.873 56.812 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(52,168,83)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 6.551 44.778 c -0.675 -1.799 -0.675 -3.824 0 -5.736 v -3.824 H 1.603 c -2.137 4.161 -2.137 9.11 0 13.383 L 6.551 44.778 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(251,188,4)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 14.873 32.969 c 2.137 0 4.161 0.787 5.736 2.249 l 0 0 l 4.274 -4.274 c -2.699 -2.474 -6.298 -3.936 -9.897 -3.824 c -5.623 0 -10.797 3.149 -13.271 8.21 l 4.948 3.824 C 7.676 35.556 11.05 32.969 14.873 32.969 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(234,67,53)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                      </g>
                    </svg>
                    </div>

                    {/* Apple Pay */}
                    <div className="flex items-center justify-center dark:w-10 dark:h-6 dark:bg-white dark:rounded">
                      <svg className="h-9 w-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                      <g style={{stroke: "none", strokeWidth: 0, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "none", fillRule: "nonzero", opacity: 1}} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                        <path d="M 16.445 31.287 c -1.055 1.248 -2.743 2.233 -4.43 2.092 c -0.211 -1.688 0.615 -3.481 1.582 -4.588 c 1.055 -1.283 2.901 -2.198 4.395 -2.268 C 18.168 28.281 17.482 30.004 16.445 31.287 M 17.974 33.714 c -2.444 -0.141 -4.536 1.389 -5.696 1.389 c -1.178 0 -2.953 -1.319 -4.887 -1.283 c -2.514 0.035 -4.852 1.459 -6.135 3.727 c -2.637 4.536 -0.686 11.251 1.863 14.943 c 1.248 1.828 2.743 3.832 4.711 3.762 c 1.863 -0.07 2.602 -1.213 4.852 -1.213 c 2.268 0 2.918 1.213 4.887 1.178 c 2.039 -0.035 3.323 -1.828 4.571 -3.657 c 1.424 -2.074 2.004 -4.096 2.039 -4.202 c -0.035 -0.035 -3.938 -1.529 -3.973 -6.03 c -0.035 -3.762 3.077 -5.555 3.217 -5.661 C 21.666 34.065 18.923 33.784 17.974 33.714 M 32.091 28.615 v 27.407 h 4.254 v -9.37 h 5.889 c 5.38 0 9.159 -3.692 9.159 -9.036 s -3.709 -9.001 -9.019 -9.001 L 32.091 28.615 L 32.091 28.615 z M 36.345 32.202 h 4.905 c 3.692 0 5.801 1.969 5.801 5.432 s -2.11 5.45 -5.819 5.45 h -4.887 V 32.202 z M 59.164 56.234 c 2.672 0 5.151 -1.354 6.276 -3.498 h 0.088 v 3.287 h 3.938 V 42.381 c 0 -3.956 -3.164 -6.505 -8.034 -6.505 c -4.518 0 -7.858 2.584 -7.981 6.135 h 3.832 c 0.316 -1.688 1.881 -2.795 4.026 -2.795 c 2.602 0 4.061 1.213 4.061 3.446 v 1.512 l -5.309 0.316 c -4.94 0.299 -7.612 2.321 -7.612 5.837 C 52.449 53.878 55.209 56.234 59.164 56.234 z M 60.307 52.981 c -2.268 0 -3.709 -1.09 -3.709 -2.76 c 0 -1.723 1.389 -2.725 4.043 -2.883 l 4.729 -0.299 v 1.547 C 65.37 51.153 63.19 52.981 60.307 52.981 z M 74.723 63.477 c 4.149 0 6.1 -1.582 7.806 -6.382 L 90 36.14 h -4.325 l -5.01 16.191 h -0.088 l -5.01 -16.191 h -4.448 l 7.208 19.953 l -0.387 1.213 c -0.65 2.057 -1.705 2.848 -3.586 2.848 c -0.334 0 -0.984 -0.035 -1.248 -0.07 v 3.287 C 73.352 63.442 74.406 63.477 74.723 63.477 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,0,0)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                      </g>
                    </svg>
                    </div>

                    {/* PayPal */}
                    <div className="flex items-center justify-center dark:w-10 dark:h-6 dark:bg-white dark:rounded">
                      <svg className="h-9 w-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                      <g style={{stroke: "none", strokeWidth: 0, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "none", fillRule: "nonzero", opacity: 1}} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                        <path d="M 50.752 42.126 c -0.191 0 -0.327 0.187 -0.269 0.369 l 2.646 8.212 l -2.393 3.87 c -0.116 0.188 0.019 0.431 0.24 0.431 h 2.828 c 0.164 0 0.317 -0.086 0.402 -0.227 l 7.391 -12.226 c 0.113 -0.188 -0.022 -0.428 -0.242 -0.428 h -2.828 c -0.166 0 -0.32 0.088 -0.404 0.231 l -2.909 4.912 l -1.477 -4.875 c -0.048 -0.159 -0.195 -0.267 -0.36 -0.267 L 50.752 42.126 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 87.11 37.841 c -0.185 0 -0.343 0.135 -0.372 0.318 l -2.145 13.596 c -0.03 0.19 0.099 0.368 0.289 0.398 c 0.018 0.003 0.036 0.004 0.055 0.004 h 2.543 c 0.185 0 0.343 -0.135 0.372 -0.318 l 2.144 -13.597 c 0.03 -0.19 -0.1 -0.368 -0.29 -0.398 c -0.018 -0.003 -0.035 -0.004 -0.053 -0.004 H 87.11 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,112,224)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 7.581 37.841 c -0.338 0 -0.626 0.246 -0.679 0.581 L 5.773 45.58 c 0.053 -0.334 0.341 -0.581 0.679 -0.581 H 9.76 c 3.328 0 6.153 -2.428 6.669 -5.719 c 0.038 -0.246 0.06 -0.494 0.065 -0.742 c -0.846 -0.444 -1.84 -0.697 -2.928 -0.697 L 7.581 37.841 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,28,100)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 16.494 38.539 c -0.005 0.249 -0.027 0.497 -0.065 0.742 C 15.913 42.571 13.088 45 9.76 45 H 6.453 c -0.338 0 -0.627 0.246 -0.679 0.581 l -1.038 6.578 l -0.65 4.127 c -0.048 0.304 0.159 0.59 0.463 0.639 c 0.029 0.005 0.059 0.007 0.088 0.007 h 3.59 c 0.338 0 0.626 -0.246 0.679 -0.581 l 0.946 -5.997 c 0.053 -0.334 0.341 -0.581 0.68 -0.581 h 2.113 c 3.328 0 6.153 -2.428 6.669 -5.719 C 19.68 41.718 18.504 39.593 16.494 38.539 L 16.494 38.539 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,112,224)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 3.503 33.07 c -0.338 0 -0.627 0.246 -0.679 0.58 L 0.007 51.512 c -0.053 0.339 0.209 0.646 0.552 0.646 h 4.177 l 1.037 -6.578 l 1.129 -7.158 c 0.053 -0.334 0.341 -0.58 0.679 -0.581 h 5.984 c 1.089 0 2.082 0.254 2.928 0.697 c 0.058 -2.996 -2.414 -5.469 -5.813 -5.469 H 3.503 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 68.343 37.841 h -4.805 c -0.185 0 -0.343 0.134 -0.372 0.318 l -2.144 13.597 c -0.03 0.19 0.1 0.368 0.29 0.398 c 0.018 0.003 0.036 0.004 0.054 0.004 h 2.543 c 0.185 0 0.343 -0.135 0.372 -0.318 l 0.63 -3.993 c 0.029 -0.183 0.186 -0.318 0.372 -0.318 h 2.312 c 2.701 0 4.994 -1.971 5.412 -4.641 C 73.429 40.195 71.325 37.847 68.343 37.841 z M 69.722 42.769 c -0.157 0.996 -0.927 1.729 -2.4 1.729 h -1.883 l 0.571 -3.621 h 1.85 C 69.383 40.877 69.879 41.775 69.722 42.769 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,112,224)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 33.584 37.841 h -4.805 c -0.185 0 -0.343 0.134 -0.372 0.318 l -2.144 13.597 c -0.03 0.19 0.1 0.368 0.29 0.398 c 0.018 0.003 0.036 0.004 0.054 0.004 h 2.543 c 0.185 0 0.343 -0.135 0.372 -0.318 l 0.63 -3.993 c 0.029 -0.183 0.186 -0.318 0.372 -0.318 h 2.312 c 2.701 0 4.994 -1.971 5.413 -4.641 C 38.669 40.195 36.566 37.847 33.584 37.841 z M 34.962 42.769 c -0.157 0.996 -0.927 1.729 -2.4 1.729 H 30.68 l 0.571 -3.621 h 1.85 C 34.623 40.877 35.119 41.775 34.962 42.769 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 84.078 42.131 c -0.018 -0.003 -0.036 -0.004 -0.055 -0.004 h -2.414 c -0.185 0 -0.343 0.135 -0.371 0.318 l -0.079 0.501 c 0 0 -1.054 -1.151 -2.981 -1.144 h 0 c -0.642 0.002 -1.381 0.134 -2.21 0.479 c -1.902 0.793 -2.816 2.432 -3.204 3.627 c 0 0 -1.234 3.645 1.556 5.648 c 0 0 2.587 1.928 5.5 -0.119 l -0.05 0.32 c -0.03 0.19 0.1 0.368 0.29 0.398 c 0.018 0.003 0.036 0.004 0.054 0.004 h 2.414 c 0.185 0 0.343 -0.135 0.372 -0.318 l 1.469 -9.311 C 84.397 42.339 84.268 42.161 84.078 42.131 z M 80.476 47.273 c -0.211 1.335 -1.306 2.319 -2.71 2.319 c -0.277 0 -0.53 -0.038 -0.758 -0.111 c -1.041 -0.334 -1.635 -1.335 -1.465 -2.419 c 0.211 -1.335 1.309 -2.319 2.714 -2.319 v 0 c 0.277 0 0.531 0.038 0.758 0.111 C 80.057 45.188 80.647 46.188 80.476 47.273 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,112,224)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <polygon points="43.42,41.8 43.42,41.8 43.42,41.8 " style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform="  matrix(1 0 0 1 0 0) "/>
                        <path d="M 49.317 42.131 c -0.018 -0.003 -0.036 -0.004 -0.054 -0.004 h -2.414 c -0.185 0 -0.343 0.135 -0.372 0.318 l -0.079 0.501 c 0 0 -1.054 -1.151 -2.981 -1.144 c -0.642 0.002 -1.381 0.134 -2.21 0.479 c -1.902 0.793 -2.816 2.432 -3.204 3.627 c 0 0 -1.235 3.645 1.555 5.648 c 0 0 2.588 1.928 5.5 -0.119 l -0.05 0.32 c -0.03 0.19 0.1 0.368 0.29 0.398 c 0.018 0.003 0.036 0.004 0.053 0.004 h 2.414 c 0.185 0 0.343 -0.135 0.372 -0.318 l 1.468 -9.311 C 49.637 42.339 49.507 42.161 49.317 42.131 z M 45.717 47.273 c -0.211 1.335 -1.306 2.319 -2.71 2.319 c -0.277 0 -0.53 -0.038 -0.758 -0.111 c -1.041 -0.334 -1.635 -1.335 -1.465 -2.419 c 0.211 -1.335 1.309 -2.319 2.714 -2.319 v 0 c 0.277 0 0.531 0.038 0.758 0.111 C 45.297 45.188 45.888 46.188 45.717 47.273 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,48,135)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                      </g>
                    </svg>
                    </div>

                    {/* AMEX */}
                    <svg className="h-9 w-auto" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                      <g style={{stroke: "none", strokeWidth: 0, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "none", fillRule: "nonzero", opacity: 1}} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                        <path d="M 84.259 16.068 H 5.741 C 2.57 16.068 0 18.638 0 21.809 v 6.131 v 2 V 60.06 v 2 v 6.131 c 0 3.171 2.57 5.741 5.741 5.741 h 78.518 c 3.171 0 5.741 -2.57 5.741 -5.741 V 62.06 v -2 V 29.94 v -2 v -6.131 C 90 18.638 87.43 16.068 84.259 16.068 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(1,111,208)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 4 68.191 V 62.06 v -2 V 29.94 v -2 v -6.131 c 0 -3.171 2.57 -5.741 5.741 -5.741 h -4 C 2.57 16.068 0 18.638 0 21.809 v 6.131 V 62.06 v 6.131 c 0 3.171 2.57 5.741 5.741 5.741 h 4 C 6.57 73.932 4 71.362 4 68.191 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(0,100,188)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                        <path d="M 17.513 36.122 L 9.5 53.855 h 9.593 l 1.189 -2.827 H 23 l 1.189 2.827 h 10.559 v -2.158 l 0.941 2.158 h 5.462 l 0.941 -2.203 v 2.203 h 21.959 l 2.67 -2.754 l 2.5 2.754 L 80.5 53.878 l -8.038 -8.839 l 8.038 -8.916 H 69.396 l -2.599 2.703 l -2.422 -2.703 H 40.487 l -2.051 4.577 l -2.099 -4.577 h -9.573 v 2.084 l -1.065 -2.084 C 25.698 36.122 17.513 36.122 17.513 36.122 z M 19.369 38.64 h 4.676 l 5.315 12.024 V 38.64 h 5.122 l 4.105 8.621 l 3.783 -8.621 h 5.097 v 12.724 h -3.101 l -0.025 -9.971 l -4.521 9.971 h -2.774 l -4.547 -9.971 v 9.971 h -6.38 l -1.21 -2.853 h -6.534 l -1.207 2.85 H 13.75 C 13.75 51.362 19.369 38.64 19.369 38.64 z M 50.305 38.64 h 12.61 l 3.857 4.166 l 3.981 -4.166 h 3.857 l -5.86 6.395 l 5.86 6.321 h -4.032 l -3.857 -4.214 l -4.001 4.214 H 50.305 L 50.305 38.64 L 50.305 38.64 z M 21.644 40.793 l -2.153 5.082 h 4.303 L 21.644 40.793 z M 53.419 41.275 v 2.323 h 6.879 v 2.589 h -6.879 v 2.536 h 7.716 l 3.585 -3.735 l -3.433 -3.715 h -7.868 L 53.419 41.275 z" style={{stroke: "none", strokeWidth: 1, strokeDasharray: "none", strokeLinecap: "butt", strokeLinejoin: "miter", strokeMiterlimit: 10, fill: "rgb(255,255,255)", fillRule: "nonzero", opacity: 1}} transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
                      </g>
                    </svg>
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:w-5/12 p-8 lg:p-12 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden flex flex-col justify-between">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] -translate-y-20 translate-x-20 pointer-events-none" />
              
              <div className="relative z-10">

                <div className="mb-8">
                  <div className={`rounded-2xl flex flex-col ${
                    planKey === 'PRO'
                      ? 'bg-blue-600 text-white shadow-2xl shadow-blue-300/50 dark:shadow-none pt-8 px-8 pb-7'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-sm'
                  }`}>
                    {planKey === 'PRO' && (
                      <div className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full w-fit mb-3">
                        Most Popular
                      </div>
                    )}
                    <h3 className={`font-bold text-lg ${planKey === 'PRO' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-2 mb-6 flex flex-col">
                      <div>
                        <span className={`text-3xl font-black ${planKey === 'PRO' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {formatLKR(monthlyPrice)}
                        </span>
                        <span className={`text-sm ml-1 ${planKey === 'PRO' ? 'text-blue-200' : 'text-slate-500'}`}>
                          /month
                        </span>
                      </div>
                      {isYearly && plan.price > 0 && (
                        <p className={`text-xs mt-1 ${planKey === 'PRO' ? 'text-blue-200' : 'text-slate-500'}`}>
                          Billed annually
                        </p>
                      )}
                    </div>
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features.slice(0, 8).map((feature, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${planKey === 'PRO' ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
                          <span className={`mt-0.5 ${planKey === 'PRO' ? 'text-white' : 'text-emerald-500'}`}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <div className={`mt-auto pt-6 border-t ${planKey === 'PRO' ? 'border-white/20' : 'border-slate-100 dark:border-slate-800'}`}>
                      <button 
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                          planKey === 'PRO'
                            ? 'bg-white text-blue-600 hover:bg-blue-50'
                            : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <svg className={`w-4 h-4 animate-spin ${planKey === 'PRO' ? 'text-blue-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            Pay {formatLKR(totalDue)}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-3">
                <p className="text-xs text-center text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
                  Payments are secure and encrypted.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-sans">
        <MotionBlurBackground />
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading checkout...</p>
        </div>
        <SiteFooter />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
