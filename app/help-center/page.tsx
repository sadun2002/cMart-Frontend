'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search,
  Book,
  CreditCard,
  Settings,
  Store,
  Smartphone,
  Shield,
  ArrowRight,
  LifeBuoy,
  MessageCircle,
  FileText
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MotionBlurBackground } from '@/components/ui/motion-blur-background';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const CATEGORIES = [
  {
    title: 'Getting Started',
    description: 'Everything you need to set up your store and make your first sale.',
    icon: Book,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    title: 'Billing & Plans',
    description: 'Manage your subscription, invoices, and payment methods.',
    icon: CreditCard,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  {
    title: 'Store Management',
    description: 'Inventory, staff accounts, multi-location sync, and reporting.',
    icon: Store,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    title: 'POS Hardware',
    description: 'Troubleshooting receipt printers, cash drawers, and barcode scanners.',
    icon: Smartphone,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20'
  },
  {
    title: 'Account & Security',
    description: 'Passwords, two-factor authentication, and privacy settings.',
    icon: Shield,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20'
  },
  {
    title: 'Advanced Settings',
    description: 'API keys, webhooks, and third-party integrations.',
    icon: Settings,
    color: 'text-gray-500',
    bg: 'bg-gray-100 dark:bg-slate-800'
  }
];

const POPULAR_ARTICLES = [
  'How do I process a refund or return?',
  'Connecting a Bluetooth barcode scanner to the iPad app',
  'Setting up low-stock alerts and automatic reordering',
  'How to upgrade or downgrade your subscription plan',
  'Exporting end-of-day sales reports to CSV/Excel',
  'Adding a new employee account with custom permissions'
];

export default function HelpCenterPage() {
  return (
    <div className="font-sans min-h-screen bg-transparent transition-colors selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-50">
      <MotionBlurBackground />
      <SiteHeader />

      <main className="pt-32 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 px-6 mb-12 md:mb-16 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
                How can we help?
              </h1>
              <p className="text-xl text-gray-600 dark:text-slate-400 mb-10">
                Search our knowledge base or browse categories below to find answers quickly.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto shadow-2xl shadow-blue-900/50 rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-16 pr-6 py-5 border-0 rounded-2xl text-lg text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-blue-400/50 transition-all bg-white"
                  placeholder="Search for articles, guides, or keywords..."
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                    Search
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="relative z-20 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Categories (Left/Main Column) */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {CATEGORIES.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Link 
                      href="#"
                      className="group flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-3xl hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-none hover:border-blue-300 dark:hover:border-blue-700 transition-all h-full"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${category.bg} ${category.color}`}>
                        <category.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                        {category.description}
                      </p>
                      <span className="inline-flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform mt-auto">
                        View articles <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar (Right Column) */}
            <div className="flex flex-col gap-8 h-full">
              {/* Popular Articles */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Popular Articles</h3>
                </div>
                <ul className="space-y-4">
                  {POPULAR_ARTICLES.map((article, idx) => (
                    <li key={idx}>
                      <Link 
                        href="#"
                        className="group flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" />
                        <span className="text-gray-600 dark:text-slate-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {article}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Still Need Help CTA */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl flex-1 flex flex-col justify-center"
              >
                <h3 className="text-2xl font-bold mb-3">Still need help?</h3>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Our support team is available 24/7 to help you with any issues you might face.
                </p>
                <Link 
                  href="/contact"
                  className="flex items-center justify-center w-full px-6 py-4 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-xl transition-colors shadow-sm"
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Contact Support
                </Link>
              </motion.div>
            </div>

          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

// Need to define ChevronRight locally since I didn't import it at the top
function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
