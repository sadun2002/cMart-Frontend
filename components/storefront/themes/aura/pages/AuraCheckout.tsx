'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export function AuraCheckout({ storeName, domain }: { storeName: string; domain: string }) {
  const { items, getTotal, clearCart } = useStorefrontCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getTotal();
  const shipping = subtotal > 50000 ? 0 : 500;
  const total = subtotal + shipping;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      clearCart();
      router.push(`/s/${domain}${themeQuery}`);
      alert('Order placed successfully (Demo)');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white font-sans">
      
      {/* Minimal Header for Checkout */}
      <header className="py-8 border-b border-aura-border bg-white text-center relative">
        <Link 
          href={`/s/${domain}/cart${themeQuery}`}
          className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} /> Back to Bag
        </Link>
        <Link 
          href={`/s/${domain}${themeQuery}`}
          className="text-2xl font-bold tracking-[0.2em] text-aura-on-surface uppercase font-serif"
        >
          {storeName}
        </Link>
      </header>

      <main className="flex-grow">
        <div className="flex flex-col lg:flex-row-reverse min-h-[calc(100vh-100px)]">
          
          {/* Order Summary (Right on Desktop, Top on Mobile) */}
          <div className="w-full lg:w-[45%] bg-[#f4f4f5] p-6 md:p-12 lg:p-16 border-l border-aura-border">
            <h2 className="text-xl font-serif mb-8 text-aura-on-surface">Order Summary</h2>
            
            <div className="flex flex-col gap-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-24 bg-white relative shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-serif text-sm">{item.name}</h3>
                  </div>
                  <div className="text-sm font-serif">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 font-sans text-sm text-zinc-600 border-t border-zinc-300 pt-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-serif text-black">LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-serif text-black">{shipping === 0 ? 'Free' : `LKR ${shipping.toLocaleString()}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xl font-serif mt-6 border-t border-zinc-300 pt-6">
              <span>Total</span>
              <span>LKR {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Checkout Form (Left on Desktop, Bottom on Mobile) */}
          <div className="w-full lg:w-[55%] p-6 md:p-12 lg:p-16 lg:pl-[10%]">
            
            <nav className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest font-sans text-zinc-400 mb-10">
              <Link href={`/s/${domain}/cart${themeQuery}`} className="text-black">Cart</Link>
              <ChevronRight size={12} />
              <span className="text-black font-semibold">Information</span>
              <ChevronRight size={12} />
              <span>Shipping</span>
              <ChevronRight size={12} />
              <span>Payment</span>
            </nav>

            <form onSubmit={handleCheckout} className="flex flex-col gap-10 max-w-xl">
              
              {/* Contact */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-serif text-aura-on-surface">Contact</h2>
                  <span className="text-sm text-zinc-500">Have an account? <Link href={`/s/${domain}/login${themeQuery}`} className="text-black underline">Log in</Link></span>
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="Email or mobile phone number"
                  className="w-full p-4 bg-transparent border border-aura-border focus:border-black focus:outline-none transition-colors text-sm"
                />
              </section>

              {/* Delivery */}
              <section>
                <h2 className="text-xl font-serif text-aura-on-surface mb-4">Delivery</h2>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" required placeholder="First name" className="w-full p-4 bg-transparent border border-aura-border focus:border-black focus:outline-none transition-colors text-sm" />
                    <input type="text" required placeholder="Last name" className="w-full p-4 bg-transparent border border-aura-border focus:border-black focus:outline-none transition-colors text-sm" />
                  </div>
                  <input type="text" required placeholder="Address" className="w-full p-4 bg-transparent border border-aura-border focus:border-black focus:outline-none transition-colors text-sm" />
                  <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full p-4 bg-transparent border border-aura-border focus:border-black focus:outline-none transition-colors text-sm" />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" required placeholder="City" className="col-span-1 w-full p-4 bg-transparent border border-aura-border focus:border-black focus:outline-none transition-colors text-sm" />
                    <select className="col-span-1 w-full p-4 bg-transparent border border-aura-border focus:border-black focus:outline-none transition-colors text-sm appearance-none rounded-none text-zinc-500">
                      <option>Western</option>
                      <option>Central</option>
                      <option>Southern</option>
                    </select>
                    <input type="text" required placeholder="Postal code" className="col-span-1 w-full p-4 bg-transparent border border-aura-border focus:border-black focus:outline-none transition-colors text-sm" />
                  </div>
                </div>
              </section>

              {/* Payment Info Demo */}
              <section>
                <h2 className="text-xl font-serif text-aura-on-surface mb-2">Payment</h2>
                <p className="text-sm text-zinc-500 mb-4">All transactions are secure and encrypted.</p>
                <div className="border border-aura-border p-6 bg-[#f4f4f5] flex items-center justify-center text-sm text-zinc-600">
                  This is a demo store. No actual payment is required.
                </div>
              </section>

              <button 
                type="submit"
                disabled={isProcessing || items.length === 0}
                className="w-full py-5 bg-black text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-4"
              >
                {isProcessing ? 'Processing...' : 'Complete Order'}
              </button>

              <div className="text-center mt-4 md:hidden">
                <Link href={`/s/${domain}/cart${themeQuery}`} className="text-sm text-zinc-500 hover:text-black">
                  Return to cart
                </Link>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
