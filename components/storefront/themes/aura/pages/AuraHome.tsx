'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { AuraProductGrid } from '../components/AuraProductGrid';
import { motion, useScroll, useTransform } from 'framer-motion';

export function AuraHome({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[95vh] w-full overflow-hidden bg-zinc-950">
          <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=80" 
              alt="Fashion Editorial" 
              className="w-full h-full object-cover object-top opacity-80"
            />
          </motion.div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-5xl md:text-7xl lg:text-9xl font-serif text-white mb-6 tracking-tight"
            >
              Spring 2027
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-white/80 font-sans text-sm md:text-base uppercase tracking-[0.3em] max-w-xl mx-auto mb-10"
            >
              A new era of sartorial elegance
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <Link 
                href={`/s/${domain}/shop${themeQuery}`}
                className="inline-block bg-white text-black px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold font-sans hover:bg-black hover:text-white transition-colors duration-500"
              >
                Explore Collection
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y border-aura-border bg-white py-6 overflow-hidden flex items-center">
          <div className="whitespace-nowrap flex animate-[marquee_20s_linear_infinite] opacity-60">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-xl md:text-3xl font-serif mx-8 uppercase tracking-widest text-zinc-400">
                Crafted for elegance &nbsp;&mdash;&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <AuraProductGrid 
          domain={domain} 
          title="Curated Selection" 
          subtitle="New Arrivals"
        />

        {/* Editorial Section */}
        <section className="py-24 bg-[#f4f4f5]">
          <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="aspect-[3/4] md:aspect-[4/5] relative overflow-hidden group"
              >
                <img 
                  src="https://images.unsplash.com/photo-1550614000-4b95d466f914?w=1000&q=80" 
                  alt="Craftsmanship" 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
              </motion.div>
              
              <div className="flex flex-col justify-center max-w-lg lg:ml-12">
                <span className="uppercase tracking-[0.2em] text-xs font-sans text-zinc-500 mb-6 block">The Atelier</span>
                <h2 className="text-4xl md:text-5xl font-serif font-light text-aura-on-surface leading-tight mb-8">
                  Uncompromising Quality
                </h2>
                <div className="space-y-6 text-zinc-600 font-serif font-light leading-relaxed text-lg">
                  <p>
                    Every piece in our collection is crafted with meticulous attention to detail. We source only the finest fabrics, ensuring that our garments not only look exceptional but feel extraordinary against the skin.
                  </p>
                  <p>
                    Our approach to fashion marries timeless silhouettes with modern sensibilities, creating pieces that transcend seasonal trends.
                  </p>
                </div>
                <div className="mt-12">
                  <Link 
                    href={`/s/${domain}/about${themeQuery}`}
                    className="inline-flex items-center gap-4 text-xs uppercase tracking-widest font-sans border-b border-black pb-2 hover:text-zinc-500 hover:border-zinc-500 transition-colors"
                  >
                    Our Story
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Products */}
        <AuraProductGrid 
          domain={domain} 
          title="The Essentials" 
          subtitle="Wardrobe Staples"
        />

        {/* Newsletter Hero */}
        <div className="relative py-32 bg-zinc-950 text-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full opacity-30">
            <img 
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1800&q=80" 
              alt="Texture" 
              className="w-full h-full object-cover grayscale"
            />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto px-6 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">Join the Inner Circle</h2>
            <p className="text-zinc-400 font-sans mb-10 text-sm md:text-base">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="w-full flex flex-col sm:flex-row gap-0" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="flex-grow bg-white/10 border border-white/20 px-6 py-4 text-white font-sans text-sm focus:outline-none focus:border-white transition-colors uppercase placeholder:text-zinc-500"
              />
              <button 
                type="submit"
                className="bg-white text-black px-8 py-4 font-sans text-sm font-semibold uppercase tracking-widest hover:bg-zinc-200 transition-colors mt-4 sm:mt-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
