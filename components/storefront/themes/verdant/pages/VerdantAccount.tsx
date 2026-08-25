'use client';

import React, { useState } from 'react';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { User, Package, MapPin, Heart, LogOut, ChevronRight } from 'lucide-react';

export function VerdantAccount({ storeName, domain }: { storeName: string; domain: string }) {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <div className="bg-verdant-surface-container-low py-12 border-b border-verdant-surface-container">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <h1 className="text-3xl md:text-4xl font-verdant-heading font-bold text-verdant-on-surface mb-2">
            My Account
          </h1>
          <p className="text-verdant-on-surface-variant font-verdant-body">
            Welcome back, Jane Doe
          </p>
        </div>
      </div>

      <main className="flex-grow py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            
            {/* Sidebar */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="bg-verdant-surface-bright rounded-2xl border border-verdant-surface-container overflow-hidden sticky top-24 shadow-sm">
                <nav className="flex flex-col">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 w-full p-4 text-left font-verdant-body font-medium transition-colors border-l-4 ${
                          isActive 
                            ? 'bg-verdant-surface-container-low border-primary text-primary' 
                            : 'border-transparent text-verdant-on-surface-variant hover:bg-verdant-surface-container hover:text-verdant-on-surface'
                        }`}
                      >
                        <tab.icon size={20} className={isActive ? 'text-primary' : 'text-verdant-on-surface-variant opacity-70'} />
                        {tab.label}
                        {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                      </button>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-verdant-surface-container">
                  <button className="flex items-center gap-3 w-full p-3 text-left font-verdant-body font-medium text-verdant-error hover:bg-verdant-error/10 rounded-xl transition-colors">
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-grow">
              {activeTab === 'profile' && (
                <div className="bg-verdant-surface-bright p-8 rounded-[24px] shadow-sm border border-verdant-surface-container">
                  <h2 className="text-2xl font-verdant-heading font-bold text-verdant-on-surface mb-6">Profile Settings</h2>
                  <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">First Name</label>
                        <input type="text" defaultValue="Jane" className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Last Name</label>
                        <input type="text" defaultValue="Doe" className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Email Address</label>
                      <input type="email" defaultValue="jane.doe@example.com" className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Phone Number</label>
                      <input type="tel" defaultValue="+1 (555) 000-0000" className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body" />
                    </div>
                    <button type="submit" className="mt-4 px-8 py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm w-fit">
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-verdant-surface-bright p-8 rounded-[24px] shadow-sm border border-verdant-surface-container">
                  <h2 className="text-2xl font-verdant-heading font-bold text-verdant-on-surface mb-6">Order History</h2>
                  <div className="flex flex-col items-center justify-center py-12 text-center text-verdant-on-surface-variant">
                    <Package size={48} className="mb-4 opacity-50" />
                    <h3 className="text-lg font-verdant-heading font-semibold text-verdant-on-surface mb-2">No orders yet</h3>
                    <p className="font-verdant-body">When you place an order, it will appear here.</p>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="bg-verdant-surface-bright p-8 rounded-[24px] shadow-sm border border-verdant-surface-container">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-verdant-heading font-bold text-verdant-on-surface">Saved Addresses</h2>
                    <button className="text-primary font-verdant-body font-medium hover:underline">Add New</button>
                  </div>
                  <div className="border border-verdant-surface-container rounded-xl p-6 relative">
                    <span className="absolute top-6 right-6 px-2 py-1 bg-verdant-primary-container text-verdant-on-primary-container text-xs font-bold rounded">Default</span>
                    <h3 className="font-verdant-heading font-semibold text-verdant-on-surface text-lg mb-2">Home</h3>
                    <p className="font-verdant-body text-verdant-on-surface-variant leading-relaxed mb-4">
                      Jane Doe<br/>
                      123 Organic Lane, Apt 4B<br/>
                      Freshville, CA 90210<br/>
                      United States
                    </p>
                    <div className="flex gap-4">
                      <button className="text-sm font-medium text-primary hover:underline">Edit</button>
                      <button className="text-sm font-medium text-verdant-error hover:underline">Delete</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="bg-verdant-surface-bright p-8 rounded-[24px] shadow-sm border border-verdant-surface-container">
                  <h2 className="text-2xl font-verdant-heading font-bold text-verdant-on-surface mb-6">Wishlist</h2>
                  <div className="flex flex-col items-center justify-center py-12 text-center text-verdant-on-surface-variant">
                    <Heart size={48} className="mb-4 opacity-50" />
                    <h3 className="text-lg font-verdant-heading font-semibold text-verdant-on-surface mb-2">Your wishlist is empty</h3>
                    <p className="font-verdant-body">Save items you love to view them later.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
