import Link from 'next/link';
import { COMPANY_NAME, COMPANY_TAGLINE, PLANS, formatLKR } from '@/lib/constants';
import type { Metadata } from 'next';
import { Store, Globe, Package, Users, BarChart3, CreditCard, Rocket, PhoneCall, Coffee, ArrowRight, Moon, Star } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { PricingSection } from '@/components/sections/pricing-section';

export const metadata: Metadata = {
  title: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
  description: 'Complete POS and e-commerce platform for Sri Lankan businesses. Manage your store, employees, and online shop from one dashboard.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-300">
      {/* GLOBAL BACKGROUND ANIMATION */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 opacity-90 transition-colors duration-300" />
        <div className="absolute top-10 right-0 -translate-y-16 translate-x-16">
          <div className="w-96 h-96 bg-blue-500/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
        </div>
        <div className="absolute bottom-1/4 left-0 translate-y-16 -translate-x-16">
          <div className="w-80 h-80 bg-blue-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
        </div>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2">
          <div className="w-72 h-72 bg-emerald-400/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply" />
        </div>
      </div>

      {/* Navigation */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-visible z-10">
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium mb-6">
              Built for Sri Lankan Businesses
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6 transition-colors">
              The Smart Way to
              <span className="text-blue-600"> Run Your Store</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl transition-colors">
              Complete POS system + e-commerce platform for Sri Lankan businesses.
              Manage sales, inventory, employees, and your online store — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
              >
                Let's meet -- with coffee <Coffee className="w-5 h-5 ml-1" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
              >
                View Pricing
              </Link>
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-4 transition-colors">
              Free plan available forever. Pro from <strong className="text-gray-600 dark:text-slate-300">Rs. 2,500/month</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative z-10 bg-transparent">
        {/* Full-width blue banner */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 w-full py-16 px-6 text-center mb-16 shadow-2xl shadow-blue-900/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-6">Everything you need, in one platform</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              From point-of-sale to online store, from employee management to detailed reports —
              {COMPANY_NAME} covers every aspect of running a modern Sri Lankan business.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg"
            >
              Explore All Features <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Store, title: 'Point of Sale', desc: 'Fast, intuitive POS with barcode scanning, cash/card/QR payment, and thermal receipt printing.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
              { icon: Globe, title: 'Online Store', desc: 'Auto-generated e-commerce website on your own subdomain. Apply beautiful themes in one click.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
              { icon: Package, title: 'Inventory Management', desc: 'Track stock levels, get low-stock alerts, manage suppliers, and prevent stockouts automatically.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
              { icon: Users, title: 'Team Management', desc: 'Add employees with custom permissions. Track attendance, working hours, and performance.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
              { icon: BarChart3, title: 'Smart Reports', desc: 'Detailed sales, profit/loss, inventory, and employee reports with export to CSV/PDF.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
              { icon: CreditCard, title: 'PayHere Integration', desc: 'Accept online payments via PayHere QR. Fully integrated with Sri Lankan payment gateway.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
            ].map((f) => (
              <div key={f.title} className="group bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-6 border ${f.border} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 transition-colors">{f.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-600 text-white relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
          <p className="text-blue-200 mb-8 text-lg">
            Join hundreds of Sri Lankan businesses already using {COMPANY_NAME} to manage their stores.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg"
          >
            Start Your Free Store Today →
          </Link>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="py-24 relative z-10 bg-transparent overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Loved by Sri Lankan Businesses</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 transition-colors">See what our users have to say about {COMPANY_NAME}</p>
        </div>
        
        {/* Marquee Container with fade edges */}
        <div className="relative marquee-container">
          {/* Fade edge masks - left and right gradient overlays */}
          <div className="absolute inset-0 pointer-events-none z-20" style={{
            background: 'linear-gradient(to right, hsl(var(--background)) 0%, transparent 20%, transparent 80%, hsl(var(--background)) 100%)'
          }} />
          
          {/* Marquee tracks */}
          <div className="flex overflow-x-hidden">
            {/* Track 1 */}
            <div className="animate-marquee marquee-track flex gap-6 px-6 whitespace-nowrap min-w-full">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="inline-flex flex-col bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-8 rounded-3xl shadow-xl shadow-gray-200/40 dark:shadow-none w-80 shrink-0 whitespace-normal transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-blue-500 text-blue-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-slate-300 mb-6 italic leading-relaxed transition-colors">
                    "Since switching to {COMPANY_NAME}, managing my inventory and online orders has never been easier. Highly recommended for any growing business!"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      S
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm transition-colors">Saman Silva</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors">Retail Store Owner</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Track 2 (duplicate for seamless loop) */}
            <div className="animate-marquee marquee-track flex gap-6 px-6 whitespace-nowrap min-w-full" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={`dup-${i}`} className="inline-flex flex-col bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-8 rounded-3xl shadow-xl shadow-gray-200/40 dark:shadow-none w-80 shrink-0 whitespace-normal transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-blue-500 text-blue-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-slate-300 mb-6 italic leading-relaxed transition-colors">
                    "Since switching to {COMPANY_NAME}, managing my inventory and online orders has never been easier. Highly recommended for any growing business!"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      S
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm transition-colors">Saman Silva</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors">Retail Store Owner</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <SiteFooter />
    </div>
  );
}
