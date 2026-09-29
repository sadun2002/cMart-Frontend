'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, ShieldCheck, Lock, CheckCircle2, AlertCircle, Plus, 
  Trash2, Star, Calendar, User, Hash, Globe, RefreshCw, Zap,
  Check, ChevronDown, ChevronUp, Sparkles, Building2, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { MainRightPanel } from '@/components/ui/right-panel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { formatLKR } from '@/lib/constants';

export interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'paypal';
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4?: string;
  cardholderName?: string;
  expiry?: string;
  isDefault: boolean;
  addedAt: string;
  email?: string;
  postalCode?: string;
  country?: string;
}

const STORAGE_KEY = 'cmart_saved_payment_methods';

const INITIAL_DEFAULT_PAYMENT_METHODS: SavedPaymentMethod[] = [
  {
    id: 'pm_default_visa',
    type: 'card',
    cardBrand: 'visa',
    last4: '4242',
    cardholderName: 'Store Owner',
    expiry: '12/28',
    isDefault: true,
    addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    country: 'Sri Lanka',
    postalCode: '00100'
  }
];

interface UpdatePaymentMethodPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (savedMethod: SavedPaymentMethod) => void;
  currentPlanName?: string;
  renewalAmountLKR?: number;
  renewalDate?: string;
  billingCycle?: 'monthly' | 'yearly' | 'lifetime';
}

export function UpdatePaymentMethodPanel({
  isOpen,
  onClose,
  onSuccess,
  currentPlanName = 'Pro',
  renewalAmountLKR = 3900,
  renewalDate,
  billingCycle = 'monthly'
}: UpdatePaymentMethodPanelProps) {
  // Saved methods list
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [activeTab, setActiveTab] = useState<'card' | 'express'>('card');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Card Form Fields
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [setAsDefault, setSetAsDefault] = useState(true);

  // Accordion Section States
  const [openSections, setOpenSections] = useState({
    savedMethods: true,
    addMethod: true,
    autoRenewInfo: false,
    security: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Dialog State
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    methodId: string | null;
  }>({
    isOpen: false,
    methodId: null
  });

  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPaymentMethods(parsed);
          return;
        }
      }
      // Initialize with default
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_PAYMENT_METHODS));
      setPaymentMethods(INITIAL_DEFAULT_PAYMENT_METHODS);
    } catch (e) {
      setPaymentMethods(INITIAL_DEFAULT_PAYMENT_METHODS);
    }
  }, [isOpen]);

  // Persist methods
  const persistMethods = (methods: SavedPaymentMethod[]) => {
    setPaymentMethods(methods);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
      // Notify other components (like Subscription page)
      window.dispatchEvent(new Event('cmart_payment_methods_updated'));
    } catch (e) {
      console.error('Failed to save payment methods', e);
    }
  };

  // Reset form inputs
  const resetForm = () => {
    setCardholderName('');
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setPostalCode('');
    setCountry('Sri Lanka');
    setSetAsDefault(true);
    setValidationError(null);
  };

  // Detect Card Brand from number
  const detectedCardBrand = useMemo<'visa' | 'mastercard' | 'amex' | 'discover' | null>(() => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    if (/^(6011|65|64[4-9])/.test(clean)) return 'discover';
    return null;
  }, [cardNumber]);

  // Format Card Number (grouped in 4 digits)
  const handleCardNumberChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    setCardNumber(groups ? groups.join(' ') : digits);
    if (validationError?.field === 'field-card-number') setValidationError(null);
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (raw: string) => {
    let clean = raw.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 1) {
      const firstDigit = parseInt(clean[0]);
      if (firstDigit > 1) {
        clean = `0${firstDigit}`;
      }
    }
    if (clean.length >= 2) {
      const month = parseInt(clean.substring(0, 2));
      if (month < 1 || month > 12) {
        clean = clean.substring(0, 1);
      } else if (clean.length > 2) {
        clean = `${clean.substring(0, 2)}/${clean.substring(2, 4)}`;
      }
    }
    setExpiry(clean);
    if (validationError?.field === 'field-card-expiry') setValidationError(null);
  };

  // Format CVC
  const handleCvcChange = (raw: string) => {
    const maxLen = detectedCardBrand === 'amex' ? 4 : 3;
    const clean = raw.replace(/\D/g, '').slice(0, maxLen);
    setCvc(clean);
    if (validationError?.field === 'field-card-cvc') setValidationError(null);
  };

  // Form Validation
  const validateForm = (): boolean => {
    if (!cardholderName.trim()) {
      setValidationError({ field: 'field-card-name', message: 'Cardholder name is required' });
      document.getElementById('field-card-name')?.focus();
      return false;
    }
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15 || cleanCard.length > 16) {
      setValidationError({ field: 'field-card-number', message: 'Enter a valid 15 or 16-digit card number' });
      document.getElementById('field-card-number')?.focus();
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setValidationError({ field: 'field-card-expiry', message: 'Valid MM/YY expiry date is required' });
      document.getElementById('field-card-expiry')?.focus();
      return false;
    }
    // Check if expiry is in past
    const [expMonth, expYear] = expiry.split('/').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setValidationError({ field: 'field-card-expiry', message: 'This card has already expired' });
      document.getElementById('field-card-expiry')?.focus();
      return false;
    }

    const minCvcLen = detectedCardBrand === 'amex' ? 4 : 3;
    if (cvc.length < minCvcLen) {
      setValidationError({ field: 'field-card-cvc', message: `Enter a valid ${minCvcLen}-digit CVC code` });
      document.getElementById('field-card-cvc')?.focus();
      return false;
    }

    setValidationError(null);
    return true;
  };

  // Save Card Handler
  const handleSaveCard = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate bank-level tokenization & verification
      await new Promise(resolve => setTimeout(resolve, 1200));

      const cleanCard = cardNumber.replace(/\s+/g, '');
      const last4 = cleanCard.slice(-4);
      const newMethod: SavedPaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        cardBrand: detectedCardBrand || 'visa',
        last4,
        cardholderName: cardholderName.trim(),
        expiry,
        isDefault: setAsDefault || paymentMethods.length === 0,
        addedAt: new Date().toISOString(),
        country,
        postalCode: postalCode.trim()
      };

      let updatedMethods = [...paymentMethods];
      if (newMethod.isDefault) {
        updatedMethods = updatedMethods.map(m => ({ ...m, isDefault: false }));
      }
      updatedMethods.unshift(newMethod);

      persistMethods(updatedMethods);
      resetForm();
      setShowAddForm(false);
      toast.success('Payment method updated successfully! Auto-renewal is active.');
      if (onSuccess) onSuccess(newMethod);
      onClose();
    } catch (error) {
      toast.error('Failed to update payment method. Please check card details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Link Express Wallet (Apple Pay / Google Pay / PayPal)
  const handleConnectExpressWallet = async (type: 'apple_pay' | 'google_pay' | 'paypal') => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const label = type === 'apple_pay' ? 'Apple Pay' : type === 'google_pay' ? 'Google Pay' : 'PayPal';
      const email = type === 'paypal' ? 'business@paypal.com' : `${type}@wallet.account`;

      const newMethod: SavedPaymentMethod = {
        id: `pm_express_${Date.now()}`,
        type,
        isDefault: true,
        email,
        cardholderName: label,
        addedAt: new Date().toISOString()
      };

      const updated = paymentMethods.map(m => ({ ...m, isDefault: false }));
      updated.unshift(newMethod);
      persistMethods(updated);

      toast.success(`${label} connected as default auto-renewal method!`);
      if (onSuccess) onSuccess(newMethod);
      onClose();
    } catch (e) {
      toast.error('Failed to link express wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set Default Method
  const handleSetDefault = (id: string) => {
    const updated = paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === id
    }));
    persistMethods(updated);
    toast.success('Default auto-renewal payment method updated');
  };

  // Delete Method
  const handleDeleteMethod = () => {
    if (!deleteConfirmDialog.methodId) return;
    const target = paymentMethods.find(m => m.id === deleteConfirmDialog.methodId);
    let updated = paymentMethods.filter(m => m.id !== deleteConfirmDialog.methodId);
    
    // If deleted method was default and others exist, make the first one default
    if (target?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }

    persistMethods(updated);
    toast.success('Payment method removed');
    setDeleteConfirmDialog({ isOpen: false, methodId: null });
  };

  const defaultMethod = paymentMethods.find(m => m.isDefault) || paymentMethods[0];
  const hasUnsavedChanges = Boolean(cardNumber || cardholderName || expiry || cvc);

  return (
    <>
      <MainRightPanel
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Payment Method"
        subtitle="Manage recurring subscription billing & card details"
        icon={CreditCard}
        formId={showAddForm ? "paymentMethodForm" : undefined}
        onSave={showAddForm ? handleSaveCard : undefined}
        isSubmitting={isSubmitting}
        saveText={showAddForm ? "Save Payment Method" : undefined}
        hideFooter={!showAddForm}
        requireConfirmOnClose={hasUnsavedChanges}
        className="max-w-lg"
      >
        <div className="space-y-6 font-sans pb-8">

          {/* ──────────────── 1. ACTIVE AUTO-BILLING STATUS CARD ──────────────── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-5 text-white shadow-xl shadow-blue-600/20">
            {/* Subtle background glow */}
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-Renewal Enabled
                </span>
                <span className="text-xs font-bold text-blue-100 bg-white/10 px-2 py-0.5 rounded-md">
                  {currentPlanName.toUpperCase()} PLAN
                </span>
              </div>

              <div>
                <p className="text-xs text-blue-100 font-medium">Automatic Recurring Charge</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black tracking-tight">{formatLKR(renewalAmountLKR)}</span>
                  <span className="text-xs text-blue-200 font-medium">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-blue-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-200" />
                  Next renewal: <strong className="text-white font-bold">{renewalDate || 'Upcoming Cycle'}</strong>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Direct Debit
                </span>
              </div>
            </div>
          </div>


          {/* ──────────────── 2. SAVED PAYMENT METHODS ──────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Connected Payment Methods ({paymentMethods.length})
                </h3>
              </div>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Card
                </button>
              )}
            </div>

            <div className="p-4 space-y-3">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  No payment methods attached yet. Add a card to ensure uninterrupted access.
                </div>
              ) : (
                paymentMethods.map(method => (
                  <div 
                    key={method.id}
                    className={`relative p-3.5 rounded-xl border transition-all ${
                      method.isDefault 
                        ? 'border-blue-500/70 bg-blue-50/40 dark:bg-blue-500/5 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Brand Icon Badge */}
                        <div className="w-12 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                          {method.type === 'card' ? (
                            method.cardBrand === 'visa' ? (
                              <span className="text-xs font-black text-blue-700 italic tracking-wider">VISA</span>
                            ) : method.cardBrand === 'mastercard' ? (
                              <div className="flex -space-x-1.5 items-center">
                                <div className="w-4 h-4 rounded-full bg-red-500 opacity-90" />
                                <div className="w-4 h-4 rounded-full bg-amber-400 opacity-90" />
                              </div>
                            ) : method.cardBrand === 'amex' ? (
                              <span className="text-[10px] font-black text-cyan-600 tracking-tighter">AMEX</span>
                            ) : (
                              <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            )
                          ) : method.type === 'apple_pay' ? (
                            <span className="text-xs font-black text-black dark:text-white">Pay</span>
                          ) : method.type === 'google_pay' ? (
                            <span className="text-xs font-bold text-blue-500">GPay</span>
                          ) : (
                            <span className="text-xs font-bold text-indigo-500">PayPal</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {method.type === 'card' ? `•••• •••• •••• ${method.last4}` : method.cardholderName}
                            </span>
                            {method.isDefault && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                                <Check className="w-3 h-3" /> Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {method.type === 'card' 
                              ? `Expires ${method.expiry} • ${method.cardholderName}` 
                              : `Authorized for recurring renewal • ${method.email || ''}`}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!method.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(method.id)}
                            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all cursor-pointer"
                            title="Set as Default for Auto-Renewal"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmDialog({ isOpen: true, methodId: method.id })}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Remove Payment Method"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>


          {/* ──────────────── 3. ADD / UPDATE PAYMENT FORM ──────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/40 transition-colors outline-none cursor-pointer"
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {showAddForm ? 'Hide Add Card Form' : 'Add New Card or Express Payment'}
              </span>
              {showAddForm ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <div className="p-5 space-y-5">
                    {/* Method Selector Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setActiveTab('card')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          activeTab === 'card'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Credit / Debit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('express')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          activeTab === 'express'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Express Wallets (Apple / Google / PayPal)
                      </button>
                    </div>

                    {activeTab === 'card' ? (
                      <form id="paymentMethodForm" onSubmit={handleSaveCard} className="space-y-4">
                        {/* Name on Card */}
                        <div className="space-y-1.5 relative">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Cardholder Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id="field-card-name"
                              type="text"
                              value={cardholderName}
                              onChange={e => {
                                setCardholderName(e.target.value);
                                if (validationError?.field === 'field-card-name') setValidationError(null);
                              }}
                              placeholder="Name as printed on card"
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-900 dark:text-white"
                            />
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          </div>
                          <ValidationErrorTooltip error={validationError} fieldId="field-card-name" />
                        </div>

                        {/* Card Number */}
                        <div className="space-y-1.5 relative">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Card Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id="field-card-number"
                              type="text"
                              value={cardNumber}
                              onChange={e => handleCardNumberChange(e.target.value)}
                              placeholder="0000 0000 0000 0000"
                              maxLength={19}
                              className="w-full pl-10 pr-20 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-sm text-slate-900 dark:text-white tracking-wider"
                            />
                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            {/* Live Detected Brand */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                              {detectedCardBrand === 'visa' && (
                                <span className="text-[11px] font-black text-blue-600 italic tracking-wider bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">VISA</span>
                              )}
                              {detectedCardBrand === 'mastercard' && (
                                <span className="text-[11px] font-black text-amber-600 tracking-wider bg-amber-50 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">MASTERCARD</span>
                              )}
                              {detectedCardBrand === 'amex' && (
                                <span className="text-[11px] font-black text-cyan-600 tracking-wider bg-cyan-50 dark:bg-cyan-900/40 px-1.5 py-0.5 rounded">AMEX</span>
                              )}
                              {detectedCardBrand === 'discover' && (
                                <span className="text-[11px] font-black text-orange-600 tracking-wider bg-orange-50 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">DISCOVER</span>
                              )}
                              {!detectedCardBrand && (
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">Debit / Credit</span>
                              )}
                            </div>
                          </div>
                          <ValidationErrorTooltip error={validationError} fieldId="field-card-number" />
                        </div>

                        {/* Expiry & CVC Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Expiry */}
                          <div className="space-y-1.5 relative">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Expires (MM/YY) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                id="field-card-expiry"
                                type="text"
                                value={expiry}
                                onChange={e => handleExpiryChange(e.target.value)}
                                placeholder="MM/YY"
                                maxLength={5}
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-sm text-slate-900 dark:text-white"
                              />
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            <ValidationErrorTooltip error={validationError} fieldId="field-card-expiry" />
                          </div>

                          {/* CVC */}
                          <div className="space-y-1.5 relative">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span>Security Code <span className="text-red-500">*</span></span>
                              <span className="text-[10px] text-slate-400 font-normal">CVV/CVC</span>
                            </label>
                            <div className="relative">
                              <input
                                id="field-card-cvc"
                                type="password"
                                value={cvc}
                                onChange={e => handleCvcChange(e.target.value)}
                                placeholder="•••"
                                maxLength={4}
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-sm text-slate-900 dark:text-white"
                              />
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            <ValidationErrorTooltip error={validationError} fieldId="field-card-cvc" />
                          </div>
                        </div>

                        {/* Country & Postal Code */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Billing Country
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-900 dark:text-white"
                              />
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Postal Code
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={postalCode}
                                onChange={e => setPostalCode(e.target.value)}
                                placeholder="e.g. 00100"
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-900 dark:text-white"
                              />
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>
                        </div>

                        {/* Set as Default Toggle */}
                        <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={setAsDefault}
                            onChange={e => setSetAsDefault(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Use as default payment method for recurring renewals
                          </span>
                        </label>
                      </form>
                    ) : (
                      /* Express Wallets */
                      <div className="space-y-3 py-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Authorize one-touch recurring billing via your preferred digital wallet:
                        </p>

                        {/* Google Pay */}
                        <button
                          type="button"
                          onClick={() => handleConnectExpressWallet('google_pay')}
                          disabled={isSubmitting}
                          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-sm text-slate-800 dark:text-white cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          <span className="font-extrabold text-blue-500">G</span>
                          <span className="font-extrabold text-red-500">o</span>
                          <span className="font-extrabold text-amber-500">o</span>
                          <span className="font-extrabold text-blue-500">g</span>
                          <span className="font-extrabold text-emerald-500">l</span>
                          <span className="font-extrabold text-red-500">e</span>
                          <span className="font-black ml-1 text-slate-700 dark:text-slate-200">Pay</span>
                        </button>

                        {/* Apple Pay */}
                        <button
                          type="button"
                          onClick={() => handleConnectExpressWallet('apple_pay')}
                          disabled={isSubmitting}
                          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-black text-white hover:bg-slate-900 transition-all font-bold text-sm cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          <span className="text-base"></span>
                          <span>Pay with Apple Pay</span>
                        </button>

                        {/* PayPal */}
                        <button
                          type="button"
                          onClick={() => handleConnectExpressWallet('paypal')}
                          disabled={isSubmitting}
                          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#FFC439] hover:bg-[#F4BB33] transition-all font-extrabold text-sm text-blue-950 cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          <span>PayPal Auto-Billing</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          {/* ──────────────── 4. HOW RECURRING BILLING WORKS ──────────────── */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                How Recurring Renewal Works
              </h4>
            </div>

            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Hassle-Free Renewals:</strong> Your linked card is charged automatically on every billing cycle so your store and POS terminals never encounter downtime.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Automated Invoices:</strong> Official VAT/Tax invoices with payment confirmations will be generated and saved directly to your <em>Billing History</em>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Cancel or Swap Anytime:</strong> You can switch plans, replace your card, or cancel recurring renewals at any time from this dashboard.
                </span>
              </li>
            </ul>
          </div>


          {/* ──────────────── 5. SECURITY & COMPLIANCE ──────────────── */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Bank-Grade 256-Bit SSL</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">PCI-DSS Level 1 Compliant Encrypted Vault</p>
              </div>
            </div>
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

        </div>
      </MainRightPanel>

      {/* Confirmation Dialog for Deleting Method */}
      <ConfirmDialog
        isOpen={deleteConfirmDialog.isOpen}
        title="Remove Payment Method?"
        message="Are you sure you want to remove this payment method? If it is your default card, automatic renewals may fail on your next cycle."
        confirmText="Remove Method"
        cancelText="Keep"
        type="danger"
        onConfirm={handleDeleteMethod}
        onCancel={() => setDeleteConfirmDialog({ isOpen: false, methodId: null })}
      />
    </>
  );
}
