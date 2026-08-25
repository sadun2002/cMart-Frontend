'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Image as ImageIcon, Save, CheckCircle, 
  EyeOff, Eye, Search, GripVertical, ExternalLink, X, Type, Link as LinkIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { KpiCard } from '@/components/ui/kpi-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { bannersApi, themeApi } from '@/lib/services';

const mockPages = [
  { id: '1', title: 'Home', handle: '/' },
  { id: '2', title: 'Shop', handle: '/shop' },
  { id: '3', title: 'Product Details', handle: '/product/1' },
  { id: '4', title: 'Cart', handle: '/cart' },
  { id: '5', title: 'Checkout', handle: '/checkout' },
  { id: '6', title: 'Categories', handle: '/categories' },
  { id: '7', title: 'Offers and Sales', handle: '/offers' },
  { id: '8', title: 'About Us', handle: '/about' },
  { id: '9', title: 'Contact', handle: '/contact' },
  { id: '10', title: 'FAQ', handle: '/faq' },
  { id: '11', title: 'Shipping', handle: '/shipping' },
  { id: '12', title: 'Privacy Policy', handle: '/privacy' },
  { id: '13', title: 'Terms', handle: '/terms' },
  { id: '14', title: 'Login', handle: '/login' },
  { id: '15', title: 'Register', handle: '/register' },
  { id: '16', title: 'Account', handle: '/account' },
  { id: '17', title: 'Forgot Password', handle: '/forgot-password' },
];

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Slide-out panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    ctaText: '',
    ctaLink: '',
    status: 'Inactive',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTheme, setActiveTheme] = useState<any>(null);

  useEffect(() => {
    fetchBanners();
    fetchActiveTheme();
  }, []);

  const fetchActiveTheme = async () => {
    try {
      const res = await themeApi.getMyTheme().catch(() => null);
      const data = res as any;
      const theme = data?.data?.theme || data?.theme || data?.data || data;
      console.log('Fetched active theme:', theme); // Debug log to see the actual structure
      setActiveTheme(theme);
    } catch (e) {}
  };

  const fetchBanners = async () => {
    try {
      const res = await bannersApi.list();
      setBanners(res.data);
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBanners = banners.filter(b => b.title.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.order - b.order);

  const handleOpenPanel = (banner: any = null) => {
    setImageFile(null);
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        ctaText: banner.ctaText || '',
        ctaLink: banner.ctaLink || '',
        status: banner.status || 'Inactive',
      });
    } else {
      setEditingBanner(null);
      setFormData({ 
        title: 'New Collection', 
        subtitle: 'Discover our latest arrivals and seasonal offers.', 
        image: '', 
        ctaText: 'Shop Now', 
        ctaLink: '/', 
        status: 'Active' 
      });
    }
    setIsPanelOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Banner title is required');
      return;
    }
    if (!editingBanner && !imageFile && !formData.image) {
      toast.error('Banner image is required');
      return;
    }

    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle);
      data.append('ctaText', formData.ctaText);
      data.append('ctaLink', formData.ctaLink);
      data.append('status', formData.status);
      
      if (imageFile) {
        data.append('image', imageFile);
      } else if (formData.image) {
         data.append('image', formData.image); // retain url if no new image uploaded
      }

      if (editingBanner) {
        await bannersApi.update(editingBanner.id, data);
        toast.success('Banner updated successfully');
      } else {
        data.append('order', (banners.length + 1).toString());
        await bannersApi.create(data);
        toast.success('New banner created');
      }
      
      await fetchBanners();
      setIsPanelOpen(false);
    } catch (error) {
      toast.error('Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannersApi.delete(id);
        toast.success('Banner deleted');
        setBanners(banners.filter(b => b.id !== id));
      } catch (error) {
        toast.error('Failed to delete banner');
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const data = new FormData();
      data.append('status', newStatus);
      await bannersApi.update(id, data);
      setBanners(banners.map(b => b.id === id ? { ...b, status: newStatus } : b));
      toast.success(`Banner ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to change status');
    }
  };

  const kpis = {
    total: banners.length,
    active: banners.filter(b => b.status === 'Active').length,
    inactive: banners.filter(b => b.status === 'Inactive').length
  };

  const isMinimalist = activeTheme?.id === 1 || activeTheme?.themeId === 1 || activeTheme?.slug === 'minimalist' || activeTheme?.theme?.id === 1 || activeTheme?.theme?.slug === 'minimalist' || activeTheme?.name?.toLowerCase().includes('minimalist');

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center">Loading banners...</div>;
  }

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6 relative overflow-hidden">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-blue-600" />
            Manage Banners
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create and arrange promotional banners for your online store's homepage.</p>
        </div>
        <button onClick={() => handleOpenPanel()} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Banner
        </button>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard title="Total Banners" value={kpis.total} icon={ImageIcon} iconColorClass="text-blue-600" iconBgClass="bg-blue-50 dark:bg-blue-500/10" />
        <KpiCard title="Active" value={kpis.active} icon={CheckCircle} iconColorClass="text-emerald-600" iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" />
        <KpiCard title="Inactive" value={kpis.inactive} icon={EyeOff} iconColorClass="text-amber-600" iconBgClass="bg-amber-50 dark:bg-amber-500/10" />
      </div>

      {/* ──────────────── LIST VIEW ──────────────── */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search banners by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl shadow-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400 transition-all outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto custom-scrollbar p-6">
          <div className="flex flex-col gap-4 min-w-[800px]">
            {filteredBanners.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 gap-4">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <p className="font-medium text-lg text-slate-500">No banners found.</p>
              </div>
            ) : (
              filteredBanners.map((banner) => (
                <div key={banner.id} onClick={() => handleOpenPanel(banner)} className="flex items-center gap-6 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group">
                  <div className="cursor-grab p-2 text-slate-300 hover:text-slate-500 dark:hover:text-slate-400" onClick={(e) => e.stopPropagation()}>
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="w-40 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {banner.image ? (
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{banner.title}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{banner.subtitle}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                        banner.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {banner.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {banner.status}
                      </span>
                      {banner.ctaLink && (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> {banner.ctaLink}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                    <button onClick={(e) => handleToggleStatus(banner.id, banner.status, e)} className={`p-2.5 rounded-xl transition-colors ${banner.status === 'Inactive' ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`} title={banner.status === 'Inactive' ? 'Activate' : 'Deactivate'}>
                      {banner.status === 'Inactive' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button onClick={(e) => handleDelete(banner.id, e)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ──────────────── SLIDE-OUT PANEL ──────────────── */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
              onClick={() => setIsPanelOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%', boxShadow: '-20px 0 25px -5px rgb(0 0 0 / 0.1)' }}
              animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-slate-900 z-[110] border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {isMinimalist ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Banners Not Supported</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                        The current theme ({activeTheme?.name || 'Minimalist'}) does not utilize image banners. Its design focuses on typography, spacing, and minimalism.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Banner Image</label>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[21/9] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer transition-all group overflow-hidden relative">
                        {formData.image ? (
                          <img src={formData.image} alt="Banner Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <ImageIcon className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold">Click to upload image</span>
                            <span className="text-xs font-medium mt-1 opacity-70">
                              Recommended size: {activeTheme?.id === 1 ? '800x600px' : '1920x820px'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pt-2">
                      {/* Title */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Banner Name (Internal Reference)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Type className="w-5 h-5" />
                          </div>
                          <input 
                            type="text" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. Summer Sale 2026" 
                            className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Visibility Status</label>
                        <div className="text-sm font-medium text-slate-500 mt-1">
                          {formData.status === 'Active' ? 'Active (Visible)' : 'Inactive (Hidden)'}
                        </div>
                      </div>
                      <button
                        onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${formData.status === 'Active' ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.status === 'Active' ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                      </button>
                    </div>
                  </>
                )}

              </div>

              {/* Panel Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsPanelOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving || isMinimalist} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
                  {isSaving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
