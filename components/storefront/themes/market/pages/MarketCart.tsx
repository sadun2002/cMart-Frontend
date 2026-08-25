'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { Trash2, ArrowLeft, Lock, ShoppingBag } from 'lucide-react';

export function MarketCart({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const { items, updateQuantity, removeItem, getTotal } = useStorefrontCart();
  const [promoCode, setPromoCode] = useState('');

  const subtotal = getTotal();
  const shipping = subtotal > 5000 ? 0 : 499;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Your Cart</h1>
            <Link href={`/s/${domain}/shop${themeQuery}`} className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-market-on-surface-muted)' }}>
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag className="w-14 h-14 mb-4" style={{ color: 'var(--color-market-border)' }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Your cart is empty</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-market-on-surface-muted)' }}>Looks like you haven't added anything to your cart yet.</p>
              <Link href={`/s/${domain}/shop${themeQuery}`}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-market-primary)' }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="rounded-2xl p-5 flex items-center gap-4"
                    style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: 'var(--color-market-surface-low)' }}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-market-sage)', color: 'var(--color-market-sage-dark)' }}>Organic</span>
                      <h3 className="font-bold mt-1 text-base line-clamp-1" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                        {item.name}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--color-market-on-surface-muted)' }}>Local Farms</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-lg overflow-hidden"
                          style={{ borderColor: 'var(--color-market-border)' }}>
                          <button className="w-8 h-8 flex items-center justify-center text-lg hover:opacity-60"
                            style={{ color: 'var(--color-market-on-surface)' }}
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>−</button>
                          <span className="w-8 text-center text-sm font-semibold" style={{ color: 'var(--color-market-on-surface)' }}>{item.quantity}</span>
                          <button className="w-8 h-8 flex items-center justify-center text-lg hover:opacity-60"
                            style={{ color: 'var(--color-market-on-surface)' }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <span className="text-base font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                          LKR {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 transition-opacity hover:opacity-60 shrink-0"
                      style={{ color: 'var(--color-market-on-surface-muted)' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <div className="rounded-2xl p-6 sticky top-24"
                  style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                  <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Order Summary</h2>

                  <div className="space-y-3 mb-5">
                    {[
                      { label: `Subtotal (${items.length} items)`, value: `LKR ${subtotal.toLocaleString()}` },
                      { label: 'Shipping', value: shipping === 0 ? 'Free' : `LKR ${shipping.toLocaleString()}` },
                      { label: 'Estimated Tax', value: `LKR ${tax.toLocaleString()}` },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span style={{ color: 'var(--color-market-on-surface-muted)' }}>{row.label}</span>
                        <span style={{ color: 'var(--color-market-on-surface)' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code */}
                  <div className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-market-on-surface-muted)' }}>Promo Code</p>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Enter code" value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                        style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                      <button className="px-4 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-market-on-surface)', color: 'white' }}>Apply</button>
                    </div>
                  </div>

                  <div className="border-t pt-5 mb-5 flex justify-between" style={{ borderColor: 'var(--color-market-border)' }}>
                    <span className="font-bold text-base" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Total</span>
                    <span className="font-bold text-2xl" style={{ color: 'var(--color-market-primary)', fontFamily: 'var(--font-market-heading)' }}>LKR {total.toLocaleString()}</span>
                  </div>

                  <Link href={`/s/${domain}/checkout${themeQuery}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-market-primary)', fontFamily: 'var(--font-market-heading)' }}>
                    Proceed to Checkout →
                  </Link>
                  <p className="flex items-center justify-center gap-1.5 mt-3 text-xs"
                    style={{ color: 'var(--color-market-on-surface-muted)' }}>
                    <Lock className="w-3 h-3" /> Secure Checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
