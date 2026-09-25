import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Plus, Building2, Check, Circle, Users, SearchX } from 'lucide-react';
import { SecondaryRightPanel } from '@/components/ui/right-panel';
import { AddSupplierPanel } from '@/components/shared/AddSupplierPanel';
import { storeOwnerAPI } from '@/lib/api';

export const FALLBACK_SUPPLIERS = [
  { id: '1', name: 'Anchor Ceylon Ltd' },
  { id: '2', name: 'Nestle Lanka PLC' },
  { id: '3', name: 'Unilever Sri Lanka' },
  { id: '4', name: 'Cargills Ceylon' },
  { id: '5', name: 'Maliban Biscuit Manufactories' },
  { id: '6', name: 'Ceylon Cold Stores (Elephant House)' },
];

interface SelectSupplierPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (supplierId: string) => void;
  selectedSupplierId?: string | null;
  suppliers?: any[];
  setSuppliers?: React.Dispatch<React.SetStateAction<any[]>>;
  title?: string;
  subtitle?: string;
}

export function SelectSupplierPanel({
  isOpen,
  onClose,
  onSelect,
  selectedSupplierId,
  suppliers = [],
  setSuppliers,
  title = "Select Supplier",
  subtitle = "Choose a supplier"
}: SelectSupplierPanelProps) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      if (setSuppliers) {
        storeOwnerAPI.getSuppliers()
          .then((res: any) => {
            const list = res.data || res;
            if (Array.isArray(list) && list.length > 0) {
              setSuppliers(list);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, setSuppliers]);

  const filteredSuppliers = useMemo(() => {
    const list = Array.isArray(suppliers) ? suppliers : [];
    return list.filter(s => {
      const q = search.toLowerCase();
      return s.name?.toLowerCase().includes(q) || 
             (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
             (s.phone && s.phone.includes(q));
    });
  }, [suppliers, search]);

  return (
    <>
      <SecondaryRightPanel
        isOpen={isOpen && !isAddOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        icon={Users}
        hideFooter={true}
      >
        <div className="space-y-4 pb-12">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search by supplier name, contact or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* List Body */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 px-5 h-12 rounded-xl font-bold transition-all cursor-pointer border border-blue-200 dark:border-blue-500/30"
            >
              <Plus className="w-5 h-5" /> Add New Supplier
            </button>
            
            <hr className="w-full border-slate-200 dark:border-slate-700 border-t-2" />

            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((s: any) => {
                const isSelected = String(selectedSupplierId) === String(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (isSelected) {
                        onSelect(''); // Clear selection
                        onClose(); // Close panel since action is done
                      } else {
                        onSelect(String(s.id));
                        onClose(); // Close panel on select
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500/60 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                        {s.logo || s.image ? (
                          <img src={s.logo || s.image} alt={s.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 pr-2">
                        <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>{s.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{s.contactPerson || s.phone || 'Registered Supplier'}</p>
                      </div>
                    </div>
                    
                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <SearchX className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No suppliers found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
              </div>
            )}
          </div>
        </div>
      </SecondaryRightPanel>

      <AddSupplierPanel
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(newSupplier: any) => {
          setIsAddOpen(false);
          if (newSupplier) {
            if (setSuppliers) {
              setSuppliers(prev => {
                const exists = prev.find(s => s.id === newSupplier.id);
                if (exists) return prev.map(s => s.id === newSupplier.id ? { ...s, ...newSupplier } : s);
                return [newSupplier, ...prev];
              });
            }
            onSelect(String(newSupplier.id));
            onClose();
          }
        }}
      />
    </>
  );
}
