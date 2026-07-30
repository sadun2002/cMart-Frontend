'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const CATEGORIES = ['All', 'Product Updates', 'Engineering', 'Commerce', 'Company News'];

const FEATURED_POST = {
  title: 'Introducing cMart AI: The Future of Inventory Management',
  excerpt: 'Today we are thrilled to announce cMart AI, a suite of intelligent tools designed to completely automate your supply chain and inventory tracking.',
  category: 'Product Updates',
  date: 'July 25, 2026',
  readTime: '5 min read',
  image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
};

const POSTS = [
  {
    title: 'How to optimize your POS for the holiday rush',
    excerpt: 'The holiday season is approaching fast. Here are 10 actionable tips to ensure your store runs smoothly during peak hours.',
    category: 'Commerce',
    date: 'July 18, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Migrating from React to Next.js 16: Our Engineering Journey',
    excerpt: 'A deep dive into how our engineering team migrated the entire cMart dashboard to Next.js 16 and Turbopack for insane performance gains.',
    category: 'Engineering',
    date: 'July 10, 2026',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Welcome our new VP of Customer Success',
    excerpt: 'We are incredibly excited to welcome Sarah Jenkins to the cMart executive team. She brings over 15 years of retail tech experience.',
    category: 'Company News',
    date: 'June 28, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'The psychology of pricing: Strategies that convert',
    excerpt: 'Stop guessing your product prices. Learn the psychological triggers that make customers hit the buy button faster.',
    category: 'Commerce',
    date: 'June 15, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'New Feature: Multi-store inventory syncing is here',
    excerpt: 'Managing multiple locations just got significantly easier. Our new multi-store sync keeps your stock levels accurate in real-time.',
    category: 'Product Updates',
    date: 'June 02, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Building a culture of transparency at cMart',
    excerpt: 'Why we decided to open-source our employee handbook and make our diversity metrics public for the world to see.',
    category: 'Company News',
    date: 'May 20, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-50">
      <SiteHeader />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-rose-400/20 dark:bg-rose-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <main className="relative z-10 pt-32 pb-24">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 border border-blue-100 dark:border-blue-800/50">
              <Sparkles className="w-4 h-4" />
              <span>cMart Resources</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-rose-600 dark:from-blue-400 dark:to-rose-400">Updates</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Read the latest news, product updates, and tutorials from the cMart team to help you grow your business.
            </p>
          </motion.div>
        </section>

        {/* Featured Post */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group block relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-slate-900 aspect-auto md:aspect-[21/9]"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${FEATURED_POST.image}')` }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent dark:from-slate-950 dark:via-slate-950/60 transition-colors" />
            
            {/* Content */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
              <div className="max-w-3xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-bold mb-6 shadow-sm">
                  {FEATURED_POST.category}
                </span>
                <Link href="#" className="block">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 group-hover:text-blue-300 transition-colors leading-tight">
                    {FEATURED_POST.title}
                  </h2>
                </Link>
                <p className="text-gray-200 dark:text-slate-300 text-lg md:text-xl mb-6 max-w-2xl leading-relaxed">
                  {FEATURED_POST.excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-300 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {FEATURED_POST.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {FEATURED_POST.readTime}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Filters */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((category, index) => (
              <button
                key={category}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  index === 0 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Post Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {POSTS.map((post, index) => (
              <motion.article 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-none dark:hover:border-blue-900/50 transition-all"
              >
                <Link href="#" className="block aspect-[16/10] overflow-hidden relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${post.image}')` }}
                  />
                </Link>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                      {post.category}
                    </span>
                    <span className="text-gray-300 dark:text-slate-700">•</span>
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">
                      {post.readTime}
                    </span>
                  </div>
                  <Link href="#" className="block mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-800/50">
                    <span className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {post.date}
                    </span>
                    <Link href="#" className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
