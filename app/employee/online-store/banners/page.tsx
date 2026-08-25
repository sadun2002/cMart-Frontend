'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Image as ImageIcon, Save, CheckCircle, 
  EyeOff, Eye, Search, GripVertical, ExternalLink, X, Type, Link as LinkIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { KpiCard } from '@/components/ui/kpi-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { themeApi } from '@/lib/services';

const mockPages = [
  { title: 'Home', handle: '/' },
  { title: 'Shop', handle: '/shop' },
  { title: 'Categories', handle: '/categories' },
  { title: 'Offers', handle: '/offers' },
  { title: 'About Us', handle: '/about' },
  { title: 'Contact', handle: '/contact' },
  { title: 'FAQ', handle: '/faq' },
  { title: 'Shipping', handle: '/shipping' },
  { title: 'Privacy Policy', handle: '/privacy' },
  { title: 'Terms', handle: '/terms' },
];

// Mock Data
const mockBanners = [
  { 
    id: '1', 
    title: 'Summer Sale 2026', 
    subtitle: 'Up to 50% Off on all electronics',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200', 
    status: 'Active', 
    ctaText: 'Shop Now',
    ctaLink: '/collections/summer',
    order: 1 
  },
  { 
    id: '2', 
    title: 'New Arrivals - Fashion', 
    subtitle: 'Check out the latest trendy outfits',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200', 
    status: 'Active', 
    ctaText: 'Discover',
    ctaLink: '/collections/new-arrivals',
    order: 2 
  },
  { 
    id: '3', 
    title: 'Free Delivery', 
    subtitle: 'On orders over Rs. 5000',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7450951?auto=format&fit=crop&q=80&w=1200', 
    status: 'Inactive', 
    ctaText: 'Learn More',
    ctaLink: '/shipping-policy',
    order: 3 
  },
];

export default function BannersPage() {
  const [banners, setBanners] = useState(mockBanners);
  const [search, setSearch] = useState('');
  
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
  const [activeTheme, setActiveTheme] = useState<any>(null);

  useEffect(() => {
    const fetchActiveTheme = async () => {
      try {
        const res = await themeApi.getMyTheme().catch(() => null);
        const data = res as any;
        const theme = data?.data?.theme || data?.theme || data?.data || data;
        setActiveTheme(theme);
      } catch (e) {}
    };
    fetchActiveTheme();
  }, []);

  const filteredBanners = banners.filter(b => b.title.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.order - b.order);

  const handleOpenPanel = (banner: any = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image,
        ctaText: banner.ctaText,
        ctaLink: banner.ctaLink,
        status: banner.status,
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

  const handleSave = () => {
    if (!formData.title) {
      toast.error('Banner title is required');
      return;
    }

    if (editingBanner) {
      setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, ...formData } : b));
      toast.success('Banner updated successfully');
    } else {
      const newBanner = {
        id: Math.random().toString(),
        ...formData,
        order: banners.length + 1
      };
      setBanners([...banners, newBanner]);
      toast.success('New banner created');
    }
    setIsPanelOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Are you sure you want to delete this banner?')) {
      setBanners(banners.filter(b => b.id !== id));
      toast.success('Banner deleted');
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setBanners(banners.map(b => b.id === id ? { ...b, status: newStatus } : b));
    toast.success(`Banner ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
  };

  const kpis = {
    total: banners.length,
    active: banners.filter(b => b.status === 'Active').length,
    inactive: banners.filter(b => b.status === 'Inactive').length
  };

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
                
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Banner Image</label>
                  <div className="w-full aspect-[21/9] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer transition-all group overflow-hidden relative">
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
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Primary Title</label>
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

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subtitle</label>
                    <textarea 
                      value={formData.subtitle} 
                      onChange={e => setFormData({...formData, subtitle: e.target.value})}
                      placeholder="e.g. Up to 50% Off on all electronics" 
                      className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* CTA Text */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Button Text</label>
                      <input 
                        type="text" 
                        value={formData.ctaText} 
                        onChange={e => setFormData({...formData, ctaText: e.target.value})}
                        placeholder="e.g. Shop Now" 
                        className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                      />
                    </div>
                    {/* CTA Link */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Button Link</label>
                      <CustomSelect 
                        value={formData.ctaLink} 
                        onChange={(val) => setFormData({...formData, ctaLink: val})}
                        options={mockPages.map(p => ({ label: p.title, value: p.handle }))}
                        label="Select a page"
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

              </div>

              {/* Panel Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsPanelOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
                  Save Banner
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
