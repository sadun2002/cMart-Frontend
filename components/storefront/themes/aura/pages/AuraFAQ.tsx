'use client';

import React, { useState } from 'react';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    category: "Orders & Shipping",
    questions: [
      { q: "Do you ship internationally?", a: "Yes, we offer worldwide shipping. Delivery times and costs vary depending on the destination. You can calculate exact shipping costs at checkout." },
      { q: "How can I track my order?", a: "Once your order is dispatched, you will receive an email containing your tracking information. You can also view the status of your order in your account dashboard." },
      { q: "What is your return policy?", a: "We accept returns within 14 days of delivery. Garments must be unworn, unwashed, and with all original tags attached. Bespoke or altered items cannot be returned." }
    ]
  },
  {
    category: "Product & Care",
    questions: [
      { q: "How should I care for silk garments?", a: "We recommend professional dry cleaning for all our silk pieces to maintain their luster and drape. If hand washing is necessary, use cold water and a specialized silk detergent." },
      { q: "Do you offer alterations?", a: "Complimentary alterations are available for suiting and tailored trousers at our flagship boutiques. For online purchases, please contact our concierge service." },
      { q: "Are your materials sustainably sourced?", a: "Sustainability is at the core of our brand. We exclusively partner with mills that adhere to strict environmental and ethical standards, prioritizing natural, biodegradable fibers." }
    ]
  }
];

export function AuraFAQ({ storeName, domain }: { storeName: string; domain: string }) {
  const [openIndex, setOpenIndex] = useState<string>("0-0");

  const toggleQuestion = (id: string) => {
    setOpenIndex(openIndex === id ? "" : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1000px]">
          
          <div className="text-center mb-24">
            <span className="uppercase tracking-[0.2em] text-xs font-sans text-zinc-500 mb-6 block">Information</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-aura-on-surface leading-tight">
              Frequently Asked
            </h1>
          </div>

          <div className="flex flex-col gap-20">
            {FAQS.map((category, cIndex) => (
              <div key={category.category}>
                <h2 className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500 mb-8 border-b border-aura-border pb-4">
                  {category.category}
                </h2>
                <div className="flex flex-col">
                  {category.questions.map((q, qIndex) => {
                    const id = `${cIndex}-${qIndex}`;
                    const isOpen = openIndex === id;
                    
                    return (
                      <div key={qIndex} className="border-b border-aura-border">
                        <button 
                          onClick={() => toggleQuestion(id)}
                          className="w-full py-8 flex justify-between items-center text-left group"
                        >
                          <span className={`font-serif text-xl md:text-2xl transition-colors ${isOpen ? 'text-black' : 'text-zinc-600 group-hover:text-black'}`}>
                            {q.q}
                          </span>
                          <span className="text-zinc-400 group-hover:text-black transition-colors ml-4 shrink-0">
                            {isOpen ? <Minus size={24} strokeWidth={1} /> : <Plus size={24} strokeWidth={1} />}
                          </span>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pb-8 font-serif font-light text-zinc-500 text-lg leading-relaxed max-w-3xl">
                                {q.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-32 text-center py-24 bg-[#f4f4f5]">
            <h3 className="text-2xl font-serif font-light mb-6">Need further assistance?</h3>
            <p className="text-zinc-500 font-serif mb-8">Our concierge team is available to help.</p>
            <a href={`/s/${domain}/contact`} className="inline-block bg-black text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold font-sans hover:bg-zinc-800 transition-colors">
              Contact Us
            </a>
          </div>

        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
