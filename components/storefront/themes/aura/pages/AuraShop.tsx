'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { AuraProductCard } from '../components/AuraProductCard';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  badge?: string;
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', name: 'Silk Essential Blouse', price: 12500, image: 'https://images.unsplash.com/photo-1598559069252-5539276d49dd?w=800&q=80', category: 'Tops', badge: 'New' },
  { id: '2', name: 'Tailored Linen Trousers', price: 14200, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80', category: 'Bottoms' },
  { id: '3', name: 'Oversized Wool Blazer', price: 28500, image: 'https://images.unsplash.com/photo-1591369822096-fb14ce694e88?w=800&q=80', category: 'Outerwear', badge: 'Bestseller' },
  { id: '4', name: 'Minimalist Midi Dress', price: 18900, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', category: 'Dresses' },
  { id: '5', name: 'Cashmere V-Neck Sweater', price: 22000, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', category: 'Knitwear' },
  { id: '6', name: 'Pleated Midi Skirt', price: 13500, image: 'https://images.unsplash.com/photo-1583496661160-c588c443c98d?w=800&q=80', category: 'Bottoms' },
  { id: '7', name: 'Structured Leather Tote', price: 35000, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80', category: 'Accessories' },
  { id: '8', name: 'Classic Silk Scarf', price: 8500, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80', category: 'Accessories' },
];

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Knitwear', 'Accessories'];

export function AuraShop({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = activeCategory === 'All' 
    ? SAMPLE_PRODUCTS 
    : SAMPLE_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      {/* Page Header */}
      <div className="pt-32 pb-16 bg-[#f4f4f5]">
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px] text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-aura-on-surface mb-4">
            Collection
          </h1>
          <p className="text-zinc-500 font-sans text-sm uppercase tracking-widest">
            {filteredProducts.length} Items
          </p>
        </div>
      </div>

      <main className="flex-grow py-12 md:py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
          
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-6 border-b border-aura-border gap-6">
            {/* Category Pills (Desktop) */}
            <div className="hidden md:flex flex-wrap gap-8">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`text-sm uppercase tracking-widest font-sans pb-1 transition-colors relative ${
                    activeCategory === category 
                      ? 'text-black font-semibold' 
                      : 'text-zinc-500 hover:text-black'
                  }`}
                >
                  {category}
                  {activeCategory === category && (
                    <span className="absolute bottom-0 left-0 w-full h-px bg-black"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Category Dropdown (Simplified) */}
            <div className="w-full md:hidden flex justify-between items-center border border-aura-border p-4">
              <span className="font-sans text-sm uppercase tracking-widest">{activeCategory}</span>
              <ChevronDown size={16} />
            </div>

            {/* Sort/Filter */}
            <div className="flex items-center gap-6 self-end md:self-auto">
              <button className="flex items-center gap-2 text-sm uppercase tracking-widest font-sans text-zinc-600 hover:text-black transition-colors">
                <span>Sort</span>
                <ChevronDown size={16} strokeWidth={1.5} />
              </button>
              <button className="flex items-center gap-2 text-sm uppercase tracking-widest font-sans text-zinc-600 hover:text-black transition-colors">
                <SlidersHorizontal size={16} strokeWidth={1.5} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
            {filteredProducts.map((product) => (
              <AuraProductCard key={product.id} product={product} domain={domain} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-24">
              <p className="text-zinc-500 font-sans uppercase tracking-widest">No products found in this category.</p>
            </div>
          )}

        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
