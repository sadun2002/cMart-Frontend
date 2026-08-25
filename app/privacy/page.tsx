'use client';

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MotionBlurBackground } from '@/components/ui/motion-blur-background';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="font-sans min-h-screen bg-white dark:bg-slate-950 transition-colors selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-50 relative">
      <MotionBlurBackground />
      <SiteHeader />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-500 dark:text-slate-400">
            Last updated: July 27, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-blue">
          <p className="lead text-xl text-gray-600 dark:text-slate-300 mb-8">
            At cMart, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our point-of-sale software.
          </p>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              We collect information that you provide directly to us when you register for an account, create or modify your profile, contact customer support, or otherwise communicate with us.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-slate-400">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and billing information.</li>
              <li><strong>Business Data:</strong> Store name, inventory data, sales records, and employee details.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our services, including access times and pages viewed.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              We use the information we collect to provide, maintain, and improve our services, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-slate-400">
              <li>Processing your transactions and sending related information.</li>
              <li>Providing customer support and technical assistance.</li>
              <li>Sending administrative messages, updates, and security alerts.</li>
              <li>Analyzing usage patterns to enhance user experience.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Security</h2>
            <p className="text-gray-600 dark:text-slate-400">
              We implement industry-standard security measures designed to protect your personal and business data. All data is encrypted in transit using SSL/TLS protocols, and sensitive information like payment details is encrypted at rest. However, no security system is impenetrable, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Sharing of Information</h2>
            <p className="text-gray-600 dark:text-slate-400">
              We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Contact Us</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Contact our Support Team
            </Link>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
