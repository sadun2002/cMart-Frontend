'use client';

import React from 'react';
import { MarketProductCard, MarketProduct } from './MarketProductCard';

const MOCK_PRODUCTS: MarketProduct[] = [
  { id: '1', name: 'Heirloom Vine Tomatoes', price: 1250, compareAtPrice: 1600, image: 'https://images.unsplash.com/photo-1566842600175-97dca6f50c6b?w=600&q=80', category: 'Fruits & Veg', badge: 'Organic', description: 'Locally grown, vibrant red heirloom tomatoes perfect for fresh salads.' },
  { id: '2', name: 'Organic Green Kale', price: 750, compareAtPrice: 990, image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=600&q=80', category: 'Fruits & Veg', badge: 'Organic', description: 'Crisp, nutrient-dense green kale. Excellent for roasting or raw salads.' },
  { id: '3', name: 'White Button Mushrooms', price: 980, image: 'https://images.unsplash.com/photo-1611010344444-5f9e4d86a6d7?w=600&q=80', category: 'Fruits & Veg', badge: 'Local', description: 'Earthy and mild, these mushrooms are versatile for cooking or eating raw.' },
  { id: '4', name: 'Sweet Bell Peppers', price: 600, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80', category: 'Fruits & Veg', description: 'Crunchy, sweet, and colorful bell peppers perfect for snacking or cooking.' },
  { id: '5', name: 'Artisan Sourdough Loaf', price: 1800, image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80', category: 'Bakery', description: 'Baked fresh this morning using organic heritage grains.' },
  { id: '6', name: 'Organic Hass Avocados', price: 1500, image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=600&q=80', category: 'Fruits & Veg', badge: 'Organic', description: 'Creamy, rich, and perfectly ripe. Hand-picked from certified farms.' },
  { id: '7', name: 'Farm Fresh Eggs (12pk)', price: 1200, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80', category: 'Dairy & Eggs', badge: 'Local', description: 'Free-range, pasture-raised eggs from local farms.' },
  { id: '8', name: 'Extra Virgin Olive Oil', price: 4500, compareAtPrice: 5500, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80', category: 'Pantry', description: 'Cold-pressed extra virgin olive oil with a rich, fruity flavour.' },
];

interface MarketProductGridProps {
  domain: string;
  title?: string;
  subtitle?: string;
  products?: MarketProduct[];
  limit?: number;
}

export function MarketProductGrid({ domain, title = 'Fresh Products', subtitle, products = MOCK_PRODUCTS, limit }: MarketProductGridProps) {
  const displayProducts = limit ? products.slice(0, limit) : products;

  return (
    <section className="py-10" style={{ fontFamily: 'var(--font-market-body)' }}>
      <div className="container mx-auto px-4 md:px-6 max-w-[1280px]">
        {title && (
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>{subtitle}</p>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <MarketProductCard key={product.id} product={product} domain={domain} />
          ))}
        </div>
      </div>
    </section>
  );
}
