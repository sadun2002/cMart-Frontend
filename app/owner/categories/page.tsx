'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Trash2, FolderTree, Edit, X, Image as ImageIcon, ChevronRight, ChevronDown, List, LayoutGrid, Package, Maximize, Minimize } from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomSelect } from '@/components/ui/custom-select';
import { useAuthStore } from '@/lib/auth-store';
import { saveCategoryLocally, markCategorySynced, getLocalCategories } from '@/lib/local-services';

// --- Recursive Category Row Component ---
const CategoryRow = ({ category, level = 0, onEdit, onDelete, defaultExpanded = false }: any) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = category.children && category.children.length > 0;

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <>
      <div 
        className={`grid grid-cols-12 gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group`}
        style={{ paddingLeft: `${1.25 + level * 2}rem` }}
      >
        <div className="col-span-5 flex items-center gap-3">
          {hasChildren ? (
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6" /> // spacer
          )}
          
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400 overflow-hidden">
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <FolderTree className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{category.name}</h3>
            {category.description && <p className="text-xs text-slate-500 line-clamp-1">{category.description}</p>}
            <p className="text-xs text-slate-400 mt-0.5">
              {category.updatedAt && category.updatedAt !== category.createdAt 
                ? `Updated ${new Date(category.updatedAt).toLocaleDateString()}` 
                : category.createdAt ? `Added ${new Date(category.createdAt).toLocaleDateString()}` : ''}
            </p>
          </div>
        </div>
        
        <div className="col-span-3 text-slate-500 text-sm font-medium flex items-center">
          /{category.slug}
        </div>

        <div className="col-span-2 text-slate-500 text-sm font-medium flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-400" />
          {category._count?.products || 0} Items
        </div>

        <div className="col-span-2 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
          <button onClick={() => onEdit(category)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(category.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col">
          {category.children.map((child: any) => (
            <CategoryRow key={child.id} category={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} defaultExpanded={defaultExpanded} />
          ))}
        </div>
      )}
    </>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal / Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    parentId: 'null', 
    sortOrder: '0',
    active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = useAuthStore.getState().user;
      const isStartup = user?.tenant?.plan === 'STARTUP';
      
      let treeData = [];
      let flatData = [];

      try {
        if (isStartup) {
          treeData = await getLocalCategories(user?.tenantId || null);
          flatData = await getLocalCategories(user?.tenantId || null); // Flat could just be a flat map, but local returns tree. We can flatten it.
          
          // Flatten tree
          const flatten = (nodes: any[]): any[] => {
            let res: any[] = [];
            nodes.forEach(n => {
              res.push(n);
              if (n.children) res = [...res, ...flatten(n.children)];
            });
            return res;
          };
          flatData = flatten(treeData);
        } else {
          const [treeRes, flatRes] = await Promise.all([
            storeOwnerAPI.getCategories(),
            storeOwnerAPI.getFlatCategories()
          ]);
          treeData = treeRes.data;
          flatData = flatRes.data;
        }
      } catch(e) {
         // Fallback to local
         treeData = await getLocalCategories(user?.tenantId || null);
         const flatten = (nodes: any[]): any[] => {
            let res: any[] = [];
            nodes.forEach(n => {
              res.push(n);
              if (n.children) res = [...res, ...flatten(n.children)];
            });
            return res;
          };
          flatData = flatten(treeData);
      }
      
      setCategories(treeData);
      setFlatCategories(flatData);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const focusField = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
        if (el.tagName === 'BUTTON') el.click();
      }
    }, 100);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category Name is required');
      focusField('field-category-name');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      payload.append('name', formData.name);
      if (formData.description) payload.append('description', formData.description);
      payload.append('parentId', formData.parentId);
      payload.append('sortOrder', formData.sortOrder);
      payload.append('active', formData.active.toString());
      
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingCategory) {
        await storeOwnerAPI.updateCategory(editingCategory.id, payload);
        toast.success('Category updated successfully!');
      } else {
        const user = useAuthStore.getState().user;
        const tenantId = user?.tenantId || null;
        const isStartup = user?.tenant?.plan === 'STARTUP';

        const localData = {
          name: formData.name,
          description: formData.description,
          parentId: formData.parentId,
          image: imagePreview // Save base64 preview if available
        };

        const localRecord = await saveCategoryLocally(localData, tenantId);

        if (!isStartup) {
          try {
            const res = await storeOwnerAPI.createCategory(payload);
            await markCategorySynced(localRecord.id);
            toast.success('Category added and synced successfully!');
          } catch(syncErr) {
            console.error('Sync failed:', syncErr);
            toast.warning('Category saved locally but failed to sync to server.');
          }
        } else {
           toast.success('Category added successfully to local database!');
        }
      }

      setIsPanelOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
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
      await storeOwnerAPI.deleteCategory(confirmDialog.id);
      toast.success('Category deleted');
      fetchData();
      setConfirmDialog({ isOpen: false, id: null });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddPanel = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const openEditPanel = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      parentId: category.parentId ? category.parentId.toString() : 'null',
      sortOrder: category.sortOrder !== undefined ? category.sortOrder.toString() : '0',
      active: category.active !== undefined ? category.active : true,
    });
    if (category.image) {
      setImagePreview(category.image);
    } else {
      setImagePreview(null);
    }
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', parentId: 'null', sortOrder: '0', active: true });
    setImageFile(null);
    setImagePreview(null);
  };

  const filterCategories = (cats: any[], searchTerm: string): any[] => {
    if (!searchTerm) return cats;
    
    return cats.map(c => {
      const category = { ...c };
      const nameMatches = category.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchingChildren: any[] = [];
      if (category.children && category.children.length > 0) {
        matchingChildren = filterCategories(category.children, searchTerm);
      }
      
      if (nameMatches) {
        return category; // Parent matches, keep it with all its original children
      } else if (matchingChildren.length > 0) {
        // Parent doesn't match, but children do. Keep parent with only matching children.
        category.children = matchingChildren;
        return category;
      }
      return null;
    }).filter(Boolean);
  };

  const filteredCategories = filterCategories(categories, search);
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, c) => sum + (c.children?.length || 0), 0);

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full p-4 sm:p-8">
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-blue-600" />
            Categories
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Organize your products into categories and subcategories.</p>
        </div>
        
        <button 
          onClick={openAddPanel}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* ──────────────── SEARCH BAR & KPIs ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search categories..."
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
        {viewMode === 'list' ? (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 h-16 px-5 pl-9 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <div className="col-span-5">Category Name</div>
              <div className="col-span-3">Slug</div>
              <div className="col-span-2">Products</div>
              <div className="col-span-2 text-right pr-4">Action</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium">Loading categories...</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <FolderTree className="w-12 h-12 opacity-20" />
                  <p className="font-medium text-lg text-slate-500">No categories found.</p>
                </div>
              ) : (
                filteredCategories.map((c) => (
                  <CategoryRow key={c.id} category={c} onEdit={openEditPanel} onDelete={handleDelete} defaultExpanded={!!search} />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/30 dark:bg-slate-900/20">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-medium">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <FolderTree className="w-12 h-12 opacity-20" />
                <p className="font-medium text-lg text-slate-500">No categories found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 xl:gap-6">
                {filteredCategories.map(c => (
                  <div key={c.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                         {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <FolderTree className="w-12 h-12 opacity-50" />}
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button onClick={() => openEditPanel(c)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-3 bg-white text-slate-900 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                              <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="absolute top-2 right-2">
                           <span className="px-2 py-1 bg-slate-900/50 backdrop-blur-md text-white rounded-lg text-[9px] font-bold">
                             {c.productsCount || 0} items
                           </span>
                         </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1 line-clamp-1">{c.name}</h3>
                        {c.description && <p className="text-[10px] font-medium text-slate-500 line-clamp-1 mb-2">{c.description}</p>}
                        
                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <p className="text-[9px] font-bold text-slate-400">Created: {new Date(c.createdAt).toLocaleDateString()}</p>
                          {c.children && c.children.length > 0 && (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                              {c.children.length} sub
                            </span>
                          )}
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────────── SLIDE OUT PANEL ──────────────── */}
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
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="categoryForm" onSubmit={handleSaveCategory} className="font-sans space-y-6">
                  
                  {/* Image Upload */}
                  <div className="w-full h-40 relative group">
                    {imagePreview ? (
                      <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                          onClick={() => setZoomedImage(imagePreview)}
                        />
                        <button 
                          type="button" 
                          onClick={() => { setImageFile(null); setImagePreview(null); }} 
                          className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 shadow hover:shadow-md transition-all z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
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
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-sm flex items-center justify-center text-blue-500">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Upload Cover Image (Optional)</span>
                      </label>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category Name <span className="text-red-500">*</span></label>
                    <input 
                      id="field-category-name" required autoFocus
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                      placeholder="e.g. Electronics" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                    <textarea 
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white resize-none"
                      placeholder="Short description..." 
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Parent Category</label>
                    <CustomSelect 
                      value={formData.parentId} 
                      onChange={val => setFormData({...formData, parentId: val})}
                      label="None (Root Category)"
                      options={[
                        { value: 'null', label: 'None (Root Category)' },
                        ...flatCategories
                          .filter(c => c.id !== editingCategory?.id)
                          .map(c => ({ value: c.id.toString(), label: c.name }))
                      ]}
                    />
                  </div>
                  {/* Empty space to allow dropdown to expand without being clipped */}
                  <div className="h-40" aria-hidden="true"></div>
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
                    form="categoryForm"
                    disabled={isSubmitting}
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FolderTree className="w-5 h-5" />
                        {editingCategory ? 'Save Changes' : 'Save Category'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete Category"
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
            <img src={zoomedImage} alt="Zoomed Category" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
