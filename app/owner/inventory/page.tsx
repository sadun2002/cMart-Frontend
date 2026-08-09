'use client';

import { useState, useEffect } from 'react';
import { Package, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, SlidersHorizontal, Search, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBranchStore } from '@/lib/branch-store';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { getActiveBranch, branches, setActiveBranch, activeBranchId } = useBranchStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState<'in' | 'out' | 'transfer' | 'adjust' | null>(null);

  const activeBranch = getActiveBranch();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerAPI.getProducts();
      setProducts(res.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Branch Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage stock, pricing, and transfers per branch.</p>
        </div>
        
        {/* Branch Context Selector for Mobile or explicitly on page */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Viewing Branch:</span>
          <select 
            value={activeBranchId || ''}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6">
        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => setModalOpen('in')} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm">
            <ArrowDownToLine className="w-4 h-4" /> Stock In
          </Button>
          <Button onClick={() => setModalOpen('out')} className="gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm">
            <ArrowUpFromLine className="w-4 h-4" /> Stock Out
          </Button>
          <Button onClick={() => setModalOpen('transfer')} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
            <ArrowRightLeft className="w-4 h-4" /> Transfer Stock
          </Button>
          <Button onClick={() => setModalOpen('adjust')} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm">
            <SlidersHorizontal className="w-4 h-4" /> Stock Adjustment
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products in this branch..." 
            className="pl-11 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              <div className="grid grid-cols-[300px_120px_100px_120px_120px_120px_120px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Product</div>
                <div className="text-right">Available</div>
                <div className="text-right">Reserved</div>
                <div className="text-right">Reorder Lvl</div>
                <div className="text-right">Cost (Rs)</div>
                <div className="text-right">Selling (Rs)</div>
                <div className="text-center">Status</div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading ? (
                  <div className="flex justify-center items-center h-48 text-slate-400">Loading...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <SearchX className="w-8 h-8 mb-2 opacity-50" />
                    <p>No products found in inventory.</p>
                  </div>
                ) : (
                  filteredProducts.map(p => (
                    <div key={p.id} className="grid grid-cols-[300px_120px_100px_120px_120px_120px_120px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {p.images?.[0]?.url ? <img src={p.images[0].url} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
                          <span className="text-xs text-slate-500 truncate">{p.barcode || 'No barcode'}</span>
                        </div>
                      </div>
                      <div className="text-right font-black text-slate-900 dark:text-white text-lg">
                        {p.stock}
                      </div>
                      <div className="text-right font-medium text-slate-500">
                        {Math.floor(Math.random() * 5)} {/* Mock reserved */}
                      </div>
                      <div className="text-right font-medium text-amber-600">
                        {p.minStock || 10}
                      </div>
                      <div className="text-right font-semibold text-slate-600 dark:text-slate-400">
                        {Number(p.cost || 0).toFixed(2)}
                      </div>
                      <div className="text-right font-bold text-slate-900 dark:text-white">
                        {Number(p.price || 0).toFixed(2)}
                      </div>
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                          p.stock <= 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                          p.stock <= (p.minStock || 10) ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                          'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                        }`}>
                          {p.stock <= 0 ? 'Out of Stock' : p.stock <= (p.minStock || 10) ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals for actions (Placeholder Mockups) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white capitalize">
              {modalOpen.replace('-', ' ')} Action
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              This dialog would allow selecting a product and entering quantity for the {modalOpen} action. In a fully implemented multi-branch backend, this would execute the stock ledger entry.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => setModalOpen(null)} variant="outline">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
