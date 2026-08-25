'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { User, ShoppingBag, MapPin, Heart, Shield, LogOut, Star, Package } from 'lucide-react';

type Tab = 'profile' | 'orders' | 'addresses' | 'wishlist' | 'security';

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" /> },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
];

const MOCK_ORDERS = [
  { id: '#VM-2847', date: 'Aug 14, 2026', status: 'Delivered', total: 3450, items: 4 },
  { id: '#VM-2791', date: 'Aug 05, 2026', status: 'Processing', total: 8900, items: 7 },
  { id: '#VM-2720', date: 'Jul 28, 2026', status: 'Delivered', total: 2100, items: 2 },
];

export function MarketAccount({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [form, setForm] = useState({ firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', phone: '+1 (555) 123-4567', preferredStore: 'Downtown Market' });

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Sidebar */}
            <aside className="md:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-market-primary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="white"/></svg>
                </div>
                <h2 className="font-bold text-base" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>My Account</h2>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: activeTab === item.id ? 'var(--color-market-primary)' : 'transparent',
                      color: activeTab === item.id ? 'white' : 'var(--color-market-on-surface-muted)',
                    }}>
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
              <button className="mt-6 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-market-error)' }}>
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </aside>

            {/* Content */}
            <div className="md:col-span-3">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Profile Settings</h1>
                      <p className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>Manage your personal information and preferences.</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-70"
                        style={{ borderColor: 'var(--color-market-border)', color: 'var(--color-market-on-surface)' }}>Cancel</button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-market-primary)' }}>
                        Save Changes ✓
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { icon: <Package className="w-6 h-6" style={{ color: 'var(--color-market-primary)' }} />, label: 'TOTAL ORDERS', value: '42', suffix: '+3 this month', suffixColor: 'var(--color-market-primary)' },
                      { icon: <Star className="w-6 h-6" style={{ color: 'var(--color-market-amber)' }} />, label: 'REWARD POINTS', value: '1,250', suffix: 'Gold Tier', suffixColor: 'var(--color-market-amber)' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl p-5 flex items-center gap-4"
                        style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                        {stat.icon}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>{stat.label}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{stat.value}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--color-market-amber-light)', color: stat.suffixColor }}>{stat.suffix}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Form */}
                  <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                    <div className="flex items-start gap-8">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-market-surface-low)' }}>
                          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <button className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-market-primary)' }}>Upload new photo</button>
                        <p className="text-[10px]" style={{ color: 'var(--color-market-on-surface-muted)' }}>JPG, GIF or PNG. Max 800K</p>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        {[
                          { key: 'firstName', label: 'First Name' }, { key: 'lastName', label: 'Last Name' },
                          { key: 'email', label: 'Email Address' }, { key: 'phone', label: 'Phone Number' },
                          { key: 'preferredStore', label: 'Preferred Store' },
                        ].map(({ key, label }) => (
                          <div key={key} className={key === 'email' ? 'col-span-2' : ''}>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>{label}</label>
                            <input type="text" value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                              style={{ border: '1px solid var(--color-market-border)', backgroundColor: 'var(--color-market-surface-low)', color: 'var(--color-market-on-surface)' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Order History</h1>
                  <div className="space-y-4">
                    {MOCK_ORDERS.map((order) => (
                      <div key={order.id} className="rounded-2xl p-5 flex items-center justify-between"
                        style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{order.id}</p>
                          <p className="text-xs" style={{ color: 'var(--color-market-on-surface-muted)' }}>{order.date} · {order.items} items</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${order.status === 'Delivered' ? '' : ''}`}
                            style={{
                              backgroundColor: order.status === 'Delivered' ? 'var(--color-market-sage)' : 'var(--color-market-amber-light)',
                              color: order.status === 'Delivered' ? 'var(--color-market-sage-dark)' : 'var(--color-market-secondary)',
                            }}>
                            {order.status}
                          </span>
                          <span className="font-bold text-sm" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                            LKR {order.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'addresses' || activeTab === 'wishlist' || activeTab === 'security') && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-4xl mb-4">🚧</p>
                  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Coming Soon</h2>
                  <p className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>This section is under construction.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
