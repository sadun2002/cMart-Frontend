'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { CreditCard, Smartphone, Lock } from 'lucide-react';

type Step = 'customer' | 'shipping' | 'method' | 'payment';

export function MarketCheckout({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const { items, getTotal } = useStorefrontCart();
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');
  const [form, setForm] = useState({ email: '', phone: '', fullName: '', street: '', city: '', zip: '', cardNo: '', expiry: '', cvc: '' });

  const subtotal = getTotal();
  const shipping = shippingMethod === 'express' ? 1499 : 599;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const STEPS: { id: Step; num: number; label: string }[] = [
    { id: 'customer', num: 1, label: 'Customer Details' },
    { id: 'shipping', num: 2, label: 'Shipping Address' },
    { id: 'method', num: 3, label: 'Shipping Method' },
    { id: 'payment', num: 4, label: 'Payment Method' },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-10">
          <h1 className="text-3xl font-bold mb-10" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">

              {STEPS.map((step) => (
                <div key={step.id} className="rounded-2xl p-6"
                  style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: 'var(--color-market-primary)' }}>{step.num}</div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{step.label}</h2>
                  </div>

                  {step.id === 'customer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[{ key: 'email', label: 'Email Address', placeholder: 'jane@example.com', type: 'email' },
                        { key: 'phone', label: 'Phone Number', placeholder: '+94 77 123 4567', type: 'tel' }].map(({ key, label, placeholder, type }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>{label}</label>
                          <input type={type} placeholder={placeholder}
                            value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {step.id === 'shipping' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>Full Name</label>
                        <input type="text" placeholder="Jane Doe" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>Street Address</label>
                        <input type="text" placeholder="123 Organic Lane" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[{ key: 'city', label: 'City', placeholder: 'Colombo' }, { key: 'zip', label: 'ZIP Code', placeholder: '10001' }].map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>{label}</label>
                            <input type="text" placeholder={placeholder}
                              value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                              style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.id === 'method' && (
                    <div className="space-y-3">
                      {[
                        { id: 'standard', label: 'Standard Delivery', sub: '3-5 Business Days', price: 'LKR 599' },
                        { id: 'express', label: 'Express Delivery', sub: '1-2 Business Days', price: 'LKR 1,499' },
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors"
                          style={{
                            border: `1px solid ${shippingMethod === opt.id ? 'var(--color-market-primary)' : 'var(--color-market-border)'}`,
                            backgroundColor: shippingMethod === opt.id ? 'var(--color-market-primary-light)' : 'var(--color-market-surface)',
                          }}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="shipping" value={opt.id} checked={shippingMethod === opt.id}
                              onChange={() => setShippingMethod(opt.id as any)}
                              style={{ accentColor: 'var(--color-market-primary)' }} />
                            <div>
                              <p className="text-sm font-semibold" style={{ color: 'var(--color-market-on-surface)' }}>{opt.label}</p>
                              <p className="text-xs" style={{ color: 'var(--color-market-on-surface-muted)' }}>{opt.sub}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-market-on-surface)' }}>{opt.price}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {step.id === 'payment' && (
                    <div>
                      <div className="flex gap-3 mb-5">
                        {[{ id: 'card', label: 'Card', icon: <CreditCard className="w-5 h-5" /> },
                          { id: 'paypal', label: 'PayPal', icon: <span className="text-xs font-bold">PayPal</span> },
                          { id: 'apple', label: 'Apple Pay', icon: <Smartphone className="w-5 h-5" /> }].map((opt) => (
                          <button key={opt.id} onClick={() => setPaymentMethod(opt.id as any)}
                            className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-semibold transition-colors"
                            style={{
                              border: `1px solid ${paymentMethod === opt.id ? 'var(--color-market-primary)' : 'var(--color-market-border)'}`,
                              backgroundColor: paymentMethod === opt.id ? 'var(--color-market-primary-light)' : 'var(--color-market-surface)',
                              color: paymentMethod === opt.id ? 'var(--color-market-primary)' : 'var(--color-market-on-surface-muted)',
                            }}>
                            {opt.icon}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {paymentMethod === 'card' && (
                        <div className="space-y-4">
                          {[{ key: 'cardNo', label: 'Card Number', placeholder: '0000 0000 0000 0000' }].map(({ key, label, placeholder }) => (
                            <div key={key}>
                              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>{label}</label>
                              <input type="text" placeholder={placeholder}
                                value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                            </div>
                          ))}
                          <div className="grid grid-cols-2 gap-4">
                            {[{ key: 'expiry', label: 'Expiry Date', placeholder: 'MM/YY' }, { key: 'cvc', label: 'CVC', placeholder: '123' }].map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>{label}</label>
                                <input type="text" placeholder={placeholder}
                                  value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                  style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="sticky top-24">
              <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: 'var(--color-market-surface-low)' }}>
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold line-clamp-1" style={{ color: 'var(--color-market-on-surface)' }}>{item.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-market-on-surface-muted)' }}>Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold shrink-0" style={{ color: 'var(--color-market-on-surface)' }}>LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--color-market-border)' }}>
                  {[
                    { label: 'Subtotal', value: `LKR ${subtotal.toLocaleString()}` },
                    { label: 'Shipping', value: `LKR ${shipping.toLocaleString()}` },
                    { label: 'Taxes', value: `LKR ${tax.toLocaleString()}` },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--color-market-on-surface-muted)' }}>{r.label}</span>
                      <span style={{ color: 'var(--color-market-on-surface)' }}>{r.value}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between" style={{ borderColor: 'var(--color-market-border)' }}>
                    <span className="font-bold text-base" style={{ fontFamily: 'var(--font-market-heading)', color: 'var(--color-market-on-surface)' }}>Total</span>
                    <span className="font-bold text-xl" style={{ color: 'var(--color-market-primary)', fontFamily: 'var(--font-market-heading)' }}>LKR {total.toLocaleString()}</span>
                  </div>
                </div>
                <button className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-market-secondary)', fontFamily: 'var(--font-market-heading)' }}>
                  <Lock className="w-4 h-4" /> Place Order
                </button>
                <p className="flex items-center justify-center gap-1 mt-2 text-xs" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                  <Lock className="w-3 h-3" /> Secure, encrypted checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
