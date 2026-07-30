"use client";

import { useState } from 'react';
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
import { useAuthStore } from '@/lib/auth-store';

// FAQ Data
const faqs = [
  { q: "Can I change my plan later?", a: "Yes! You can upgrade or downgrade at any time. Changes take effect immediately." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, bank transfers, and PayHere payments for Sri Lankan customers." },
  { q: "Is there a free trial?", a: "Yes! All paid plans come with a 14-day free trial. No credit card required." },
  { q: "Can I cancel anytime?", a: "Absolutely. Cancel anytime with one click. No questions asked, no penalties." },
  { q: "Do you offer discounts for NGOs or startups?", a: "Yes! We offer 50% off for registered NGOs and early-stage startups. Contact us for details." },
  { q: "What happens to my data if I cancel?", a: "Your data remains accessible for 90 days after cancellation. Export anytime in CSV or JSON format." },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuthStore();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-50">
      {/* Navigation (Matches Home Page) */}
      <SiteHeader />

      {/* HERO & PRICING CARDS */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-12">
            No hidden fees. Cancel anytime. Choose the perfect plan for your business.
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-14">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 rounded-full bg-blue-600 flex items-center p-1 transition-colors"
              aria-label="Toggle Annual Billing"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                  isYearly ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
              Annually <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full ml-1">-20%</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-end text-left">
            {[
              {
                key: 'FREE',
                name: PLANS.FREE.name,
                price: 'Free',
                period: 'forever',
                features: PLANS.FREE.features,
                highlight: false,
                rank: 0,
              },
              {
                key: 'PRO',
                name: PLANS.PRO.name,
                price: formatLKR(isYearly ? PLANS.PRO.price * 0.8 : PLANS.PRO.price),
                period: '/month',
                features: PLANS.PRO.features,
                highlight: true,
                rank: 1,
              },
              {
                key: 'ENTERPRISE',
                name: PLANS.ENTERPRISE.name,
                price: formatLKR(isYearly ? PLANS.ENTERPRISE.price * 0.8 : PLANS.ENTERPRISE.price),
                period: '/month',
                features: PLANS.ENTERPRISE.features,
                highlight: false,
                rank: 2,
              },
            ].map((plan) => {
              
              let cta = 'Start Free Trial';
              let href = '/register';
              let disabled = false;

              if (user && user.tenant?.plan) {
                const userPlanStr = user.tenant.plan.toUpperCase();
                let userRank = 0;
                if (userPlanStr === 'PRO') userRank = 1;
                else if (userPlanStr === 'ENTERPRISE') userRank = 2;

                if (userRank === plan.rank) {
                  cta = 'Current Plan (Activated)';
                  href = '#';
                  disabled = true;
                } else if (userRank < plan.rank) {
                  cta = 'Upgrade';
                  href = '/owner/dashboard?upgrade=true';
                } else {
                  cta = 'Downgrade';
                  href = '/owner/dashboard?downgrade=true';
                }
              }

              return (
              <div
                key={plan.key}
                style={{ height: plan.highlight ? '580px' : '520px' }}
                className={`rounded-2xl flex flex-col ${
                  plan.highlight
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-300/50 dark:shadow-none pt-8 px-8 pb-7'
                    : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-7 shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full w-fit mb-3">
                    Most Popular
                  </div>
                )}
                <h3 className={`font-bold text-lg ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <div className="mt-2 mb-6 text-left flex flex-col">
                  <div>
                    <span className={`text-3xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ml-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${plan.highlight ? "text-blue-200" : "text-gray-500"} ${!(isYearly && plan.price !== 'Free') ? 'invisible' : ''}`}>
                    Billed annually
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-blue-100' : 'text-gray-600 dark:text-slate-400'}`}>
                      <span className={`mt-0.5 ${plan.highlight ? 'text-white' : 'text-green-500'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className={`mt-auto pt-6 border-t ${plan.highlight ? 'border-white/20' : 'border-gray-100 dark:border-slate-800'}`}>
                  {disabled ? (
                    <div
                      className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-colors cursor-default ${
                        plan.highlight
                          ? 'bg-white text-blue-600'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {cta}
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

      {/* FEATURE COMPARISON TABLE */}
      <section className="py-24 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Compare All Features</h2>
          </div>
          <div className="overflow-x-auto rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                  <th className="p-6 font-bold text-gray-900 dark:text-white text-lg w-[40%]">Feature</th>
                  <th className="p-6 font-bold text-gray-900 dark:text-white text-lg text-center w-[20%]">Free</th>
                  <th className="p-6 font-bold text-blue-600 dark:text-blue-400 text-lg text-center w-[20%]">Pro</th>
                  <th className="p-6 font-bold text-gray-900 dark:text-white text-lg text-center w-[20%]">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {[
                  { feature: 'Products', f: '50', p: 'Unlimited', e: 'Unlimited' },
                  { feature: 'Staff', f: '2', p: '10', e: 'Unlimited' },
                  { feature: 'Online orders', f: '100/mo', p: 'Unlimited', e: 'Unlimited' },
                  { feature: 'Storage', f: '2GB', p: '50GB', e: 'Unlimited' },
                  { feature: 'POS system', f: true, p: true, e: true },
                  { feature: 'Basic reports', f: true, p: true, e: true },
                  { feature: 'Advanced reports', f: false, p: true, e: true },
                  { feature: 'Custom reports', f: false, p: false, e: true },
                  { feature: 'Online store', f: true, p: true, e: true },
                  { feature: 'Custom domain', f: false, p: true, e: true },
                  { feature: 'Free themes', f: true, p: true, e: true },
                  { feature: 'Premium themes', f: false, p: true, e: true },
                  { feature: 'Custom theme', f: false, p: false, e: true },
                  { feature: 'Email support', f: true, p: true, e: true },
                  { feature: 'Priority support', f: false, p: true, e: true },
                  { feature: 'Phone support', f: false, p: false, e: true },
                  { feature: 'API access', f: false, p: false, e: true },
                  { feature: 'White label', f: false, p: false, e: true },
                  { feature: 'Multi-location', f: false, p: false, e: true },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-6 text-gray-600 dark:text-slate-400 font-medium">{row.feature}</td>
                    {[row.f, row.p, row.e].map((val, colIdx) => (
                      <td key={colIdx} className="p-6 text-center">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} />
                          ) : (
                            <Minus className="w-5 h-5 text-gray-300 dark:text-slate-700 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-900 dark:text-white font-semibold">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-gray-50 dark:bg-slate-900/50 transition-colors">
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

      {/* MONEY-BACK GUARANTEE */}
      <section className="py-20 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">30-Day Money-Back Guarantee</h2>
          <p className="text-gray-500 dark:text-slate-400 text-lg">Try {COMPANY_NAME} risk-free. If you're not completely satisfied, we'll refund your payment.</p>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <SiteFooter />
    </div>
  );
}
