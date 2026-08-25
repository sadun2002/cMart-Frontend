"use client";

import { X, CreditCard } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export interface CardData {
  id: number;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface CardFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: CardData) => void;
}

export function CardFormPanel({ isOpen, onClose, onAddCard }: CardFormPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
    isDefault: false
  });

  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setFormData({...formData, number: val});

    if (val.length === 19) {
      expiryRef.current?.focus();
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setFormData({...formData, expiry: val});

    if (val.length === 5) {
      cvcRef.current?.focus();
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 4);
    setFormData({...formData, cvc: val});
  };

  const validate = () => {
    if (formData.name.trim().length < 3) return "Name on card must be at least 3 characters long.";
    const rawNumber = formData.number.replace(/\s/g, '');
    if (rawNumber.length < 13 || rawNumber.length > 19) return "Please enter a valid card number.";
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.expiry)) return "Please enter a valid expiry date (MM/YY).";
    if (formData.cvc.length < 3) return "Please enter a valid CVC.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);
    
    const rawNumber = formData.number.replace(/\s/g, '');
    const firstDigit = rawNumber.charAt(0);
    const brand = firstDigit === '4' ? 'Visa' : firstDigit === '5' ? 'Mastercard' : 'Card';
    const last4 = rawNumber.slice(-4).padStart(4, '0');

    try {
      await onAddCard({
        id: Date.now(),
        brand,
        last4,
        expiry: formData.expiry,
        isDefault: formData.isDefault
      });
      
      onClose();
      setFormData({
        name: "",
        number: "",
        expiry: "",
        cvc: "",
        isDefault: false
      });
    } catch (err) {
      setError("An error occurred while saving the card.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity animate-in fade-in" 
        onClick={() => !isLoading && onClose()}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-1/3 min-w-[320px] max-w-md bg-background shadow-xl flex flex-col animate-in slide-in-from-right duration-300 ease-in-out">
        <div className="px-4 py-6 sm:px-6 flex items-center justify-between border-b border-border">
          <h2 className="text-lg font-medium text-foreground flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Add New Card
          </h2>
          <button
            type="button"
            disabled={isLoading}
            className="-m-2 p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            onClick={onClose}
          >
            <span className="sr-only">Close panel</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form id="card-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="card-name" className="block text-sm font-medium text-foreground">Name on Card</label>
              <input
                type="text"
                id="card-name"
                required
                disabled={isLoading}
                minLength={3}
                maxLength={50}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-foreground">Card Number</label>
              <input
                type="text"
                id="card-number"
                placeholder="0000 0000 0000 0000"
                required
                disabled={isLoading}
                maxLength={19}
                pattern="[\d ]{15,19}"
                title="13 to 16 digit card number"
                value={formData.number}
                onChange={handleNumberChange}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="card-expiry" className="block text-sm font-medium text-foreground">Expiry (MM/YY)</label>
                <input
                  type="text"
                  id="card-expiry"
                  ref={expiryRef}
                  placeholder="MM/YY"
                  required
                  disabled={isLoading}
                  maxLength={5}
                  pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                  title="MM/YY format"
                  value={formData.expiry}
                  onChange={handleExpiryChange}
                  className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="card-cvc" className="block text-sm font-medium text-foreground">CVC</label>
                <input
                  type="text"
                  id="card-cvc"
                  ref={cvcRef}
                  placeholder="123"
                  required
                  disabled={isLoading}
                  maxLength={4}
                  pattern="\d{3,4}"
                  title="3 or 4 digit CVC"
                  value={formData.cvc}
                  onChange={handleCvcChange}
                  className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center">
              <input
                id="card-is-default"
                type="checkbox"
                disabled={isLoading}
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary disabled:opacity-50"
              />
              <label htmlFor="card-is-default" className="ml-2 block text-sm text-foreground">
                Set as default payment method
              </label>
            </div>
          </form>
        </div>

        <div className="border-t border-border px-4 py-4 sm:px-6 bg-muted flex justify-end space-x-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 border border-input shadow-sm text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="card-form"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer disabled:opacity-50 min-w-[120px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Card"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
