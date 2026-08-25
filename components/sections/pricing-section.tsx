"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PLANS, formatLKR } from "@/lib/constants";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  useEffect(() => {
    if (window.innerWidth >= 768) return;
    const targetId = billing === 'lifetime' ? 'home-plan-startup' : 'home-plan-pro';
    const targetCard = document.getElementById(targetId);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [billing]);

  return (
    <section className="py-20 relative z-10 bg-transparent">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-500 dark:text-slate-400 transition-colors">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-14 bg-gray-100 dark:bg-slate-900 p-1.5 rounded-full w-fit mx-auto">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center ${
              billing === 'monthly' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              billing === 'yearly' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Annually <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full ml-0.5">-20%</span>
          </button>
          <button
            onClick={() => setBilling('lifetime')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center ${
              billing === 'lifetime' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Lifetime
          </button>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar pb-8 pt-4 lg:pt-8 px-4 md:px-0 -mx-4 md:mx-0 items-stretch">
          {[
            {
              key: "STARTUP",
              name: PLANS.STARTUP.name,
              price: billing === 'lifetime' ? PLANS.STARTUP.priceLifetime : billing === 'yearly' ? (PLANS.STARTUP.priceYearly / 12) : PLANS.STARTUP.priceMonthly,
              period: billing === 'lifetime' ? 'once' : '/mo',
              features: PLANS.STARTUP.features,
              highlight: false,
              cta: "See More",
            },
            {
              key: "PRO",
              name: PLANS.PRO.name,
              price: billing === 'lifetime' ? null : billing === 'yearly' ? (PLANS.PRO.priceYearly / 12) : PLANS.PRO.priceMonthly,
              period: "/mo",
              features: PLANS.PRO.features,
              highlight: true,
              cta: "See More",
            },
            {
              key: "ENT",
              name: PLANS.ENTERPRISE.name,
              price: billing === 'lifetime' ? null : billing === 'yearly' ? (PLANS.ENTERPRISE.priceYearly / 12) : PLANS.ENTERPRISE.priceMonthly,
              period: "/mo",
              features: PLANS.ENTERPRISE.features,
              highlight: false,
              cta: "See More",
            },
          ].map((plan) => {
            const isUnavailable = plan.price === null;
            
            return (
            <div
              key={plan.key}
              id={`home-plan-${plan.key.toLowerCase()}`}
              className={`w-[80vw] sm:w-[60vw] md:w-auto md:flex-1 snap-center shrink-0 rounded-2xl p-5 lg:p-7 flex flex-col transition-all duration-300 md:hover:-translate-y-2 md:hover:shadow-2xl md:hover:border-blue-200 dark:hover:border-blue-500/30 h-full ${
                plan.highlight
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/20 lg:scale-105 md:hover:shadow-blue-300/50"
                  : "bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800"
              } ${isUnavailable ? 'opacity-70 pointer-events-none' : ''}`}
            >
              {plan.highlight && (
                <div className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full w-fit mb-3">
                  Most Popular
                </div>
              )}
              <h3
                className={`font-bold text-lg transition-colors ${
                  plan.highlight ? "text-white" : "text-gray-900 dark:text-white"
                }`}
              >
                {plan.name}
              </h3>
              <div className="mt-2 mb-6 transition-colors min-h-[80px]">
                {isUnavailable ? (
                   <div className="flex flex-col justify-center h-full">
                     <span className={`text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-500'}`}>Not available</span>
                     <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>for lifetime billing</span>
                   </div>
                ) : (
                  <>
                    <div>
                      <span
                        className={`text-3xl md:text-xl lg:text-3xl xl:text-4xl font-black ${
                          plan.highlight ? "text-white" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {formatLKR(plan.price!)}
                      </span>
                      <span
                        className={`text-sm ml-1 ${
                          plan.highlight ? "text-blue-200" : "text-gray-500 dark:text-slate-400"
                        }`}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${plan.highlight ? "text-blue-200" : "text-gray-500 dark:text-slate-400"} ${!(billing === 'yearly' && plan.period !== 'once') ? 'invisible' : ''}`}>
                      Billed annually ({formatLKR(plan.price! * 12)}/yr)
                    </p>
                  </>
                )}
              </div>
              <ul className="space-y-3 flex-1">
                {plan.features.slice(0, 6).map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-3 text-sm transition-colors ${
                      plan.highlight ? "text-blue-100" : "text-gray-600 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 ${
                        plan.highlight ? "text-white" : "text-green-500"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="leading-tight">{f}</span>
                  </li>
                ))}
              </ul>
              {plan.name.toUpperCase() === 'PRO' || plan.name.toUpperCase() === 'ENTERPRISE' ? (
                <div
                  onClick={() => toast.info('This plan is coming soon!')}
                  className={`mt-6 block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer hover:opacity-90 ${
                    plan.highlight
                      ? "bg-white text-blue-600"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    Coming Soon <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              ) : (
                <Link
                  href="/pricing"
                  className={`mt-6 block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isUnavailable ? 'Unavailable' : (
                    <span className="flex items-center justify-center gap-1.5">
                      {plan.cta} <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </Link>
              )}
            </div>
          )})}
        </div>
      </div>
    </section>
  );
}
