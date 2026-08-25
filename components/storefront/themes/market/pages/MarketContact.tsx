'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { MapPin, Phone, Clock, Send } from 'lucide-react';

export function MarketContact({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-14">
          <div className="mb-10">
            <p className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold mb-3"
              style={{ color: 'var(--color-market-on-surface-muted)' }}>
              <span className="w-8 h-px" style={{ backgroundColor: 'var(--color-market-on-surface-muted)' }} />
              Get in Touch
            </p>
            <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
              Let's grow something <span className="italic" style={{ color: 'var(--color-market-primary)' }}>beautiful</span><br />together.
            </h1>
            <p className="text-sm max-w-lg" style={{ color: 'var(--color-market-on-surface-muted)' }}>
              Whether you have a question about our organic sourcing, need help with a recent order, or just want to talk seasonal produce, we're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Form */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
              <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Send us a message</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[{ key: 'name', label: 'Full Name', type: 'text', placeholder: '' },
                    { key: 'email', label: 'Email Address', type: 'email', placeholder: '' }].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>{label}</label>
                      <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>Subject</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>Your Message</label>
                  <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                  Send Message <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Store Details */}
            <div className="space-y-5">
              <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Store Details</h2>
                <div className="space-y-5">
                  {[
                    { icon: <MapPin className="w-5 h-5" style={{ color: 'var(--color-market-primary)' }} />, label: 'VISIT US', lines: ['1245 Verdant Way', 'Colombo 03, Sri Lanka'] },
                    { icon: <Phone className="w-5 h-5" style={{ color: 'var(--color-market-primary)' }} />, label: 'CALL OR EMAIL', lines: ['+94 11 867 5309', 'hello@verdantmarket.com'] },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      {item.icon}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--color-market-on-surface-muted)' }}>{item.label}</p>
                        {item.lines.map((l) => <p key={l} className="text-sm" style={{ color: 'var(--color-market-on-surface)' }}>{l}</p>)}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5" style={{ color: 'var(--color-market-primary)' }} />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--color-market-on-surface-muted)' }}>MARKET HOURS</p>
                      {[['Monday - Friday', '8:00 AM - 8:00 PM'], ['Saturday', '7:00 AM - 9:00 PM'], ['Sunday', '9:00 AM - 6:00 PM', true]].map(([day, hrs, bold]) => (
                        <div key={day as string} className="flex justify-between text-sm gap-8">
                          <span style={{ color: bold ? 'var(--color-market-primary)' : 'var(--color-market-on-surface-muted)', fontWeight: bold ? 600 : 400 }}>{day}</span>
                          <span style={{ color: bold ? 'var(--color-market-primary)' : 'var(--color-market-on-surface)', fontWeight: 600 }}>{hrs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="rounded-2xl overflow-hidden h-48" style={{ backgroundColor: 'var(--color-market-surface-low)', border: '1px solid var(--color-market-border)' }}>
                <div className="w-full h-full flex items-center justify-center flex-col gap-2" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                  <MapPin className="w-8 h-8" />
                  <p className="text-sm font-medium">Get Directions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
