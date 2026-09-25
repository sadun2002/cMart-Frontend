'use client';
import { Suspense } from 'react';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateSystemBarcode } from '@/lib/barcode-utils';
import { Plus, Search, Trash2, Package, Tag, Filter, X, Barcode, Edit, List, LayoutGrid, Maximize, Minimize, Copy, ChevronDown, ChevronUp, CircleDollarSign, Printer, Download, Settings, Calendar, Check, Layers, Info, Building2, Users, SearchX, Circle, Lock } from 'lucide-react';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect, CustomSelectOption } from '@/components/ui/custom-select';
import { SelectSupplierPanel, FALLBACK_SUPPLIERS } from '@/components/shared/SelectSupplierPanel';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { useAuthStore } from '@/lib/auth-store';
import { CategoryPanel } from '@/components/shared/CategoryPanel';
import { BrandPanel } from '@/components/shared/BrandPanel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { saveProductLocally, markProductSynced, getLocalProducts, updateProductLocally, deleteProductLocally, getLocalBrands, getLocalCategories, getProductLogs, saveBarcodeHistory, saveCategoryLocally, saveBrandLocally } from '@/lib/local-services';
import { getSetting, setSetting } from '@/lib/db';
import { isTauriEnv } from '@/lib/local-db';

const DEFAULT_UNITS: CustomSelectOption[] = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'l', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'packets', label: 'Packets' }
];

const DEFAULT_VARIANT_OPTIONS = ['Size', 'Color', 'Material', 'Style', 'Weight'];

const BARCODE_TYPES = [
  { value: 'ean13', label: 'EAN-13 (Retail)' },
  { value: 'code128', label: 'Code 128 (Standard)' },
  { value: 'upca', label: 'UPC-A (North America)' },
  { value: 'code39', label: 'Code 39' },
  { value: 'qrcode', label: 'QR Code' },
];

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

function ProductHistoryView({ product, categoryName, onClose, onUpdate, onDelete }: { product: any, categoryName?: string, onClose: () => void, onUpdate: (p: any) => void, onDelete: (id: number) => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    async function loadLogs() {
      if (!product?.id) return;
      const logs = await getProductLogs(product.id, user?.branchId || 1);
      
      // If no logs found (e.g. legacy products), fallback to creation log
      if (logs.length === 0) {
        setHistory([{ date: product.createdAt, action: 'CREATED', desc: 'Product created', by: user?.name || 'System', role: user?.role || '' }]);
      } else {
        setHistory(logs.map(l => {
          const parts = (l.performedBy || `${user?.name || 'System'}|${user?.role || ''}`).split('|');
          return {
            date: l.createdAt,
            action: l.action,
            desc: l.description,
            by: parts[0],
            role: parts[1] || ''
          };
        }));
      }
    }
    loadLogs();
  }, [product, user?.branchId]);

  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-900/50 border-b-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            {product.name}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
              product.showOnWebsite ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 
              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {product.showOnWebsite ? 'Published' : 'POS Only'}
            </span>
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Added on {new Date(product.createdAt).toLocaleDateString()} at {new Date(product.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onUpdate(product)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-colors shadow-sm shadow-blue-500/20">
            <Edit className="w-4 h-4" /> Update
          </button>
          <button onClick={() => onDelete(product.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10 font-bold transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10 font-bold transition-colors">
            <ChevronUp className="w-4 h-4" /> Close
          </button>
        </div>
      </div>
      
      {/* Product Details Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Box 1: Identification */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Barcode className="w-4 h-4" /> Identification</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Barcode</p>
                <div className="flex items-center gap-2 group/barcode">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.barcode || <span className="text-slate-400 italic font-normal">N/A</span>}</p>
                  {product.barcode && (
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(product.barcode); toast.success('Barcode copied!'); }} className="p-1 opacity-0 group-hover/barcode:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0" title="Copy Barcode">
                      <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">SKU</p>
                <div className="flex items-center gap-2 group/sku">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.sku || <span className="text-slate-400 italic font-normal">N/A</span>}</p>
                  {product.sku && (
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(product.sku); toast.success('SKU copied!'); }} className="p-1 opacity-0 group-hover/sku:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0" title="Copy SKU">
                      <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500" />
                    </button>
                  )}
                </div>
              </div>
              {product.aliases && <div><p className="text-xs text-slate-500 mb-0.5">Aliases</p><p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{product.aliases}</p></div>}
            </div>
          </div>
          
          {/* Box 2: Organization */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Organization</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-slate-500 mb-0.5">Category</p><p className="font-bold text-slate-900 dark:text-white text-sm">{categoryName || 'N/A'}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Brand</p><p className="font-bold text-slate-900 dark:text-white text-sm">{product.brand || <span className="text-slate-400 italic font-normal">N/A</span>}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Unit</p><p className="font-bold text-slate-900 dark:text-white text-sm uppercase">{product.unit || 'pieces'}</p></div>
            </div>
          </div>
          
          {/* Box 3: Pricing */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><CircleDollarSign className="w-4 h-4" /> Pricing</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-slate-500 mb-0.5">Selling Price</p><p className="font-black text-blue-600 dark:text-blue-400 text-lg">Rs. {Number(product.price || 0).toFixed(2)}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Cost Price</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Rs. {Number(product.cost || 0).toFixed(2)}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Wholesale Price</p><p className="font-bold text-amber-600 dark:text-amber-500 text-sm">Rs. {Number(product.wholesalePrice || 0).toFixed(2)}</p></div>
              {product.taxRate && Number(product.taxRate) > 0 ? <div><p className="text-xs text-slate-500 mb-0.5">Tax Rate</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{product.taxRate}%</p></div> : null}
            </div>
          </div>

          {/* Box 4: Inventory */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> Inventory & Tracking</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Current Stock</p>
                <p className={`font-black text-lg ${
                  product.stock <= 0 ? 'text-red-600' :
                  product.stock <= (product.lowStockLevel || 5) ? 'text-orange-500' :
                  'text-emerald-600'
                }`}>{formatStock(product.stock)} {product.unit}</p>
              </div>
              <div><p className="text-xs text-slate-500 mb-0.5">Low Stock Alert Level</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{product.lowStockLevel || 5}</p></div>
              {product.moq && Number(product.moq) > 0 && <div><p className="text-xs text-slate-500 mb-0.5">MOQ</p><p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{product.moq}</p></div>}
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Tracking Options</p>
                <div className="flex gap-2 mt-1">
                  {product.trackExpiry && <span className="text-[10px] bg-purple-50 text-purple-600 dark:bg-purple-500/20 px-2 py-0.5 rounded font-bold uppercase">Expiry: {product.expiryDate || 'Yes'}</span>}
                  {product.trackBatch && <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 px-2 py-0.5 rounded font-bold uppercase">Batch</span>}
                  {!product.trackExpiry && !product.trackBatch && <span className="text-[10px] text-slate-400 italic font-medium">None</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-black text-slate-900 dark:text-white">Recent Activity Log</h3>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-max flex flex-col">
              <div className="grid grid-cols-[200px_150px_450px_200px] gap-4 p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Date</div>
                <div>Action</div>
                <div>Description</div>
                <div>Performed By</div>
              </div>
              <div className="flex flex-col">
                {history.map((h, i) => (
                  <div key={i} className="grid grid-cols-[200px_150px_450px_200px] gap-4 p-4 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div>
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${
                        h.action === 'CREATED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                        h.action === 'PRICE_UPDATE' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                        'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>{h.action.replace('_', ' ')}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{h.desc}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{h.by}</span>
                      {h.role && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-1.5 py-0.5 rounded w-max mt-0.5">
                          {h.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { MainRightPanel, SecondaryRightPanel } from '@/components/ui/right-panel';

export function AddProductPanelInner({ isOpen, onClose, onSuccess, editingProduct: initialEditingProduct, onCategorySelect, onBrandSelect, rightOffset = 'right-0', suppliers: propSuppliers }: any) {
  const { user } = useAuthStore();
  const isProOrEnterprise = user?.tenant?.plan === 'PRO' || user?.tenant?.plan === 'ENTERPRISE';
  const plan = user?.tenant?.plan?.toUpperCase() || 'STARTUP';
  const isStartup = plan === 'STARTUP' || plan === 'FREE';
  const isLocalMode = isTauriEnv() || isStartup;

  const [products, setProducts] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>(propSuppliers || []);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal / Side Panel state
  const [isSupplierPanelOpen, setIsSupplierPanelOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(initialEditingProduct);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Quick Add Panels State
  const [isAddCategoryPanelOpen, setIsAddCategoryPanelOpen] = useState(false);
  const [isAddBrandPanelOpen, setIsAddBrandPanelOpen] = useState(false);

  const handleClosePanel = () => { onClose(); };
  
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
    sku: '',
    price: '', 
    cost: '',
    stockQuantity: '',
    lowStockLevel: '',
    taxRate: '',
    unit: '',
    brand: '',
    supplierId: 'null',
    moq: '',
    wholesalePrice: '',
    trackExpiry: false, expiryDate: "",
    trackBatch: false,
    showOnWebsite: false,
    categoryId: 'null',
    subcategoryId: 'null',
    aliases: ''
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageLabels, setImageLabels] = useState<string[]>([]);
  const [existingImageLabels, setExistingImageLabels] = useState<Record<number, string>>({});
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({ basic: true, pricing: false, identification: false, variants: false, advanced: false });

  // Barcode Generation State
  const [generateBarcodeOnSave, setGenerateBarcodeOnSave] = useState(false);
  const [symbology, setSymbology] = useState('ean13');
  const [barcodeScale, setBarcodeScale] = useState(3);
  const [barcodeHeight, setBarcodeHeight] = useState(15);
  const [showStoreName, setShowStoreName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [printQuantity, setPrintQuantity] = useState(1);
  const [compositeImageUrl, setCompositeImageUrl] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [openVariantSections, setOpenVariantSections] = useState<Record<string, boolean>>({});
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitInput, setCustomUnitInput] = useState('');
  const [customUnits, setCustomUnits] = useState<string[]>([]);
  const [customVariantOptions, setCustomVariantOptions] = useState<string[]>([]);
  const [customVariantInputs, setCustomVariantInputs] = useState<Record<number, string>>({});
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variantOptions, setVariantOptions] = useState<{name: string, values: string[], isCustom?: boolean}[]>([{ name: '', values: [] }]);
  const [variants, setVariants] = useState<any[]>([]);

  const toggleSection = (section: 'basic' | 'pricing' | 'identification' | 'variants' | 'advanced') => {
    // Close secondary panels related to 'basic' when ANY section is toggled
    setIsAddCategoryPanelOpen(false);
    setIsAddBrandPanelOpen(false);
    
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      } else {
        return {
          basic: false,
          pricing: false,
          identification: false,
          variants: false,
          advanced: false,
          [section]: true
        };
      }
    });
  };

  const [validationError, setValidationError] = useState<{ field: string, message: string } | null>(null);

  const focusField = (id: string, sectionKey?: string, message?: string) => {
    if (message) {
      setValidationError({ field: id, message });
    }
    const focus = () => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          if (el.tagName === 'BUTTON') el.click();
        }
      }, 100);
    };

    if (sectionKey && !(openSections as any)[sectionKey]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
      setTimeout(focus, 300);
    } else {
      focus();
    }
    
    setTimeout(() => setValidationError(null), 3000);
  };

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
    if (searchParams.get('action') === 'add') {
      openAddPanel();
      // Remove the query param from URL so it doesn't re-open on refresh
      router.replace('/owner/products');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (Array.isArray(propSuppliers) && propSuppliers.length > 0) {
      setSuppliers(propSuppliers);
    }
  }, [propSuppliers]);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  // Variant Generation Effect
  useEffect(() => {
    if (!hasVariants) {
      setVariants([]);
      return;
    }
    const activeOptions = variantOptions.filter(o => o.name.trim() && o.values.length >= 2);
    if (activeOptions.length === 0) {
      setVariants([]);
      return;
    }
    
    const cartesianProduct = (arr: any[][]): any[][] => {
      return arr.reduce((a, b) => {
        return a.flatMap(d => b.map(e => [d, e].flat()));
      }, [[]] as any[][]);
    };

    const valuesArrays = activeOptions.map(o => o.values);
    const combos = cartesianProduct(valuesArrays);
    
    setVariants(prevVariants => {
      return combos.map(combo => {
        const name = combo.join(' / ');
        const attributes: any = {};
        activeOptions.forEach((opt, idx) => {
          attributes[opt.name] = combo[idx];
        });
        
        // Preserve existing if possible
        const existing = prevVariants.find(v => v.name === name);
        const generatedSku = `PRD-${Math.floor(10000000 + Math.random() * 90000000)}`;
        return existing ? existing : {
          name,
          sku: generatedSku,
          barcode: '',
          price: '',
          cost: '',
          stockQuantity: '0',
          lowStockLevel: '5',
          moq: '',
          wholesalePrice: '',
          attributes
        };
      });
    });
  }, [variantOptions, hasVariants]);

  // Derived Barcode State
  const activeVariantIndexStr = Object.keys(openVariantSections).find(k => openVariantSections[k]);
  const activeVariantIndex = activeVariantIndexStr ? parseInt(activeVariantIndexStr) : null;
  const showBarcodePanel = generateBarcodeOnSave && (
    (!hasVariants && openSections.identification) || 
    (hasVariants && activeVariantIndex !== null)
  );
  
  const activeBarcode = (hasVariants && activeVariantIndex !== null) 
    ? variants[activeVariantIndex]?.barcode 
    : formData.barcode;
    
  const activePrice = (hasVariants && activeVariantIndex !== null) 
    ? variants[activeVariantIndex]?.price 
    : formData.price;

  // Auto-fill print quantity when panel opens
  useEffect(() => {
    if (showBarcodePanel) {
      if (hasVariants && activeVariantIndex !== null) {
        const v = variants[activeVariantIndex];
        const stock = parseInt(v?.stockQuantity || '0');
        setPrintQuantity(stock > 0 ? stock : 1);
      } else if (!hasVariants && openSections.identification) {
        const stock = parseInt(formData.stockQuantity || '0');
        setPrintQuantity(stock > 0 ? stock : 1);
      }
    }
  }, [showBarcodePanel, activeVariantIndex, openSections.identification, hasVariants]);

  // Barcode Preview Generation
  useEffect(() => {
    if (!showBarcodePanel || !activeBarcode) {
      setCompositeImageUrl('');
      return;
    }

    const generateBarcodeUrl = () => {
      if (!activeBarcode) return '';
      const params = new URLSearchParams({
        bcid: symbology,
        text: activeBarcode,
        scale: barcodeScale.toString(),
        height: barcodeHeight.toString(),
        includetext: 'true',
        backgroundcolor: 'ffffff',
      });
      return `https://bwipjs-api.metafloor.com/?${params.toString()}`;
    };

    const bwipUrl = generateBarcodeUrl();
    if (!bwipUrl) {
      setCompositeImageUrl('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = bwipUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const topPadding = (showStoreName || showDate) ? 30 * (barcodeScale / 3) : 0;
      const bottomPadding = showPrice ? 30 * (barcodeScale / 3) : 0;
      
      canvas.width = img.width + 40;
      canvas.height = img.height + topPadding + bottomPadding + 20;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      
      const fontSize = Math.max(12, 16 * (barcodeScale / 3));
      ctx.font = `bold ${fontSize}px sans-serif`;

      if (showStoreName || showDate) {
        ctx.textBaseline = 'top';
        
        if (showStoreName) {
          ctx.textAlign = 'left';
          ctx.fillText(user?.tenant?.businessName || 'cMart POS', 20, 10);
        }
        
        if (showDate) {
          const dateStr = new Date().toLocaleDateString('en-GB');
          ctx.textAlign = 'right';
          ctx.fillText(dateStr, canvas.width - 20, 10);
        }
      }

      const imgX = (canvas.width - img.width) / 2;
      const imgY = topPadding + 10;
      ctx.drawImage(img, imgX, imgY);

      if (showPrice) {
         ctx.textBaseline = 'bottom';
         ctx.textAlign = 'center';
         const priceStr = `Rs. ${parseFloat(activePrice || '0').toFixed(2)}`;
         ctx.fillText(priceStr, canvas.width / 2, canvas.height - 10);
      }
      
      setCompositeImageUrl(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      setCompositeImageUrl('');
    };
  }, [activeBarcode, activePrice, symbology, barcodeScale, barcodeHeight, showStoreName, showDate, showPrice, user, showBarcodePanel]);

  const handlePrintBarcode = async () => {
    if (user?.tenantId) {
       await saveBarcodeHistory(user.tenantId, {
         barcode: activeBarcode,
         barcodeType: symbology,
         quantity: printQuantity
       });
    }
    const printWindow = window.open('', '_blank');
    if (printWindow && compositeImageUrl) {
      const imagesHtml = Array(printQuantity)
        .fill(0)
        .map(() => `<div class="barcode-wrapper"><img src="${compositeImageUrl}" onload="imageLoaded()" /></div>`)
        .join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcodes</title>
            <style>
              body { 
                display: flex; 
                flex-wrap: wrap; 
                gap: 20px; 
                padding: 20px; 
                justify-content: center; 
                margin: 0;
                background: white;
              }
              .barcode-wrapper { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                page-break-inside: avoid;
              }
              img { max-width: 100%; height: auto; }
              @media print {
                body { padding: 0; gap: 10px; }
              }
            </style>
            <script>
              let loaded = 0;
              const total = ${printQuantity};
              function imageLoaded() {
                loaded++;
                if (loaded >= total) {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 200);
                }
              }
            </script>
          </head>
          <body>
            ${imagesHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Save draft state
  useEffect(() => {
    if (!editingProduct && isOpen) {
      localStorage.setItem('productDraft', JSON.stringify(formData));
      if (imagePreviews.length > 0) {
        try {
          const base64Images = imagePreviews.filter(img => img.startsWith('data:image'));
          localStorage.setItem('productDraftImages', JSON.stringify(base64Images));
          localStorage.setItem('productDraftLabels', JSON.stringify(imageLabels));
        } catch(e) {
          console.warn("Images too large to auto-save in draft.");
        }
      } else {
        localStorage.removeItem('productDraftImages');
        localStorage.removeItem('productDraftLabels');
      }
    }
  }, [formData, editingProduct, isOpen, imagePreviews]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const user = useAuthStore.getState().user;
      const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';
      
      let prodData: any[] = [];
      let brandsData: any[] = [];
      let catsData: any[] = [];
      let suppliersData: any[] = [];
      try {
        if (isLocalMode) {
          prodData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1);
          brandsData = await getLocalBrands(user?.tenantId || null);
          catsData = await getLocalCategories(user?.tenantId || null);
        } else {
          const prodRes = await storeOwnerAPI.getProducts();
          prodData = prodRes.data;
          const brandRes = await storeOwnerAPI.getBrands().catch(() => ({ fallbackToLocal: true }));
          if (brandRes && (brandRes as any).fallbackToLocal) {
            brandsData = await getLocalBrands(user?.tenantId || null);
          } else {
            brandsData = (brandRes as any).data || [];
          }
          const catRes = await storeOwnerAPI.getCategories().catch(() => ({ data: [] }));
          catsData = catRes.data || [];
        }
      } catch(e) {
        // Fallback to local DB if backend fetch fails
        prodData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1);
        brandsData = await getLocalBrands(user?.tenantId || null);
        catsData = await getLocalCategories(user?.tenantId || null);
      }

      // Always fetch suppliers from backend API
      try {
        const supRes = await storeOwnerAPI.getSuppliers().catch(() => ({ data: [] }));
        const supList = supRes.data || supRes || [];
        if (Array.isArray(supList) && supList.length > 0) {
          suppliersData = supList;
        } else if (FALLBACK_SUPPLIERS) {
          suppliersData = FALLBACK_SUPPLIERS;
        }
      } catch (e) {
        if (FALLBACK_SUPPLIERS) {
          suppliersData = FALLBACK_SUPPLIERS;
        }
      }

      setProducts(prodData);
      setCategories(catsData);
      setBrands(brandsData);
      if (suppliersData.length > 0) {
        setSuppliers(suppliersData);
      }

      // Load custom units & custom variant options
      try {
        const localUnits = localStorage.getItem('product_custom_units');
        if (localUnits) {
          const parsed = JSON.parse(localUnits);
          if (Array.isArray(parsed)) setCustomUnits(parsed);
        }
        const dbUnits = await getSetting('product_custom_units', '');
        if (dbUnits) {
          const parsed = JSON.parse(dbUnits);
          if (Array.isArray(parsed)) {
            setCustomUnits(parsed);
            localStorage.setItem('product_custom_units', dbUnits);
          }
        }
      } catch (e) {}

      try {
        const localVariants = localStorage.getItem('product_custom_variants');
        if (localVariants) {
          const parsed = JSON.parse(localVariants);
          if (Array.isArray(parsed)) setCustomVariantOptions(parsed);
        }
        const dbVariants = await getSetting('product_custom_variants', '');
        if (dbVariants) {
          const parsed = JSON.parse(dbVariants);
          if (Array.isArray(parsed)) {
            setCustomVariantOptions(parsed);
            localStorage.setItem('product_custom_variants', dbVariants);
          }
        }
      } catch (e) {}
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const user = useAuthStore.getState().user;
      const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';
      
      if (isLocalMode) {
        const localData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1);
        setProducts(localData);
      } else {
        const res = await storeOwnerAPI.getProducts();
        setProducts(res.data);
      }
    } catch (err) {
      const user = useAuthStore.getState().user;
      const localData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1).catch(() => []);
      setProducts(localData);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    let finalProduct: any = null;
    e.preventDefault();
    if (!formData.name.trim()) {
      focusField('field-name', 'basic', 'Product name is required');
      return;
    }
    if (!hasVariants && !formData.price) {
      focusField('field-price', 'pricing', 'Selling Price is required');
      return;
    }
    if (hasVariants) {
      if (variants.length < 2) {
        focusField('field-variant-option-0', 'variants', 'At least two variants must be created (e.g. Size S and M)');
        return;
      }
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.price) {
          if (!openVariantSections[i]) {
            setOpenVariantSections(prev => ({ ...prev, [i]: true }));
            setTimeout(() => focusField(`field-variant-price-${i}`, 'variants', `Selling price is required for variant: ${v.name}`), 300);
          } else {
            focusField(`field-variant-price-${i}`, 'variants', `Selling price is required for variant: ${v.name}`);
          }
          return;
        }
      }
    }
    
    if (generateBarcodeOnSave) {
      if (!hasVariants && !formData.barcode) {
        focusField('field-barcode', 'identification', 'Barcode is required when "Generate and Print Barcode" is enabled.');
        return;
      }
      if (!hasVariants && formData.barcode) {
        if (symbology === 'ean13' && formData.barcode.length !== 13) {
          focusField('field-barcode', 'identification', 'EAN-13 barcodes must be exactly 13 digits.');
          return;
        }
        if (symbology === 'upca' && formData.barcode.length !== 12) {
          focusField('field-barcode', 'identification', 'UPC-A barcodes must be exactly 12 digits.');
          return;
        }
      }

      if (hasVariants) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          if (!v.barcode) {
            if (!openVariantSections[i]) {
              setOpenVariantSections(prev => ({ ...prev, [i]: true }));
              setTimeout(() => focusField(`field-variant-barcode-${i}`, 'variants', `Barcode is required for variant: ${v.name} when generating barcodes.`), 300);
            } else {
              focusField(`field-variant-barcode-${i}`, 'variants', `Barcode is required for variant: ${v.name} when generating barcodes.`);
            }
            return;
          }
          if (symbology === 'ean13' && v.barcode.length !== 13) {
            if (!openVariantSections[i]) {
              setOpenVariantSections(prev => ({ ...prev, [i]: true }));
              setTimeout(() => focusField(`field-variant-barcode-${i}`, 'variants', `EAN-13 barcodes must be exactly 13 digits for variant: ${v.name}.`), 300);
            } else {
              focusField(`field-variant-barcode-${i}`, 'variants', `EAN-13 barcodes must be exactly 13 digits for variant: ${v.name}.`);
            }
            return;
          }
          if (symbology === 'upca' && v.barcode.length !== 12) {
            if (!openVariantSections[i]) {
              setOpenVariantSections(prev => ({ ...prev, [i]: true }));
              setTimeout(() => focusField(`field-variant-barcode-${i}`, 'variants', `UPC-A barcodes must be exactly 12 digits for variant: ${v.name}.`), 300);
            } else {
              focusField(`field-variant-barcode-${i}`, 'variants', `UPC-A barcodes must be exactly 12 digits for variant: ${v.name}.`);
            }
            return;
          }
        }
      }
    }
    if (formData.categoryId === 'null') {
      focusField('field-category', 'basic', 'Category is required');
      return;
    }
    const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId);
    if (selectedCategory && selectedCategory.children && selectedCategory.children.length > 0) {
      if (formData.subcategoryId === 'null') {
        focusField('field-subcategory', 'basic', 'Subcategory is required for this category');
        return;
      }
    }
    if (!formData.unit) {
      focusField('field-unit', 'basic', 'Unit is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      payload.append('name', formData.name);
      if (formData.barcode) payload.append('barcode', formData.barcode);
      
      // Send dummy values for backend compatibility until backend is updated for multi-branch
      payload.append('price', formData.price || '0');
      if (formData.cost) payload.append('cost', formData.cost || '0');
      payload.append('stockQuantity', formData.stockQuantity || '0');
      payload.append('unit', formData.unit || 'pieces');
      payload.append('showOnWebsite', formData.showOnWebsite.toString());
      
      if (formData.aliases) payload.append('aliases', formData.aliases);
      if (formData.moq) payload.append('moq', formData.moq);
      if (formData.wholesalePrice) payload.append('wholesalePrice', formData.wholesalePrice);
      
      if (hasVariants) {
        payload.append('hasVariants', 'true');
        payload.append('variants', JSON.stringify(variants));
      }
      
      const finalCategoryId = formData.subcategoryId !== 'null' ? formData.subcategoryId : formData.categoryId !== 'null' ? formData.categoryId : null;
      if (finalCategoryId) {
        payload.append('categoryId', finalCategoryId);
      }
      
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          payload.append('images', file);
        });
        payload.append('imageLabels', JSON.stringify(imageLabels));
      }
      if (deletedImageIds.length > 0) {
        payload.append('deletedImageIds', JSON.stringify(deletedImageIds));
      }
      if (Object.keys(existingImageLabels).length > 0) {
        payload.append('existingImageLabels', JSON.stringify(existingImageLabels));
      }

      if (editingProduct) {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

        // Update locally first
        const localData = {
          name: formData.name,
          barcode: formData.barcode,
          sku: formData.sku,
          price: formData.price,
          cost: formData.cost,
          stockQuantity: formData.stockQuantity,
          lowStockLevel: formData.lowStockLevel,
          taxRate: formData.taxRate,
          unit: formData.unit,
          brand: formData.brand,
          supplierId: formData.supplierId,
          wholesalePrice: formData.wholesalePrice,
          trackExpiry: formData.trackExpiry,
          trackBatch: formData.trackBatch,
          showOnWebsite: formData.showOnWebsite,
          categoryId: finalCategoryId,
          aliases: formData.aliases,
          imageLabels: JSON.stringify(imageLabels),
          hasVariants,
          variants,
          images: JSON.stringify(imagePreviews),
          isBarcodePrinted: generateBarcodeOnSave
        };

        await updateProductLocally(editingProduct.id, localData, tenantId);
        finalProduct = { ...localData, id: editingProduct.id };

        if (!isLocalMode) {
          try {
            await storeOwnerAPI.updateProduct(editingProduct.id, payload);
            await markProductSynced(editingProduct.id);
            toast.success('Product updated and synced successfully!');
          } catch (syncErr: any) {
            console.error('Sync failed:', syncErr);
            toast.warning('Product updated locally but failed to sync to server (Product may not exist on server).');
          }
        } else {
          toast.success('Product updated successfully in local database!');
        }
      } else {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

        // 1. Save locally first
        const localData = {
          name: formData.name,
          barcode: formData.barcode,
          sku: formData.sku,
          price: formData.price,
          cost: formData.cost,
          stockQuantity: formData.stockQuantity,
          lowStockLevel: formData.lowStockLevel,
          taxRate: formData.taxRate,
          unit: formData.unit,
          brand: formData.brand,
          supplierId: formData.supplierId,
          wholesalePrice: formData.wholesalePrice,
          trackExpiry: formData.trackExpiry,
          trackBatch: formData.trackBatch,
          showOnWebsite: formData.showOnWebsite,
          categoryId: finalCategoryId,
          aliases: formData.aliases,
          imageLabels: JSON.stringify(imageLabels),
          hasVariants,
          variants,
          images: JSON.stringify(imagePreviews), // Draft base64 representations
          isBarcodePrinted: generateBarcodeOnSave
        };
        
        const localRecord = await saveProductLocally(localData, tenantId);
        finalProduct = { ...localData, id: localRecord.id };

        // 2. Sync if not startup
        if (!isLocalMode) {
          try {
            const res = await storeOwnerAPI.createProduct(payload);
            // Mark synced in local DB
            await markProductSynced(localRecord.id);
            toast.success('Product added and synced successfully!');
          } catch (syncErr) {
            console.error('Sync failed:', syncErr);
            toast.warning('Product saved locally but failed to sync to server.');
          }
        } else {
          toast.success('Product added successfully to local database!');
        }

        localStorage.removeItem('productDraft');
        localStorage.removeItem('productDraftImages');
        localStorage.removeItem('productDraftLabels');
      }

      resetForm();
      if (onSuccess) {
        onSuccess(finalProduct);
      } else {
        onClose();
        fetchProducts();
      }
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
      
      const user = useAuthStore.getState().user;
      const tenantId = user?.tenantId || null;
      const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

      await deleteProductLocally(confirmDialog.id, tenantId);

      if (!isLocalMode) {
        try {
          await storeOwnerAPI.deleteProduct(confirmDialog.id);
          toast.success('Product deleted and synced');
        } catch (syncErr: any) {
          console.error('Delete sync failed:', syncErr);
          toast.success('Product deleted locally (was not synced to server)');
        }
      } else {
        toast.success('Product deleted from local database');
      }

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
    setImageLabels([]);
    setExistingImageLabels({});
    setDeletedImageIds([]);
    
    const draft = localStorage.getItem('productDraft');
    const generatedSku = `PRD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setIsCustomUnit(false);
    setCustomUnitInput('');
    setCustomVariantInputs({});
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData({ ...parsed, categoryId: parsed.categoryId || 'null', subcategoryId: parsed.subcategoryId || 'null', sku: parsed.sku || generatedSku, moq: parsed.moq || '' });
      } catch (e) {
        setFormData({ name: '', barcode: '', sku: generatedSku, price: '', cost: '', stockQuantity: '', lowStockLevel: '5', taxRate: '0', unit: '', brand: '', supplierId: 'null', moq: '', wholesalePrice: '', trackExpiry: false, expiryDate: "", trackBatch: false, showOnWebsite: false, categoryId: 'null', subcategoryId: 'null', aliases: '' });
      }
    } else {
      setFormData({ name: '', barcode: '', sku: generatedSku, price: '', cost: '', stockQuantity: '', lowStockLevel: '5', taxRate: '0', unit: '', brand: '', supplierId: 'null', moq: '', wholesalePrice: '', trackExpiry: false, expiryDate: "", trackBatch: false, showOnWebsite: false, categoryId: 'null', subcategoryId: 'null', aliases: '' });
    }
    setGenerateBarcodeOnSave(false);
    
    const draftImagesStr = localStorage.getItem('productDraftImages');
    const draftLabelsStr = localStorage.getItem('productDraftLabels');
    if (draftImagesStr) {
      try {
        const draftImages = JSON.parse(draftImagesStr);
        setImagePreviews(draftImages);
        
        let parsedLabels = Array(draftImages.length).fill('');
        if (draftLabelsStr) {
          try {
            parsedLabels = JSON.parse(draftLabelsStr);
          } catch(e) {}
        }
        setImageLabels(parsedLabels);

        const files = draftImages.map((img: string, idx: number) => dataURLtoFile(img, `draft-image-${idx}.png`)).filter(Boolean);
        setImageFiles(files);
      } catch (e) {
        console.warn('Failed to parse draft images');
      }
    }
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
      sku: product.sku || `PRD-${Math.floor(10000000 + Math.random() * 90000000)}`,
      price: product.price ? product.price.toString() : '',
      cost: product.cost ? product.cost.toString() : '',
      stockQuantity: product.stockQuantity !== undefined && product.stockQuantity !== null ? product.stockQuantity.toString() : '0',
      lowStockLevel: product.lowStockLevel !== undefined && product.lowStockLevel !== null ? product.lowStockLevel.toString() : '5',
      taxRate: product.taxRate !== undefined && product.taxRate !== null ? product.taxRate.toString() : '0',
      unit: product.unit || '',
      brand: product.brand || '',
      supplierId: product.supplierId ? product.supplierId.toString() : 'null',
      moq: product.moq ? product.moq.toString() : '',
      wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toString() : '',
      trackExpiry: product.trackExpiry === 1,
      expiryDate: product.expiryDate || "",
      trackBatch: product.trackBatch === 1,
      showOnWebsite: product.showOnWebsite === 1,
      categoryId: catId,
      subcategoryId: subcatId,
      aliases: product.aliases || ''
    });
    setGenerateBarcodeOnSave(product.isBarcodePrinted === true);
    // Set preview if image exists
    setImageFiles([]);
    setImagePreviews([]);
    setImageLabels([]);
    
    // Populate existing labels if available
    const existingLabels: Record<number, string> = {};
    if (product.images) {
       product.images.forEach((img: any) => {
         if (img.label) existingLabels[img.id] = img.label;
       });
    }
    setExistingImageLabels(existingLabels);
    
    setDeletedImageIds([]);
    setIsCustomUnit(false);
    setCustomUnitInput('');
    setCustomVariantInputs({});
  };

  useEffect(() => {
    if (isOpen) {
      if (initialEditingProduct) {
        openEditPanel(initialEditingProduct);
      } else {
        openAddPanel();
      }
    }
  }, [isOpen, initialEditingProduct]);

  const resetForm = () => {
    setEditingProduct(null);
    const generatedSku = `PRD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setFormData({ name: '', barcode: '', sku: generatedSku, price: '', cost: '', stockQuantity: '', lowStockLevel: '5', taxRate: '0', unit: '', brand: '', supplierId: 'null', moq: '', wholesalePrice: '', trackExpiry: false, expiryDate: "", trackBatch: false, showOnWebsite: false, categoryId: 'null', subcategoryId: 'null', aliases: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setImageLabels([]);
    setExistingImageLabels({});
    setDeletedImageIds([]);
    setIsCustomUnit(false);
    setCustomUnitInput('');
    setCustomVariantInputs({});
    setVariantOptions([{ name: '', values: [] }]);
    setHasVariants(false);
  };

  const generateBarcode = () => {
    const code = generateSystemBarcode(user?.tenantId || 0);
    setFormData({...formData, barcode: code});
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

  const handleSaveCustomUnit = async () => {
    const trimmed = customUnitInput.trim();
    if (!trimmed) {
      setIsCustomUnit(false);
      return;
    }

    const lower = trimmed.toLowerCase();
    const isDefault = DEFAULT_UNITS.some(u => u.value.toLowerCase() === lower);

    if (!isDefault && !customUnits.some(u => u.toLowerCase() === lower)) {
      const updated = [...customUnits, trimmed];
      setCustomUnits(updated);
      localStorage.setItem('product_custom_units', JSON.stringify(updated));
      try {
        await setSetting('product_custom_units', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist custom unit', e);
      }
    }

    setFormData(prev => ({ ...prev, unit: trimmed }));
    setCustomUnitInput('');
    setIsCustomUnit(false);
  };

  const handleDeleteCustomUnit = async (unitToDelete: string) => {
    const updated = customUnits.filter(u => u.toLowerCase() !== unitToDelete.toLowerCase());
    setCustomUnits(updated);
    localStorage.setItem('product_custom_units', JSON.stringify(updated));
    try {
      await setSetting('product_custom_units', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist custom units', e);
    }
    if (formData.unit.toLowerCase() === unitToDelete.toLowerCase()) {
      setFormData(prev => ({ ...prev, unit: '' }));
    }
  };

  const handleSaveCustomVariantOption = async (idx: number) => {
    const val = (customVariantInputs[idx] || '').trim();
    if (!val) {
      const newOpts = [...variantOptions];
      newOpts[idx].isCustom = false;
      setVariantOptions(newOpts);
      return;
    }

    const formattedVal = val.charAt(0).toUpperCase() + val.slice(1);
    const isDefault = DEFAULT_VARIANT_OPTIONS.some(o => o.toLowerCase() === formattedVal.toLowerCase());

    if (!isDefault && !customVariantOptions.some(o => o.toLowerCase() === formattedVal.toLowerCase())) {
      const updated = [...customVariantOptions, formattedVal];
      setCustomVariantOptions(updated);
      localStorage.setItem('product_custom_variants', JSON.stringify(updated));
      try {
        await setSetting('product_custom_variants', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist custom variant option', e);
      }
    }

    const newOpts = [...variantOptions];
    newOpts[idx].name = formattedVal;
    newOpts[idx].isCustom = false;
    if (formattedVal === 'Size' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['S', 'M', 'L', 'XL', 'XXL'];
    else if (formattedVal === 'Color' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['Red', 'Green', 'Blue', 'Black', 'White'];
    else if (formattedVal === 'Weight' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['100g', '250g', '500g', '1kg'];
    else if (formattedVal === 'Material' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['Cotton', 'Polyester', 'Silk', 'Leather'];
    else if (formattedVal === 'Style' && (!newOpts[idx].values || newOpts[idx].values.length === 0)) newOpts[idx].values = ['Casual', 'Formal', 'Sport', 'Vintage'];

    setVariantOptions(newOpts);
    setCustomVariantInputs(prev => ({ ...prev, [idx]: '' }));
  };

  const handleDeleteCustomVariantOption = async (optionToDelete: string) => {
    const updated = customVariantOptions.filter(o => o.toLowerCase() !== optionToDelete.toLowerCase());
    setCustomVariantOptions(updated);
    localStorage.setItem('product_custom_variants', JSON.stringify(updated));
    try {
      await setSetting('product_custom_variants', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist custom variant options', e);
    }

    const newOpts = variantOptions.map(opt => {
      if (opt.name.toLowerCase() === optionToDelete.toLowerCase()) {
        return { ...opt, name: '', values: [] };
      }
      return opt;
    });
    setVariantOptions(newOpts);
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

  // Auto-save product draft when not editing existing product
  useEffect(() => {
    if (editingProduct || !isOpen) return;
    const hasData = Boolean(
      formData.name ||
      formData.barcode ||
      formData.price ||
      formData.cost ||
      formData.stockQuantity ||
      formData.brand ||
      formData.aliases ||
      imagePreviews.length > 0
    );
    if (hasData) {
      try {
        localStorage.setItem('productDraft', JSON.stringify(formData));
        if (imagePreviews.length > 0) {
          localStorage.setItem('productDraftImages', JSON.stringify(imagePreviews));
          localStorage.setItem('productDraftLabels', JSON.stringify(imageLabels));
        }
      } catch (e) {}
    }
  }, [formData, imagePreviews, imageLabels, editingProduct, isOpen]);

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('productDraft');
      localStorage.removeItem('productDraftImages');
      localStorage.removeItem('productDraftLabels');
    } catch (e) {}
    resetForm();
    onClose();
  };

  const Panel = rightOffset === 'right-0' ? MainRightPanel : SecondaryRightPanel;

  return (
    <>
      {/* ──────────────── SLIDE OUT PANEL FOR ADD/EDIT ──────────────── */}
      <Panel
        isOpen={isOpen}
        onClose={handleClosePanel}
        onDiscard={handleDiscardChanges}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        subtitle={editingProduct ? 'Update pricing and inventory levels' : 'Configure product details and stock'}
        icon={Package}
        formId="productForm"
        isSubmitting={isSubmitting}
        saveText={editingProduct ? 'Update Product' : 'Save Product'}
      >
        <form id="productForm" onSubmit={handleSaveProduct} className="font-sans space-y-6">
                  
                  {/* 1. Basic Information */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => toggleSection('basic')}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.basic ? 'rounded-t-xl' : 'rounded-xl'}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Info className="w-4 h-4 text-blue-600" />
                        Basic Information
                      </span>
                      {openSections.basic ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.basic && (
                        <motion.div 
        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
      >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                            {/* Image Upload */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Images</label>
                                <span className="text-xs font-medium text-slate-500">
                                  {(editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(typeof i === 'string' ? i : i.id)).length || 0) + imageFiles.length} / 15
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                {editingProduct?.images?.filter((img: any) => !deletedImageIds.includes(typeof img === 'string' ? img : img.id)).map((img: any, idx: number) => {
                                  const imgSrc = typeof img === 'string' ? img : img.url;
                                  const imgId = typeof img === 'string' ? img : img.id;
                                  return (
                                  <div key={`existing-${imgId || idx}`} className="relative group w-full flex flex-col gap-1">
                                    <div className="w-full h-24 rounded-xl border border-slate-300 dark:border-slate-500 overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
                                      <img src={imgSrc} alt="Product" className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => setZoomedImage(imgSrc)} />
                                      <button type="button" onClick={() => setDeletedImageIds(prev => [...prev, imgId])} className="absolute -top-1 -right-1 m-2 p-1.5 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 shadow hover:shadow-md transition-all z-10"><X className="w-4 h-4" /></button>
                                    </div>
                                    <input type="text" placeholder="Variant/Color" value={existingImageLabels[imgId] || ''} onChange={(e) => setExistingImageLabels(prev => ({...prev, [imgId]: e.target.value}))} className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                  </div>
                                )})}
                                {imagePreviews.map((preview, idx) => (
                                  <div key={`new-${idx}`} className="relative group w-full flex flex-col gap-1">
                                    <div className="w-full h-24 rounded-xl border border-slate-300 dark:border-slate-500 overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
                                      <img src={preview} alt="New Preview" className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => setZoomedImage(preview)} />
                                      <button type="button" onClick={() => { setImagePreviews(prev => prev.filter((_, i) => i !== idx)); setImageFiles(prev => prev.filter((_, i) => i !== idx)); setImageLabels(prev => prev.filter((_, i) => i !== idx)); }} className="absolute -top-1 -right-1 m-2 p-1.5 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 shadow hover:shadow-md transition-all z-10"><X className="w-4 h-4" /></button>
                                    </div>
                                    <input type="text" placeholder="Variant/Color" value={imageLabels[idx] || ''} onChange={(e) => { const newLabels = [...imageLabels]; newLabels[idx] = e.target.value; setImageLabels(newLabels); }} className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                  </div>
                                ))}
                                {(() => {
                                  const totalImages = (editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(typeof i === 'string' ? i : i.id)).length || 0) + imageFiles.length;
                                  if (totalImages >= 15) return null;
                                  
                                  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(e.target.files || []); if (files.length === 0) return; const allowed = 15 - totalImages; if (allowed <= 0) { toast.warning('Maximum 15 images allowed.'); return; } const filesToAdd = files.slice(0, allowed); setImageFiles(prev => [...prev, ...filesToAdd]); setImageLabels(prev => [...prev, ...Array(filesToAdd.length).fill('')]); filesToAdd.forEach(file => { const reader = new FileReader(); reader.onloadend = () => { setImagePreviews(prev => [...prev, reader.result as string]); }; reader.readAsDataURL(file); }); };

                                  if (totalImages === 0) {
                                    return (
                                      <label className="col-span-3 w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                          <Plus className="w-5 h-5" />
                                        </div>
                                        <div className="text-center">
                                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                            Click or drag images to upload
                                          </span>
                                          <span className="text-[11px] font-medium text-slate-400">
                                            Supports PNG, JPG, SVG
                                          </span>
                                        </div>
                                      </label>
                                    );
                                  }

                                  return (
                                    <label className="w-full h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                      <Plus className="w-6 h-6 text-slate-400" />
                                      <span className="text-xs font-bold text-slate-500">Add</span>
                                    </label>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            <div className="space-y-2 relative">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Name <span className="text-red-500">*</span></label>
                              <input id="field-name" autoFocus value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" placeholder="e.g. Wireless Mouse" />
                              <ValidationErrorTooltip error={validationError} fieldId="field-name" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2 relative">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category <span className="text-red-500">*</span></label>
                                <CustomSelect id="field-category" value={formData.categoryId} onChange={val => setFormData({...formData, categoryId: val, subcategoryId: 'null'})} label="Select" options={categories.map(c => ({ value: c.id.toString(), label: c.name }))} actionButton={{ label: 'Add Category', onClick: () => { setIsAddBrandPanelOpen(false); setIsAddCategoryPanelOpen(true); } }} />
                                <ValidationErrorTooltip error={validationError} fieldId="field-category" />
                              </div>
                              <div className="space-y-2 relative">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subcategory</label>
                                <CustomSelect id="field-subcategory" value={formData.subcategoryId} onChange={val => setFormData({...formData, subcategoryId: val})} label="Select" disabled={formData.categoryId === 'null'} options={(categories.find(c => c.id.toString() === formData.categoryId)?.children || []).map((sc: any) => ({ value: sc.id.toString(), label: sc.name }))} actionButton={{ label: 'Add Subcategory', onClick: () => { setIsAddBrandPanelOpen(false); setIsAddCategoryPanelOpen(true); } }} />
                                <ValidationErrorTooltip error={validationError} fieldId="field-subcategory" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Brand</label>
                                <CustomSelect 
                                  value={formData.brand} 
                                  onChange={val => setFormData({...formData, brand: val})} 
                                  label="Select" 
                                  options={[
                                    ...brands.map(b => ({ value: b.name, label: b.name }))
                                  ]} 
                                  actionButton={{ label: 'Add Brand', onClick: () => { setIsAddCategoryPanelOpen(false); setIsAddBrandPanelOpen(true); } }}
                                />
                              </div>
                              <div className="space-y-2 relative">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Unit <span className="text-red-500">*</span></label>
                                {isCustomUnit ? (
                                  <div className="relative flex items-center">
                                    <input 
                                      id="field-unit"
                                      type="text" 
                                      autoFocus
                                      value={customUnitInput} 
                                      onChange={(e) => setCustomUnitInput(e.target.value)} 
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleSaveCustomUnit();
                                        } else if (e.key === 'Escape') {
                                          setIsCustomUnit(false);
                                          setCustomUnitInput('');
                                        }
                                      }}
                                      placeholder="Enter custom unit..." 
                                      className="w-full pl-4 pr-16 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                    />
                                    <div className="absolute right-2 flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={handleSaveCustomUnit}
                                        title="Save Unit"
                                        className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { setIsCustomUnit(false); setCustomUnitInput(''); }}
                                        title="Cancel"
                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <CustomSelect 
                                    id="field-unit"
                                    value={formData.unit} 
                                    onChange={val => setFormData({...formData, unit: val})} 
                                    label="Select" 
                                    options={[
                                      ...DEFAULT_UNITS,
                                      ...customUnits.map(u => ({
                                        value: u,
                                        label: u.charAt(0).toUpperCase() + u.slice(1),
                                        onDelete: () => handleDeleteCustomUnit(u)
                                      })),
                                      ...(formData.unit && !DEFAULT_UNITS.some(du => du.value.toLowerCase() === formData.unit.toLowerCase()) && !customUnits.some(cu => cu.toLowerCase() === formData.unit.toLowerCase()) ? [{
                                        value: formData.unit,
                                        label: formData.unit.charAt(0).toUpperCase() + formData.unit.slice(1),
                                        onDelete: () => handleDeleteCustomUnit(formData.unit)
                                      }] : [])
                                    ]} 
                                    actionButton={{ 
                                      label: 'Add Unit', 
                                      onClick: () => { 
                                        setIsCustomUnit(true); 
                                        setCustomUnitInput(''); 
                                      } 
                                    }}
                                  />
                                )}
                                <ValidationErrorTooltip error={validationError} fieldId="field-unit" />
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">This product has multiple options, like different sizes or colors</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${hasVariants ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${hasVariants ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={hasVariants} onChange={() => setHasVariants(!hasVariants)} />
                              </label>
                            </div>

                            {!editingProduct && (
                              <div className="mt-4">
                                <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Do you want to generate and print a barcode for this product now?</span>
                                  <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${generateBarcodeOnSave ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${generateBarcodeOnSave ? 'translate-x-5' : 'translate-x-0'}`} />
                                  </div>
                                  <input type="checkbox" className="hidden" checked={generateBarcodeOnSave} onChange={() => setGenerateBarcodeOnSave(!generateBarcodeOnSave)} />
                                </label>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                                    {/* 2. Variants Section */}
                  {hasVariants && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl relative z-50">
                    <button 
                      type="button" 
                      onClick={() => toggleSection('variants')}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.variants ? 'rounded-t-xl' : 'rounded-xl'}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Layers className="w-4 h-4 text-blue-600" />
                        Variants
                      </span>
                      {openSections.variants ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.variants && (
                        <motion.div 
        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
      >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                            

                            {hasVariants && (
                              <div className="space-y-4 pt-2 relative z-[60]">
                                <div className="space-y-3 relative z-[60]">
                                  {variantOptions.map((opt, idx) => {
                                    const variantSelectOptions: CustomSelectOption[] = [
                                      ...DEFAULT_VARIANT_OPTIONS.map(name => ({ label: name, value: name })),
                                      ...customVariantOptions.map(name => ({
                                        label: name,
                                        value: name,
                                        onDelete: () => handleDeleteCustomVariantOption(name)
                                      }))
                                    ];
                                    if (opt.name && !variantSelectOptions.some(s => s.value.toLowerCase() === opt.name.toLowerCase())) {
                                      variantSelectOptions.push({
                                        label: opt.name,
                                        value: opt.name,
                                        onDelete: () => handleDeleteCustomVariantOption(opt.name)
                                      });
                                    }

                                    return (
                                      <div key={idx} className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-500 rounded-xl relative" style={{ zIndex: 50 - idx }}>
                                        <div className="flex items-end gap-4 w-full">
                                          <div className="space-y-2 shrink-0" style={{ width: 'calc((100% + 1rem + 2px) / 2)' }}>
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Option Name</label>
                                              {opt.isCustom ? (
                                                <div className="relative flex items-center">
                                                  <input 
                                                    id={`field-variant-option-${idx}`}
                                                    type="text" 
                                                    autoFocus
                                                    value={customVariantInputs[idx] !== undefined ? customVariantInputs[idx] : opt.name} 
                                                    onChange={e => {
                                                      const newInputs = {...customVariantInputs};
                                                      newInputs[idx] = e.target.value;
                                                      setCustomVariantInputs(newInputs);
                                                    }}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (customVariantInputs[idx]?.trim()) {
                                                          const newOpts = [...variantOptions];
                                                          newOpts[idx] = { name: customVariantInputs[idx].trim(), values: [], isCustom: false };
                                                          setVariantOptions(newOpts);
                                                          const newInputs = {...customVariantInputs};
                                                          delete newInputs[idx];
                                                          setCustomVariantInputs(newInputs);
                                                        }
                                                      }
                                                    }}
                                                    placeholder="Enter option..." 
                                                    className="w-full pl-4 pr-16 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                                  />
                                                  <ValidationErrorTooltip error={validationError} fieldId={`field-variant-option-${idx}`} />
                                                  <div className="absolute right-2 flex items-center gap-1">
                                                    <button
                                                      type="button"
                                                      onClick={() => handleSaveCustomVariantOption(idx)}
                                                      title="Save Option"
                                                      className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all"
                                                    >
                                                      <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const newOpts = [...variantOptions];
                                                        newOpts[idx].isCustom = false;
                                                        setVariantOptions(newOpts);
                                                      }}
                                                      title="Cancel"
                                                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                                    >
                                                      <X className="w-4 h-4" />
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <CustomSelect 
                                                  id={`field-variant-option-${idx}`}
                                                  value={opt.name || ''} 
                                                  onChange={(val) => {
                                                    const newOpts = [...variantOptions];
                                                    newOpts[idx].name = val;
                                                    if (val === 'Size') newOpts[idx].values = ['S', 'M', 'L', 'XL', 'XXL'];
                                                    else if (val === 'Color') newOpts[idx].values = ['Red', 'Green', 'Blue', 'Black', 'White'];
                                                    else if (val === 'Weight') newOpts[idx].values = ['100g', '250g', '500g', '1kg'];
                                                    else if (val === 'Material') newOpts[idx].values = ['Cotton', 'Polyester', 'Silk', 'Leather'];
                                                    else if (val === 'Style') newOpts[idx].values = ['Casual', 'Formal', 'Sport', 'Vintage'];
                                                    else newOpts[idx].values = [];
                                                    setVariantOptions(newOpts);
                                                  }}
                                                  label="Select Option"
                                                  options={variantSelectOptions}
                                                  actionButton={{
                                                    label: 'Add Variant',
                                                    onClick: () => {
                                                      const newOpts = [...variantOptions];
                                                      newOpts[idx].isCustom = true;
                                                      setVariantOptions(newOpts);
                                                      setCustomVariantInputs(prev => ({ ...prev, [idx]: '' }));
                                                    }
                                                  }}
                                                />
                                              )}
                                          </div>
                                          <div className="flex items-end">
                                            <button type="button" onClick={() => setVariantOptions(variantOptions.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 p-2.5 rounded-xl transition-colors mb-0.5"><Trash2 className="w-5 h-5" /></button>
                                          </div>
                                        </div>
                                        <div className="space-y-2 mt-1 w-full">
                                          <label className="text-xs font-bold text-slate-500 block mb-1">Option Values (comma separated)</label>
                                          <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl min-h-[48px] items-center">
                                            {opt.values.map((v, vIdx) => (
                                              <span key={vIdx} className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {v}
                                                <button type="button" onClick={() => {
                                                  const newOpts = [...variantOptions];
                                                  newOpts[idx].values = newOpts[idx].values.filter((_, i) => i !== vIdx);
                                                  setVariantOptions(newOpts);
                                                }} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                              </span>
                                            ))}
                                            <input 
                                              type="text" 
                                              placeholder={opt.values.length === 0 ? "Type and press comma..." : ""} 
                                              className="flex-1 min-w-[120px] bg-transparent focus:outline-none text-sm font-medium dark:text-white"
                                              onKeyDown={(e) => {
                                                if (e.key === ',' || e.key === 'Enter') {
                                                  e.preventDefault();
                                                  const val = e.currentTarget.value.trim();
                                                  const cleanVal = val.endsWith(',') ? val.slice(0, -1).trim() : val;
                                                  if (cleanVal && !opt.values.includes(cleanVal)) {
                                                    const newOpts = [...variantOptions];
                                                    newOpts[idx].values = [...newOpts[idx].values, cleanVal];
                                                    setVariantOptions(newOpts);
                                                    e.currentTarget.value = '';
                                                  }
                                                }
                                              }}
                                              onChange={(e) => {
                                                if (e.target.value.includes(',')) {
                                                  const vals = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                                  if (vals.length > 0) {
                                                    const newOpts = [...variantOptions];
                                                    const newValuesToAdd = vals.filter(v => !newOpts[idx].values.includes(v));
                                                    newOpts[idx].values = [...newOpts[idx].values, ...newValuesToAdd];
                                                    setVariantOptions(newOpts);
                                                  }
                                                  e.target.value = '';
                                                }
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {variantOptions.length < 3 && (
                                    <button type="button" onClick={() => setVariantOptions([...variantOptions, {name: '', values: []}])} className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"><Plus className="w-4 h-4" /> {variantOptions.length === 0 ? 'Add Option' : 'Add another option'}</button>
                                  )}
                                </div>

                                {variants.length > 0 && (
                                  <div className="mt-6 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Variant Details</h3>
                                    {variants.map((v, i) => (
                                      <div key={i} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl overflow-hidden">
                                        <button 
                                          type="button" 
                                          onClick={() => setOpenVariantSections(prev => ({...prev, [i]: !prev[i]}))}
                                          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors outline-none"
                                        >
                                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">{v.name}</span>
                                          {openVariantSections[i] ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                        </button>
                                        <AnimatePresence>
                                          {openVariantSections[i] && (
                                            <motion.div 
                                              initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                              animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                                              exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                            >
                                              <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                    <div className="flex justify-between items-center h-6">
                                                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Barcode</label>
                                                      <button type="button" onClick={() => { const newV = [...variants]; newV[i].barcode = generateSystemBarcode(user?.tenantId || 0); setVariants(newV); }} className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded cursor-pointer">Generate</button>
                                                    </div>
                                                    <div className="relative">
                                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Barcode className="h-4 w-4" /></div>
                                                      <input id={`field-variant-barcode-${i}`} type="text" value={v.barcode || ''} onChange={e => { const newV = [...variants]; newV[i].barcode = e.target.value; setVariants(newV); }} placeholder="Barcode" className="w-full pl-9 pr-3 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" />
                                                      <ValidationErrorTooltip error={validationError} fieldId={`field-variant-barcode-${i}`} />
                                                    </div>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <div className="flex items-center h-6">
                                                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">SKU</label>
                                                    </div>
                                                    <input type="text" readOnly disabled value={v.sku || ''} onChange={e => { const newV = [...variants]; newV[i].sku = e.target.value; setVariants(newV); }} placeholder="SKU" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white opacity-50 cursor-not-allowed" />
                                                  </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2 relative">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Selling Price <span className="text-red-500">*</span></label>
                                                    <input id={`field-variant-price-${i}`} type="number" step="0.01" value={v.price || ''} onChange={e => { const newV = [...variants]; newV[i].price = e.target.value; setVariants(newV); }} placeholder="0.00" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" />
                                                    <ValidationErrorTooltip error={validationError} fieldId={`field-variant-price-${i}`} />
                                                  </div>
                                                  <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cost Price</label>
                                                    <input type="number" step="0.01" value={v.cost || ''} onChange={e => { const newV = [...variants]; newV[i].cost = e.target.value; setVariants(newV); }} placeholder="0.00" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" />
                                                  </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Opening Stock</label>
                                                    <input type="number" value={v.stockQuantity || ''} onChange={e => { const newV = [...variants]; newV[i].stockQuantity = e.target.value; setVariants(newV); }} placeholder="0" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" />
                                                  </div>
                                                  <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Low Stock Alert</label>
                                                    <div className="relative">
                                                      <input type="number" value={v.lowStockLevel || ''} onChange={e => { const newV = [...variants]; newV[i].lowStockLevel = e.target.value; setVariants(newV); }} placeholder="5" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white pr-16" />
                                                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                        <span className="text-xs font-bold text-slate-400">{formData.unit}</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">MOQ</label>
                                                    <div className="relative">
                                                      <input type="number" min="0" value={v.moq || ''} onChange={e => { const newV = [...variants]; newV[i].moq = e.target.value; setVariants(newV); }} placeholder="0" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white pr-16" />
                                                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                        <span className="text-xs font-bold text-slate-400">{formData.unit}</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Wholesale Price</label>
                                                    <input type="number" step="0.01" value={v.wholesalePrice || ''} onChange={e => { const newV = [...variants]; newV[i].wholesalePrice = e.target.value; setVariants(newV); }} placeholder="0.00" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" />
                                                  </div>
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  )}

                  {/* 3. Pricing & Inventory */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => toggleSection('pricing')}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.pricing ? 'rounded-t-xl' : 'rounded-xl'}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <CircleDollarSign className="w-4 h-4 text-blue-600" />
                        Pricing & Inventory
                      </span>
                      {openSections.pricing ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.pricing && (
                        <motion.div 
        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
      >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                            {!hasVariants && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2 relative">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Selling Price <span className="text-red-500">*</span></label>
                                    <input id="field-price" type="number" step="0.01" disabled={hasVariants} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white disabled:opacity-50" placeholder={hasVariants ? "Set in variants section" : "0.00"} />
                                    <ValidationErrorTooltip error={validationError} fieldId="field-price" position="bottom" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cost Price</label>
                                    <input type="number" step="0.01" disabled={hasVariants} value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white disabled:opacity-50" placeholder={hasVariants ? "Set in variants section" : "0.00"} />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Opening Stock</label>
                                    <input type="number" min="0" disabled={hasVariants} value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white disabled:opacity-50" placeholder={hasVariants ? "Set in variants section" : "e.g. 100"} />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Low Stock Alert Level</label>
                                    <div className="relative">
                                      <input type="number" min="0" value={formData.lowStockLevel || ''} onChange={e => setFormData({...formData, lowStockLevel: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white pr-16" placeholder="e.g. 5" />
                                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <span className="text-xs font-bold text-slate-400">{formData.unit}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                            
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tax Rate (%)</label>
                              <input type="number" step="0.01" min="0" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" placeholder="e.g. 18" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 4. Identification */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => toggleSection('identification')}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.identification ? 'rounded-t-xl' : 'rounded-xl'}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Barcode className="w-4 h-4 text-blue-600" />
                        Identification
                      </span>
                      {openSections.identification ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.identification && (
                        <motion.div 
        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
      >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                            {!hasVariants && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center h-6">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Barcode</label>
                                    <button type="button" onClick={generateBarcode} className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded cursor-pointer">Generate</button>
                                  </div>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Barcode className="h-4 w-4" /></div>
                                    <input id="field-barcode" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" placeholder="Scan/Enter Barcode" />
                                    <ValidationErrorTooltip error={validationError} fieldId="field-barcode" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center h-6">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">SKU</label>
                                  </div>
                                  <input readOnly disabled value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white opacity-50 cursor-not-allowed" placeholder="Product Code" />
                                </div>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Search Aliases (Keywords)</label>
                              <div className="flex flex-wrap gap-2 p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl min-h-[48px] items-center focus-within:ring-2 focus-within:ring-blue-500">
                                {formData.aliases.split(',').map(s => s.trim()).filter(s => s).map((alias, aIdx) => (
                                  <span key={aIdx} className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {alias}
                                    <button type="button" onClick={() => {
                                      const newAliases = formData.aliases.split(',').map(s => s.trim()).filter(s => s);
                                      newAliases.splice(aIdx, 1);
                                      setFormData({...formData, aliases: newAliases.join(', ')});
                                    }} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                  </span>
                                ))}
                                <input 
                                  type="text" 
                                  placeholder={formData.aliases.split(',').filter(s => s.trim()).length === 0 ? "Type and press comma..." : ""} 
                                  className="flex-1 min-w-[120px] bg-transparent focus:outline-none text-sm font-medium dark:text-white px-2"
                                  onKeyDown={(e) => {
                                    if (e.key === ',' || e.key === 'Enter') {
                                      e.preventDefault();
                                      const val = e.currentTarget.value.trim();
                                      const cleanVal = val.endsWith(',') ? val.slice(0, -1).trim() : val;
                                      if (cleanVal) {
                                        const currentAliases = formData.aliases.split(',').map(s => s.trim()).filter(s => s);
                                        if (currentAliases.length >= 5) {
                                          toast.warning('Maximum 5 aliases allowed');
                                          e.currentTarget.value = '';
                                          return;
                                        }
                                        if (!currentAliases.includes(cleanVal)) {
                                          setFormData({...formData, aliases: [...currentAliases, cleanVal].join(', ')});
                                        }
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                  onChange={(e) => {
                                    if (e.target.value.includes(',')) {
                                      const vals = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                      if (vals.length > 0) {
                                        const currentAliases = formData.aliases.split(',').map(s => s.trim()).filter(s => s);
                                        const availableSlots = Math.max(0, 5 - currentAliases.length);
                                        const newValuesToAdd = vals.filter(v => !currentAliases.includes(v)).slice(0, availableSlots);
                                        
                                        if (newValuesToAdd.length > 0) {
                                          setFormData({...formData, aliases: [...currentAliases, ...newValuesToAdd].join(', ')});
                                        }
                                        if (vals.length > availableSlots) {
                                          toast.warning('Maximum 5 aliases allowed');
                                        }
                                      }
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  

                  {/* 5. Advanced Settings */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => toggleSection('advanced')}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.advanced ? 'rounded-t-xl' : 'rounded-xl'}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Settings className="w-4 h-4 text-blue-600" />
                        Advanced Settings
                      </span>
                      {openSections.advanced ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.advanced && (
                        <motion.div 
        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
      >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">Supplier {isStartup && <Lock className="w-3.5 h-3.5 text-amber-500" />}</label>
                              <div className="relative">
                                {(() => {
                                  const selectedSupplier = suppliers.find(s => String(s.id) === String(formData.supplierId));
                                  return (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isStartup) {
                                            setShowUpgradeModal(true);
                                            return;
                                          }
                                          setIsSupplierPanelOpen(prev => !prev);
                                          setSupplierSearch('');
                                        }}
                                        className={`w-full flex items-center justify-between px-4 h-11 bg-slate-100 dark:bg-slate-900 border rounded-xl font-medium text-sm transition-all text-left ${
                                          selectedSupplier 
                                            ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-900/10 text-slate-900 dark:text-white' 
                                            : isStartup ? 'border-amber-200/50 bg-amber-50/10 opacity-70' : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                          <Building2 className={`w-4 h-4 shrink-0 ${isStartup ? 'text-amber-500' : 'text-blue-600'}`} />
                                          <span className="truncate">
                                            {selectedSupplier ? selectedSupplier.name : 'Select Supplier'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          {selectedSupplier && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                              1 Selected
                                            </span>
                                          )}
                                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSupplierPanelOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                      </button>

                                      {/* Supplier Preview Card */}
                                      {selectedSupplier && (
                                        <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center justify-between">
                                          <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                              {selectedSupplier.logo || selectedSupplier.image ? (
                                                <img src={selectedSupplier.logo || selectedSupplier.image} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                <Building2 className="w-5 h-5 text-blue-500" />
                                              )}
                                            </div>
                                            <div className="min-w-0">
                                              <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{selectedSupplier.name}</h4>
                                              <p className="text-xs text-slate-500 truncate">{selectedSupplier.contactPerson || selectedSupplier.phone || 'Registered Supplier'}</p>
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setFormData({...formData, supplierId: 'null'});
                                            }}
                                            className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
                                            title="Remove supplier"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            {!hasVariants && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">MOQ</label>
                                  <div className="relative">
                                    <input type="number" min="0" value={formData.moq || ''} onChange={e => setFormData({...formData, moq: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white pr-16" placeholder="0" />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                      <span className="text-xs font-bold text-slate-400">{formData.unit}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Wholesale Price</label>
                                  <input type="number" step="0.01" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" placeholder="0.00" />
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                              <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Track Expiry Date</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${formData.trackExpiry ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.trackExpiry ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={formData.trackExpiry} onChange={(e) => setFormData({...formData, trackExpiry: e.target.checked})} />
                              </label>
                              <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Track Batch/Lot</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${formData.trackBatch ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.trackBatch ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={formData.trackBatch} onChange={(e) => setFormData({...formData, trackBatch: e.target.checked})} />
                              </label>
                            </div>
                            
                            {/* Expiry Date input removed: Date is tracked in Inventory instead */}
                            
                            {isProOrEnterprise && (
                              <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mt-4">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Show in E-Store (Show this product on your e-commerce website)</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${formData.showOnWebsite ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.showOnWebsite ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={formData.showOnWebsite} onChange={(e) => setFormData({...formData, showOnWebsite: e.target.checked})} />
                              </label>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
      </Panel>
            
      <SecondaryRightPanel
        isOpen={showBarcodePanel}
        onClose={() => {
          if (hasVariants && activeVariantIndex !== null) {
            setOpenVariantSections(prev => ({ ...prev, [activeVariantIndex]: false }));
          } else {
            setOpenSections(prev => ({ ...prev, identification: false }));
          }
        }}
        title="Barcode Config"
        icon={Barcode}
        hideFooter={true}
      >
        <div className="space-y-6">
                  {/* Live Preview */}
                  {formData.barcode ? (
                    compositeImageUrl ? (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                        <img src={compositeImageUrl} alt="Barcode Preview" className="max-w-full object-contain bg-white p-4 rounded-xl shadow-sm" />
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 text-center">
                        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mb-3" />
                        <p className="text-sm text-slate-500 font-medium">Generating preview...</p>
                      </div>
                    )
                  ) : null}
                  
                  {/* Print Quantity */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Print Quantity</label>
                    <input type="number" min="1" max="1000" value={printQuantity} onChange={e => setPrintQuantity(parseInt(e.target.value) || 1)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" />
                  </div>
                  
                  {/* Advanced Configuration Accordion */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <button type="button" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">Advanced Config</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isAdvancedOpen && (
                      <div className="p-4 space-y-5 border-t border-slate-200 dark:border-slate-700">
                        {/* Barcode Type */}
                        <div className="space-y-2 relative">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Barcode Type</label>
                          <button type="button" onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-950 transition-colors">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{BARCODE_TYPES.find(t => t.value === symbology)?.label}</span>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          </button>
                          {isTypeDropdownOpen && (
                            <div className="absolute z-10 top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                              {BARCODE_TYPES.map(type => (
                                <button key={type.value} type="button" onClick={() => { setSymbology(type.value); setIsTypeDropdownOpen(false); }} className="w-full px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Scale */}
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Scale (Size)</label>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{barcodeScale}x</span>
                          </div>
                          <input type="range" min="1" max="5" step="1" value={barcodeScale} onChange={(e) => setBarcodeScale(parseInt(e.target.value))} className="w-full accent-blue-600" />
                        </div>
                        
                        {/* Height */}
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Height</label>
                          <input type="range" min="5" max="50" value={barcodeHeight} onChange={(e) => setBarcodeHeight(parseInt(e.target.value))} className="w-full accent-blue-600" />
                          <div className="text-right text-xs text-slate-500 font-medium">{barcodeHeight}mm</div>
                        </div>
                        
                        {/* Display Options */}
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Display Options</label>
                          <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/70">
                              <div className={`w-10 h-5 rounded-full relative transition-colors ${showStoreName ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showStoreName ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                              <input type="checkbox" className="hidden" checked={showStoreName} onChange={() => setShowStoreName(!showStoreName)} />
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Show Store Name</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/70">
                              <div className={`w-10 h-5 rounded-full relative transition-colors ${showPrice ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showPrice ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                              <input type="checkbox" className="hidden" checked={showPrice} onChange={() => setShowPrice(!showPrice)} />
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Show Price Label</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/70">
                              <div className={`w-10 h-5 rounded-full relative transition-colors ${showDate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showDate ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                              <input type="checkbox" className="hidden" checked={showDate} onChange={() => setShowDate(!showDate)} />
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Show Date</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Print Button */}
                  <div className="space-y-2">
                    <button 
                      type="button" 
                      onClick={handlePrintBarcode} 
                      disabled={!activeBarcode || (symbology === 'ean13' && activeBarcode.length !== 13)}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                      <Printer className="w-5 h-5" />
                      Print Label
                    </button>
                    {symbology === 'ean13' && activeBarcode && activeBarcode.length !== 13 && (
                      <p className="text-xs text-red-500 font-bold text-center">EAN-13 barcodes must be exactly 13 digits.</p>
                    )}
                  </div>
        </div>
      </SecondaryRightPanel>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard Changes?"
        message="Are you sure you want to discard your changes? All unsaved product inputs will be cleared."
        confirmText="Discard"
        cancelText="Keep Editing"
        type="warning"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          onClose();
        }}
        onCancel={() => setShowDiscardConfirm(false)}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Supplier Management"
      />
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
          onClick={() => setZoomedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center bg-slate-900 p-2 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomedImage(null)}
              className="absolute -top-4 -right-4 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomedImage} alt="Zoomed Product" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </motion.div>
        </div>
      )}

      {/* Quick Add Category Panel */}
      <CategoryPanel 
        isOpen={isAddCategoryPanelOpen} 
        onClose={() => setIsAddCategoryPanelOpen(false)} 
        onSuccess={(newCat) => {
          if (!newCat) return;
          // Ensure new category is added locally to dropdown
          fetchInitialData(); 
          setFormData(prev => ({ ...prev, categoryId: newCat.id.toString(), subcategoryId: 'null' }));
        }} 
        flatCategories={(() => {
          const flatten = (nodes: any[]): any[] => {
            let res: any[] = [];
            nodes.forEach(n => {
              res.push(n);
              if (n.children) res = [...res, ...flatten(n.children)];
            });
            return res;
          };
          return flatten(categories);
        })()}
        className="right-[448px] border-l border-r z-40 hidden lg:flex" 
      />

      {/* Quick Add Brand Panel */}
      <BrandPanel 
        isOpen={isAddBrandPanelOpen} 
        onClose={() => setIsAddBrandPanelOpen(false)} 
        onSuccess={(newBrand) => {
          if (!newBrand) return;
          fetchInitialData();
          setFormData(prev => ({ ...prev, brand: newBrand.name }));
        }}
        className="right-[448px] border-l border-r z-40 hidden lg:flex" 
      />

      <SelectSupplierPanel
        isOpen={isSupplierPanelOpen}
        onClose={() => setIsSupplierPanelOpen(false)}
        onSelect={(supplierId) => setFormData({...formData, supplierId: supplierId || 'null'})}
        selectedSupplierId={formData.supplierId}
        suppliers={suppliers}
        setSuppliers={setSuppliers}
      />
    </>
  );
}

export function AddProductPanel(props: any) {
  return (
    <Suspense fallback={null}>
      <AddProductPanelInner {...props} />
    </Suspense>
  );
}
