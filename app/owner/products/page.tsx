'use client';
import { Suspense } from 'react';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { generateSystemBarcode } from '@/lib/barcode-utils';
import { generateSKU } from '@/lib/sku-generator';
import { Plus, Search, Trash2, Package, Tag, Filter, X, Barcode, Edit, List, LayoutGrid, Maximize, Minimize, Copy, ChevronDown, ChevronUp, CircleDollarSign, Printer, Download, Settings } from 'lucide-react';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { useAuthStore } from '@/lib/auth-store';
import { saveProductLocally, markProductSynced, getLocalProducts, updateProductLocally, deleteProductLocally, getLocalBrands, getLocalCategories, getProductLogs, saveBarcodeHistory } from '@/lib/local-services';

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

function ProductHistoryView({ product, onBack }: { product: any, onBack: () => void }) {
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
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {product.name}
            </h2>
            <p className="text-sm font-medium text-slate-500">Product Details & History</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-6 space-y-6 no-scrollbar">
        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Box 1: Identification */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Barcode className="w-4 h-4" /> Identification</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-slate-500 mb-0.5">Barcode</p><p className="font-bold text-slate-900 dark:text-white text-sm">{product.barcode || <span className="text-slate-400 italic font-normal">N/A</span>}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">SKU</p><p className="font-bold text-slate-900 dark:text-white text-sm">{product.sku || <span className="text-slate-400 italic font-normal">N/A</span>}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">System ID</p><p className="font-bold text-slate-900 dark:text-white text-sm">{product.id}</p></div>
              {product.aliases && <div><p className="text-xs text-slate-500 mb-0.5">Aliases</p><p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{product.aliases}</p></div>}
            </div>
          </div>
          
          {/* Box 2: Organization */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Organization</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-slate-500 mb-0.5">Brand</p><p className="font-bold text-slate-900 dark:text-white text-sm">{product.brand || <span className="text-slate-400 italic font-normal">N/A</span>}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Unit</p><p className="font-bold text-slate-900 dark:text-white text-sm uppercase">{product.unit || 'pieces'}</p></div>
              <div><p className="text-xs text-slate-500 mb-0.5">Website Visibility</p><p className={`font-bold text-sm ${product.showOnWebsite ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{product.showOnWebsite ? 'Published' : 'Hidden (POS Only)'}</p></div>
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
    </div>
  );
}

function StoreProductsPageContent() {
  const { user } = useAuthStore();
  const isProOrEnterprise = user?.tenant?.plan === 'PRO' || user?.tenant?.plan === 'ENTERPRISE';
  const isStartup = user?.tenant?.plan === 'STARTUP';

  const [products, setProducts] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
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
    sku: '',
    price: '', 
    cost: '',
    stockQuantity: '',
    lowStockLevel: '5',
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
  const [openSections, setOpenSections] = useState({ basic: true, pricing: true, identification: false, variants: false, advanced: false });

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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variantOptions, setVariantOptions] = useState<{name: string, values: string[], isCustom?: boolean}[]>([{ name: 'Size', values: [] }]);
  const [variants, setVariants] = useState<any[]>([]);

  const toggleSection = (section: 'basic' | 'pricing' | 'identification' | 'variants' | 'advanced') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const focusField = (id: string, sectionKey?: string) => {
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
    if (!editingProduct && isPanelOpen) {
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
  }, [formData, editingProduct, isPanelOpen, imagePreviews]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const user = useAuthStore.getState().user;
      const isStartup = user?.tenant?.plan === 'STARTUP';
      
      let prodData: any[] = [];
      let brandsData: any[] = [];
      let catsData: any[] = [];
      try {
        if (isStartup) {
          prodData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1);
          brandsData = await getLocalBrands(user?.tenantId || null);
          catsData = await getLocalCategories(user?.tenantId || null);
        } else {
          const prodRes = await storeOwnerAPI.getProducts();
          prodData = prodRes.data;
          const brandRes = await storeOwnerAPI.getBrands().catch(() => ({ data: [] }));
          brandsData = brandRes.data || [];
          const catRes = await storeOwnerAPI.getCategories().catch(() => ({ data: [] }));
          catsData = catRes.data || [];
        }
      } catch(e) {
        // Fallback to local DB if backend fetch fails
        prodData = await getLocalProducts(user?.tenantId || null, user?.branchId || 1);
        brandsData = await getLocalBrands(user?.tenantId || null);
        catsData = await getLocalCategories(user?.tenantId || null);
      }

      setProducts(prodData);
      setCategories(catsData);
      setBrands(brandsData);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const user = useAuthStore.getState().user;
      const isStartup = user?.tenant?.plan === 'STARTUP';
      
      if (isStartup) {
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
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      focusField('field-name', 'basic');
      return;
    }
    if (!hasVariants && !formData.price) {
      toast.error('Selling Price is required');
      focusField('field-price', 'pricing');
      return;
    }
    if (hasVariants) {
      if (variants.length < 2) {
        toast.error('At least two variants must be created (e.g. Size S and M)');
        focusField('field-variant-option-0', 'variants');
        return;
      }
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.price) {
          toast.error(`Selling price is required for variant: ${v.name}`);
          if (!openVariantSections[i]) {
            setOpenVariantSections(prev => ({ ...prev, [i]: true }));
            setTimeout(() => focusField(`field-variant-price-${i}`, 'variants'), 300);
          } else {
            focusField(`field-variant-price-${i}`, 'variants');
          }
          return;
        }
      }
    }
    if (formData.categoryId === 'null') {
      toast.error('Category is required');
      focusField('field-category', 'basic');
      return;
    }
    if (!formData.unit) {
      toast.error('Unit is required');
      focusField('field-unit', 'basic');
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
        const isStartup = user?.tenant?.plan === 'STARTUP';

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
          images: JSON.stringify(imagePreviews)
        };

        await updateProductLocally(editingProduct.id, localData, tenantId);

        if (!isStartup) {
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
        const isStartup = user?.tenant?.plan === 'STARTUP';

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
          images: JSON.stringify(imagePreviews) // Draft base64 representations
        };
        
        const localRecord = await saveProductLocally(localData, tenantId);

        // 2. Sync if not startup
        if (!isStartup) {
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
      
      const user = useAuthStore.getState().user;
      const tenantId = user?.tenantId || null;
      const isStartup = user?.tenant?.plan === 'STARTUP';

      await deleteProductLocally(confirmDialog.id, tenantId);

      if (!isStartup) {
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
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    const generatedSku = `PRD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setFormData({ name: '', barcode: '', sku: generatedSku, price: '', cost: '', stockQuantity: '', lowStockLevel: '5', taxRate: '0', unit: '', brand: '', supplierId: 'null', moq: '', wholesalePrice: '', trackExpiry: false, expiryDate: "", trackBatch: false, showOnWebsite: false, categoryId: 'null', subcategoryId: 'null', aliases: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setImageLabels([]);
    setExistingImageLabels({});
    setDeletedImageIds([]);
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
              <div className="grid grid-cols-[300px_180px_200px_200px_150px_150px_120px_100px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Product Name</div>
                <div>Category & Brand</div>
                <div>Identifiers</div>
                <div>Pricing</div>
                <div>Inventory</div>
                <div>Tracking</div>
                <div className="text-center">Visibility</div>
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
                  <div key={p.id} onClick={() => setViewingProduct(p)} className="cursor-pointer grid grid-cols-[300px_180px_200px_200px_150px_150px_120px_100px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 overflow-hidden">
                        {p.images && p.images.length > 0 ? (
                          <img src={typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate" title={p.name}>{p.name}</h3>
                        {p.aliases && <p className="text-[10px] text-slate-500 truncate" title={p.aliases}>Aliases: {p.aliases}</p>}
                      </div>
                    </div>

                    <div className="min-w-0 flex flex-col justify-center">
                      {catInfo ? (
                        <>
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{catInfo.main}</span>
                          {catInfo.sub && <span className="text-xs text-slate-500 truncate">{catInfo.sub}</span>}
                        </>
                      ) : <span className="text-slate-400 italic text-sm">None</span>}
                      {p.brand && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-1.5 py-0.5 rounded w-max mt-1 truncate max-w-full">{p.brand}</span>}
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-0 justify-center">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm truncate group/sku">
                        <span className="truncate">SKU: {p.sku || <span className="text-slate-400 italic font-normal text-xs">N/A</span>}</span>
                        {p.sku && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.sku); toast.success('SKU copied!'); }}
                            className="p-1 opacity-0 group-hover/sku:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0"
                            title="Copy SKU"
                          >
                            <Copy className="w-3 h-3 text-slate-400 hover:text-blue-500" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs truncate group/barcode">
                        <Barcode className="w-3 h-3 shrink-0" />
                        <span className="truncate">{p.barcode || <span className="text-slate-400 italic font-normal text-[10px]">N/A</span>}</span>
                        {p.barcode && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.barcode); toast.success('Barcode copied!'); }}
                            className="p-1 opacity-0 group-hover/barcode:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0"
                            title="Copy Barcode"
                          >
                            <Copy className="w-3 h-3 text-slate-400 hover:text-blue-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0 justify-center text-xs">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-slate-500">Price:</span>
                        <span className="font-black text-blue-600 dark:text-blue-400">Rs. {Number(p.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-slate-500">Cost:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Rs. {Number(p.cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-slate-500">W/S:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-500">Rs. {Number(p.wholesalePrice || 0).toFixed(2)}</span>
                      </div>
                      {p.taxRate && Number(p.taxRate) > 0 ? (
                         <div className="flex justify-between items-center w-full mt-0.5 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                           <span className="text-slate-500 text-[10px]">Tax:</span>
                           <span className="font-bold text-slate-500 text-[10px]">{p.taxRate}%</span>
                         </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 justify-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] uppercase font-bold w-max ${
                        p.stock <= 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                        p.stock <= (p.lowStockLevel || 5) ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}>
                         Stock: {formatStock(p.stock)} {p.unit}
                      </span>
                      {p.moq && Number(p.moq) > 0 && (
                        <span className="text-[10px] text-slate-500 font-medium">MOQ: <span className="font-bold text-slate-700 dark:text-slate-300">{p.moq}</span></span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-0 justify-center text-[10px]">
                      {p.trackExpiry ? (
                         <div className="flex flex-col gap-0.5">
                           <span className="text-slate-500">Expiry Tracked</span>
                           {p.expiryDate && <span className="font-bold text-slate-700 dark:text-slate-300">{p.expiryDate}</span>}
                         </div>
                      ) : p.trackBatch ? (
                         <span className="text-slate-500">Batch Tracked</span>
                      ) : (
                         <span className="text-slate-400 italic">No Tracking</span>
                      )}
                    </div>

                    <div className="flex justify-center items-center">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${
                        p.showOnWebsite ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {p.showOnWebsite ? 'Published' : 'POS Only'}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditPanel(p); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
                      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                         {p.images && p.images.length > 0 ? <img src={typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <Package className="w-8 h-8 opacity-50" />}
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
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <p className="text-[10px] font-bold text-slate-500 truncate">{catInfo ? (catInfo.sub || catInfo.main) : 'No Category'}</p>
                            {p.brand && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 px-1.5 py-0.5 rounded truncate max-w-[80px] shrink-0">{p.brand}</span>}
                          </div>
                          <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1.5 line-clamp-2" title={p.name}>{p.name}</h3>
                          
                          <div className="flex flex-col gap-0.5 mt-2">
                            {p.sku && (
                              <div className="flex items-center justify-between group/sku">
                                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate"><span className="text-slate-400">SKU:</span> {p.sku}</p>
                                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.sku); toast.success('SKU copied!'); }} className="p-0.5 opacity-0 group-hover/sku:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0" title="Copy SKU"><Copy className="w-2.5 h-2.5 text-slate-400" /></button>
                              </div>
                            )}
                            {p.barcode && (
                              <div className="flex items-center justify-between group/barcode">
                                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate"><Barcode className="w-3 h-3 text-slate-400" /> {p.barcode}</p>
                                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.barcode); toast.success('Barcode copied!'); }} className="p-0.5 opacity-0 group-hover/barcode:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all shrink-0" title="Copy Barcode"><Copy className="w-2.5 h-2.5 text-slate-400" /></button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 justify-end">
                          <div className="flex justify-between items-end">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                            <span className="font-black text-blue-600 dark:text-blue-400 text-base leading-none">Rs. {Number(p.price || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cost</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Rs. {Number(p.cost || 0).toFixed(2)}</span>
                          </div>
                          {(Number(p.wholesalePrice) > 0) && (
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">W/S</span>
                              <span className="font-bold text-amber-600 dark:text-amber-500 text-xs">Rs. {Number(p.wholesalePrice).toFixed(2)}</span>
                            </div>
                          )}
                          {(Number(p.moq) > 0) && (
                            <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-50 dark:border-slate-800/50">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">MOQ</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{p.moq}</span>
                            </div>
                          )}
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">To</label>
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  
                  {/* 1. Basic Information */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => toggleSection('basic')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none"
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Basic Information</span>
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
                                  {(editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length} / 15
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                {editingProduct?.images?.filter((img: any) => !deletedImageIds.includes(img.id)).map((img: any, idx: number) => (
                                  <div key={`existing-${img.id || idx}`} className="relative group w-full flex flex-col gap-1">
                                    <div className="w-full h-24 rounded-xl border border-slate-300 dark:border-slate-500 overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
                                      <img src={img.url} alt="Product" className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => setZoomedImage(img.url)} />
                                      <button type="button" onClick={() => setDeletedImageIds(prev => [...prev, img.id])} className="absolute -top-1 -right-1 m-2 p-1.5 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 shadow hover:shadow-md transition-all z-10"><X className="w-4 h-4" /></button>
                                    </div>
                                    <input type="text" placeholder="Variant/Color" value={existingImageLabels[img.id] || ''} onChange={(e) => setExistingImageLabels(prev => ({...prev, [img.id]: e.target.value}))} className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white" />
                                  </div>
                                ))}
                                {imagePreviews.map((preview, idx) => (
                                  <div key={`new-${idx}`} className="relative group w-full flex flex-col gap-1">
                                    <div className="w-full h-24 rounded-xl border border-slate-300 dark:border-slate-500 overflow-hidden bg-slate-50 dark:bg-slate-800 relative">
                                      <img src={preview} alt="New Preview" className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => setZoomedImage(preview)} />
                                      <button type="button" onClick={() => { setImagePreviews(prev => prev.filter((_, i) => i !== idx)); setImageFiles(prev => prev.filter((_, i) => i !== idx)); setImageLabels(prev => prev.filter((_, i) => i !== idx)); }} className="absolute -top-1 -right-1 m-2 p-1.5 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 shadow hover:shadow-md transition-all z-10"><X className="w-4 h-4" /></button>
                                    </div>
                                    <input type="text" placeholder="Variant/Color" value={imageLabels[idx] || ''} onChange={(e) => { const newLabels = [...imageLabels]; newLabels[idx] = e.target.value; setImageLabels(newLabels); }} className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white" />
                                  </div>
                                ))}
                                {((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) < 15 && (
                                  <label className="w-full h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); if (files.length === 0) return; const allowed = 15 - ((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length); if (allowed <= 0) { toast.warning('Maximum 15 images allowed.'); return; } const filesToAdd = files.slice(0, allowed); setImageFiles(prev => [...prev, ...filesToAdd]); setImageLabels(prev => [...prev, ...Array(filesToAdd.length).fill('')]); filesToAdd.forEach(file => { const reader = new FileReader(); reader.onloadend = () => { setImagePreviews(prev => [...prev, reader.result as string]); }; reader.readAsDataURL(file); }); }} />
                                    <Plus className="w-6 h-6 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500">Add</span>
                                  </label>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Product Name <span className="text-red-500">*</span></label>
                              <input id="field-name" required autoFocus value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" placeholder="e.g. Wireless Mouse" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                                <CustomSelect id="field-category" value={formData.categoryId} onChange={val => setFormData({...formData, categoryId: val, subcategoryId: 'null'})} label="Select" options={categories.map(c => ({ value: c.id.toString(), label: c.name }))} actionButton={{ label: 'Add Category', onClick: () => router.push('/owner/categories?action=add') }} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subcategory</label>
                                <CustomSelect value={formData.subcategoryId} onChange={val => setFormData({...formData, subcategoryId: val})} label="Select" disabled={formData.categoryId === 'null'} options={(categories.find(c => c.id.toString() === formData.categoryId)?.children || []).map((sc: any) => ({ value: sc.id.toString(), label: sc.name }))} actionButton={{ label: 'Add Subcategory', onClick: () => router.push('/owner/categories?action=add-sub') }} />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Brand</label>
                                <CustomSelect 
                                  value={formData.brand} 
                                  onChange={val => setFormData({...formData, brand: val})} 
                                  label="Select Brand" 
                                  options={[
                                    { value: '', label: 'None' },
                                    ...brands.map(b => ({ value: b.name, label: b.name }))
                                  ]} 
                                  actionButton={{ label: 'Add Brand', onClick: () => router.push('/owner/brands?action=add') }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Unit</label>
                                {isCustomUnit ? (
                                  <input 
                                    id="field-unit"
                                    type="text" 
                                    autoFocus
                                    value={formData.unit} 
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})} 
                                    placeholder="Enter custom unit..." 
                                    className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                  />
                                ) : (
                                  <CustomSelect 
                                    id="field-unit"
                                    value={formData.unit} 
                                    onChange={val => setFormData({...formData, unit: val})} 
                                    label="Select" 
                                    options={[ 
                                      {value: 'pieces', label: 'Pieces'}, 
                                      {value: 'kg', label: 'Kilograms (kg)'}, 
                                      {value: 'g', label: 'Grams (g)'}, 
                                      {value: 'l', label: 'Liters (L)'}, 
                                      {value: 'ml', label: 'Milliliters (ml)'}, 
                                      {value: 'boxes', label: 'Boxes'}, 
                                      {value: 'packets', label: 'Packets'} 
                                    ]} 
                                    actionButton={{ label: 'Add Unit', onClick: () => { setIsCustomUnit(true); setFormData({...formData, unit: ''}); } }}
                                  />
                                )}
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

                            <div className="mt-4">
                              <label className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Do you want to generate and print a barcode for this product now?</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${generateBarcodeOnSave ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${generateBarcodeOnSave ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={generateBarcodeOnSave} onChange={() => setGenerateBarcodeOnSave(!generateBarcodeOnSave)} />
                              </label>
                            </div>
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
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none"
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Variants</span>
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
                                    const PREDEFINED_VARIANTS = [
                                      { label: 'Size', value: 'Size' },
                                      { label: 'Color', value: 'Color' },
                                      { label: 'Material', value: 'Material' },
                                      { label: 'Style', value: 'Style' },
                                      { label: 'Weight', value: 'Weight' }
                                    ];
                                    const selectOptions = (opt.name && !PREDEFINED_VARIANTS.find(p => p.value === opt.name)) 
                                      ? [{label: opt.name, value: opt.name}, ...PREDEFINED_VARIANTS] 
                                      : PREDEFINED_VARIANTS;

                                    return (
                                      <div key={idx} className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-500 rounded-xl relative" style={{ zIndex: 50 - idx }}>
                                        <div className="grid grid-cols-2 gap-4 w-full">
                                          <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Option Name</label>
                                              {opt.isCustom ? (
                                                <input 
                                                  id={`field-variant-option-${idx}`}
                                                  type="text" 
                                                  autoFocus
                                                  value={opt.name} 
                                                  onChange={(e) => {
                                                    const newOpts = [...variantOptions];
                                                    newOpts[idx].name = e.target.value;
                                                    setVariantOptions(newOpts);
                                                  }} 
                                                  placeholder="Enter custom option name..." 
                                                  className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                                />
                                              ) : (
                                                <CustomSelect 
                                                  id={`field-variant-option-${idx}`}
                                                  value={opt.name || ''} 
                                                  label="Select Option"
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
                                                  options={selectOptions}
                                                  actionButton={{
                                                    label: 'Add Variant',
                                                    onClick: () => {
                                                      const newOpts = [...variantOptions];
                                                      newOpts[idx].isCustom = true;
                                                      newOpts[idx].name = '';
                                                      setVariantOptions(newOpts);
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
                                    <button type="button" onClick={() => setVariantOptions([...variantOptions, {name: '', values: []}])} className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"><Plus className="w-4 h-4" /> Add another option</button>
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
                                                      <input type="text" value={v.barcode || ''} onChange={e => { const newV = [...variants]; newV[i].barcode = e.target.value; setVariants(newV); }} placeholder="Barcode" className="w-full pl-9 pr-3 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" />
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
                                                  <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Selling Price <span className="text-red-500">*</span></label>
                                                    <input id={`field-variant-price-${i}`} type="number" step="0.01" required value={v.price || ''} onChange={e => { const newV = [...variants]; newV[i].price = e.target.value; setVariants(newV); }} placeholder="0.00" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" />
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
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none"
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Pricing & Inventory</span>
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
                                  <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Selling Price <span className="text-red-500">*</span></label>
                                    <input id="field-price" type="number" step="0.01" required={!hasVariants} disabled={hasVariants} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white disabled:opacity-50" placeholder={hasVariants ? "Set in variants section" : "0.00"} />
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
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none"
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Identification</span>
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
                                    <input value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" placeholder="Scan/Enter Barcode" />
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
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none"
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Advanced Settings</span>
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
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Supplier</label>
                              <CustomSelect value={formData.supplierId} onChange={val => setFormData({...formData, supplierId: val})} label="Select" options={[]} locked={isStartup} onLockedClick={() => setShowUpgradeModal(true)} />
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
                              <label className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Track Expiry</span>
                                
  <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
    <input type="checkbox" className="sr-only peer" checked={formData.trackExpiry} onChange={e => setFormData({...formData, trackExpiry: e.target.checked})} />
    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  </div>
                              </label>
                              <label className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Track Batch/Lot</span>
                                
  <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
    <input type="checkbox" className="sr-only peer" checked={formData.trackBatch} onChange={e => setFormData({...formData, trackBatch: e.target.checked})} />
    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  </div>
                              </label>
                            </div>
                            
                            {/* Expiry Date input removed: Date is tracked in Inventory instead */}
                            
                            {isProOrEnterprise && (
                              <div className={`flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl ${((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) === 0 ? 'opacity-50 grayscale' : ''}`}>
                                  <label htmlFor="showOnWebsite" className="flex flex-col cursor-pointer select-none">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Show in E-Store (Show this product on your e-commerce website)</span>
                                  {((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) === 0 && (
                                    <span className="text-xs text-red-500 font-semibold mt-0.5">Requires at least 1 image</span>
                                  )}
                                </label>
                                  
  <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
    <input type="checkbox" id="showOnWebsite" className="sr-only peer" checked={formData.showOnWebsite && ((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) > 0} disabled={((editingProduct?.images?.filter((i: any) => !deletedImageIds.includes(i.id)).length || 0) + imageFiles.length) === 0} onChange={e => setFormData({...formData, showOnWebsite: e.target.checked})} />
    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
  </div>
                                </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    form="productForm"
                    disabled={isSubmitting}
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Package className="w-5 h-5" />
                        {editingProduct ? 'Save Changes' : 'Save Product'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
            
            {showBarcodePanel && (
              <motion.div 
                initial={{ x: '100%', opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: '100%', opacity: 0 }} 
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 right-[448px] z-40 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl border-l border-r border-slate-200 dark:border-slate-800 flex flex-col hidden lg:flex"
              >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Barcode className="w-6 h-6 text-blue-600" />
                    Barcode Config
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
              </motion.div>
            )}
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

