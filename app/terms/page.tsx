'use client';

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-50">
      <SiteHeader />

      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-500 dark:text-slate-400">
            Last updated: July 27, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-blue">
          <p className="lead text-xl text-gray-600 dark:text-slate-300 mb-8">
            Please read these Terms of Service carefully before using the cMart point-of-sale and e-commerce platform operated by us.
          </p>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-slate-400">
              By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service. These Terms apply to all visitors, users, and others who wish to access or use the Service.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Subscription and Billing</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-slate-400">
              <li><strong>Billing Cycle:</strong> The service is billed in advance on a recurring basis (monthly or annually).</li>
              <li><strong>Cancellations:</strong> You may cancel your subscription at any time. Your cancellation will take effect at the end of the current paid term.</li>
              <li><strong>Refunds:</strong> Except when required by law, paid subscription fees are non-refundable.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times.
            </p>
            <p className="text-gray-600 dark:text-slate-400">
              You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              You agree not to use the service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-slate-400">
              <li>Violate any national or international law or regulation.</li>
              <li>Transmit any malicious code, viruses, or disruptive data.</li>
              <li>Attempt to gain unauthorized access to our systems or user accounts.</li>
              <li>Engage in any activity that interferes with or disrupts the service.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Contact Us</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
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
