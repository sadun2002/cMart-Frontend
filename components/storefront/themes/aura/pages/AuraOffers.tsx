'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { motion } from 'framer-motion';

const OFFERS = [
  { 
    id: 1, 
    title: "The Archive Sale", 
    discount: "Up to 50% Off", 
    description: "Discover pieces from previous collections, now available at exceptional prices. A rare opportunity to acquire our timeless designs.",
    validUntil: "Ends Sunday at midnight",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80"
  },
  { 
    id: 2, 
    title: "Complimentary Tailoring", 
    discount: "Exclusive Service", 
    description: "For a limited time, enjoy complimentary alterations on all suiting and outerwear purchases over LKR 100,000.",
    validUntil: "Available this month",
    image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1600&q=80"
  }
];

export function AuraOffers({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px] text-center">
          <span className="uppercase tracking-[0.2em] text-xs font-sans text-zinc-500 mb-6 block">Privileges</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-aura-on-surface mb-6 leading-tight">
            Exclusive Offers
          </h1>
        </div>
      </div>

      <main className="flex-grow pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          <div className="flex flex-col gap-24">
            {OFFERS.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-16`}
              >
                <div className="w-full md:w-1/2 aspect-[4/5] bg-[#f4f4f5] overflow-hidden">
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  />
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <span className="inline-block border border-black px-4 py-1 mb-8 text-[10px] font-sans font-semibold tracking-[0.2em] uppercase w-fit">
                    {offer.discount}
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light mb-6 leading-tight text-aura-on-surface">
                    {offer.title}
                  </h2>
                  <p className="text-base text-zinc-600 font-serif font-light leading-relaxed mb-10 max-w-md">
                    {offer.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <Link 
                      href={`/s/${domain}/shop${themeQuery}`} 
                      className="inline-block bg-black text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold font-sans hover:bg-zinc-800 transition-colors"
                    >
                      Shop the Offer
                    </Link>
                    <div className="text-xs text-zinc-500 font-sans tracking-widest uppercase">
                      * {offer.validUntil}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
