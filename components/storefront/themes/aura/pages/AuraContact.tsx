'use client';

import React from 'react';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { motion } from 'framer-motion';

export function AuraContact({ storeName, domain }: { storeName: string; domain: string }) {
  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          
          <div className="text-center mb-24">
            <span className="uppercase tracking-[0.2em] text-xs font-sans text-zinc-500 mb-6 block">Concierge</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-aura-on-surface leading-tight">
              Client Services
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Contact Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-12"
            >
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500 mb-4">Direct Inquiries</h3>
                <p className="font-serif text-2xl text-aura-on-surface mb-2">concierge@{domain}.com</p>
                <p className="font-serif text-2xl text-aura-on-surface">+1 (800) 123-4567</p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500 mb-4">The Flagship Boutique</h3>
                <p className="font-serif text-xl text-zinc-600 leading-relaxed">
                  123 Fashion Avenue<br />
                  Suite 4B<br />
                  New York, NY 10012
                </p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500 mb-4">Operating Hours</h3>
                <div className="grid grid-cols-2 gap-4 font-serif text-lg text-zinc-600">
                  <span>Mon - Fri</span>
                  <span>10:00 - 19:00</span>
                  <span>Saturday</span>
                  <span>11:00 - 18:00</span>
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500">First Name</label>
                    <input type="text" className="bg-transparent border-b border-aura-border py-3 focus:outline-none focus:border-black transition-colors font-serif text-lg" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500">Last Name</label>
                    <input type="text" className="bg-transparent border-b border-aura-border py-3 focus:outline-none focus:border-black transition-colors font-serif text-lg" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500">Email Address</label>
                  <input type="email" className="bg-transparent border-b border-aura-border py-3 focus:outline-none focus:border-black transition-colors font-serif text-lg" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500">Inquiry Type</label>
                  <select className="bg-transparent border-b border-aura-border py-3 focus:outline-none focus:border-black transition-colors font-serif text-lg appearance-none rounded-none text-aura-on-surface">
                    <option>Product Information</option>
                    <option>Order Status</option>
                    <option>Returns & Exchanges</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500">Message</label>
                  <textarea rows={4} className="bg-transparent border-b border-aura-border py-3 focus:outline-none focus:border-black transition-colors font-serif text-lg resize-none"></textarea>
                </div>

                <button type="submit" className="bg-black text-white px-10 py-5 uppercase tracking-[0.2em] text-xs font-semibold font-sans hover:bg-zinc-800 transition-colors w-fit mt-4">
                  Submit Inquiry
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
