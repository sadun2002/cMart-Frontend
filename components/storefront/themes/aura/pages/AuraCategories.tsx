'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: "Outerwear", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80", count: 24, span: "col-span-12 md:col-span-8" },
  { id: 2, name: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", count: 18, span: "col-span-12 md:col-span-4" },
  { id: 3, name: "Knitwear", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", count: 12, span: "col-span-12 md:col-span-4" },
  { id: 4, name: "Accessories", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80", count: 35, span: "col-span-12 md:col-span-4" },
  { id: 5, name: "Essentials", image: "https://images.unsplash.com/photo-1598559069252-5539276d49dd?w=800&q=80", count: 42, span: "col-span-12 md:col-span-4" }
];

export function AuraCategories({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-aura-on-surface mb-6 leading-tight">
            Curated Collections
          </h1>
          <p className="max-w-2xl text-zinc-500 font-serif text-lg leading-relaxed">
            Discover our carefully categorized selections, designed to build a timeless and versatile wardrobe.
          </p>
        </div>
      </div>

      <main className="flex-grow pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
          <div className="grid grid-cols-12 gap-6">
            {CATEGORIES.map((cat, index) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`${cat.span} group relative overflow-hidden bg-[#f4f4f5] aspect-square md:aspect-auto md:min-h-[500px]`}
              >
                <Link href={`/s/${domain}/shop${themeQuery}`}>
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                  
                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
                    <div className="flex justify-between items-start text-white">
                      <span className="font-sans text-xs uppercase tracking-[0.2em]">{cat.count} Items</span>
                      <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide">
                      {cat.name}
                    </h2>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
