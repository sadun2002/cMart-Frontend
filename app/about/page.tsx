import Link from 'next/link';
import { Target, HeartHandshake, MapPin, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import type { Metadata } from 'next';
import { COMPANY_NAME } from '@/lib/constants';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MotionBlurBackground } from '@/components/ui/motion-blur-background';

export const metadata: Metadata = {
  title: 'About Us — cMart',
  description: 'Learn about cMart, our mission, and our journey.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors relative">
      <MotionBlurBackground />
      {/* Navigation */}
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 z-10 bg-transparent overflow-hidden text-center transition-colors">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-8">
            Empowering <span className="text-blue-600 dark:text-blue-500">Small Businesses</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-16">
            We believe every shop deserves enterprise-level tools. 
            That's why we built cMart.
          </p>
          <div className="w-full max-w-5xl mx-auto aspect-[21/9] bg-blue-50 dark:bg-slate-900 rounded-3xl border border-blue-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-blue-900/5 dark:shadow-none relative flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" 
              alt="Team collaborating" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* OUR STORY SECTION */}
      <section className="py-24 relative z-10 bg-transparent transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase mb-2">
                Our Story
              </div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">
                From a small store struggle to a national platform.
              </h2>
              <div className="space-y-6 text-lg text-gray-600 dark:text-slate-400 leading-relaxed pt-4">
                <p>
                  cMart started in 2024 as a core project under our parent company, <strong>Chatudisa</strong>. Our founder, struggling to manage their own small store, realized that powerful POS systems cost too much for small businesses.
                </p>
                <p>
                  Today, Chatudisa's cMart platform serves 500+ stores across Sri Lanka, helping them sell online and manage inventory with ease.
                </p>
                <p className="font-semibold text-gray-900 dark:text-slate-200 text-xl border-l-4 border-blue-600 dark:border-blue-500 pl-6 py-2 bg-gray-50 dark:bg-slate-900 rounded-r-xl">
                  Our mission is simple: Make professional e-commerce tools accessible to everyone.
                </p>
              </div>
            </div>
            <div className="aspect-square lg:aspect-[4/3] bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-xl shadow-emerald-900/5 dark:shadow-none flex items-center justify-center relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=800&q=80" 
                alt="Modern retail store POS checkout" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BY THE NUMBERS */}
      <section className="py-12 relative z-10 bg-transparent transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-[2rem] p-12 shadow-2xl shadow-blue-900/20 text-white">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
              {[
                { value: '500+', label: 'Happy Stores' },
                { value: '50,000+', label: 'Orders Processed' },
                { value: 'Rs. 100M+', label: 'Revenue Generated' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat, i) => (
                <div 
                  key={stat.label} 
                  className={`flex flex-col items-center justify-center ${i === 1 || i === 3 ? 'border-l border-white/20' : i === 2 ? 'lg:border-l border-white/20' : ''}`}
                >
                  <div className="text-3xl md:text-4xl font-black mb-2 text-white">{stat.value}</div>
                  <div className="text-blue-100 font-medium tracking-wide uppercase text-xs md:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="py-24 relative z-10 bg-transparent transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Simplicity First',
                desc: "Tools should make life easier, not harder. Every feature we build must pass the 'grandma test'.",
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-100/50 dark:bg-blue-900/30',
              },
              {
                icon: HeartHandshake,
                title: 'Fair Pricing',
                desc: "Small businesses shouldn't pay enterprise prices. Quality tools for everyone, at fair prices.",
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-100/50 dark:bg-emerald-900/30',
              },
              {
                icon: MapPin,
                title: 'Built for Sri Lanka',
                desc: "We understand local needs - from Sinhala support to PayHere payments to local currency.",
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-100/50 dark:bg-purple-900/30',
              },
            ].map(val => (
              <div key={val.title} className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-gray-100 dark:border-slate-800 shadow-xl shadow-blue-900/5 dark:shadow-none hover:-translate-y-2 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl ${val.bg} ${val.color} flex items-center justify-center mb-8`}>
                  <val.icon className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-4">{val.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-lg leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR TEAM */}
      <section className="py-24 relative z-10 bg-transparent transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Meet the Team</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Kasun Perera', role: 'Founder & CEO', bio: 'Former store owner turned tech founder.', color: 'bg-blue-100', img: 'https://i.pravatar.cc/300?img=11' },
              { name: 'Nimali Silva', role: 'Head of Product', bio: 'Obsessed with making complex tools simple.', color: 'bg-emerald-100', img: 'https://i.pravatar.cc/300?img=47' },
              { name: 'Ruwan Fernando', role: 'Lead Developer', bio: 'Architecting scalable systems since 2015.', color: 'bg-purple-100', img: 'https://i.pravatar.cc/300?img=12' },
              { name: 'Chamari Jayawardena', role: 'Design Lead', bio: 'Creating beautiful experiences every day.', color: 'bg-orange-100', img: 'https://i.pravatar.cc/300?img=44' },
            ].map((member) => (
              <div key={member.name} className="group">
                <div className={`aspect-square rounded-3xl ${member.color} dark:bg-slate-900 mb-6 overflow-hidden relative flex items-center justify-center shadow-sm`}>
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">{member.role}</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-4">{member.bio}</p>
                <div className="flex items-center gap-3 text-gray-400 dark:text-slate-500">
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Github className="w-5 h-5" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE / JOURNEY */}
      <section className="py-24 relative z-10 bg-transparent overflow-hidden transition-colors">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Our Journey</h2>
          </div>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-4 md:left-[50%] top-0 bottom-0 w-1 bg-gray-200 dark:bg-slate-800 transform md:-translate-x-1/2 rounded-full" />
            
            <div className="space-y-12">
              {[
                { year: '2023', title: 'The Idea', desc: 'Founder struggles with expensive POS solutions and decides to build a better alternative for local businesses.', pos: 'left' },
                { year: '2024', title: 'Start up', desc: 'Chatudisa company is established, and we started developing the core system for cMart.', pos: 'right' },
                { year: '2026', title: 'Launch', desc: 'cMart officially launches to the public, offering a complete ecosystem for modern retail.', pos: 'left' },
              ].map((step, i) => (
                <div key={step.year + step.title} className={`relative flex flex-col md:flex-row items-center gap-8 ${step.pos === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded-full transform -translate-x-[6px] md:-translate-x-1/2 ring-8 ring-gray-50 dark:ring-slate-950 z-10 transition-colors" />
                  
                  {/* Content Box */}
                  <div className={`w-full pl-12 md:pl-0 md:w-1/2 flex ${step.pos === 'left' ? 'md:justify-end' : 'md:justify-start'}`}>
                    <div className={`bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-none border border-gray-100 dark:border-slate-800 max-w-sm w-full transition-all hover:-translate-y-2`}>
                      <div className="text-blue-600 dark:text-blue-400 font-black text-2xl mb-2">{step.year}</div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">{step.title}</h3>
                      <p className="text-gray-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative z-10 bg-transparent text-center transition-colors">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Want to Join Our Journey?</h2>
          <p className="text-xl text-gray-500 dark:text-slate-400 mb-10 leading-relaxed">
            Whether you're a customer looking to grow your business, or a future team member wanting to build great tools, we'd love to connect.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
            >
              Contact Us
            </Link>
            <Link
              href="/careers"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              View Careers
            </Link>
          </div>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <SiteFooter />
    </div>
  );
}
