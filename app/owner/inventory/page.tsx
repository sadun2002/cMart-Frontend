'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Warehouse, Search, Package, AlertTriangle, XCircle, 
  DollarSign, Filter, ArrowUpRight, ArrowDownRight, 
  Save, RefreshCw
} from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');

  // Stock adjustments map: productId -> newStockValue
  const [adjustments, setAdjustments] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerAPI.getProducts();
      setProducts(res.data);
      setAdjustments({});
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const { totalItems, lowStockCount, outOfStockCount, totalValue } = useMemo(() => {
    let tItems = 0;
    let lStock = 0;
    let oStock = 0;
    let tValue = 0;

    products.forEach(p => {
      tItems++;
      if (p.stock === 0) {
        oStock++;
      } else if (p.stock <= p.minStock) {
        lStock++;
      }
      const cost = parseFloat(p.cost || p.price || '0');
      tValue += cost * p.stock;
    });

    return { totalItems: tItems, lowStockCount: lStock, outOfStockCount: oStock, totalValue: tValue };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Apply Search
      const searchMatch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
                          (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));
      if (!searchMatch) return false;

      // Apply Filter Type
      if (filterType === 'out' && p.stock !== 0) return false;
      if (filterType === 'low' && (p.stock === 0 || p.stock > p.minStock)) return false;

      return true;
    });
  }, [products, search, filterType]);

  const handleAdjustStock = (productId: number, newValue: number) => {
    setAdjustments(prev => ({
      ...prev,
      [productId]: Math.max(0, newValue) // Prevent negative stock
    }));
  };

  const saveAdjustments = async () => {
    const adjustIds = Object.keys(adjustments).map(Number);
    if (adjustIds.length === 0) return;

    try {
      setIsSaving(true);
      toast.loading('Saving stock updates...', { id: 'save-stock' });

      // Run updates in parallel
      const updatePromises = adjustIds.map(id => {
        return storeOwnerAPI.updateProduct(id, { stockQuantity: adjustments[id] });
      });

      await Promise.all(updatePromises);
      
      toast.success(`Successfully updated stock for ${adjustIds.length} items!`, { id: 'save-stock' });
      setAdjustments({});
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update stock', { id: 'save-stock' });
    } finally {
      setIsSaving(false);
    }
  };

  const hasAdjustments = Object.keys(adjustments).length > 0;

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full p-4 sm:p-8">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Warehouse className="w-8 h-8 text-blue-600" />
            Inventory Control
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Monitor stock levels, track inventory value, and perform quick adjustments.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProducts}
            className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {hasAdjustments && (
            <motion.button 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={saveAdjustments}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:bg-emerald-400"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save {Object.keys(adjustments).length} Changes
            </motion.button>
          )}
        </div>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Total Products</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalItems}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Low Stock</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{lowStockCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
            <XCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Out of Stock</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{outOfStockCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Inventory Value</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(totalValue)}
            </h3>
          </div>
        </div>
      </div>

      {/* ──────────────── SEARCH & FILTERS ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search by name, SKU or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden flex-shrink-0">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-6 h-full rounded-xl text-sm font-bold transition-all ${filterType === 'all' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            All Items
          </button>
          <button 
            onClick={() => setFilterType('low')}
            className={`px-6 h-full rounded-xl text-sm font-bold transition-all ${filterType === 'low' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Low Stock
          </button>
          <button 
            onClick={() => setFilterType('out')}
            className={`px-6 h-full rounded-xl text-sm font-bold transition-all ${filterType === 'out' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* ──────────────── DATA TABLE ──────────────── */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-5 pl-4">Product Details</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2 text-right">Cost / Price</div>
          <div className="col-span-3 text-center pr-4">Stock Management</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 min-h-[300px]">
               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
               <p className="font-medium">Loading inventory...</p>
             </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 min-h-[300px]">
               <Package className="w-12 h-12 opacity-20" />
               <p className="font-medium text-lg text-slate-500">No products found matching criteria.</p>
             </div>
          ) : (
            filteredProducts.map((p) => {
              const currentStock = adjustments[p.id] !== undefined ? adjustments[p.id] : p.stock;
              const isLowStock = currentStock > 0 && currentStock <= p.minStock;
              const isOutOfStock = currentStock === 0;
              const hasChange = adjustments[p.id] !== undefined && adjustments[p.id] !== p.stock;
              const stockDiff = currentStock - p.stock;

              return (
                <div key={p.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  
                  <div className="col-span-5 flex items-center gap-4 pl-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-400 overflow-hidden relative">
                      {p.images && p.images.length > 0 ? (
                        <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6" />
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-1" title={p.name}>{p.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{p.sku || 'NO-SKU'}</span>
                        {p.barcode && (
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                            {p.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center">
                    {p.category?.name || <span className="text-slate-400 italic">Uncategorized</span>}
                  </div>

                  <div className="col-span-2 flex flex-col justify-center items-end text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Rs. {parseFloat(p.price).toFixed(2)}
                    </span>
                    {p.cost && (
                      <span className="text-xs font-bold text-slate-400 mt-0.5">
                        Cost: Rs. {parseFloat(p.cost).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-6 pr-4">
                    
                    {/* Status Badge */}
                    <div className="w-24 flex justify-end">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-900/50">
                          <XCircle className="w-3 h-3" /> Empty
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50">
                          <AlertTriangle className="w-3 h-3" /> Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Stock Adjuster */}
                    <div className="flex flex-col items-end gap-1">
                      <div className={`flex items-center h-10 rounded-xl overflow-hidden border transition-all ${
                        hasChange 
                          ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)]' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}>
                        <button 
                          onClick={() => handleAdjustStock(p.id, currentStock - 1)}
                          className="w-10 h-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-lg transition-colors border-r border-slate-200 dark:border-slate-700"
                        >
                          -
                        </button>
                        
                        <input 
                          type="number" 
                          min="0"
                          value={currentStock.toString()} 
                          onChange={(e) => handleAdjustStock(p.id, parseInt(e.target.value) || 0)}
                          className={`w-16 h-full text-center font-black outline-none bg-white dark:bg-slate-900 ${
                            hasChange ? 'text-blue-600 dark:text-blue-400' : isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                          }`}
                        />
                        
                        <button 
                          onClick={() => handleAdjustStock(p.id, currentStock + 1)}
                          className="w-10 h-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-lg transition-colors border-l border-slate-200 dark:border-slate-700"
                        >
                          +
                        </button>
                      </div>

                      {/* Diff Indicator */}
                      <div className="h-4 flex items-center justify-end w-full px-1">
                        {hasChange && (
                          <span className={`text-[10px] font-black flex items-center gap-0.5 ${stockDiff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stockDiff > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(stockDiff)} {p.unit}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
