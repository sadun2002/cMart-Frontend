'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const slides = [
  {
    id: 1,
    title: 'Farm Fresh to Your Door',
    subtitle: 'Discover the freshest organic vegetables, handpicked daily from local farms.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920',
    cta: 'Shop Fresh',
  },
  {
    id: 2,
    title: '100% Organic Fruits',
    subtitle: 'Taste the difference with our certified organic, pesticide-free fruits.',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1920',
    cta: 'Explore Fruits',
  },
  {
    id: 3,
    title: 'Daily Harvest Specials',
    subtitle: 'Enjoy up to 30% off on our daily seasonal specials. Healthy eating made affordable.',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1920',
    cta: 'View Offers',
  }
];

export function VerdantHeroSlider({ domain }: { domain: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] max-h-[700px] bg-verdant-surface-container overflow-hidden rounded-[24px] mx-4 md:mx-8 lg:mx-auto lg:max-w-[1248px] mt-6 mb-12 shadow-sm">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-verdant-surface-container-lowest/95 via-verdant-surface-container-lowest/70 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 md:px-16 lg:px-24 max-w-2xl">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase bg-verdant-primary-container text-verdant-on-primary-container rounded-full"
              >
                Premium Grocery
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-verdant-heading font-bold text-verdant-on-surface leading-tight mb-4"
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg md:text-xl font-verdant-body text-verdant-on-surface-variant mb-8 max-w-lg"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Link 
                  href={`/s/${domain}/shop`}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all bg-primary rounded-xl hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
                >
                  {slides[currentSlide].cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-12 flex items-center gap-3">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md text-verdant-on-surface hover:bg-white/40 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md text-verdant-on-surface hover:bg-white/40 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-8 md:left-16 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-verdant-outline-variant/60 hover:bg-verdant-outline-variant'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
