'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Search, Trash2, Tag, Edit, X, Image as ImageIcon, List, LayoutGrid, Package, Maximize, Minimize, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { MainRightPanel } from '@/components/ui/right-panel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { useAuthStore } from '@/lib/auth-store';
import { saveBrandLocally, markBrandSynced, getLocalBrands, updateBrandLocally, deleteBrandLocally } from '@/lib/local-services';
import { isTauriEnv } from '@/lib/local-db';

// --- Brand Row Component ---
const BrandRow = ({ brand, onEdit, onDelete }: any) => {
  return (
    <div className={`grid grid-cols-12 gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group pl-6`}>
      <div className="col-span-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 overflow-hidden">
          {brand.image ? (
            <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
          ) : (
            <Tag className="w-5 h-5" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">{brand.name}</h3>
          {brand.description && <p className="text-xs text-slate-500 line-clamp-1">{brand.description}</p>}
          <p className="text-xs text-slate-400 mt-0.5">
            {brand.updatedAt && brand.updatedAt !== brand.createdAt 
              ? `Updated ${new Date(brand.updatedAt).toLocaleDateString()}` 
              : brand.createdAt ? `Added ${new Date(brand.createdAt).toLocaleDateString()}` : ''}
          </p>
        </div>
      </div>
      
      <div className="col-span-4 text-slate-500 text-sm font-medium flex items-center gap-2">
        <Package className="w-4 h-4 text-slate-400" />
        {brand._count?.products || 0} Items
      </div>

      <div className="col-span-2 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
        <button onClick={() => onEdit(brand)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Edit className="w-5 h-5" />
        </button>
        <button onClick={() => onDelete(brand.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

function BrandsPageContent() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // Validation Error State
  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);

  const triggerValidation = (sectionKey: string, fieldId: string, message: string) => {
    setValidationError({ field: fieldId, message });

    const focus = () => {
      setTimeout(() => {
        const el = document.getElementById(fieldId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 100);
    };

    if (sectionKey && !openSections[sectionKey as keyof typeof openSections]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
      setTimeout(focus, 300);
    } else {
      focus();
    }

    setTimeout(() => setValidationError(null), 3500);
  };

  const [formData, setFormData] = useState({ 
    name: '', 
    description: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState({
    basic: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => {
      const next = { basic: false };
      next[section] = true;
      if (prev[section]) {
        next[section] = false;
      }
      return next;
    });
  };

  useEffect(() => {
    fetchData();
    const handleReset = () => fetchData();
    window.addEventListener('cmart_database_reset', handleReset);
    return () => window.removeEventListener('cmart_database_reset', handleReset);
  }, []);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsPanelOpen(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = useAuthStore.getState().user;
      const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';
      
      let data = [];

      try {
        if (isLocalMode) {
          data = await getLocalBrands(user?.tenantId || null);
        } else {
          const res = await storeOwnerAPI.getBrands();
          if (res && (res as any).fallbackToLocal) {
            data = await getLocalBrands(user?.tenantId || null);
          } else {
            data = res.data || [];
          }
        }
      } catch(e) {
         data = await getLocalBrands(user?.tenantId || null);
      }
      
      setBrands(data);
    } catch (err) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerValidation('basic', 'field-brand-name', 'Brand name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      payload.append('name', formData.name);
      if (formData.description) payload.append('description', formData.description);
      
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingBrand) {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

        const localData = {
          name: formData.name,
          description: formData.description,
          image: imagePreview || editingBrand.image
        };

        await updateBrandLocally(editingBrand.id, localData, tenantId);

        if (!isLocalMode) {
          try {
            await storeOwnerAPI.updateBrand(editingBrand.id, payload);
            await markBrandSynced(editingBrand.id);
            toast.success('Brand updated and synced successfully!');
          } catch(syncErr) {
            console.error('Sync failed:', syncErr);
            toast.warning('Brand updated locally but failed to sync to server.');
          }
        } else {
          toast.success('Brand updated successfully in local database!');
        }
      } else {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isLocalMode = isTauriEnv() || user?.tenant?.plan === 'STARTUP';

        const localData = {
          name: formData.name,
          description: formData.description,
          image: imagePreview
        };

        const localRecord = await saveBrandLocally(localData, tenantId);

        if (!isLocalMode) {
          try {
            const res = await storeOwnerAPI.createBrand(payload);
            await markBrandSynced(localRecord.id);
            toast.success('Brand added and synced successfully!');
          } catch(syncErr) {
            console.error('Sync failed:', syncErr);
            toast.warning('Brand saved locally but failed to sync to server.');
          }
        } else {
           toast.success('Brand added successfully to local database!');
        }
      }

      setIsPanelOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save brand');
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

      // Delete locally first
      await deleteBrandLocally(confirmDialog.id, tenantId);

      if (!isLocalMode) {
        try {
          await storeOwnerAPI.deleteBrand(confirmDialog.id);
          toast.success('Brand deleted and synced');
        } catch (err: any) {
          toast.success('Brand deleted locally (was not synced to server)');
        }
      } else {
        toast.success('Brand deleted from local database');
      }

      fetchData();
      setConfirmDialog({ isOpen: false, id: null });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete brand locally');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddPanel = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const openEditPanel = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
    });
    if (brand.image) {
      setImagePreview(brand.image);
    } else {
      setImagePreview(null);
    }
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '' });
    setImageFile(null);
    setImagePreview(null);
  };

  const filterBrands = (b: any[], searchTerm: string): any[] => {
    if (!searchTerm) return b;
    return b.filter(brand => brand.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filteredBrands = filterBrands(brands, search);

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Tag className="w-8 h-8 text-blue-600" />
              Brands
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage product brands and manufacturers.</p>
          </div>
          
          <button 
            onClick={openAddPanel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            Add Brand
          </button>
        </div>
      )}

      {/* ──────────────── SEARCH BAR & KPIs ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden flex-shrink-0 ml-auto">
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
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Full Screen"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800`}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ──────────────── DATA TABLE ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Loading brands...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <TableEmptyState
            icon={Tag}
            title="No brands found"
            description="You haven't created any brands yet, or none match your search. Click below to add your first brand."
            actionLabel="Create First Brand"
            onAction={openAddPanel}
          />
        ) : viewMode === 'list' ? (
          <>
            <div className="grid grid-cols-12 gap-4 h-16 px-5 pl-9 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <div className="col-span-6">Brand Name</div>
              <div className="col-span-4">Products</div>
              <div className="col-span-2 text-right pr-4">Action</div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {filteredBrands.map((b) => (
                <BrandRow key={b.id} brand={b} onEdit={openEditPanel} onDelete={handleDelete} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/30 dark:bg-slate-900/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 xl:gap-6">
              {filteredBrands.map(b => (
                  <div key={b.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                         {b.image ? <img src={b.image} alt={b.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <Tag className="w-12 h-12 opacity-50" />}
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button onClick={() => openEditPanel(b)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(b.id)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                              <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="absolute top-2 right-2">
                           <span className="px-2 py-1 bg-slate-900/50 backdrop-blur-md text-white rounded-lg text-[9px] font-bold">
                             {b.productsCount || 0} items
                           </span>
                         </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1 line-clamp-1">{b.name}</h3>
                        {b.description && <p className="text-[10px] font-medium text-slate-500 line-clamp-1 mb-2">{b.description}</p>}
                        
                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <p className="text-[9px] font-bold text-slate-400">Created: {new Date(b.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      {/* ──────────────── SLIDE OUT PANEL: BRAND ──────────────── */}
      <MainRightPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onDiscard={handleClosePanel}
        title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
        subtitle={editingBrand ? 'Modify manufacturer and brand details' : 'Create and manage product brands and makers'}
        icon={Tag}
        formId="brandForm"
        isSubmitting={isSubmitting}
        saveText={editingBrand ? 'Save Changes' : 'Save Brand'}
      >
        <form id="brandForm" onSubmit={handleSaveBrand} className="font-sans space-y-4">
          
          {/* 1. Basic Information */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button 
              type="button" 
              onClick={() => toggleSection("basic")}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.basic ? "rounded-t-xl" : "rounded-xl"}`}
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
                  <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Brand Logo <span className="text-xs font-medium text-slate-400">(Optional)</span>
                      </label>
                      <div className="w-full relative">
                        {imagePreview ? (
                          <div className="relative group w-full h-36 rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-3">
                            <img 
                              src={imagePreview} 
                              alt="Logo Preview" 
                              className="max-w-full max-h-full object-contain cursor-pointer hover:scale-105 transition-transform" 
                              onClick={() => setZoomedImage(imagePreview)}
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-[1px]">
                              <button 
                                type="button" 
                                onClick={() => setZoomedImage(imagePreview)} 
                                className="p-2 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all shadow-md cursor-pointer hover:scale-110"
                                title="Zoom logo"
                              >
                                <Maximize className="w-4 h-4" />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => { setImageFile(null); setImagePreview(null); }} 
                                className="p-2 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-md cursor-pointer hover:scale-110"
                                title="Remove logo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group">
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setImageFile(file);
                                  const reader = new FileReader();
                                  reader.onloadend = () => setImagePreview(reader.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                              <Plus className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                Click or drag logo to upload
                              </span>
                              <span className="text-[11px] font-medium text-slate-400">
                                Supports PNG, JPG, SVG
                              </span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 relative">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Brand Name <span className="text-red-500">*</span></span>
                        <ValidationErrorTooltip error={validationError} fieldId="field-brand-name" />
                      </label>
                      <input 
                        id="field-brand-name"
                        autoFocus
                        value={formData.name} 
                        onChange={e => {
                          setFormData({...formData, name: e.target.value});
                          if (validationError?.field === 'field-brand-name') setValidationError(null);
                        }} 
                        className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none ${
                          validationError?.field === 'field-brand-name' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                        placeholder="e.g. Nike" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                      <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none resize-none"
                        placeholder="Short description..." 
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </MainRightPanel>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone."
        confirmText="Delete Brand"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, id: null })}
        isLoading={isDeleting}
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
            <img src={zoomedImage} alt="Zoomed Brand" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <BrandsPageContent />
    </Suspense>
  );
}
