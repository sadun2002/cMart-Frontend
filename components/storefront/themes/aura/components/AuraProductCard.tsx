'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  badge?: string;
}

export function AuraProductCard({ product, domain }: { product: Product; domain: string }) {
  const { items, updateQuantity, addItem } = useStorefrontCart();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  
  const [isHovered, setIsHovered] = useState(false);

  // Determine if item is in cart
  const cartItem = items.find(item => item.productId === Number(product.id) || item.id === product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product details
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    } else {
      addItem({ 
        productId: Number(product.id), 
        name: product.name, 
        price: product.price, 
        image: product.image,
        quantity: 1
      });
    }
  };

  return (
    <Link href={`/s/${domain}/product/${product.id}${themeQuery}`} className="block group">
      <div 
        className="relative overflow-hidden bg-[#f4f4f5] aspect-[3/4] mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <motion.img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
          animate={{ scale: isHovered ? 1.05 : 1 }}
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase z-10 font-sans">
            {product.badge}
          </div>
        )}

        {/* Quick Add Overlay */}
        <div 
          className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 flex items-end justify-center ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0 opacity-100'}`}
        >
          <button 
            onClick={handleAddToCart}
            className={`w-full py-3 bg-white text-black font-sans text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300 transform ${isHovered ? 'translate-y-0' : 'translate-y-4 md:translate-y-8 translate-y-0'}`}
            style={{ transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          >
            {cartItem ? `In Cart (${cartItem.quantity})` : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col items-center text-center font-serif mt-5 gap-1">
        {product.category && (
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans">{product.category}</span>
        )}
        <h3 className="text-sm md:text-base text-aura-on-surface group-hover:text-primary transition-colors">{product.name}</h3>
        <p className="text-sm font-light text-zinc-600 mt-1">LKR {product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
