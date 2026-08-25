'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { VerdantProductCard } from '../components/VerdantProductCard';

// Sample data to make it look like a grocery store
const sampleProducts = [
  { id: 1, name: "Fresh Organic Bananas", price: 450, compareAtPrice: 500, category: "Fruits", image: "https://images.unsplash.com/photo-1571501478200-85f260ceddad?auto=format&fit=crop&q=80&w=800", isOrganic: true },
  { id: 2, name: "Crisp Green Apples", price: 850, category: "Fruits", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6fb6c?auto=format&fit=crop&q=80&w=800", isOrganic: false },
  { id: 3, name: "Farm Fresh Avocados", price: 1200, compareAtPrice: 1500, category: "Vegetables", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800", isOrganic: true },
  { id: 4, name: "Organic Cherry Tomatoes", price: 350, category: "Vegetables", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800", isOrganic: true },
  { id: 5, name: "Fresh Strawberries", price: 1500, compareAtPrice: 1800, category: "Fruits", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800", isOrganic: false },
  { id: 6, name: "Organic Spinach", price: 250, category: "Vegetables", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800", isOrganic: true },
  { id: 7, name: "Whole Grain Bread", price: 600, category: "Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800", isOrganic: false },
  { id: 8, name: "Fresh Milk", price: 400, category: "Dairy", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=800", isOrganic: false },
];

export function VerdantProductGrid({ domain, title, limit }: { domain: string; title: string; limit?: number }) {
  const displayProducts = limit ? sampleProducts.slice(0, limit) : sampleProducts;
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
        
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-verdant-heading font-bold text-verdant-on-surface">
              {title}
            </h2>
            <div className="h-1.5 w-16 bg-primary mt-3 rounded-full" />
          </div>
          
          <Link 
            href={`/s/${domain}/shop${themeQuery}`}
            className="hidden md:inline-flex items-center text-sm font-verdant-body font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View All Products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <VerdantProductCard product={product} domain={domain} />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link 
            href={`/s/${domain}/shop${themeQuery}`}
            className="inline-flex items-center px-6 py-3 border border-primary text-primary font-verdant-body font-medium rounded-xl hover:bg-primary hover:text-white transition-colors"
          >
            View All Products
          </Link>
        </div>

      </div>
    </section>
  );
}
