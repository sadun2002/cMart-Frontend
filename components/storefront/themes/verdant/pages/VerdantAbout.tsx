'use client';

import React from 'react';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { motion } from 'framer-motion';
import { Leaf, Award, HeartHandshake, Users } from 'lucide-react';

const STATS = [
  { label: 'Happy Customers', value: '10K+', icon: Users },
  { label: 'Organic Farms', value: '50+', icon: Leaf },
  { label: 'Quality Awards', value: '15', icon: Award },
  { label: 'Local Partners', value: '120', icon: HeartHandshake },
];

export function VerdantAbout({ storeName, domain }: { storeName: string; domain: string }) {
  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80" 
            alt="Farm landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-verdant-surface-bright/95 via-verdant-surface-bright/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px] relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="text-primary font-verdant-heading font-bold uppercase tracking-wider text-sm mb-4 block">Our Story</span>
            <h1 className="text-5xl md:text-6xl font-verdant-heading font-bold text-verdant-on-surface mb-6 leading-tight">
              Rooted in Nature,<br/>Delivered to You.
            </h1>
            <p className="text-xl text-verdant-on-surface-variant font-verdant-body leading-relaxed mb-8">
              We started {storeName} with a simple mission: to connect local farmers directly with people who care about what they eat. We believe that organic, sustainable food should be accessible to everyone.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="flex-grow">
        {/* Stats Section */}
        <div className="bg-primary text-white py-12 -mt-12 relative z-20 mx-4 md:mx-8 rounded-[24px] shadow-lg max-w-[1280px] xl:mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
            {STATS.map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <stat.icon className="w-8 h-8 mb-4 opacity-80" />
                <h3 className="text-3xl md:text-4xl font-verdant-heading font-bold mb-1">{stat.value}</h3>
                <p className="text-sm font-verdant-body opacity-90 uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[24px] overflow-hidden aspect-square md:aspect-auto md:h-[600px] shadow-sm border border-verdant-surface-container"
              >
                <img 
                  src="https://images.unsplash.com/photo-1595858602534-11812d3122f3?w=800&q=80" 
                  alt="Organic farming"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-6"
              >
                <h2 className="text-3xl md:text-4xl font-verdant-heading font-bold text-verdant-on-surface">
                  Sustainable from Seed to Table
                </h2>
                <div className="space-y-4 text-lg text-verdant-on-surface-variant font-verdant-body leading-relaxed">
                  <p>
                    Every product we offer is carefully vetted. We visit our partner farms, inspect their practices, and ensure they meet our rigorous standards for sustainability and organic growing methods.
                  </p>
                  <p>
                    By cutting out the middlemen, we provide fresher produce to our customers while ensuring fair compensation for the farmers who work tirelessly to grow our food.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="bg-verdant-surface-bright p-6 rounded-2xl border border-verdant-surface-container">
                    <Leaf className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-verdant-heading font-bold text-verdant-on-surface mb-2">100% Organic</h4>
                    <p className="text-sm font-verdant-body text-verdant-on-surface-variant">No synthetic pesticides or fertilizers, ever.</p>
                  </div>
                  <div className="bg-verdant-surface-bright p-6 rounded-2xl border border-verdant-surface-container">
                    <HeartHandshake className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-verdant-heading font-bold text-verdant-on-surface mb-2">Fair Trade</h4>
                    <p className="text-sm font-verdant-body text-verdant-on-surface-variant">We guarantee fair wages for all our partners.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
