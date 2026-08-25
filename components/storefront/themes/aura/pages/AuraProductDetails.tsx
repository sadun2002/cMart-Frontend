'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function AuraProductDetails({ storeName, domain, productId }: { storeName: string; domain: string; productId: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const { items, updateQuantity, addItem } = useStorefrontCart();

  // Mock product data
  const product = {
    id: productId,
    name: 'Silk Essential Blouse',
    price: 12500,
    category: 'Tops',
    description: 'A masterpiece of understatement. This essential blouse is cut from pure, lightweight silk that drapes beautifully. It features a concealed button placket and a slightly oversized fit for effortless elegance.',
    details: [
      '100% Mulberry Silk',
      'Concealed front button closure',
      'Buttoned cuffs',
      'Dry clean only',
      'Made in Italy'
    ],
    images: [
      'https://images.unsplash.com/photo-1598559069252-5539276d49dd?w=1200&q=80',
      'https://images.unsplash.com/photo-1598559068461-1a06903fb6fb?w=1200&q=80',
      'https://images.unsplash.com/photo-1598559067566-fbc216bba037?w=1200&q=80'
    ]
  };

  const cartItem = items.find(item => item.productId === Number(product.id) || item.id === product.id);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');

  const handleAddToCart = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    } else {
      addItem({ 
        productId: Number(product.id),
        name: product.name, 
        price: product.price, 
        image: product.images[0],
        quantity: 1
      });
    }
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow pt-24 pb-24">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px] mb-8">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-sans text-zinc-500">
            <Link href={`/s/${domain}${themeQuery}`} className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href={`/s/${domain}/shop${themeQuery}`} className="hover:text-black transition-colors">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-black">{product.name}</span>
          </nav>
        </div>

        <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative">
            
            {/* Image Gallery (Left) */}
            <div className="w-full lg:w-[60%] flex flex-col gap-4">
              {product.images.map((img, idx) => (
                <div key={idx} className="bg-[#f4f4f5] w-full aspect-[3/4]">
                  <img src={img} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Product Info (Right - Sticky) */}
            <div className="w-full lg:w-[40%]">
              <div className="sticky top-32 flex flex-col gap-8">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-sans block mb-2">{product.category}</span>
                  <h1 className="text-4xl md:text-5xl font-serif font-light text-aura-on-surface mb-4 leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-2xl font-serif text-zinc-600">
                    LKR {product.price.toLocaleString()}
                  </p>
                </div>

                <div className="h-px w-full bg-aura-border"></div>

                {/* Add to Cart */}
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="w-full py-5 bg-black text-white font-sans text-xs font-semibold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                  >
                    {cartItem ? `Add Another (In Cart: ${cartItem.quantity})` : 'Add to Cart'}
                  </button>
                  <p className="text-xs text-center text-zinc-500 uppercase tracking-widest font-sans">
                    Complimentary shipping on orders over LKR 50,000
                  </p>
                </div>

                {/* Description */}
                <div className="text-zinc-600 font-serif font-light leading-relaxed text-base mt-4">
                  {product.description}
                </div>

                {/* Accordions */}
                <div className="border-t border-aura-border mt-8">
                  {/* Details Accordion */}
                  <div className="border-b border-aura-border">
                    <button 
                      onClick={() => toggleAccordion('details')}
                      className="w-full py-6 flex justify-between items-center text-sm uppercase tracking-widest font-sans group"
                    >
                      <span>Details & Fit</span>
                      <span className="text-zinc-400 group-hover:text-black transition-colors">
                        {activeAccordion === 'details' ? <Minus size={18} strokeWidth={1} /> : <Plus size={18} strokeWidth={1} />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {activeAccordion === 'details' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <ul className="pb-6 pl-4 list-disc space-y-2 font-serif font-light text-zinc-600 text-sm">
                            {product.details.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Shipping Accordion */}
                  <div className="border-b border-aura-border">
                    <button 
                      onClick={() => toggleAccordion('shipping')}
                      className="w-full py-6 flex justify-between items-center text-sm uppercase tracking-widest font-sans group"
                    >
                      <span>Shipping & Returns</span>
                      <span className="text-zinc-400 group-hover:text-black transition-colors">
                        {activeAccordion === 'shipping' ? <Minus size={18} strokeWidth={1} /> : <Plus size={18} strokeWidth={1} />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {activeAccordion === 'shipping' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pb-6 font-serif font-light text-zinc-600 text-sm leading-relaxed space-y-4">
                            <p>Standard delivery within 2-4 business days.</p>
                            <p>Free returns within 14 days of delivery. Items must be unworn and in original condition with tags attached.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
