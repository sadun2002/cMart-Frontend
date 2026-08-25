'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingCart, Heart } from 'lucide-react';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { toast } from 'sonner';

export interface MarketProduct {
  id: string | number;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category?: string;
  badge?: string;
  unit?: string;
  description?: string;
}

interface MarketProductCardProps {
  product: MarketProduct;
  domain: string;
}

export function MarketProductCard({ product, domain }: MarketProductCardProps) {
  const { addItem } = useStorefrontCart();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link href={`/s/${domain}/product/${product.id}${themeQuery}`} className="block group">
      <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>

        {/* Image */}
        <div className="relative w-full aspect-[4/3] overflow-hidden"
          style={{ backgroundColor: 'var(--color-market-surface-low)' }}>
          <img src={product.image} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: 'var(--color-market-sage)', color: 'var(--color-market-sage-dark)' }}>
                {product.badge}
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: 'var(--color-market-amber)' }}>
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'white' }}
            onClick={(e) => { e.preventDefault(); toast('Added to wishlist'); }}>
            <Heart className="w-4 h-4" style={{ color: 'var(--color-market-on-surface-muted)' }} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category && (
            <p className="text-[11px] uppercase tracking-wider mb-1 font-medium"
              style={{ color: 'var(--color-market-on-surface-muted)', fontFamily: 'var(--font-market-body)' }}>
              {product.category}
            </p>
          )}
          <h3 className="font-bold text-base leading-tight line-clamp-2 mb-1"
            style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--color-market-on-surface-muted)', fontFamily: 'var(--font-market-body)' }}>
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-bold" style={{ color: 'var(--color-market-primary)', fontFamily: 'var(--font-market-heading)' }}>
                LKR {product.price.toLocaleString()}
              </span>
              {product.unit && (
                <span className="text-xs ml-1" style={{ color: 'var(--color-market-on-surface-muted)' }}>/{product.unit}</span>
              )}
              {hasDiscount && (
                <p className="text-xs line-through" style={{ color: 'var(--color-market-on-surface-subtle)' }}>
                  LKR {product.compareAtPrice!.toLocaleString()}
                </p>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95 text-white"
              style={{ backgroundColor: 'var(--color-market-secondary)', fontFamily: 'var(--font-market-heading)' }}>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
