'use client';

import React from 'react';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { motion } from 'framer-motion';

export function AuraAbout({ storeName, domain }: { storeName: string; domain: string }) {
  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          
          <div className="text-center mb-24">
            <span className="uppercase tracking-[0.2em] text-xs font-sans text-zinc-500 mb-6 block">Maison</span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-light text-aura-on-surface leading-tight">
              Our Heritage
            </h1>
          </div>

          <div className="flex flex-col gap-32">
            
            {/* Section 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1"
              >
                <h2 className="text-3xl font-serif font-light mb-8 leading-tight">The Vision</h2>
                <div className="space-y-6 text-zinc-600 font-serif font-light leading-relaxed text-lg">
                  <p>
                    Founded on the principles of timeless elegance and uncompromising quality, {storeName} represents a new paradigm in modern luxury. We believe that true style transcends seasonal trends.
                  </p>
                  <p>
                    Our journey began with a simple question: How can we create garments that you will cherish not just for a season, but for a lifetime? The answer lies in our unwavering commitment to craftsmanship.
                  </p>
                </div>
              </motion.div>
              <div className="order-1 lg:order-2 bg-[#f4f4f5] aspect-[4/5] w-full">
                <img src="https://images.unsplash.com/photo-1550614000-4b95d466f914?w=1000&q=80" alt="Vision" className="w-full h-full object-cover grayscale" />
              </div>
            </div>

            {/* Section 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="bg-[#f4f4f5] aspect-[4/5] w-full">
                <img src="https://images.unsplash.com/photo-1598559068461-1a06903fb6fb?w=1000&q=80" alt="Craftsmanship" className="w-full h-full object-cover grayscale" />
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl font-serif font-light mb-8 leading-tight">The Craft</h2>
                <div className="space-y-6 text-zinc-600 font-serif font-light leading-relaxed text-lg">
                  <p>
                    Every stitch, every seam, and every silhouette is meticulously considered. We partner exclusively with artisans who share our dedication to perfection, utilizing techniques passed down through generations.
                  </p>
                  <p>
                    We source our materials from the world's most prestigious mills, ensuring that the tactile experience of our garments matches their visual appeal. It is this dedication to the unseen details that defines our aesthetic.
                  </p>
                </div>
              </motion.div>
            </div>

          </div>

          <div className="mt-32 text-center py-24 border-y border-aura-border">
            <h3 className="text-2xl md:text-3xl font-serif font-light mb-8">Experience the Collection</h3>
            <a href={`/s/${domain}/shop`} className="inline-block bg-black text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold font-sans hover:bg-zinc-800 transition-colors">
              Explore Now
            </a>
          </div>

        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
