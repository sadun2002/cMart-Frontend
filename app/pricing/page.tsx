"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Check, 
  X, 
  Rocket, 
  Crown, 
  Building, 
  ChevronDown, 
  ShieldCheck,
  Minus
} from 'lucide-react';
import { COMPANY_NAME, PLANS, formatLKR } from '@/lib/constants';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MotionBlurBackground } from '@/components/ui/motion-blur-background';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';

// FAQ Data
const faqs = [
  { q: "Can I change my plan later?", a: "Yes! You can upgrade or downgrade at any time. Changes take effect immediately." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, bank transfers, and various online payment gateways." },
  { q: "Is there a free trial?", a: "Yes! All users get a 30-day free trial of the Startup plan. No credit card required." },
  { q: "Can I use it offline?", a: "The Startup plan works completely offline. Pro and Enterprise require an internet connection for cloud sync." },
  { q: "Do you offer discounts for NGOs or startups?", a: "Yes! We offer 50% off for registered NGOs and early-stage startups. Contact us for details." },
  { q: "What happens to my data if I cancel?", a: "Your data remains accessible for 90 days after cancellation. Export anytime in CSV or JSON format." },
];

type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuthStore();
  const compareScrollRef = useRef<HTMLDivElement>(null);
  const [isComparePaused, setIsComparePaused] = useState(false);

  const handleBillingChange = (newBilling: BillingCycle) => {
    setBilling(newBilling);
    if (window.innerWidth < 768) {
      const targetId = newBilling === 'lifetime' ? 'plan-startup' : 'plan-pro';
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  useEffect(() => {
    // Scroll the Pro card to the center on mobile devices initially
    const proCard = document.getElementById('plan-pro');
    if (proCard && window.innerWidth < 768) {
      proCard.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
    }
  }, []);

  useEffect(() => {
    // Auto-scroll for the compare cards on mobile
    if (window.innerWidth >= 768) return;
    if (isComparePaused) return;

    const interval = setInterval(() => {
      if (compareScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = compareScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          compareScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          compareScrollRef.current.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isComparePaused]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors relative">
      <MotionBlurBackground />
      {/* Navigation (Matches Home Page) */}
      <SiteHeader />

      {/* HERO & PRICING PLANS */}
      <section className="pt-24 pb-20 px-6 relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Start Free — 30 Days
          </h1>
          <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-12">
            No credit card required. Try our POS risk-free and upgrade when you're ready.
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-14 bg-gray-100 dark:bg-slate-900 p-1.5 rounded-full w-fit mx-auto">
            <button
              onClick={() => handleBillingChange('monthly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center ${
                billing === 'monthly' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleBillingChange('yearly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                billing === 'yearly' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Annually <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full ml-0.5">-20%</span>
            </button>
            <button
              onClick={() => handleBillingChange('lifetime')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center ${
                billing === 'lifetime' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Lifetime
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto items-start text-left overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar pb-8 pt-4 lg:pt-8 px-4 md:px-0 -mx-4 md:mx-auto">
            {[
              {
                key: 'STARTUP',
                name: PLANS.STARTUP.name,
                price: billing === 'lifetime' ? PLANS.STARTUP.priceLifetime : billing === 'yearly' ? (PLANS.STARTUP.priceYearly / 12) : PLANS.STARTUP.priceMonthly,
                period: billing === 'lifetime' ? 'once' : '/mo',
                features: PLANS.STARTUP.features,
                highlight: false,
                rank: 0,
              },
              {
                key: 'PRO',
                name: PLANS.PRO.name,
                price: billing === 'lifetime' ? null : billing === 'yearly' ? (PLANS.PRO.priceYearly / 12) : PLANS.PRO.priceMonthly,
                period: '/mo',
                features: PLANS.PRO.features,
                highlight: true,
                rank: 1,
              },
              {
                key: 'ENTERPRISE',
                name: PLANS.ENTERPRISE.name,
                price: billing === 'lifetime' ? null : billing === 'yearly' ? (PLANS.ENTERPRISE.priceYearly / 12) : PLANS.ENTERPRISE.priceMonthly,
                period: '/mo',
                features: PLANS.ENTERPRISE.features,
                highlight: false,
                rank: 2,
              },
            ].map((plan) => {
              
              let cta = 'Start 30-Day Free Trial';
              let href = '/register';
              let disabled = false;

              if (user) {
                const isPending = user.role === 'STORE_OWNER' && user.tenant?.active === false;
                const userPlanStr = (user.tenant?.plan || 'STARTUP').toUpperCase();
                let userRank = 0;
                if (userPlanStr === 'PRO') userRank = 1;
                else if (userPlanStr === 'ENTERPRISE') userRank = 2;
                
                if (isPending) {
                  cta = plan.key === 'STARTUP' ? 'Start 30-Day Free Trial' : `Start with ${plan.name}`;
                  href = '/owner/dashboard';
                } else if (userRank === plan.rank) {
                  cta = 'Go to Dashboard';
                  href = '/owner/dashboard';
                  disabled = false;
                } else if (userRank < plan.rank) {
                  cta = `Upgrade to ${plan.name}`;
                  href = `/checkout?plan=${plan.key}&billing=${billing}`;
                } else {
                  cta = `Downgrade to ${plan.name}`;
                  href = `/checkout?plan=${plan.key}&billing=${billing}`;
                }
              } else {
                cta = plan.key === 'STARTUP' ? 'Start 30-Day Free Trial' : `Start with ${plan.name}`;
                href = `/register?redirect=${encodeURIComponent(`/checkout?plan=${plan.key}&billing=${billing}`)}`;
              }
              
              const isUnavailable = plan.price === null;

              return (
              <div
                key={plan.key}
                id={`plan-${plan.key.toLowerCase()}`}
                className={`w-[80vw] sm:w-[60vw] md:w-auto md:flex-1 snap-center shrink-0 rounded-2xl flex flex-col h-full ${
                  plan.highlight
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-300/50 dark:shadow-none p-5 lg:pt-8 lg:px-8 lg:pb-7 lg:scale-105 relative z-10'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 lg:p-7 shadow-sm'
                } ${isUnavailable ? 'opacity-70 pointer-events-none' : ''}`}
              >
                {plan.highlight && (
                  <div className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full w-fit mb-3">
                    Most Popular
                  </div>
                )}
                <h3 className={`font-bold text-lg ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <div className="mt-2 mb-6 text-left flex flex-col min-h-[80px]">
                  {isUnavailable ? (
                     <div className="flex flex-col justify-center h-full">
                       <span className={`text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-500'}`}>Not available</span>
                       <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>for lifetime billing</span>
                     </div>
                  ) : (
                    <>
                      <div>
                        <span className={`text-3xl md:text-xl lg:text-3xl xl:text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                          {plan.price !== null ? formatLKR(plan.price) : ''}
                        </span>
                        <span className={`text-sm ${plan.period === 'once' ? 'block mt-1' : 'ml-1'} ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>
                          {plan.period}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${plan.highlight ? "text-blue-200" : "text-gray-500"} ${!(billing === 'yearly' && plan.period !== 'once') ? 'invisible' : ''}`}>
                        Billed annually ({formatLKR(plan.price! * 12)}/yr)
                      </p>
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlight ? 'text-blue-100' : 'text-gray-600 dark:text-slate-400'}`}>
                      <Check className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-white' : 'text-green-500'}`} strokeWidth={3} />
                      <span className="leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className={`mt-auto pt-6 border-t ${plan.highlight ? 'border-white/20' : 'border-gray-100 dark:border-slate-800'}`}>
                  {plan.key === 'PRO' || plan.key === 'ENTERPRISE' ? (
                    <div
                      onClick={() => toast.info('This plan is coming soon!')}
                      className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer hover:opacity-90 ${
                        plan.highlight
                          ? 'bg-white/90 text-blue-600'
                          : 'bg-blue-600 dark:bg-blue-500 text-white'
                      }`}
                    >
                      Coming Soon
                    </div>
                  ) : disabled || isUnavailable ? (
                    <div
                      className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-colors cursor-default ${
                        plan.highlight
                          ? 'bg-white/90 text-blue-600'
                          : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isUnavailable ? 'Unavailable' : cta}
                    </div>
                  ) : (
                    <Link
                      href={href}
                      className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                        plan.highlight
                          ? 'bg-white text-blue-600 hover:bg-blue-50'
                          : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                      }`}
                    >
                      {cta}
                    </Link>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE SECTION */}
      <section className="py-24 relative z-10 bg-transparent transition-colors">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Compare All Features</h2>
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto hide-scrollbar rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                  <th className="p-4 sm:p-6 font-bold text-gray-900 dark:text-white text-sm sm:text-lg w-[40%]">Feature</th>
                  <th className="p-4 sm:p-6 font-bold text-gray-900 dark:text-white text-sm sm:text-lg text-center w-[20%]">Startup</th>
                  <th className="p-4 sm:p-6 font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-lg text-center w-[20%]">Pro</th>
                  <th className="p-4 sm:p-6 font-bold text-gray-900 dark:text-white text-sm sm:text-lg text-center w-[20%]">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {[
                  { feature: 'Target Audience', f: 'Local Shops', p: 'Online & Retail', e: 'Supermarkets/Chains' },
                  { feature: 'Working Mode', f: 'Offline', p: 'Cloud Sync', e: 'Cloud Sync' },
                  { feature: 'Lifetime Pricing', f: true, p: false, e: false },
                  { feature: 'POS system', f: true, p: true, e: true },
                  { feature: 'Inventory Management', f: true, p: true, e: true },
                  { feature: 'Online store', f: false, p: true, e: true },
                  { feature: 'Multi-device sync', f: false, p: true, e: true },
                  { feature: 'Cloud Backups', f: false, p: true, e: true },
                  { feature: 'Multi-location', f: false, p: false, e: true },
                  { feature: 'API access', f: false, p: false, e: true },
                  { feature: 'Roles & permissions', f: false, p: false, e: true },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 sm:p-6 text-gray-600 dark:text-slate-400 font-medium text-xs sm:text-base">{row.feature}</td>
                    {[row.f, row.p, row.e].map((val, colIdx) => (
                      <td key={colIdx} className="p-4 sm:p-6 text-center">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto" strokeWidth={3} />
                          ) : (
                            <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 dark:text-slate-700 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-900 dark:text-white font-semibold text-xs sm:text-base">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div 
            ref={compareScrollRef}
            onMouseEnter={() => setIsComparePaused(true)}
            onMouseLeave={() => setIsComparePaused(false)}
            onTouchStart={() => setIsComparePaused(true)}
            onTouchEnd={() => setIsComparePaused(false)}
            className="md:hidden flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-8 pt-2"
          >
            {[
              { name: 'Startup', key: 'f' as const, color: 'text-gray-900 dark:text-white' },
              { name: 'Pro', key: 'p' as const, color: 'text-blue-600 dark:text-blue-400' },
              { name: 'Enterprise', key: 'e' as const, color: 'text-gray-900 dark:text-white' }
            ].map((plan) => (
              <div key={plan.name} className="w-[85vw] snap-center shrink-0 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col">
                <h3 className={`text-xl font-bold mb-6 text-center ${plan.color}`}>{plan.name} Plan</h3>
                <div className="space-y-4 divide-y divide-gray-100 dark:divide-slate-800">
                  {[
                    { feature: 'Target Audience', f: 'Local Shops', p: 'Online & Retail', e: 'Supermarkets/Chains' },
                    { feature: 'Working Mode', f: 'Offline', p: 'Cloud Sync', e: 'Cloud Sync' },
                    { feature: 'Lifetime Pricing', f: true, p: false, e: false },
                    { feature: 'POS system', f: true, p: true, e: true },
                    { feature: 'Inventory Management', f: true, p: true, e: true },
                    { feature: 'Online store', f: false, p: true, e: true },
                    { feature: 'Multi-device sync', f: false, p: true, e: true },
                    { feature: 'Cloud Backups', f: false, p: true, e: true },
                    { feature: 'Multi-location', f: false, p: false, e: true },
                    { feature: 'API access', f: false, p: false, e: true },
                    { feature: 'Roles & permissions', f: false, p: false, e: true },
                  ].map((row, i) => {
                    const val = row[plan.key];
                    return (
                      <div key={i} className="flex justify-between items-center pt-4 first:pt-0">
                        <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">{row.feature}</span>
                        <div className="text-right">
                          {typeof val === 'boolean' ? (
                            val ? <Check className="w-5 h-5 text-emerald-500 ml-auto" strokeWidth={3} /> : <Minus className="w-5 h-5 text-gray-300 dark:text-slate-700 ml-auto" />
                          ) : (
                            <span className="text-gray-900 dark:text-white font-semibold text-sm">{val}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 relative z-10 bg-transparent transition-colors">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-shadow cursor-pointer"
                onClick={() => toggleFaq(i)}
              >
                <div className="p-6 flex items-center justify-between gap-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{faq.q}</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-400 dark:text-slate-500 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                <div 
                  className={`px-6 text-gray-600 dark:text-slate-400 transition-all duration-300 overflow-hidden ${openFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE TRIAL GUARANTEE */}
      <section className="py-20 relative z-10 bg-transparent transition-colors">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">30-Day Free Trial</h2>
          <p className="text-gray-500 dark:text-slate-400 text-lg">Try {COMPANY_NAME} completely free for 30 days. No credit card required to start.</p>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <SiteFooter />
    </div>
  );
}
