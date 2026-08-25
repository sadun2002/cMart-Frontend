'use client';

import React, { useState } from 'react';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { formatLKR } from '@/lib/constants';
import { ShoppingCart, Heart, Minus, Plus, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { toast } from 'sonner';

export function VerdantProductDetails({ 
  storeName, 
  domain, 
  product 
}: { 
  storeName: string; 
  domain: string;
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    category?: string;
    isOrganic?: boolean;
  }
}) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useStorefrontCart((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    });
    toast.success(`${quantity} x ${product.name} added to cart`, {
      icon: <ShoppingCart className="w-4 h-4 text-verdant-primary" />
    });
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 bg-verdant-surface-bright p-6 md:p-12 rounded-[24px] shadow-sm border border-verdant-surface-container">
            
            {/* Image Gallery */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="relative w-full h-[400px] md:h-[500px] rounded-[16px] overflow-hidden bg-verdant-surface-container-low border border-verdant-surface-container">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                {(product.isOrganic ?? true) && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold bg-white text-verdant-on-surface shadow-sm">
                    <Leaf size={14} className="text-primary" /> Organic
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="w-full md:w-1/2 flex flex-col">
              {product.category && (
                <p className="text-sm font-verdant-body text-verdant-on-surface-variant mb-2 uppercase tracking-wide">
                  {product.category}
                </p>
              )}
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-verdant-heading font-bold text-verdant-on-surface leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <p className="text-3xl font-bold text-primary">
                  {formatLKR(product.price)}
                </p>
                {hasDiscount && (
                  <p className="text-xl font-medium text-verdant-on-surface-variant/60 line-through">
                    {formatLKR(product.compareAtPrice!)}
                  </p>
                )}
              </div>
              
              <div className="prose prose-sm md:prose-base font-verdant-body text-verdant-on-surface-variant mb-8 max-w-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p>
                    Premium quality {product.name.toLowerCase()} sourced directly from local organic farms. 
                    Perfect for a healthy, nutritious diet. Guaranteed fresh upon delivery.
                  </p>
                )}
              </div>
              
              <hr className="border-verdant-surface-container mb-8" />
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <div className="flex items-center bg-verdant-surface-container-low rounded-xl p-1 border border-verdant-surface-container w-full sm:w-auto">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-verdant-on-surface-variant hover:text-primary transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-semibold font-verdant-body text-verdant-on-surface">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-verdant-on-surface-variant hover:text-primary transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="w-full flex-grow flex items-center justify-center gap-2 bg-primary text-white font-verdant-body font-semibold text-lg py-4 px-8 rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                
                <button 
                  className="w-full sm:w-auto p-4 flex items-center justify-center text-verdant-on-surface-variant bg-verdant-surface-container-lowest border border-verdant-surface-container rounded-xl hover:text-verdant-error hover:border-verdant-error/30 transition-colors"
                  onClick={() => toast("Added to wishlist")}
                >
                  <Heart size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-verdant-surface-container">
                <div className="flex items-start gap-3">
                  <Truck className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-verdant-heading font-semibold text-sm text-verdant-on-surface">Fast Delivery</h4>
                    <p className="text-xs font-verdant-body text-verdant-on-surface-variant">Same day in selected areas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-verdant-heading font-semibold text-sm text-verdant-on-surface">Quality Guarantee</h4>
                    <p className="text-xs font-verdant-body text-verdant-on-surface-variant">100% fresh or your money back</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
