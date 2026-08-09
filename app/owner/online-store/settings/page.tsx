'use client';

import { useState } from 'react';
import { 
  Settings2, Store, MapPin, Phone, Mail, 
  DollarSign, Clock, Hash, Lock, CheckCircle2, Globe
} from 'lucide-react';
import { toast } from 'sonner';

export default function StoreSettingsPage() {
  const [formData, setFormData] = useState({
    // Store Details
    storeName: 'C-Mart Premium',
    contactEmail: 'support@cmart.lk',
    supportPhone: '+94 77 123 4567',
    storeAddress: '123 Galle Road, Colombo 03, Sri Lanka',
    
    // Standards
    currency: 'LKR',
    timezone: 'Asia/Colombo',
    weightUnit: 'kg',
    
    // Order Formats
    orderPrefix: '#ORD-',
    orderSuffix: '',
    
    // Checkout
    requireAccount: false,
    requirePhone: true
  });

  const handleSave = () => {
    toast.success('Store settings saved successfully');
  };

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6 relative overflow-hidden overflow-y-auto">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-blue-600" />
            Store Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage foundational settings for your online storefront.</p>
        </div>
        <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors shrink-0 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-8 pb-10">
        
        {/* Basic Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              Basic Information
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">This information is displayed publicly on your website.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Store Name</label>
              <input 
                type="text" 
                value={formData.storeName}
                onChange={e => setFormData({...formData, storeName: e.target.value})}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Customer Support Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    value={formData.contactEmail}
                    onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Customer Support Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.supportPhone}
                    onChange={e => setFormData({...formData, supportPhone: e.target.value})}
                    className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Store Physical Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 pt-3 pointer-events-none text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <textarea 
                  value={formData.storeAddress}
                  onChange={e => setFormData({...formData, storeAddress: e.target.value})}
                  className="w-full h-24 pl-11 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Standards and Formats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Standards & Formats
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Used to calculate product prices, shipping weights, and order times.</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Store Currency</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <select 
                    value={formData.currency}
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                    className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="LKR">LKR - Sri Lankan Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Timezone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <select 
                    value={formData.timezone}
                    onChange={e => setFormData({...formData, timezone: e.target.value})}
                    className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Asia/Colombo">(GMT+5:30) Asia/Colombo</option>
                    <option value="UTC">(GMT+0:00) UTC</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Order ID Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Prefix</label>
                  <input 
                    type="text" 
                    value={formData.orderPrefix}
                    onChange={e => setFormData({...formData, orderPrefix: e.target.value})}
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Suffix (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.orderSuffix}
                    onChange={e => setFormData({...formData, orderSuffix: e.target.value})}
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                  />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-3">
                Your next order ID will appear as: <strong className="text-slate-900 dark:text-white">{formData.orderPrefix}1001{formData.orderSuffix}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Checkout Rules
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Configure what customers need to do before placing an order.</p>
          </div>
          
          <div className="p-6 space-y-4">
            <label className="flex items-start gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  checked={formData.requireAccount}
                  onChange={e => setFormData({...formData, requireAccount: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Require Customer Accounts</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Customers will only be able to check out if they have an account and are logged in.</div>
              </div>
            </label>
            
            <label className="flex items-start gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  checked={formData.requirePhone}
                  onChange={e => setFormData({...formData, requirePhone: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Require Phone Number at Checkout</div>
                <div className="text-sm font-medium text-slate-500 mt-1">Customers must enter their phone number to complete their purchase. Useful for delivery coordination.</div>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
