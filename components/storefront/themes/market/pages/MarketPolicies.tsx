'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';

type PolicyTab = 'privacy' | 'terms' | 'shipping';

export function MarketPolicies({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<PolicyTab>('privacy');

  const content: Record<PolicyTab, { title: string; sections: { h: string; body: string }[] }> = {
    privacy: {
      title: 'Privacy Policy',
      sections: [
        { h: 'Information We Collect', body: 'We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, email address, mailing address, phone number, and payment information.' },
        { h: 'How We Use Your Information', body: 'We use the information we collect to process transactions, send you technical notices, respond to your comments, and send you marketing and promotional communications (if you have opted in).' },
        { h: 'Information Sharing', body: 'We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except to provide products and services you have requested or as required by law.' },
        { h: 'Data Security', body: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.' },
      ],
    },
    terms: {
      title: 'Terms of Service',
      sections: [
        { h: 'Acceptance of Terms', body: 'By accessing and using this service, you accept and agree to be bound by the terms and provisions of this agreement.' },
        { h: 'Use License', body: 'Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only.' },
        { h: 'Disclaimer', body: 'The materials on our website are provided on an \'as is\' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties.' },
        { h: 'Governing Law', body: 'These terms and conditions are governed by and construed in accordance with the laws of Sri Lanka and you irrevocably submit to the exclusive jurisdiction of the courts in that location.' },
      ],
    },
    shipping: {
      title: 'Shipping Policy',
      sections: [
        { h: 'Delivery Areas', body: 'We currently deliver to all major cities and towns in the Western Province. We are continuously expanding our delivery network.' },
        { h: 'Delivery Times', body: 'Standard delivery takes 3-5 business days. Express delivery (1-2 business days) is available for an additional fee. Same-day delivery is available for orders placed before 10 AM.' },
        { h: 'Shipping Costs', body: 'Free shipping on all orders over LKR 5,000. Orders below LKR 5,000 incur a LKR 499 shipping fee. Express delivery costs LKR 1,499 regardless of order value.' },
        { h: 'Packaging', body: 'All orders are packed with eco-friendly, compostable packaging materials. Fresh produce is packed with ice packs to maintain optimal temperature during transit.' },
      ],
    },
  };

  const { title, sections } = content[activeTab];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 max-w-[900px] py-14">
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Policies & Terms</h1>

          {/* Tabs */}
          <div className="flex border-b mb-8" style={{ borderColor: 'var(--color-market-border)' }}>
            {([['privacy', 'Privacy Policy'], ['terms', 'Terms of Service'], ['shipping', 'Shipping Policy']] as [PolicyTab, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className="mr-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors"
                style={{
                  borderColor: activeTab === id ? 'var(--color-market-primary)' : 'transparent',
                  color: activeTab === id ? 'var(--color-market-primary)' : 'var(--color-market-on-surface-muted)',
                }}>
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl p-8 space-y-8" style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{title}</h2>
            {sections.map((s) => (
              <div key={s.h}>
                <h3 className="font-bold mb-2" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{s.h}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-market-on-surface-muted)' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
