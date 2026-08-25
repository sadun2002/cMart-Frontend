'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { q: 'How fresh are your products?', a: 'All our products are sourced daily from local farms and delivered within 24 hours of harvest to ensure maximum freshness and nutritional value.' },
  { q: 'Do you offer organic certified products?', a: 'Yes! Over 80% of our produce is certified organic by USDA standards. Each organic product is clearly marked with an "Organic" badge.' },
  { q: 'What are your delivery hours?', a: 'We deliver Monday to Saturday, 7 AM to 9 PM. Express delivery is available for orders placed before 2 PM on the same day.' },
  { q: 'How do I track my order?', a: 'Once your order is placed, you will receive a confirmation email with a tracking link. You can also track your order in your account dashboard.' },
  { q: 'What is your return policy?', a: 'We have a 100% satisfaction guarantee. If you receive a product that doesn\'t meet our quality standards, contact us within 24 hours for a full refund or replacement.' },
  { q: 'Do you offer subscription boxes?', a: 'Yes! Our weekly Harvest Box subscription delivers a curated selection of seasonal produce to your door. You can customize your preferences and pause anytime.' },
  { q: 'Is there a minimum order amount?', a: 'There is no minimum order amount. However, orders under LKR 5,000 incur a LKR 499 delivery fee. Orders above LKR 5,000 qualify for free delivery.' },
  { q: 'How do I apply a promo code?', a: 'You can enter your promo code at checkout in the "Promo Code" field. Only one promo code can be used per order.' },
];

export function MarketFAQ({ storeName, domain }: { storeName: string; domain: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 max-w-[800px] py-14">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Common Questions</h1>
            <p className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>Everything you need to know about shopping at {storeName}.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                  <span className="font-semibold text-sm pr-4" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{faq.q}</span>
                  {openIndex === i
                    ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--color-market-primary)' }} />
                    : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--color-market-on-surface-muted)' }} />}
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-market-on-surface-muted)' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center p-8 rounded-2xl" style={{ backgroundColor: 'var(--color-market-primary-light)', border: '1px solid var(--color-market-primary)' }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-market-primary)', fontFamily: 'var(--font-market-heading)' }}>Still have questions?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-market-on-surface-muted)' }}>Our team is happy to help. Reach out to us anytime.</p>
            <a href={`/s/${domain}/contact`}
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-market-primary)' }}>
              Contact Us
            </a>
          </div>
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
