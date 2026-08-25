'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { name: "Fresh Fruits", count: "24 items", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80" },
  { name: "Organic Vegetables", count: "36 items", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80" },
  { name: "Dairy & Eggs", count: "18 items", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80" },
  { name: "Bakery", count: "12 items", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80" },
  { name: "Meat & Poultry", count: "15 items", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80" },
  { name: "Beverages", count: "28 items", image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600&q=80" },
];

export function VerdantCategories({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <div className="bg-verdant-surface-container-low py-12 md:py-16 border-b border-verdant-surface-container relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-verdant-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-verdant-tertiary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px] relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-verdant-heading font-bold text-verdant-on-surface mb-4">
            Shop by Category
          </h1>
          <p className="text-verdant-on-surface-variant font-verdant-body max-w-2xl mx-auto text-lg">
            Discover our curated selection of farm-fresh, organic products tailored for a healthy lifestyle.
          </p>
        </div>
      </div>

      <main className="flex-grow py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Link 
                  href={`/s/${domain}/shop${themeQuery}`}
                  className="block relative h-64 md:h-80 rounded-[24px] overflow-hidden bg-verdant-surface-container shadow-sm border border-verdant-surface-container"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between">
                    <div>
                      <h3 className="text-2xl font-verdant-heading font-bold text-white mb-1 drop-shadow-sm">
                        {category.name}
                      </h3>
                      <p className="text-white/80 font-verdant-body text-sm font-medium">
                        {category.count}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link 
              href={`/s/${domain}/shop${themeQuery}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
            >
              Browse All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
