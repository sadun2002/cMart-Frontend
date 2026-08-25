'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';

export function AuraCart({ storeName, domain }: { storeName: string; domain: string }) {
  const { items, updateQuantity, removeItem, getTotal } = useStorefrontCart();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          <h1 className="text-4xl md:text-5xl font-serif font-light text-aura-on-surface mb-16 text-center">
            Your Shopping Bag
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-16 border-t border-aura-border">
              <p className="text-zinc-500 font-sans uppercase tracking-widest mb-8">Your bag is currently empty.</p>
              <Link 
                href={`/s/${domain}/shop${themeQuery}`}
                className="inline-block bg-black text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold font-sans hover:bg-zinc-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-16">
              
              {/* Cart Items */}
              <div className="w-full lg:w-[65%] flex flex-col">
                <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-aura-border text-xs uppercase tracking-widest text-zinc-500 font-sans">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>

                <div className="flex flex-col">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-6 py-8 border-b border-aura-border items-center">
                      {/* Product Detail */}
                      <div className="sm:col-span-6 flex gap-6 items-center">
                        <div className="w-24 h-32 bg-[#f4f4f5] shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link href={`/s/${domain}/product/${item.id}${themeQuery}`} className="font-serif text-lg hover:text-zinc-500 transition-colors">
                            {item.name}
                          </Link>
                          <span className="text-sm font-serif font-light text-zinc-500">LKR {item.price.toLocaleString()}</span>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-xs uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit mt-2 flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-3 flex sm:justify-center items-center gap-4">
                        <span className="sm:hidden text-xs uppercase tracking-widest text-zinc-500">Qty:</span>
                        <div className="flex items-center border border-aura-border">
                          <button 
                            className="p-3 hover:bg-zinc-50 transition-colors"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-sans text-sm">{item.quantity}</span>
                          <button 
                            className="p-3 hover:bg-zinc-50 transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="sm:col-span-3 sm:text-right flex justify-between sm:block items-center">
                        <span className="sm:hidden text-xs uppercase tracking-widest text-zinc-500">Total:</span>
                        <span className="font-serif text-lg">LKR {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-[35%]">
                <div className="bg-[#f4f4f5] p-8 md:p-10 sticky top-32">
                  <h2 className="text-xl font-serif mb-8 border-b border-zinc-200 pb-4">Order Summary</h2>
                  
                  <div className="flex flex-col gap-4 font-serif font-light mb-8 text-zinc-600 border-b border-zinc-200 pb-8">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>LKR {getTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xl font-serif mb-8">
                    <span>Total</span>
                    <span>LKR {getTotal().toLocaleString()}</span>
                  </div>

                  <Link 
                    href={`/s/${domain}/checkout${themeQuery}`}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-black text-white font-sans text-xs font-semibold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </Link>
                  
                  <Link 
                    href={`/s/${domain}/shop${themeQuery}`}
                    className="w-full flex justify-center text-center mt-6 text-xs uppercase tracking-widest font-sans border-b border-transparent hover:border-black transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
