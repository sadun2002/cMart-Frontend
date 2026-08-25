'use client';

import React from 'react';
import Link from 'next/link';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { formatLKR } from '@/lib/constants';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { Lock, CreditCard, Truck } from 'lucide-react';

// We reuse the address and card form panels from Minimalist since they just use standard inputs
// which are customized by our globals.css rules anyway.

import { useSearchParams } from 'next/navigation';

export function VerdantCheckout({ storeName, domain }: { storeName: string; domain: string }) {
  const { items, getTotal } = useStorefrontCart();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(2);
  };

  const handlePlaceOrder = () => {
    setIsLoading(true);
    // Simulate order placement
    setTimeout(() => {
      window.location.href = `/s/${domain}/checkout/success${themeQuery}`;
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-verdant-background">
        <VerdantHeader storeName={storeName} domain={domain} />
        <main className="flex-grow flex items-center justify-center py-16">
          <div className="text-center">
            <h1 className="text-3xl font-verdant-heading font-bold text-verdant-on-surface mb-4">Your cart is empty</h1>
            <Link href={`/s/${domain}/shop${themeQuery}`} className="text-primary hover:underline font-verdant-body">
              Return to shop
            </Link>
          </div>
        </main>
        <VerdantFooter storeName={storeName} domain={domain} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          
          {/* Checkout Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-verdant-on-surface-variant'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary text-white shadow-sm' : 'bg-verdant-surface-container text-verdant-on-surface-variant'}`}>
                  1
                </div>
                <span className="text-xs font-verdant-heading font-semibold uppercase tracking-wide">Shipping</span>
              </div>
              <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-verdant-surface-container'}`} />
              <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-verdant-on-surface-variant'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary text-white shadow-sm' : 'bg-verdant-surface-container text-verdant-on-surface-variant'}`}>
                  2
                </div>
                <span className="text-xs font-verdant-heading font-semibold uppercase tracking-wide">Payment</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Form Area */}
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
              
              <div className="bg-verdant-surface-bright rounded-[24px] border border-verdant-surface-container overflow-hidden shadow-sm">
                <div className="p-6 md:p-8 border-b border-verdant-surface-container flex items-center gap-3">
                  <div className="p-2 bg-verdant-primary-container text-verdant-on-primary-container rounded-lg">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-xl font-verdant-heading font-bold text-verdant-on-surface">Shipping Information</h2>
                </div>
                <div className={`p-6 md:p-8 ${step !== 1 && 'opacity-60 pointer-events-none hidden md:block'}`}>
                  {/* Mock Address Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First Name" className="w-full px-4 py-3 rounded-xl border border-verdant-surface-container bg-verdant-surface-container-low text-verdant-on-surface focus:outline-none focus:border-primary" />
                      <input type="text" placeholder="Last Name" className="w-full px-4 py-3 rounded-xl border border-verdant-surface-container bg-verdant-surface-container-low text-verdant-on-surface focus:outline-none focus:border-primary" />
                    </div>
                    <input type="text" placeholder="Street Address" className="w-full px-4 py-3 rounded-xl border border-verdant-surface-container bg-verdant-surface-container-low text-verdant-on-surface focus:outline-none focus:border-primary" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="City" className="w-full px-4 py-3 rounded-xl border border-verdant-surface-container bg-verdant-surface-container-low text-verdant-on-surface focus:outline-none focus:border-primary" />
                      <input type="text" placeholder="Postal Code" className="w-full px-4 py-3 rounded-xl border border-verdant-surface-container bg-verdant-surface-container-low text-verdant-on-surface focus:outline-none focus:border-primary" />
                    </div>
                  </div>

                  {step === 1 && (
                    <div className="mt-8 flex justify-end">
                      <button 
                        onClick={handleNext}
                        className="px-8 py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={`bg-verdant-surface-bright rounded-[24px] border border-verdant-surface-container overflow-hidden shadow-sm ${step !== 2 && 'opacity-50'}`}>
                <div className="p-6 md:p-8 border-b border-verdant-surface-container flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-verdant-secondary-container text-verdant-on-secondary-container rounded-lg">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-xl font-verdant-heading font-bold text-verdant-on-surface">Payment Method</h2>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-verdant-on-surface-variant font-verdant-body font-medium">
                    <Lock size={12} /> Secure
                  </div>
                </div>
                {step === 2 && (
                  <div className="p-6 md:p-8">
                    {/* Mock Card Form */}
                    <div className="space-y-4">
                      <input type="text" placeholder="Card Number" className="w-full px-4 py-3 rounded-xl border border-verdant-surface-container bg-verdant-surface-container-low text-verdant-on-surface focus:outline-none focus:border-primary" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-verdant-surface-container bg-verdant-surface-container-low text-verdant-on-surface focus:outline-none focus:border-primary" />
                        <input type="text" placeholder="CVC" className="w-full px-4 py-3 rounded-xl border border-verdant-surface-container bg-verdant-surface-container-low text-verdant-on-surface focus:outline-none focus:border-primary" />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center">
                      <button 
                        onClick={() => setStep(1)}
                        className="text-sm font-verdant-body font-medium text-verdant-on-surface-variant hover:text-primary transition-colors"
                      >
                        &larr; Back to Shipping
                      </button>
                      <button 
                        onClick={handlePlaceOrder}
                        disabled={isLoading}
                        className="px-8 py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center min-w-[200px]"
                      >
                        {isLoading ? 'Processing...' : `Pay ${formatLKR(getTotal())}`}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-verdant-surface-bright rounded-[24px] border border-verdant-surface-container p-6 md:p-8 sticky top-24 shadow-sm">
                <h2 className="text-xl font-verdant-heading font-bold text-verdant-on-surface mb-6">Order Summary</h2>
                
                <ul className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-[12px] bg-verdant-surface-container-low border border-verdant-surface-container"
                        />
                        <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-verdant-surface-variant text-verdant-on-surface text-[10px] font-bold rounded-full border border-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center flex-grow">
                        <h4 className="text-sm font-verdant-heading font-semibold text-verdant-on-surface line-clamp-1">{item.name}</h4>
                        <span className="text-sm font-verdant-body text-verdant-on-surface-variant">{formatLKR(item.price)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="space-y-3 font-verdant-body text-sm text-verdant-on-surface-variant border-t border-verdant-surface-container pt-6 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-verdant-on-surface">{formatLKR(getTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-verdant-on-surface">Free Delivery</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-verdant-surface-container pt-6">
                  <span className="font-verdant-heading font-bold text-lg text-verdant-on-surface">Total</span>
                  <span className="font-verdant-heading font-bold text-2xl text-primary">{formatLKR(getTotal())}</span>
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
