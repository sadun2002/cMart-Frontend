'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Truck, FileText, MapPin, Banknote, Building2, Info, ChevronDown, ChevronUp, X 
} from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from '@/components/ui/custom-select';
import { MainRightPanel, SecondaryRightPanel } from '@/components/ui/right-panel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';

const PROVINCES = [
  'Western', 'Central', 'Southern', 'North Western', 'Sabaragamuwa', 
  'Eastern', 'Uva', 'North Central', 'Northern'
];

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara', 'Negombo', 'Moratuwa', 'Sri Jayawardenepura Kotte'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya', 'Gampola', 'Dambulla'],
  'Southern': ['Galle', 'Matara', 'Hambantota', 'Tangalle', 'Weligama'],
  'North Western': ['Kurunegala', 'Puttalam', 'Kuliyapitiya', 'Chilaw'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle', 'Balangoda', 'Embilipitiya'],
  'Eastern': ['Trincomalee', 'Batticaloa', 'Ampara', 'Kattankudy'],
  'Uva': ['Badulla', 'Moneragala', 'Bandarawela', 'Haputale'],
  'North Central': ['Anuradhapura', 'Polonnaruwa', 'Hingurakgoda'],
  'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu']
};

const CATEGORIES = [
  'Electronics', 'Clothing', 'Groceries', 'Beverages', 'Hardware', 'Furniture', 
  'Stationery', 'Cosmetics', 'Toys', 'Automotive', 'Pharmaceuticals', 
  'Sporting Goods', 'Home Appliances', 'Footwear', 'Jewelry', 'Books', 
  'Music Instruments', 'Pet Supplies', 'Garden Supplies', 'Kitchenware',
  'Tools', 'Lighting', 'Plumbing', 'Paints', 'Textiles', 'Plastics',
  'Packaging', 'Chemicals', 'Cleaning Supplies', 'Office Supplies'
];

function SearchableSelect({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: string[], placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filteredOptions = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium cursor-pointer flex justify-between items-center"
      >
        <span className={value ? 'text-slate-900 dark:text-white truncate mr-2' : 'text-slate-400 truncate mr-2'}>{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-[70] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 flex flex-col overflow-hidden">
            {options.length > 5 && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-700 shrink-0">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none"
                />
              </div>
            )}
            <div className="overflow-y-auto p-1 flex-1">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-sm text-slate-400 text-center">No results found</div>
              ) : (
                filteredOptions.map(opt => (
                  <div 
                    key={opt}
                    onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                    className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg cursor-pointer transition-colors"
                  >
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function AddSupplierPanel({ isOpen, onClose, onSuccess, rightOffset = 'right-0' }: { isOpen: boolean, onClose: () => void, onSuccess?: (supplier: any) => void, rightOffset?: string }) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    contactPersonPhone: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Sri Lanka',
    province: '',
    category: '',
    brNumber: '',
    openingBalance: '',
    creditLimit: '',
    paymentTerms: 'CASH',
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    notes: '',
    active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [openSections, setOpenSections] = useState({
    basic: true,
    location: false,
    financial: false,
    bank: false,
    notes: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        basic: false,
        location: false,
        financial: false,
        bank: false,
        notes: false,
        [section]: true
      };
    });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      contactPersonPhone: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: 'Sri Lanka',
      province: '',
      category: '',
      brNumber: '',
      openingBalance: '',
      creditLimit: '',
      paymentTerms: 'CASH',
      bankName: '',
      accountName: '',
      accountNumber: '',
      branch: '',
      notes: '',
      active: true
    });
  };

  const [validationError, setValidationError] = useState<{ field: string, message: string } | null>(null);

  const focusField = (id: string, sectionKey?: string, message?: string) => {
    if (sectionKey && !openSections[sectionKey as keyof typeof openSections]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
    }
    if (message) {
      setValidationError({ field: id, message });
      setTimeout(() => setValidationError(null), 3000);
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }, 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      focusField('field-supplier-name', 'basic', 'Company / Supplier Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      focusField('field-supplier-phone', 'basic', 'Phone Number is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await storeOwnerAPI.createSupplier(formData);
      toast.success('Supplier added successfully!');
      try {
        localStorage.removeItem('draft_supplier_form');
      } catch (e) {}
      resetForm();
      if (onSuccess) {
          onSuccess(res.data || formData);
      } else {
          onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restore draft when panel opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('draft_supplier_form');
        if (saved) setFormData(JSON.parse(saved));
      } catch (e) {}
    }
  }, [isOpen]);

  // Auto-save draft when dirty inputs exist
  useEffect(() => {
    if (!isOpen) return;
    const hasData = Boolean(
      formData.name || formData.contactPerson || formData.phone || formData.email ||
      formData.address || formData.city || formData.category || formData.notes
    );
    if (hasData) {
      try {
        localStorage.setItem('draft_supplier_form', JSON.stringify(formData));
      } catch (e) {}
    }
  }, [formData, isOpen]);

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_supplier_form');
    } catch (e) {}
    resetForm();
    onClose();
  };

  const Panel = rightOffset === 'right-0' ? MainRightPanel : SecondaryRightPanel;

  return (
    <Panel
      isOpen={isOpen}
      onClose={onClose}
      onDiscard={handleDiscardChanges}
      title="Add New Supplier"
      subtitle="Register a new vendor contact"
      icon={Truck}
      formId="supplierForm"
      isSubmitting={isSubmitting}
      saveText="Save Supplier"
    >
      <form id="supplierForm" onSubmit={handleSave} className="font-sans space-y-4">
                
                {/* 1. Basic Details */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button 
                    type="button" 
                    onClick={() => toggleSection('basic')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Basic Details
                    </span>
                    {openSections.basic ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {openSections.basic && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                      >
                        <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Supplier Name <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input id="field-supplier-name" required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. Acme Corporation" />
                              <ValidationErrorTooltip error={validationError} fieldId="field-supplier-name" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                              <SearchableSelect 
                                value={formData.category} 
                                onChange={v => setFormData({...formData, category: v})} 
                                options={CATEGORIES} 
                                placeholder="e.g. Electronics" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                BR Number
                                <div className="relative group flex items-center">
                                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Business Registration
                                  </div>
                                </div>
                              </label>
                              <input type="text" value={formData.brNumber} onChange={e => setFormData({...formData, brNumber: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. PV012345" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Supplier Phone <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <input id="field-supplier-phone" required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. 011 234 5678" />
                                <ValidationErrorTooltip error={validationError} fieldId="field-supplier-phone" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. contact@acme.com" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Contact Person</label>
                              <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. John Smith" />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Contact Person Phone</label>
                              <input type="text" value={formData.contactPersonPhone} onChange={e => setFormData({...formData, contactPersonPhone: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. 077 123 4567" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Location Information */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button 
                    type="button" 
                    onClick={() => toggleSection('location')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Location Information
                    </span>
                    {openSections.location ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {openSections.location && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                      >
                        <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Address</label>
                            <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none resize-none" rows={2} placeholder="Street address" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Province</label>
                              <SearchableSelect 
                                value={formData.province} 
                                onChange={v => setFormData({...formData, province: v, city: ''})} 
                                options={PROVINCES} 
                                placeholder="Select Province" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                              <SearchableSelect 
                                value={formData.city} 
                                onChange={v => setFormData({...formData, city: v})} 
                                options={formData.province ? CITIES_BY_PROVINCE[formData.province] || [] : Object.values(CITIES_BY_PROVINCE).flat()} 
                                placeholder="Select City" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Country</label>
                            <input readOnly type="text" value={formData.country} className="w-full px-4 h-11 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-sm text-slate-500 outline-none cursor-not-allowed" placeholder="e.g. Sri Lanka" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Financial Settings */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button 
                    type="button" 
                    onClick={() => toggleSection('financial')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <Banknote className="w-4 h-4 text-blue-600" />
                      Financial Settings
                    </span>
                    {openSections.financial ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {openSections.financial && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                      >
                        <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Opening Balance</label>
                              <input type="number" value={formData.openingBalance} onChange={e => setFormData({...formData, openingBalance: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="Default 0.00" />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Credit Limit</label>
                              <input type="number" value={formData.creditLimit} onChange={e => setFormData({...formData, creditLimit: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="0.00" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Payment Terms</label>
                            <CustomSelect 
                              value={formData.paymentTerms} 
                              onChange={v => setFormData({...formData, paymentTerms: v})} 
                              options={[
                                { value: 'CASH', label: 'Cash (Immediate)' },
                                { value: '7_DAYS', label: '7 Days' },
                                { value: '15_DAYS', label: '15 Days' },
                                { value: '30_DAYS', label: '30 Days' },
                                { value: '60_DAYS', label: '60 Days' },
                                { value: 'AFTER_SELL', label: 'After Sell' }
                              ]} 
                              label="Select Terms" 
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. Bank & Settlement Details */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button 
                    type="button" 
                    onClick={() => toggleSection('bank')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Bank & Settlement Details
                    </span>
                    {openSections.bank ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {openSections.bank && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                      >
                        <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Bank Name</label>
                            <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. Commercial Bank" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Account Name</label>
                              <input type="text" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. John Smith" />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Account Number</label>
                              <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. 1234567890" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Branch</label>
                            <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none" placeholder="e.g. Colombo 03" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 5. Internal Notes & Status */}
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button 
                    type="button" 
                    onClick={() => toggleSection('notes')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4 text-blue-600" />
                      Internal Notes & Status
                    </span>
                    {openSections.notes ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {openSections.notes && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                      >
                        <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Notes / Remarks</label>
                            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none resize-none" rows={3} placeholder="Any additional details..." />
                          </div>
                          <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div>
                              <span className="block text-sm font-bold text-slate-900 dark:text-white">Active Supplier</span>
                              <span className="block text-xs font-medium text-slate-500 mt-0.5">Toggle whether this supplier is currently active.</span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${formData.active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.active ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                            <input type="checkbox" className="hidden" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

      </form>
    </Panel>
  );
}
