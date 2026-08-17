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
}

export function AddressFormPanel({ isOpen, onClose, onAddAddress }: AddressFormPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    type: "Home",
    name: "",
    street: "",
    city: "",
    country: "Western Province",
    phone: "",
    isDefault: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAddress({
      ...formData,
      id: Date.now()
    });
    onClose();
    // Reset form
    setFormData({
      type: "Home",
      name: "",
      street: "",
      city: "",
      country: "Western Province",
      phone: "",
      isDefault: false
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity animate-in fade-in" 
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-1/3 min-w-[320px] max-w-md bg-background shadow-xl flex flex-col animate-in slide-in-from-right duration-300 ease-in-out">
        <div className="px-4 py-6 sm:px-6 flex items-center justify-between border-b border-border">
          <h2 className="text-lg font-medium text-foreground flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Add New Address
          </h2>
          <button
            type="button"
            className="-m-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClose}
          >
            <span className="sr-only">Close panel</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="address-type" className="block text-sm font-medium text-foreground">Address Type</label>
              <select
                id="address-type"
                required
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground"
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
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground"
              />
            </div>

            <div>
              <label htmlFor="street" className="block text-sm font-medium text-foreground">Street Address</label>
              <input
                type="text"
                id="street"
                required
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-foreground">City</label>
                <input
                  type="text"
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground"
                />
              </div>
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-foreground">Province</label>
                <select
                  id="province"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground"
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
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1 block w-full border-input rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border bg-background text-foreground"
              />
            </div>

            <div className="pt-2 flex items-center">
              <input
                id="is-default"
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="is-default" className="ml-2 block text-sm text-foreground">
                Set as default address
              </label>
            </div>
          </form>
        </div>

        <div className="border-t border-border px-4 py-4 sm:px-6 bg-muted flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-input shadow-sm text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="address-form"
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
          >
            Save Address
          </button>
        </div>
      </div>
    </>
  );
}
