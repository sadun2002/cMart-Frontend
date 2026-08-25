'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { motion } from 'framer-motion';
import { Clock, Percent, ArrowRight } from 'lucide-react';

const OFFERS = [
  { 
    id: 1, 
    title: "Organic Vegetable Bundle", 
    discount: "30% OFF", 
    description: "Get our weekly hand-picked selection of seasonal organic vegetables at a huge discount.",
    validUntil: "Valid until Sunday",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    color: "bg-verdant-primary-container text-verdant-on-primary-container"
  },
  { 
    id: 2, 
    title: "Fresh Fruit Frenzy", 
    discount: "Buy 1 Get 1 Free", 
    description: "On all citrus fruits. Perfect for your morning fresh juice.",
    validUntil: "Ends in 2 days",
    image: "https://images.unsplash.com/photo-1571501478200-85f260ceddad?w=800&q=80",
    color: "bg-verdant-secondary-container text-verdant-on-secondary-container"
  },
  { 
    id: 3, 
    title: "Dairy Essentials", 
    discount: "20% OFF", 
    description: "Stock up on farm-fresh milk, artisan cheese, and organic eggs.",
    validUntil: "Valid until end of month",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80",
    color: "bg-verdant-tertiary-container text-verdant-on-tertiary-container"
  },
];

export function VerdantOffers({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <div className="bg-verdant-surface-container-low py-12 md:py-16 border-b border-verdant-surface-container">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px] text-center">
          <div className="inline-flex items-center justify-center p-3 bg-verdant-primary-container text-primary rounded-full mb-6">
            <Percent size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-verdant-heading font-bold text-verdant-on-surface mb-4">
            Special Offers
          </h1>
          <p className="text-verdant-on-surface-variant font-verdant-body max-w-2xl mx-auto text-lg">
            Enjoy exclusive discounts on our freshest premium organic products.
          </p>
        </div>
      </div>

      <main className="flex-grow py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <div className="flex flex-col gap-12">
            {OFFERS.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative rounded-[24px] overflow-hidden ${offer.color} shadow-sm border border-black/5 flex flex-col md:flex-row items-center gap-8`}
              >
                <div className={`p-8 md:p-12 lg:p-16 w-full md:w-1/2 flex flex-col items-start ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider uppercase bg-white/20 rounded-full backdrop-blur-md">
                    {offer.discount}
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-verdant-heading font-bold mb-4 leading-tight">
                    {offer.title}
                  </h2>
                  <p className="text-lg font-verdant-body opacity-90 mb-8 max-w-md leading-relaxed">
                    {offer.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
                    <Link 
                      href={`/s/${domain}/shop${themeQuery}`} 
                      className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary bg-white transition-all rounded-xl hover:bg-white/90 shadow-sm"
                    >
                      Shop Now <ArrowRight size={18} className="ml-2" />
                    </Link>
                    <div className="flex items-center gap-2 text-sm font-medium opacity-80">
                      <Clock size={16} />
                      {offer.validUntil}
                    </div>
                  </div>
                </div>
                
                <div className={`w-full md:w-1/2 h-64 md:h-full min-h-[300px] md:min-h-[400px] relative ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Fade gradient for seamless blend on mobile */}
                  <div className={`absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-[${offer.color.split(' ')[0].replace('bg-', '')}]/80 to-transparent md:w-1/2 opacity-20`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
