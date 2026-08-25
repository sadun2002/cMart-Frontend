'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import { Package, User, MapPin, LogOut } from 'lucide-react';

export function AuraAccount({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { id: 'orders', name: 'Order History', icon: <Package size={16} /> },
    { id: 'profile', name: 'Profile Details', icon: <User size={16} /> },
    { id: 'addresses', name: 'Addresses', icon: <MapPin size={16} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 border-b border-aura-border pb-8">
            <div>
              <span className="uppercase tracking-[0.2em] text-xs font-sans text-zinc-500 mb-4 block">Welcome Back</span>
              <h1 className="text-4xl md:text-5xl font-serif font-light text-aura-on-surface">
                Eleanor Vance
              </h1>
            </div>
            <button className="flex items-center gap-2 text-xs uppercase tracking-widest font-sans text-zinc-500 hover:text-black transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-1/4">
              <nav className="flex flex-col gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-4 py-4 px-6 text-sm uppercase tracking-widest font-sans transition-colors text-left ${
                      activeTab === tab.id 
                        ? 'bg-[#f4f4f5] text-black font-semibold' 
                        : 'text-zinc-500 hover:bg-[#f4f4f5]/50 hover:text-black'
                    }`}
                  >
                    {tab.icon}
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="w-full lg:w-3/4">
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-serif mb-8 text-aura-on-surface">Recent Orders</h2>
                  <div className="border border-aura-border bg-[#f4f4f5] p-12 text-center">
                    <p className="text-zinc-500 font-sans uppercase tracking-widest text-sm mb-6">You haven't placed any orders yet.</p>
                    <Link 
                      href={`/s/${domain}/shop${themeQuery}`}
                      className="inline-block bg-black text-white px-8 py-3 uppercase tracking-[0.2em] text-xs font-semibold font-sans hover:bg-zinc-800 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-serif mb-8 text-aura-on-surface">Profile Details</h2>
                  <form className="flex flex-col gap-6 max-w-lg" onSubmit={e => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500">First Name</label>
                        <input type="text" defaultValue="Eleanor" className="bg-transparent border-b border-aura-border py-3 focus:outline-none focus:border-black transition-colors font-serif text-lg" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500">Last Name</label>
                        <input type="text" defaultValue="Vance" className="bg-transparent border-b border-aura-border py-3 focus:outline-none focus:border-black transition-colors font-serif text-lg" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-500">Email Address</label>
                      <input type="email" defaultValue="eleanor.vance@example.com" className="bg-transparent border-b border-aura-border py-3 focus:outline-none focus:border-black transition-colors font-serif text-lg" />
                    </div>
                    <button type="submit" className="bg-black text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-semibold font-sans hover:bg-zinc-800 transition-colors w-fit mt-4">
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-serif text-aura-on-surface">Saved Addresses</h2>
                    <button className="text-xs uppercase tracking-[0.2em] font-sans text-black border-b border-black pb-0.5 hover:text-zinc-500 hover:border-zinc-500 transition-colors">
                      Add New
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="border border-aura-border p-8 bg-[#f4f4f5]">
                      <h3 className="text-sm font-sans uppercase tracking-widest font-semibold mb-4">Default Shipping</h3>
                      <p className="font-serif text-zinc-600 leading-relaxed mb-6">
                        Eleanor Vance<br />
                        123 Fashion Avenue<br />
                        Suite 4B<br />
                        New York, NY 10012
                      </p>
                      <div className="flex gap-4">
                        <button className="text-xs uppercase tracking-widest font-sans text-zinc-500 hover:text-black transition-colors">Edit</button>
                        <button className="text-xs uppercase tracking-widest font-sans text-red-500 hover:text-red-700 transition-colors">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
