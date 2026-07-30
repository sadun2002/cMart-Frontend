"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, formatLKR } from "@/lib/constants";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

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
        <div className="flex items-center justify-center gap-3 mb-14">
          <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-7 rounded-full bg-blue-600 flex items-center p-1 transition-colors"
            aria-label="Toggle Annual Billing"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
            Annually <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full ml-1">-20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              key: "FREE",
              name: PLANS.FREE.name,
              price: "Free",
              period: "forever",
              features: PLANS.FREE.features,
              highlight: false,
              cta: "Start Free Trial",
            },
            {
              key: "PRO",
              name: PLANS.PRO.name,
              price: formatLKR(isAnnual ? PLANS.PRO.price * 0.8 : PLANS.PRO.price),
              period: "/month",
              features: PLANS.PRO.features,
              highlight: true,
              cta: "Start Free Trial",
            },
            {
              key: "ENT",
              name: PLANS.ENTERPRISE.name,
              price: formatLKR(isAnnual ? PLANS.ENTERPRISE.price * 0.8 : PLANS.ENTERPRISE.price),
              period: "/month",
              features: PLANS.ENTERPRISE.features,
              highlight: false,
              cta: "Start Free Trial",
            },
          ].map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-500/30 ${
                plan.highlight
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/20 scale-105 hover:shadow-blue-300/50"
                  : "bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800"
              }`}
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
              <div className="mt-2 mb-6 transition-colors">
                <span
                  className={`text-3xl font-black ${
                    plan.highlight ? "text-white" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm ml-1 ${
                    plan.highlight ? "text-blue-200" : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {plan.period}
                </span>
                {isAnnual && plan.price !== "Free" && (
                   <p className={`text-xs mt-1 ${plan.highlight ? "text-blue-200" : "text-gray-500 dark:text-slate-400"}`}>
                      Billed annually
                   </p>
                )}
              </div>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm transition-colors ${
                      plan.highlight ? "text-blue-100" : "text-gray-600 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className={`mt-0.5 ${
                        plan.highlight ? "text-white" : "text-green-500"
                      }`}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-6 text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
