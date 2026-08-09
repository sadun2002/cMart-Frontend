'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Warehouse, Search, Package, AlertTriangle, XCircle, 
  DollarSign, Filter, ArrowUpRight, ArrowDownRight, 
  Save, RefreshCw, LayoutGrid, List, Maximize, Minimize, X
} from 'lucide-react';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortMode, setSortMode] = useState('default');
  const [categories, setCategories] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<'all' | 'updated'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

  // Stock adjustments map: productId -> newStockValue
  const [adjustments, setAdjustments] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [stockModal, setStockModal] = useState<{isOpen: boolean, product: any | null, amount: string, action: 'add' | 'remove'}>({
    isOpen: false,
    product: null,
    amount: '',
    action: 'add'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        storeOwnerAPI.getProducts(),
        storeOwnerAPI.getCategories()
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
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
    let result = products.filter(p => {
      // Apply Search
      const searchMatch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.id && p.id.toString().includes(search.toLowerCase())) ||
                          (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));
      if (!searchMatch) return false;

      // Apply Stock Filter
      if (stockFilter === 'instock' && p.stock <= 0) return false;
      if (stockFilter === 'outofstock' && p.stock !== 0) return false;
      if (stockFilter === 'lowstock' && (p.stock === 0 || p.stock > p.minStock)) return false;

      // Apply Category Filter
      if (categoryFilter !== 'all') {
        if (p.categoryId?.toString() !== categoryFilter && p.subcategoryId?.toString() !== categoryFilter) {
          const selectedCat = categories.find(c => c.id.toString() === categoryFilter);
          const isSubcategoryMatch = selectedCat?.children?.some((sc: any) => sc.id === p.categoryId);
          if (!isSubcategoryMatch) return false;
        }
      }

      // Apply Date Filter
      if (dateFilterType !== 'all') {
        const targetDate = new Date(p.updatedAt || p.createdAt);
        if (fromDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          if (targetDate < from) return false;
        }
        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (targetDate > to) return false;
        }
      }

      return true;
    });

    // Apply Sort
    if (sortMode === 'price-asc') result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortMode === 'price-desc') result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    if (sortMode === 'last-updated') result.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    return result;
  }, [products, search, stockFilter, categoryFilter, sortMode, categories, dateFilterType, fromDate, toDate]);

  const handleAdjustStock = (productId: number, newValue: number) => {
    setAdjustments(prev => ({
      ...prev,
      [productId]: Math.max(0, newValue) // Prevent negative stock
    }));
  };

  const handleStockModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModal.product) return;
    const qty = parseInt(stockModal.amount) || 0;
    const currentStock = adjustments[stockModal.product.id] !== undefined ? adjustments[stockModal.product.id] : stockModal.product.stock;
    
    let newValue = currentStock;
    if (stockModal.action === 'add') {
      newValue += qty;
    } else {
      newValue -= qty;
      if (newValue < 0) newValue = 0;
    }
    
    handleAdjustStock(stockModal.product.id, newValue);
    setStockModal({ ...stockModal, isOpen: false });
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
    <div className="font-sans flex flex-col h-full max-w-7xl mx-auto w-full p-4 sm:p-8">
      
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
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:bg-blue-400"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save {Object.keys(adjustments).length} Changes
            </motion.button>
          )}
        </div>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 mb-8">
        <KpiCard 
          title="Total Products" 
          value={totalItems} 
          icon={Package} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Low Stock" 
          value={lowStockCount} 
          icon={AlertTriangle} 
          iconColorClass="text-amber-600" 
          iconBgClass="bg-amber-50 dark:bg-amber-500/10" 
        />
        <KpiCard 
          title="Out of Stock" 
          value={outOfStockCount} 
          icon={XCircle} 
          iconColorClass="text-red-600" 
          iconBgClass="bg-red-50 dark:bg-red-500/10" 
        />
        <KpiCard 
          title="Inventory Value" 
          value={`Rs. ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
      </div>

      {/* ──────────────── SEARCH & FILTERS ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
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

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden flex-shrink-0 ml-auto">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative"
            title="Filter Inventory"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {(stockFilter !== 'all' || categoryFilter !== 'all' || sortMode !== 'default') && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button 
            onClick={() => setViewMode('list')}
            title="List View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button 
            onClick={() => setIsFullscreen(true)}
            title="Full Screen"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800`}
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ──────────────── DATA TABLE ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'fixed inset-y-0 right-0 left-[68px] z-[100] m-0 rounded-none border-none' : ''}`}>
        {isFullscreen && (
          <button 
            onClick={() => setIsFullscreen(false)} 
            className="absolute top-4 right-4 z-[110] p-3 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/80 transition-colors backdrop-blur-md shadow-lg"
          >
            <Minimize className="w-5 h-5" />
          </button>
        )}
        
        {selectedHistoryItem ? (
          <InventoryHistoryView product={selectedHistoryItem} onBack={() => setSelectedHistoryItem(null)} />
        ) : viewMode === 'list' ? (
          <div className="flex-1 flex flex-col overflow-x-auto no-scrollbar">
            <div className="min-w-[1000px] flex flex-col h-full">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div className="col-span-3 pl-4">Product Details</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Added / Updated</div>
                <div className="col-span-2 text-right">Cost / Price</div>
                <div className="col-span-3 text-right pr-4">Stock Management</div>
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
                <div 
                  key={p.id} 
                  onClick={() => setSelectedHistoryItem(p)}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  
                  <div className="col-span-3 flex items-center gap-4 pl-4">
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
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          SKU-{p.id}{p.barcode && ` • ${p.barcode}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center">
                    {p.category?.name || <span className="text-slate-400 italic">Uncategorized</span>}
                  </div>

                  <div className="col-span-2 flex flex-col justify-center text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Added: {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400 mt-0.5">
                      Upd: {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                    </span>
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
                    

                    {/* Stock Adjuster */}
                    <div className="flex flex-col items-end gap-1" onClick={e => e.stopPropagation()}>
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
                        
                        <button 
                          onClick={() => setStockModal({ isOpen: true, product: p, amount: '', action: 'add' })}
                          className={`w-16 h-full text-center font-black outline-none bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center ${
                            hasChange ? 'text-blue-600 dark:text-blue-400' : isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {currentStock}
                        </button>
                        
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
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/30 dark:bg-slate-900/20">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 xl:gap-6">
                {filteredProducts.map(p => {
                  const currentStock = adjustments[p.id] !== undefined ? adjustments[p.id] : p.stock;
                  const isLowStock = currentStock > 0 && currentStock <= p.minStock;
                  const isOutOfStock = currentStock === 0;
                  const hasChange = adjustments[p.id] !== undefined && adjustments[p.id] !== p.stock;
                  const stockDiff = currentStock - p.stock;

                  return (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedHistoryItem(p)}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col cursor-pointer group"
                    >
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                        {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <Package className="w-12 h-12 opacity-50" />}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px]" />
                        )}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-red-500 text-white flex items-center gap-1.5">
                              <XCircle className="w-3 h-3" /> Empty
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-amber-500 text-white flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3" /> Low
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-emerald-500 text-white">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-slate-500 mb-0.5">{p.category?.name || 'Uncategorized'}</p>
                          <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1 line-clamp-1" title={p.name}>{p.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              SKU-{p.id}{p.barcode && ` • ${p.barcode}`}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto mb-3">
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-lg">Rs. {parseFloat(p.price).toFixed(2)}</p>
                            {p.cost && <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Cost: Rs. {parseFloat(p.cost).toFixed(2)}</p>}
                          </div>
                        </div>

                        {/* Grid Stock Adjuster */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Stock Manage</span>
                            {hasChange && (
                              <span className={`text-[9px] font-black flex items-center gap-0.5 ${stockDiff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stockDiff > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                                {Math.abs(stockDiff)} {p.unit}
                              </span>
                            )}
                          </div>
                          <div className={`flex items-center h-9 rounded-xl overflow-hidden border transition-all ${
                            hasChange 
                              ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)]' 
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}>
                            <button 
                              onClick={() => handleAdjustStock(p.id, currentStock - 1)}
                              className="w-10 h-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-base transition-colors border-r border-slate-200 dark:border-slate-700"
                            >
                              -
                            </button>
                            
                            <button 
                              onClick={() => setStockModal({ isOpen: true, product: p, amount: '', action: 'add' })}
                              className={`flex-1 w-full h-full text-center font-black outline-none bg-white dark:bg-slate-900 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center ${
                                hasChange ? 'text-blue-600 dark:text-blue-400' : isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {currentStock}
                            </button>
                            
                            <button 
                              onClick={() => handleAdjustStock(p.id, currentStock + 1)}
                              className="w-10 h-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-base transition-colors border-l border-slate-200 dark:border-slate-700"
                            >
                              +
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────────── STOCK ADJUSTMENT MODAL ──────────────── */}
      <AnimatePresence>
        {stockModal.isOpen && stockModal.product && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setStockModal({ ...stockModal, isOpen: false })}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Adjust Stock</h2>
                <p className="text-sm font-medium text-slate-500 mb-6">{stockModal.product.name}</p>
                
                <form onSubmit={handleStockModalSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adjustment Quantity</label>
                      <input 
                        type="number"
                        min="1"
                        required
                        autoFocus
                        value={stockModal.amount}
                        onChange={(e) => setStockModal({ ...stockModal, amount: e.target.value })}
                        placeholder="e.g. 100"
                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Action</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setStockModal({ ...stockModal, action: 'add' })}
                          className={`h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all border ${
                            stockModal.action === 'add' 
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          Add to Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => setStockModal({ ...stockModal, action: 'remove' })}
                          className={`h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all border ${
                            stockModal.action === 'remove' 
                              ? 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 ring-2 ring-red-500/20' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          Remove Stock
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setStockModal({ ...stockModal, isOpen: false })}
                      className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={!stockModal.amount}
                      className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Inventory"
        onClear={() => { setStockFilter('all'); setCategoryFilter('all'); setSortMode('default'); setDateFilterType('all'); setFromDate(''); setToDate(''); setIsFilterOpen(false); }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Stock Status</label>
          <CustomSelect
            value={stockFilter}
            onChange={setStockFilter}
            options={[
              { value: 'all', label: 'All Items' },
              { value: 'instock', label: 'In Stock (>0)' },
              { value: 'lowstock', label: 'Low Stock (<10)' },
              { value: 'outofstock', label: 'Out of Stock (0)' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort Options</label>
          <CustomSelect
            value={sortMode}
            onChange={setSortMode}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'last-updated', label: 'Last Stock Updated' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Date Filter</label>
          <CustomSelect
            value={dateFilterType}
            onChange={(val) => setDateFilterType(val as any)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: 'updated', label: 'Stock Changed' },
            ]}
          />
          
          {dateFilterType !== 'all' && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">From</label>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">To</label>
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Category</label>
          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.flatMap(c => [
                { value: c.id.toString(), label: c.name },
                ...(c.children || []).map((sc: any) => ({ value: sc.id.toString(), label: `-- ${sc.name}` }))
              ])
            ]}
          />
        </div>
      </FilterPanel>
    </div>
  );
}

function InventoryHistoryView({ product, onBack }: { product: any, onBack: () => void }) {
  // dummy history for demonstration purposes, matching UI expectations
  const history = [
    { id: 'INV-1029', date: product.createdAt, type: 'INITIAL_STOCK', qtyChange: product.stock, newStock: product.stock, price: product.price, user: 'Admin' },
    { id: 'INV-1045', date: product.updatedAt || product.createdAt, type: 'MANUAL_ADJUSTMENT', qtyChange: -5, newStock: Math.max(0, product.stock - 5), price: product.price, user: 'Manager' },
    { id: 'INV-1088', date: new Date().toISOString(), type: 'RESTOCK', qtyChange: 20, newStock: product.stock + 20, price: product.price, user: 'Admin' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Inventory History: {product.name}</h2>
          <p className="text-sm font-bold text-slate-500 mt-1">
            SKU-{product.id} • Added on {new Date(product.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/50 p-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Change</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">New Stock</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Price at Update</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{new Date(h.date).toLocaleDateString()}</div>
                      <div className="text-xs font-medium text-slate-500">{new Date(h.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                        h.type === 'RESTOCK' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                        h.type === 'INITIAL_STOCK' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                        'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      }`}>
                        {h.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`font-black ${h.qtyChange > 0 ? 'text-emerald-600 dark:text-emerald-400' : h.qtyChange < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                        {h.qtyChange > 0 ? '+' : ''}{h.qtyChange}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">
                      {h.newStock}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">
                      Rs. {parseFloat(h.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">
                      {h.user}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
