'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, ShieldCheck, Lock, CheckCircle2, AlertCircle, Plus, 
  Trash2, Star, Calendar, User, Hash, RefreshCw, Zap,
  Check, ChevronDown, ChevronUp, Sparkles, HelpCircle
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
    addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
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
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [autoRenewEnabled, setAutoRenewEnabled] = useState(true);

  // Load auto-renew setting
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('cmart_auto_renew_enabled');
      if (stored !== null) {
        setAutoRenewEnabled(stored === 'true');
      }
    } catch (e) {}
  }, [isOpen]);

  const handleToggleAutoRenew = (enabled: boolean) => {
    setAutoRenewEnabled(enabled);
    try {
      localStorage.setItem('cmart_auto_renew_enabled', String(enabled));
      window.dispatchEvent(new Event('cmart_payment_methods_updated'));
    } catch (e) {}
    if (enabled) {
      toast.success('Automatic renewal enabled');
    } else {
      toast.warning('Automatic renewal paused. Card will only be used for manual renewal.');
    }
  };

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

  // Format Card Number (auto-space every 4 digits, matching checkout page)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').slice(0, 16);
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format Expiry MM/YY with Month Validation (matching checkout page)
  const formatExpiry = (value: string) => {
    let v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').slice(0, 4);
    
    if (v.length >= 1) {
      const firstDigit = parseInt(v[0]);
      if (firstDigit > 1) {
        v = `0${firstDigit}`;
      }
    }
    
    if (v.length >= 2) {
      const month = parseInt(v.substring(0, 2));
      if (month < 1 || month > 12) {
        v = v.substring(0, 1);
      } else {
        v = v.substring(0, 2) + '/' + v.substring(2, 4);
      }
    }
    return v;
  };

  // Handle Card Number Input with auto-focus to Expiry
  const handleCardNumberChange = (raw: string) => {
    const formatted = formatCardNumber(raw);
    setCardNumber(formatted);
    if (validationError?.field === 'card-input') setValidationError(null);
    
    const cleanDigits = raw.replace(/\D/g, '');
    if (cleanDigits.length >= 16 || formatted.length === 19) {
      document.getElementById('expiry-input')?.focus();
    }
  };

  // Handle Expiry Input with auto-focus to CVC
  const handleExpiryChange = (raw: string) => {
    const formatted = formatExpiry(raw);
    setExpiry(formatted);
    if (validationError?.field === 'expiry-input') setValidationError(null);
    
    const cleanDigits = raw.replace(/\D/g, '');
    if (cleanDigits.length >= 4 || formatted.length === 5) {
      document.getElementById('cvc-input')?.focus();
    }
  };

  // Format CVC
  const handleCvcChange = (raw: string) => {
    const maxLen = detectedCardBrand === 'amex' ? 4 : 3;
    const clean = raw.replace(/\D/g, '').slice(0, maxLen);
    setCvc(clean);
    if (validationError?.field === 'cvc-input') setValidationError(null);
  };

  // Form Validation
  const validateForm = (): boolean => {
    if (!cardholderName.trim()) {
      setValidationError({ field: 'card-name-input', message: 'Cardholder name is required' });
      document.getElementById('card-name-input')?.focus();
      return false;
    }
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15 || cleanCard.length > 16) {
      setValidationError({ field: 'card-input', message: 'Enter a valid 15 or 16-digit card number' });
      document.getElementById('card-input')?.focus();
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setValidationError({ field: 'expiry-input', message: 'Valid MM/YY expiry date is required' });
      document.getElementById('expiry-input')?.focus();
      return false;
    }
    // Check if expiry is in past
    const [expMonth, expYear] = expiry.split('/').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setValidationError({ field: 'expiry-input', message: 'This card has already expired' });
      document.getElementById('expiry-input')?.focus();
      return false;
    }

    const minCvcLen = detectedCardBrand === 'amex' ? 4 : 3;
    if (cvc.length < minCvcLen) {
      setValidationError({ field: 'cvc-input', message: `Enter a valid ${minCvcLen}-digit CVC code` });
      document.getElementById('cvc-input')?.focus();
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
        addedAt: new Date().toISOString()
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

  // Handle Express Wallet click (Currently Inactive / Coming Soon)
  const handleExpressWalletUnavailable = (provider: 'Google' | 'Apple' | 'PayPal') => {
    toast.info(`${provider} integration is coming soon!`, {
      description: 'Digital wallet integrations are currently not enabled. Payment is only supported via Credit or Debit cards.',
      duration: 4500
    });
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
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                  autoRenewEnabled ? 'bg-white/20 text-white' : 'bg-amber-500/30 text-amber-100 border border-amber-400/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${autoRenewEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {autoRenewEnabled ? 'Auto-Renewal Enabled' : 'Auto-Renewal Paused'}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider">
                    {autoRenewEnabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleAutoRenew(!autoRenewEnabled)}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0 ${autoRenewEnabled ? 'bg-emerald-400' : 'bg-white/30'}`}
                    title={autoRenewEnabled ? 'Click to pause automatic renewal' : 'Click to enable automatic renewal'}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${autoRenewEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-blue-100 font-medium">
                  {autoRenewEnabled ? 'Automatic Recurring Charge' : 'Manual Renewal Mode'}
                </p>
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
                <span className={`flex items-center gap-1 text-[11px] font-bold ${autoRenewEnabled ? 'text-emerald-300' : 'text-amber-200'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" /> {autoRenewEnabled ? 'Direct Debit' : 'Manual Pay'}
                </span>
              </div>
            </div>
          </div>


          {/* ──────────────── 2. SAVED PAYMENT METHODS ──────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Connected Payment Methods ({paymentMethods.length})
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Add New Card Button: Positioned below Connected Payment Methods text, above cards */}
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-blue-400/80 dark:border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-100/70 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Card</span>
                </button>
              )}

              {paymentMethods.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  No payment methods attached yet. Add a card to ensure uninterrupted access.
                </div>
              ) : (
                paymentMethods.map(method => (
                  <div 
                    key={method.id}
                    className={`relative p-4 rounded-2xl border-2 transition-all shadow-xs ${
                      method.isDefault 
                        ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-950/20 shadow-blue-500/5'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 shadow-slate-100 dark:shadow-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
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
                            <svg className="w-4 h-4 fill-current text-black dark:text-white" viewBox="0 0 24 24">
                              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                            </svg>
                          ) : method.type === 'google_pay' ? (
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 fill-current text-[#003087]" viewBox="0 0 24 24">
                              <path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z" />
                            </svg>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {method.type === 'card' ? `•••• •••• •••• ${method.last4}` : method.cardholderName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {method.type === 'card' 
                              ? `Expires ${method.expiry}` 
                              : 'Authorized for recurring renewal'}
                          </p>
                        </div>
                      </div>

                      {/* Actions & Status Badge - Right Aligned Next to Trash */}
                      <div className="flex items-center gap-2 shrink-0">
                        {method.isDefault ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-600 text-white shadow-xs select-none">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Default
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(method.id)}
                            className="inline-flex items-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 dark:hover:border-blue-500 px-3 py-1.5 rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer"
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
                        Apple / Google / PayPal
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
                              id="card-name-input"
                              type="text"
                              value={cardholderName}
                              onChange={e => {
                                setCardholderName(e.target.value);
                                if (validationError?.field === 'card-name-input') setValidationError(null);
                              }}
                              placeholder="Name as printed on card"
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-900 dark:text-white"
                            />
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          </div>
                          <ValidationErrorTooltip error={validationError} fieldId="card-name-input" />
                        </div>

                        {/* Card Number */}
                        <div className="space-y-1.5 relative">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Card Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id="card-input"
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
                          <ValidationErrorTooltip error={validationError} fieldId="card-input" />
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
                                id="expiry-input"
                                type="text"
                                value={expiry}
                                onChange={e => handleExpiryChange(e.target.value)}
                                placeholder="MM/YY"
                                maxLength={5}
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-sm text-slate-900 dark:text-white"
                              />
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            <ValidationErrorTooltip error={validationError} fieldId="expiry-input" />
                          </div>

                          {/* CVC */}
                          <div className="space-y-1.5 relative">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span>Security Code <span className="text-red-500">*</span></span>
                              <span className="text-[10px] text-slate-400 font-normal">CVV/CVC</span>
                            </label>
                            <div className="relative">
                              <input
                                id="cvc-input"
                                type="password"
                                value={cvc}
                                onChange={e => handleCvcChange(e.target.value)}
                                placeholder="•••"
                                maxLength={4}
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-sm text-slate-900 dark:text-white"
                              />
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            <ValidationErrorTooltip error={validationError} fieldId="cvc-input" />
                          </div>
                        </div>

                        {/* ── TOGGLE 1: Use as Default Payment Method ── */}
                        <label className={`flex justify-between items-center cursor-pointer p-4 rounded-xl border-2 transition-all mt-2 shadow-xs ${
                          setAsDefault 
                            ? 'border-blue-500/70 bg-blue-50/50 dark:bg-blue-950/25 dark:border-blue-500/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/35'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/70 hover:border-blue-400/80 dark:hover:border-blue-500/70 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
                        }`}>
                          <div className="pr-3">
                            <span className="block text-xs font-bold text-slate-900 dark:text-white">Use as default payment method</span>
                            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                              Set this card as the primary payment method for transactions
                            </span>
                          </div>
                          <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${setAsDefault ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setAsDefault ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={setAsDefault} 
                            onChange={(e) => setSetAsDefault(e.target.checked)} 
                          />
                        </label>

                        {/* ── TOGGLE 2: Auto Renewal ── */}
                        <label className={`flex justify-between items-center cursor-pointer p-4 rounded-xl border-2 transition-all shadow-xs ${
                          autoRenewEnabled 
                            ? 'border-blue-500/70 bg-blue-50/50 dark:bg-blue-950/25 dark:border-blue-500/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/35'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/70 hover:border-blue-400/80 dark:hover:border-blue-500/70 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
                        }`}>
                          <div className="pr-3">
                            <span className="block text-xs font-bold text-slate-900 dark:text-white">Auto renewal</span>
                            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                              {autoRenewEnabled 
                                ? 'Automatically renew subscription on billing date' 
                                : 'Disabled — card saved for manual renewal payments only'}
                            </span>
                          </div>
                          <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${autoRenewEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${autoRenewEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={autoRenewEnabled} 
                            onChange={(e) => handleToggleAutoRenew(e.target.checked)} 
                          />
                        </label>
                      </form>
                    ) : (
                      /* Express Wallets */
                      <div className="space-y-3 py-2">
                        <div className="flex items-center justify-between pb-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Digital wallet payment options:
                          </p>
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Coming Soon
                          </span>
                        </div>

                        {/* Google Pay */}
                        <button
                          type="button"
                          onClick={() => handleExpressWalletUnavailable('Google')}
                          className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:border-slate-800 dark:hover:border-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/90 shadow-sm hover:shadow-md transition-all font-bold text-sm text-slate-800 dark:text-white cursor-pointer active:scale-[0.99]"
                        >
                          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span className="font-bold text-sm tracking-normal">Pay with Google</span>
                        </button>

                        {/* Apple Pay */}
                        <button
                          type="button"
                          onClick={() => handleExpressWalletUnavailable('Apple')}
                          className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl border-2 border-black dark:border-slate-700 bg-black text-white hover:bg-neutral-800 transition-all font-bold text-sm cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                          </svg>
                          <span className="font-bold text-sm tracking-normal">Pay with Apple</span>
                        </button>

                        {/* PayPal */}
                        <button
                          type="button"
                          onClick={() => handleExpressWalletUnavailable('PayPal')}
                          className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl border-2 border-[#FFC439] hover:border-[#F4BB33] bg-[#FFC439] hover:bg-[#F4BB33] transition-all font-bold text-sm text-[#003087] cursor-pointer shadow-xs active:scale-[0.99]"
                        >
                          <svg className="w-5 h-5 fill-current text-[#003087] shrink-0" viewBox="0 0 24 24">
                            <path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z" />
                          </svg>
                          <span className="font-bold text-sm tracking-normal">Pay with PayPal</span>
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
