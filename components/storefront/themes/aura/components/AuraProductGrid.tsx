'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuraProductCard } from './AuraProductCard';
import { ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  badge?: string;
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', name: 'Silk Essential Blouse', price: 12500, image: 'https://images.unsplash.com/photo-1598559069252-5539276d49dd?w=800&q=80', category: 'Tops', badge: 'New Arrival' },
  { id: '2', name: 'Tailored Linen Trousers', price: 14200, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80', category: 'Bottoms' },
  { id: '3', name: 'Oversized Wool Blazer', price: 28500, image: 'https://images.unsplash.com/photo-1591369822096-fb14ce694e88?w=800&q=80', category: 'Outerwear', badge: 'Bestseller' },
  { id: '4', name: 'Minimalist Midi Dress', price: 18900, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', category: 'Dresses' },
];

export function AuraProductGrid({ 
  domain, 
  title, 
  subtitle,
  products = SAMPLE_PRODUCTS,
  viewAllLink = true
}: { 
  domain: string;
  title: string;
  subtitle?: string;
  products?: Product[];
  viewAllLink?: boolean;
}) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
            {subtitle && <span className="uppercase tracking-[0.2em] text-xs font-sans text-zinc-500 mb-4 block">{subtitle}</span>}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-aura-on-surface leading-tight">
              {title}
            </h2>
          </div>
          {viewAllLink && (
            <Link 
              href={`/s/${domain}/shop${themeQuery}`}
              className="hidden md:inline-flex items-center gap-2 text-sm uppercase tracking-widest font-sans border-b border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors"
            >
              Discover More <ArrowRight size={16} strokeWidth={1} />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => (
            <AuraProductCard key={product.id} product={product} domain={domain} />
          ))}
        </div>

        {viewAllLink && (
          <div className="mt-16 text-center md:hidden">
            <Link 
              href={`/s/${domain}/shop${themeQuery}`}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-sans border-b border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors"
            >
              Discover More <ArrowRight size={16} strokeWidth={1} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
