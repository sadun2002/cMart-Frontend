'use client';

import React from 'react';
import Link from 'next/link';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { formatLKR } from '@/lib/constants';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

export function VerdantCart({ storeName, domain }: { storeName: string; domain: string }) {
  const { items, updateQuantity, removeItem, getTotal } = useStorefrontCart();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <h1 className="text-3xl md:text-4xl font-verdant-heading font-bold text-verdant-on-surface mb-8">
            Your Cart
          </h1>

          {items.length === 0 ? (
            <div className="bg-verdant-surface-bright rounded-[24px] border border-verdant-surface-container p-12 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-verdant-surface-container rounded-full flex items-center justify-center text-verdant-on-surface-variant mb-6">
                <ShoppingBag size={48} />
              </div>
              <h2 className="text-2xl font-verdant-heading font-bold text-verdant-on-surface mb-3">Your cart is empty</h2>
              <p className="font-verdant-body text-verdant-on-surface-variant max-w-md mb-8">
                Looks like you haven't added any fresh produce to your cart yet. Discover our latest organic arrivals!
              </p>
              <Link 
                href={`/s/${domain}/shop${themeQuery}`}
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Cart Items */}
              <div className="w-full lg:w-2/3 flex flex-col gap-6">
                <div className="bg-verdant-surface-bright rounded-[24px] border border-verdant-surface-container overflow-hidden">
                  <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-verdant-surface-container-low border-b border-verdant-surface-container text-sm font-verdant-heading font-semibold text-verdant-on-surface-variant uppercase tracking-wider">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  
                  <ul className="divide-y divide-verdant-surface-container">
                    {items.map((item) => (
                      <li key={item.id} className="p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                        <div className="col-span-6 flex items-center gap-4 w-full">
                          <img 
                            src={item.image || 'https://via.placeholder.com/100'} 
                            alt={item.name} 
                            className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-[12px] bg-verdant-surface-container-low"
                          />
                          <div className="flex flex-col">
                            <h3 className="font-verdant-heading font-semibold text-verdant-on-surface text-base md:text-lg line-clamp-2">
                              {item.name}
                            </h3>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-sm font-verdant-body text-verdant-error hover:text-verdant-error/80 flex items-center gap-1 mt-2 w-fit"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </div>
                        
                        <div className="col-span-2 text-center hidden md:block font-verdant-body font-medium text-verdant-on-surface">
                          {formatLKR(item.price)}
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center w-full md:w-auto">
                          <div className="flex items-center bg-verdant-surface-container-low rounded-xl p-1 border border-verdant-surface-container">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-2 text-verdant-on-surface-variant hover:text-primary transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-semibold font-verdant-body text-sm text-verdant-on-surface">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-verdant-on-surface-variant hover:text-primary transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="col-span-2 text-right w-full md:w-auto font-verdant-body font-bold text-lg text-primary">
                          <span className="md:hidden text-sm font-medium text-verdant-on-surface-variant mr-2">Total:</span>
                          {formatLKR(item.price * item.quantity)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-1/3">
                <div className="bg-verdant-surface-bright rounded-[24px] border border-verdant-surface-container p-6 md:p-8 sticky top-24">
                  <h2 className="text-2xl font-verdant-heading font-bold text-verdant-on-surface mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 font-verdant-body text-verdant-on-surface-variant border-b border-verdant-surface-container pb-6 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-medium text-verdant-on-surface">{formatLKR(getTotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-medium text-verdant-on-surface">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>Estimated Tax</span>
                      <span>{formatLKR(0)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-8">
                    <span className="font-verdant-heading font-bold text-xl text-verdant-on-surface">Total</span>
                    <span className="font-verdant-heading font-bold text-2xl text-primary">{formatLKR(getTotal())}</span>
                  </div>
                  
                  <Link 
                    href={`/s/${domain}/checkout${themeQuery}`}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
                  >
                    Proceed to Checkout <ArrowRight size={18} />
                  </Link>
                  
                  <div className="mt-4 text-center">
                    <Link href={`/s/${domain}/shop${themeQuery}`} className="text-sm font-verdant-body font-medium text-primary hover:underline">
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
