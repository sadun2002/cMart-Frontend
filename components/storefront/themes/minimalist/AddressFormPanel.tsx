"use client";

import { X, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

export interface AddressData {
  id: number;
  type: string;
  name: string;
  street: string;
  city: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface AddressFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAddress: (address: AddressData) => void;
  initialName?: string;
  isFirstAddress?: boolean;
}

export function AddressFormPanel({ isOpen, onClose, onAddAddress, initialName = "", isFirstAddress = false }: AddressFormPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "Home",
    name: initialName,
    street: "",
    city: "",
    country: "Western Province",
    phone: "",
    isDefault: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(false);
      setFormData(prev => ({
        ...prev,
        name: prev.name || initialName,
        isDefault: isFirstAddress ? true : prev.isDefault
      }));
    }
  }, [isOpen, initialName, isFirstAddress]);

  if (!isOpen) return null;

  const validate = () => {
    if (formData.name.trim().length < 3) return "Name must be at least 3 characters long.";
    if (formData.street.trim().length < 5) return "Street address is too short.";
    if (formData.city.trim().length < 2) return "Please enter a valid city.";
    if (!/^\+?[0-9]{9,15}$/.test(formData.phone.replace(/\s/g, ""))) return "Please enter a valid phone number (9-15 digits).";
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
    
    try {
      await onAddAddress({
        ...formData,
        id: Date.now()
      });
      onClose();
      setFormData({
        type: "Home",
        name: "",
        street: "",
        city: "",
        country: "Western Province",
        phone: "",
        isDefault: false
      });
    } catch (err) {
      setError("An error occurred while saving the address.");
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
            <MapPin className="w-5 h-5 mr-2" />
            Add New Address
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
          <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="address-type" className="block text-sm font-medium text-foreground">Address Type</label>
              <select
                id="address-type"
                required
                disabled={isLoading}
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground disabled:opacity-50"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                id="full-name"
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
              <label htmlFor="street" className="block text-sm font-medium text-foreground">Street Address</label>
              <input
                type="text"
                id="street"
                required
                disabled={isLoading}
                minLength={5}
                maxLength={100}
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-foreground">City</label>
                <input
                  type="text"
                  id="city"
                  required
                  disabled={isLoading}
                  minLength={2}
                  maxLength={50}
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-foreground">Province</label>
                <select
                  id="province"
                  required
                  disabled={isLoading}
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground disabled:opacity-50"
                >
                  <option value="Western Province">Western Province</option>
                  <option value="Central Province">Central Province</option>
                  <option value="Southern Province">Southern Province</option>
                  <option value="Northern Province">Northern Province</option>
                  <option value="Eastern Province">Eastern Province</option>
                  <option value="North Western Province">North Western Province</option>
                  <option value="North Central Province">North Central Province</option>
                  <option value="Uva Province">Uva Province</option>
                  <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">Phone Number</label>
              <input
                type="text"
                id="phone"
                required
                disabled={isLoading}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground disabled:opacity-50"
              />
            </div>

            {!isFirstAddress && (
              <div className="pt-2 flex items-center">
                <input
                  id="is-default"
                  type="checkbox"
                  disabled={isLoading}
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary disabled:opacity-50"
                />
                <label htmlFor="is-default" className="ml-2 block text-sm text-foreground">
                  Set as default address
                </label>
              </div>
            )}
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
            form="address-form"
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
              "Save Address"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
