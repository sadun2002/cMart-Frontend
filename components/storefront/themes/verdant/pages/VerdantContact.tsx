'use client';

import React from 'react';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export function VerdantContact({ storeName, domain }: { storeName: string; domain: string }) {
  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <div className="bg-verdant-surface-container-low py-12 md:py-20 border-b border-verdant-surface-container">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-verdant-heading font-bold text-verdant-on-surface mb-4">
              Get in Touch
            </h1>
            <p className="text-verdant-on-surface-variant font-verdant-body text-lg">
              Have questions about our organic produce, delivery areas, or just want to say hi? We'd love to hear from you.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-grow py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Contact Info */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-verdant-surface-bright p-8 rounded-[24px] shadow-sm border border-verdant-surface-container flex flex-col gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-verdant-primary-container text-primary rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-verdant-heading font-semibold text-verdant-on-surface text-lg mb-1">Our Farm Store</h3>
                    <p className="text-verdant-on-surface-variant font-verdant-body">
                      123 Organic Valley Rd,<br/>
                      Freshville, CA 90210
                    </p>
                  </div>
                </div>

                <hr className="border-verdant-surface-container" />

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-verdant-secondary-container text-verdant-on-secondary-container rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-verdant-heading font-semibold text-verdant-on-surface text-lg mb-1">Phone</h3>
                    <p className="text-verdant-on-surface-variant font-verdant-body">
                      +1 (555) 123-4567<br/>
                      <span className="text-sm opacity-80">Mon-Fri from 8am to 5pm</span>
                    </p>
                  </div>
                </div>

                <hr className="border-verdant-surface-container" />

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-verdant-tertiary-container text-verdant-on-tertiary-container rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-verdant-heading font-semibold text-verdant-on-surface text-lg mb-1">Email</h3>
                    <p className="text-verdant-on-surface-variant font-verdant-body">
                      hello@organicstore.com<br/>
                      support@organicstore.com
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-primary text-white p-8 rounded-[24px] shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={24} />
                  <h3 className="font-verdant-heading font-bold text-xl">Store Hours</h3>
                </div>
                <div className="flex justify-between font-verdant-body text-white/90">
                  <span>Monday - Friday</span>
                  <span className="font-medium">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between font-verdant-body text-white/90 border-t border-white/20 pt-4">
                  <span>Saturday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between font-verdant-body text-white/90 border-t border-white/20 pt-4">
                  <span>Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 md:p-12 rounded-[24px] shadow-sm border border-verdant-surface-container"
              >
                <h2 className="text-2xl md:text-3xl font-verdant-heading font-bold text-verdant-on-surface mb-8">
                  Send us a Message
                </h2>
                <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">First Name</label>
                      <input 
                        type="text" 
                        placeholder="Jane"
                        className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-shadow"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Last Name</label>
                      <input 
                        type="text" 
                        placeholder="Doe"
                        className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-shadow"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="jane@example.com"
                      className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-shadow"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Subject</label>
                    <select className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body text-verdant-on-surface transition-shadow">
                      <option>General Inquiry</option>
                      <option>Order Issue</option>
                      <option>Wholesale</option>
                      <option>Feedback</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Message</label>
                    <textarea 
                      rows={5}
                      placeholder="How can we help you?"
                      className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body resize-none transition-shadow"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
                  >
                    Send Message <Send size={18} />
                  </button>
                </form>
              </motion.div>
            </div>
            
          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
