"use client";

import { useRef, useState, useEffect } from 'react';
import { Target, HeartHandshake, MapPin } from 'lucide-react';

export function AboutValuesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;
    
    const interval = setInterval(() => {
      if (isPaused || !scrollRef.current) return;
      
      const el = scrollRef.current;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-24 relative z-10 bg-transparent transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white">What We Stand For</h2>
        </div>
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 md:px-0 -mx-4 md:mx-0 items-stretch"
        >
          {[
            {
              icon: Target,
              title: 'Simplicity First',
              desc: "Tools should make life easier, not harder. Every feature we build must pass the 'grandma test'.",
              color: 'text-blue-600 dark:text-blue-400',
              bg: 'bg-blue-100/50 dark:bg-blue-900/30',
            },
            {
              icon: HeartHandshake,
              title: 'Fair Pricing',
              desc: "Small businesses shouldn't pay enterprise prices. Quality tools for everyone, at fair prices.",
              color: 'text-emerald-600 dark:text-emerald-400',
              bg: 'bg-emerald-100/50 dark:bg-emerald-900/30',
            },
            {
              icon: MapPin,
              title: 'Built for Sri Lanka',
              desc: "We understand local needs - from Sinhala support to local online payment gateways.",
              color: 'text-purple-600 dark:text-purple-400',
              bg: 'bg-purple-100/50 dark:bg-purple-900/30',
            },
          ].map(val => (
            <div key={val.title} className="w-full sm:w-[85vw] md:w-auto shrink-0 snap-center bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-gray-100 dark:border-slate-800 shadow-xl shadow-blue-900/5 dark:shadow-none hover:-translate-y-2 transition-all duration-300">
              <div className={`w-16 h-16 rounded-2xl ${val.bg} ${val.color} flex items-center justify-center mb-8`}>
                <val.icon className="w-8 h-8" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-4">{val.title}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-lg leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
