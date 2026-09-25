import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Maximize, Trash2, Info, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import { storeOwnerAPI } from '@/lib/api';
import { saveBrandLocally, markBrandSynced } from '@/lib/local-services';
import { isTauriEnv } from '@/lib/local-db';
import { MainRightPanel, SecondaryRightPanel } from '@/components/ui/right-panel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';

interface BrandPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBrand?: any) => void;
  className?: string;
}

export function BrandPanel({ isOpen, onClose, onSuccess, className = "right-0 z-50 border-l" }: BrandPanelProps) {
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

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setImageFile(null);
    setImagePreview(null);
  };

  const [validationError, setValidationError] = useState<{ field: string, message: string } | null>(null);

  const focusField = (id: string, sectionKey?: string, message?: string) => {
    if (sectionKey && !openSections[sectionKey as keyof typeof openSections]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
    }
    if (message) {
      setValidationError({ field: id, message });
      setTimeout(() => setValidationError(null), 3000);
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }, 100);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      focusField('field-brand-name', 'basic', 'Brand Name is required');
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

      try {
        localStorage.removeItem('draft_brand_form');
      } catch (e) {}
      resetForm();
      onSuccess(localRecord);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restore draft when brand panel opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('draft_brand_form');
        if (saved) {
          const d = JSON.parse(saved);
          if (d.name !== undefined || d.description !== undefined) {
            setFormData({ name: d.name || '', description: d.description || '' });
          }
          if (d.imagePreview) setImagePreview(d.imagePreview);
        }
      } catch (e) {}
    }
  }, [isOpen]);

  // Auto-save draft when fields change
  useEffect(() => {
    if (!isOpen) return;
    const hasData = Boolean(formData.name || formData.description || imagePreview);
    if (hasData) {
      try {
        localStorage.setItem('draft_brand_form', JSON.stringify({
          ...formData,
          imagePreview
        }));
      } catch (e) {}
    }
  }, [formData, imagePreview, isOpen]);

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_brand_form');
    } catch (e) {}
    resetForm();
    onClose();
  };

  const Panel = className.includes('right-[448px]') ? SecondaryRightPanel : MainRightPanel;

  return (
    <>
      <Panel
        isOpen={isOpen}
        onClose={onClose}
        onDiscard={handleDiscardChanges}
        title="Add New Brand"
        subtitle="Organize your product brands"
        icon={Tag}
        formId="brandForm"
        isSubmitting={isSubmitting}
        saveText="Save Brand"
      >
        <form id="brandForm" onSubmit={handleSaveBrand} className="font-sans space-y-4">
                  
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
                            {/* Logo Upload */}
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
                                      >
                                        <Maximize className="w-4 h-4" />
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => { setImageFile(null); setImagePreview(null); }} 
                                        className="p-2 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-md cursor-pointer hover:scale-110"
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

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Brand Name <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <input 
                                  id="field-brand-name"
                                  required autoFocus
                                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                                  className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                  placeholder="e.g. Nike" 
                                />
                                <ValidationErrorTooltip error={validationError} fieldId="field-brand-name" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                              <textarea 
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
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
      </Panel>

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
            <img src={zoomedImage} alt="Zoomed Cover" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </motion.div>
        </div>
      )}
    </>
  );
}
