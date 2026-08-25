'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search } from 'lucide-react';

const FAQS = [
  {
    category: "Delivery & Shipping",
    questions: [
      { q: "Where do you deliver?", a: "We currently deliver to all major metropolitan areas within a 50-mile radius of our organic farms. You can check if we deliver to your zip code at checkout." },
      { q: "How much is shipping?", a: "Shipping is a flat rate of LKR 400 for orders under LKR 5,000. Orders above LKR 5,000 qualify for free delivery!" },
      { q: "When will my order arrive?", a: "Orders placed before 2 PM are typically delivered the next day between 8 AM and 6 PM. You will receive a tracking link via SMS once your order is out for delivery." }
    ]
  },
  {
    category: "Our Products",
    questions: [
      { q: "Are all your products organic?", a: "Yes, 100% of our fresh produce is certified organic. We work strictly with farmers who do not use synthetic pesticides, herbicides, or fertilizers." },
      { q: "Where does your produce come from?", a: "We source our products directly from a network of over 50 local, sustainable farms within our region. This ensures maximum freshness and supports local agriculture." },
      { q: "What if I receive a damaged item?", a: "We have a 100% freshness guarantee. If you receive any item that doesn't meet your standards, please contact our support team within 24 hours with a photo, and we will issue a full refund or replacement." }
    ]
  },
  {
    category: "Returns & Refunds",
    questions: [
      { q: "What is your return policy?", a: "Due to the perishable nature of our products, we do not accept physical returns. However, if you are unsatisfied with the quality, we will gladly issue a refund or store credit." },
      { q: "How long do refunds take?", a: "Refunds are processed within 1-2 business days and will appear on your original payment method within 3-5 business days depending on your bank." }
    ]
  }
];

export function VerdantFAQ({ storeName, domain }: { storeName: string; domain: string }) {
  const [openIndex, setOpenIndex] = useState<string>("0-0");
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  const toggleQuestion = (id: string) => {
    setOpenIndex(openIndex === id ? "" : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <div className="bg-verdant-surface-container-low py-12 md:py-20 border-b border-verdant-surface-container">
        <div className="container mx-auto px-4 md:px-8 max-w-[800px] text-center">
          <h1 className="text-4xl md:text-5xl font-verdant-heading font-bold text-verdant-on-surface mb-6">
            How can we help?
          </h1>
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 bg-white border border-verdant-surface-container rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-verdant-on-surface-variant w-5 h-5" />
          </div>
        </div>
      </div>

      <main className="flex-grow py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-[800px]">
          {FAQS.map((category, cIndex) => {
            // Filter questions based on search
            const filteredQuestions = category.questions.filter(
              q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   q.a.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredQuestions.length === 0) return null;

            return (
              <div key={category.category} className="mb-12">
                <h2 className="text-2xl font-verdant-heading font-bold text-verdant-on-surface mb-6 flex items-center gap-4">
                  {category.category}
                  <div className="h-px bg-verdant-surface-container flex-grow" />
                </h2>
                <div className="flex flex-col gap-4">
                  {filteredQuestions.map((q, qIndex) => {
                    const id = `${cIndex}-${qIndex}`;
                    const isOpen = openIndex === id;
                    
                    return (
                      <div 
                        key={qIndex} 
                        className="bg-verdant-surface-bright border border-verdant-surface-container rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
                      >
                        <button 
                          onClick={() => toggleQuestion(id)}
                          className="w-full p-6 text-left flex justify-between items-center hover:bg-verdant-surface-container-low transition-colors"
                        >
                          <span className={`font-verdant-heading font-semibold text-lg ${isOpen ? 'text-primary' : 'text-verdant-on-surface'}`}>
                            {q.q}
                          </span>
                          <span className="text-verdant-on-surface-variant ml-4 shrink-0">
                            {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                          </span>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-6 pt-0 font-verdant-body text-verdant-on-surface-variant leading-relaxed">
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
            );
          })}
          
          <div className="mt-16 bg-verdant-primary-container text-verdant-on-primary-container p-8 rounded-3xl text-center border border-primary/10">
            <h3 className="text-2xl font-verdant-heading font-bold mb-3">Still have questions?</h3>
            <p className="font-verdant-body opacity-90 mb-6">Our support team is always here to help.</p>
            <a href={`/s/${domain}/contact${themeQuery}`} className="inline-block px-8 py-3 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
              Contact Us
            </a>
          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
