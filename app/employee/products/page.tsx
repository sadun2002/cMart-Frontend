'use client';
import { Suspense } from 'react';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2, Package, Tag, Filter, X, Barcode, Edit, List, LayoutGrid, Maximize, Minimize, Copy } from 'lucide-react';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

function formatStock(num: number) {
  if (num == null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}

function dataURLtoFile(dataurl: string, filename: string) {
  try {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--) { u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  } catch(e) {
    return null;
  }
}

function ProductHistoryView({ product, onBack }: { product: any, onBack: () => void }) {
  const history = [
    { date: new Date().toISOString(), action: 'PRICE_UPDATE', desc: 'Price changed from Rs. 1500 to Rs. 1650', by: 'Admin' },
    { date: new Date(Date.now() - 86400000).toISOString(), action: 'STOCK_ADD', desc: 'Added 50 units to stock', by: 'Warehouse Mgr' },
    { date: product.createdAt, action: 'CREATED', desc: 'Product created', by: 'Admin' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {product.name} - Product History
          </h2>
          <p className="text-sm font-medium text-slate-500">View creation and update logs for this product.</p>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto bg-white dark:bg-slate-900">
        <div className="min-w-max h-full flex flex-col">
          <div className="grid grid-cols-[200px_150px_450px_200px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            <div>Date</div>
            <div>Action</div>
            <div>Description</div>
            <div>Performed By</div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {history.map((h, i) => (
              <div key={i} className="grid grid-cols-[200px_150px_450px_200px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div>
                  <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${
                    h.action === 'CREATED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                    h.action === 'PRICE_UPDATE' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}>{h.action.replace('_', ' ')}</span>
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{h.desc}</div>
                <div className="text-sm font-medium text-slate-500">{h.by}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreProductsPageContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal / Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filters
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilterType, setDateFilterType] = useState<'all' | 'newly-added' | 'updated'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // View & Sort
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [sortMode, setSortMode] = useState<'default' | 'price-asc' | 'price-desc' | 'instock' | 'outofstock'>('default');

  // Form State
  const [formData, setFormData] = useState({ 
    name: '', 
    barcode: '', 
    price: '', 
    cost: '',
    stockQuantity: '',
    showOnWebsite: false,
    categoryId: 'null',
    subcategoryId: 'null'
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
    if (searchParams.get('action') === 'add') {
      openAddPanel();
      // Remove the query param from URL so it doesn't re-open on refresh
      router.replace('/employee/products');
    }
  }, [searchParams, router]);

  // Save draft state
  useEffect(() => {
    if (!editingProduct && isPanelOpen) {
      localStorage.setItem('productDraft', JSON.stringify(formData));
      if (imagePreviews.length > 0 && imagePreviews[0].startsWith('data:image')) {
        try {
          localStorage.setItem('productDraftImage', imagePreviews[0]);
        } catch(e) {
          console.warn("Image too large to auto-save in draft.");
        }
      } else if (imagePreviews.length === 0) {
        localStorage.removeItem('productDraftImage');
      }
    }
  }, [formData, editingProduct, isPanelOpen, imagePreviews]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        storeOwnerAPI.getProducts(),
        storeOwnerAPI.getCategories()
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await storeOwnerAPI.getProducts();
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode || !formData.price || formData.categoryId === 'null' || (!editingProduct && !formData.stockQuantity)) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.categoryId !== 'null') {
      const cat = categories.find(c => c.id.toString() === formData.categoryId);
      if (cat && cat.children && cat.children.length > 0 && formData.subcategoryId === 'null') {
         toast.error('Please select a subcategory');
         return;
      }
    }

    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      payload.append('name', formData.name);
      if (formData.barcode) payload.append('barcode', formData.barcode);
      payload.append('price', formData.price);
      if (formData.cost) payload.append('cost', formData.cost);
      payload.append('stockQuantity', formData.stockQuantity || '0');
      payload.append('showOnWebsite', formData.showOnWebsite.toString());
      
      const finalCategoryId = formData.subcategoryId !== 'null' ? formData.subcategoryId : formData.categoryId !== 'null' ? formData.categoryId : null;
      if (finalCategoryId) {
        payload.append('categoryId', finalCategoryId);
      }
      
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          payload.append('images', file);
        });
      }
      if (deletedImageIds.length > 0) {
        payload.append('deletedImageIds', JSON.stringify(deletedImageIds));
      }

      if (editingProduct) {
        await storeOwnerAPI.updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully!');
      } else {
        await storeOwnerAPI.createProduct(payload);
        toast.success('Product added successfully!');
        localStorage.removeItem('productDraft');
        localStorage.removeItem('productDraftImage');
      }

      setIsPanelOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!confirmDialog.id) return;
    try {
      setIsDeleting(true);
      await storeOwnerAPI.deleteProduct(confirmDialog.id);
      toast.success('Product deleted');
      fetchProducts();
      setConfirmDialog({ isOpen: false, id: null });
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddPanel = () => {
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    setDeletedImageIds([]);
    
    const draft = localStorage.getItem('productDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData({ ...parsed, categoryId: parsed.categoryId || 'null', subcategoryId: parsed.subcategoryId || 'null' });
      } catch (e) {
        setFormData({ name: '', barcode: '', price: '', cost: '', stockQuantity: '', showOnWebsite: false, categoryId: 'null', subcategoryId: 'null' });
      }
    } else {
      setFormData({ name: '', barcode: '', price: '', cost: '', stockQuantity: '', showOnWebsite: false, categoryId: 'null', subcategoryId: 'null' });
    }
    
    const draftImage = localStorage.getItem('productDraftImage');
    if (draftImage) {
      setImagePreviews([draftImage]);
      const file = dataURLtoFile(draftImage, 'draft-image.png');
      if (file) setImageFiles([file]);
    }
    
    setIsPanelOpen(true);
  };

  const openEditPanel = (product: any) => {
    setEditingProduct(product);
    
    // Find if the product's category is a subcategory to populate both dropdowns correctly
    let catId = 'null';
    let subcatId = 'null';
    if (product.categoryId) {
      const isMainCategory = categories.find(c => c.id === product.categoryId);
      if (isMainCategory) {
        catId = product.categoryId.toString();
      } else {
        // It might be a subcategory
        for (const mainCat of categories) {
          const isSub = mainCat.children?.find((sc: any) => sc.id === product.categoryId);
          if (isSub) {
            catId = mainCat.id.toString();
            subcatId = isSub.id.toString();
            break;
          }
        }
      }
    }

    setFormData({
      name: product.name || '',
      barcode: product.barcode || '',
      price: product.price ? product.price.toString() : '',
      cost: product.cost ? product.cost.toString() : '',
      stockQuantity: product.stock !== undefined && product.stock !== null ? product.stock.toString() : '0',
      showOnWebsite: product.showOnWebsite || false,
      categoryId: catId,
      subcategoryId: subcatId
    });
    // Set preview if image exists
    setImageFiles([]);
    setImagePreviews([]);
    setDeletedImageIds([]);
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({ name: '', barcode: '', price: '', cost: '', stockQuantity: '', showOnWebsite: false, categoryId: 'null', subcategoryId: 'null' });
    setImageFiles([]);
    setImagePreviews([]);
    setDeletedImageIds([]);
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return null;
    for (const cat of categories) {
      if (cat.id === categoryId) return { main: cat.name, sub: null };
      if (cat.children) {
        const sub = cat.children.find((c: any) => c.id === categoryId);
        if (sub) return { main: cat.name, sub: sub.name };
      }
    }
    return null;
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search);
    let matchesStock = true;
    if (stockFilter === 'instock') matchesStock = p.stock > 0;
    if (stockFilter === 'outofstock') matchesStock = p.stock <= 0;
    if (stockFilter === 'lowstock') matchesStock = p.stock > 0 && p.stock < 10;
    
    let matchesCategory = true;
    if (categoryFilter !== 'all') {
      const catId = parseInt(categoryFilter);
      if (p.categoryId !== catId) {
        // Also check if it's a subcategory of this category
        const isMain = categories.find(c => c.id === catId);
        if (!isMain?.children?.some((sc: any) => sc.id === p.categoryId)) {
          matchesCategory = false;
        }
      }
    }

    let matchesDate = true;
    if (dateFilterType !== 'all') {
      const targetDate = dateFilterType === 'newly-added' ? new Date(p.createdAt) : new Date(p.updatedAt || p.createdAt);
      
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (targetDate < from) matchesDate = false;
      }
      
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (targetDate > to) matchesDate = false;
      }
    }
    
    return matchesSearch && matchesStock && matchesCategory && matchesDate;
  }).sort((a, b) => {
    if (sortMode === 'instock') return (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortMode === 'outofstock') return (b.stock <= 0 ? 1 : 0) - (a.stock <= 0 ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortMode === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortMode === 'price-desc') return Number(b.price) - Number(a.price);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // default newest first
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Product Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Add, update, and track your store products elegantly.</p>
        </div>
        
        <button 
          onClick={openAddPanel}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* ──────────────── SEARCH & FILTER BAR ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden flex-shrink-0 ml-auto">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative"
            title="Filter & Sort"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {(stockFilter !== 'all' || categoryFilter !== 'all' || sortMode !== 'default' || dateFilterType !== 'all') && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
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

      {/* ──────────────── DATA TABLE (CARD LIST) ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'fixed inset-y-0 right-0 left-[68px] z-[100] m-0 rounded-none border-none' : ''}`}>
        {isFullscreen && (
          <button 
            onClick={() => setIsFullscreen(false)} 
            className="absolute top-4 right-4 z-[110] p-3 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/80 transition-colors backdrop-blur-md shadow-lg"
          >
            <Minimize className="w-5 h-5" />
          </button>
        )}
        {viewingProduct ? (
          <ProductHistoryView product={viewingProduct} onBack={() => setViewingProduct(null)} />
        ) : viewMode === 'list' ? (
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[250px_150px_150px_150px_150px_120px_150px_100px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Product Name</div>
                <div>Category</div>
                <div>Identifiers</div>
                <div className="text-right">Pricing</div>
                <div className="text-right">Stock Level</div>
                <div className="text-center">Visibility</div>
                <div>History</div>
                <div className="text-center">Action</div>
              </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium">Loading inventory...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <Package className="w-12 h-12 opacity-20" />
                  <p className="font-medium text-lg text-slate-500">No products found.</p>
                </div>
              ) : (
                <>
                {filteredProducts.map((p) => {
                  const catInfo = getCategoryName(p.categoryId);
                  return (
                  <div key={p.id} onClick={() => setViewingProduct(p)} className="cursor-pointer grid grid-cols-[250px_150px_150px_150px_150px_120px_150px_100px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 overflow-hidden">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{p.name}</h3>
                      </div>
                    </div>

                    <div className="min-w-0 flex flex-col justify-center">
                      {catInfo ? (
                        <>
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{catInfo.main}</span>
                          {catInfo.sub && <span className="text-xs text-slate-500 truncate">{catInfo.sub}</span>}
                        </>
                      ) : <span className="text-slate-400 italic text-sm">None</span>}
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-0 justify-center">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm truncate group/barcode">
                        <span className="truncate">{p.barcode || <span className="text-slate-400 italic font-normal text-xs">N/A</span>}</span>
                        {p.barcode && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.barcode); toast.success('Barcode copied!'); }}
                            className="p-1 opacity-0 group-hover/barcode:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                            title="Copy Barcode"
                          >
                            <Copy className="w-3 h-3 text-slate-400 hover:text-blue-500" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs truncate group/id">
                        <span className="truncate">ID: {p.id}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.id.toString()); toast.success('ID copied!'); }}
                          className="p-1 opacity-0 group-hover/id:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                          title="Copy ID"
                        >
                          <Copy className="w-3 h-3 text-slate-400 hover:text-blue-500" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right truncate flex flex-col justify-center">
                      <p className="font-bold text-slate-900 dark:text-white text-base truncate">Rs. {Number(p.price).toFixed(2)}</p>
                      {p.cost && <p className="text-xs font-semibold text-emerald-600 truncate">Cost: Rs. {Number(p.cost).toFixed(2)}</p>}
                    </div>

                    <div className="flex justify-end items-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                        p.stock <= 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                        p.stock < 10 ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {p.stock <= 0 ? 'Out of stock' : 'In stock'} ({formatStock(p.stock)})
                      </span>
                    </div>

                    <div className="flex justify-center items-center">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${
                        p.showOnWebsite ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {p.showOnWebsite ? 'Published' : 'Hidden'}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center min-w-0">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                        {p.updatedAt && p.updatedAt !== p.createdAt ? 'Updated' : 'Added'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {p.updatedAt && p.updatedAt !== p.createdAt 
                          ? new Date(p.updatedAt).toLocaleDateString() 
                          : new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditPanel(p); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )})}
                </>
              )}
            </div>
          </div>
        </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/30 dark:bg-slate-900/20">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-medium">Loading inventory...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <Package className="w-12 h-12 opacity-20" />
                <p className="font-medium text-lg text-slate-500">No products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 xl:gap-6">
                {filteredProducts.map(p => {
                  const catInfo = getCategoryName(p.categoryId);
                  return (
                    <div key={p.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                         {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <Package className="w-12 h-12 opacity-50" />}
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button onClick={() => openEditPanel(p)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                              <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                           <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                             p.stock <= 0 ? 'bg-red-500 text-white' :
                             p.stock < 10 ? 'bg-orange-500 text-white' :
                             'bg-emerald-500 text-white'
                           }`}>
                             {formatStock(p.stock)} in stock
                           </span>
                           {!p.showOnWebsite && (
                             <span className="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md bg-slate-800 text-white opacity-80 uppercase tracking-wider">
                               POS Only
                             </span>
                           )}
                         </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-slate-500 mb-0.5">{catInfo ? (catInfo.sub || catInfo.main) : 'No Category'}</p>
                          <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1 line-clamp-1" title={p.name}>{p.name}</h3>
                          {p.barcode && <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Barcode className="w-3 h-3" />{p.barcode}</p>}
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col justify-end">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Selling Price</p>
                          <p className="font-black text-blue-600 dark:text-blue-400 text-lg">Rs. {Number(p.price).toFixed(2)}</p>
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

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <AnimatePresence>
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Products"
        onClear={() => { setStockFilter('all'); setCategoryFilter('all'); setDateFilterType('all'); setFromDate(''); setToDate(''); setIsFilterOpen(false); }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Stock Status</label>
          <CustomSelect
            value={stockFilter}
            onChange={setStockFilter}
            options={[
              { value: 'all', label: 'All Products' },
              { value: 'instock', label: 'In Stock (>0)' },
              { value: 'lowstock', label: 'Low Stock (<10)' },
              { value: 'outofstock', label: 'Out of Stock (0)' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By Price</label>
          <CustomSelect
            value={sortMode}
            onChange={(val) => setSortMode(val as any)}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'price-asc', label: 'Low to High' },
              { value: 'price-desc', label: 'High to Low' },
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
              { value: 'newly-added', label: 'Added Date' },
              { value: 'updated', label: 'Updated Date' },
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
      </AnimatePresence>

      {/* ──────────────── SLIDE OUT PANEL FOR ADD/EDIT ──────────────── */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="productForm" onSubmit={handleSaveProduct} className="font-sans space-y-6">
                  
                  {/* Image Upload */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Images</label>
                      <span className="text-xs font-medium text-slate-500">
                        {(editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length} / 15
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {editingProduct?.images?.filter((img: any) => !deletedImageIds.includes(img.id)).map((img: any, idx: number) => (
                        <div key={`existing-${img.id || idx}`} className="relative group w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                          <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setDeletedImageIds(prev => [...prev, img.id])}
                            className="absolute -top-1 -right-1 m-2 p-1.5 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 shadow hover:shadow-md transition-all z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {imagePreviews.map((preview, idx) => (
                        <div key={`new-${idx}`} className="relative group w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                          <img src={preview} alt="New Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => {
                               setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                               setImageFiles(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute -top-1 -right-1 m-2 p-1.5 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 shadow hover:shadow-md transition-all z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) < 15 && (
                        <label className="w-full h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <input 
                            type="file" 
                            accept="image/*"
                            multiple
                            className="hidden" 
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length === 0) return;
                              
                              const currentTotal = (editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length;
                              const allowed = 15 - currentTotal;
                              
                              if (allowed <= 0) {
                                toast.warning('Maximum 15 images allowed.');
                                return;
                              }
                              
                              const filesToAdd = files.slice(0, allowed);
                              if (filesToAdd.length < files.length) {
                                toast.warning(`Maximum 15 images allowed. Only ${allowed} added.`);
                              }
                              
                              setImageFiles(prev => [...prev, ...filesToAdd]);
                              const newPreviews = filesToAdd.map(f => URL.createObjectURL(f));
                              setImagePreviews(prev => [...prev, ...newPreviews]);
                            }}
                          />
                          <Plus className="w-6 h-6 text-slate-400" />
                          <span className="text-xs font-bold text-slate-500">Add</span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Name *</label>
                    <input 
                      required autoFocus
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                      placeholder="e.g. Wireless Mouse" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                      <select 
                        value={formData.categoryId} 
                        onChange={e => setFormData({...formData, categoryId: e.target.value, subcategoryId: 'null'})} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                      >
                        <option value="null">Select Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subcategory</label>
                      <select 
                        disabled={formData.categoryId === 'null'}
                        value={formData.subcategoryId} 
                        onChange={e => setFormData({...formData, subcategoryId: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white disabled:opacity-50"
                      >
                        <option value="null">Select Subcategory</option>
                        {categories.find(c => c.id.toString() === formData.categoryId)?.children?.map((sc: any) => (
                          <option key={sc.id} value={sc.id}>{sc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Barcode</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Barcode className="h-5 w-5" />
                      </div>
                      <input 
                        value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                        placeholder="Scan or enter barcode" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Price (Rs.) *</label>
                      <input 
                        required type="number" step="0.01" min="0"
                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black dark:text-white"
                        placeholder="0.00" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cost (Rs.)</label>
                      <input 
                        type="number" step="0.01" min="0"
                        value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black dark:text-white"
                        placeholder="0.00" 
                      />
                    </div>
                  </div>

                  {!editingProduct && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Initial Stock *</label>
                      <input 
                        required type="number" min="0"
                        value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-black dark:text-white"
                        placeholder="100" 
                      />
                    </div>
                  )}

                  <div className={`flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl ${((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) === 0 ? 'opacity-50 grayscale' : ''}`}>
                    <input 
                      type="checkbox"
                      id="showOnWebsite"
                      checked={formData.showOnWebsite && ((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) > 0}
                      disabled={((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) === 0}
                      onChange={e => setFormData({...formData, showOnWebsite: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label htmlFor="showOnWebsite" className="flex flex-col cursor-pointer select-none">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Show in E-Store (Show this product on your e-commerce website)</span>
                      {((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) === 0 && (
                        <span className="text-xs text-red-500 font-semibold mt-0.5">Requires at least 1 image</span>
                      )}
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  type="submit" 
                  form="productForm"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      {editingProduct ? 'Save Changes' : 'Create Product'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function StoreProductsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Loading products...</div>}>
      <StoreProductsPageContent />
    </Suspense>
  );
}

