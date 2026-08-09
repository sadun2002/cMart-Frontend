'use client';

import { useState } from 'react';
import { 
  FileText, Search, Plus, MoreVertical, Edit, Trash2, Eye, 
  EyeOff, Globe, Layout, CheckCircle, Clock, X, Copy, Image as ImageIcon, CopyPlus, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { KpiCard } from '@/components/ui/kpi-card';

// Mock Data
const mockPages = [
  { id: '1', title: 'Home', handle: '/home', status: 'Published', lastUpdated: '2026-08-01' },
  { id: '2', title: 'About Us', handle: '/about-us', status: 'Published', lastUpdated: '2026-08-01' },
  { id: '3', title: 'Contact Us', handle: '/contact', status: 'Published', lastUpdated: '2026-07-28' },
  { id: '4', title: 'FAQ', handle: '/faq', status: 'Published', lastUpdated: '2026-07-25' },
  { id: '5', title: 'Privacy Policy', handle: '/privacy-policy', status: 'Published', lastUpdated: '2026-06-15' },
  { id: '6', title: 'Terms and Conditions', handle: '/terms', status: 'Hidden', lastUpdated: '2026-08-02' },
  { id: '7', title: 'Return & Refund Policy', handle: '/returns', status: 'Published', lastUpdated: '2026-07-20' },
  { id: '8', title: 'Shipping Policy', handle: '/shipping', status: 'Published', lastUpdated: '2026-07-20' },
];

export default function OnlineStorePages() {
  const [pages, setPages] = useState(mockPages);
  const [search, setSearch] = useState('');
  
  // Slide-out panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    urlSlug: '',
    content: '',
    coverImage: '',
    status: 'Hidden',
    seoTitle: '',
    seoDescription: '',
    keywords: ''
  });

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const handleOpenPanel = (page: any) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        urlSlug: page.handle,
        content: '<p>Mock content for ' + page.title + '</p>',
        coverImage: '',
        status: page.status,
        seoTitle: page.title,
        seoDescription: 'This is the meta description for ' + page.title,
        keywords: page.title.split(' ').join(', ')
      });
      setIsPanelOpen(true);
    }
  };

  const handleSave = () => {
    if (!formData.title) {
      toast.error('Page title is required');
      return;
    }

    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? { ...p, title: formData.title, handle: formData.urlSlug || '/' + formData.title.toLowerCase().replace(/\s+/g, '-'), status: formData.status, lastUpdated: new Date().toISOString().split('T')[0] } : p));
      toast.success('Page updated successfully');
    }
    setIsPanelOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Are you sure you want to delete this page?')) {
      setPages(pages.filter(p => p.id !== id));
      toast.success('Page deleted');
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'Published' ? 'Hidden' : 'Published';
    setPages(pages.map(p => p.id === id ? { ...p, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : p));
    toast.success(`Page ${newStatus === 'Published' ? 'published' : 'unpublished'}`);
  };

  const kpis = {
    total: pages.length,
    published: pages.filter(p => p.status === 'Published').length,
    hidden: pages.filter(p => p.status === 'Hidden').length
  };

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6 relative overflow-hidden">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Layout className="w-8 h-8 text-blue-600" />
            Online Store Pages
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create and manage static pages for your online store.</p>
        </div>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard title="Total Pages" value={kpis.total} icon={FileText} iconColorClass="text-blue-600" iconBgClass="bg-blue-50 dark:bg-blue-500/10" />
        <KpiCard title="Published" value={kpis.published} icon={CheckCircle} iconColorClass="text-emerald-600" iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" />
        <KpiCard title="Hidden / Drafts" value={kpis.hidden} icon={EyeOff} iconColorClass="text-amber-600" iconBgClass="bg-amber-50 dark:bg-amber-500/10" />
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
              placeholder="Search pages by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl shadow-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400 transition-all outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider z-10">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-4">
                      <FileText className="w-12 h-12 opacity-20" />
                      <p className="font-medium text-lg text-slate-500">No pages found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} onClick={() => handleOpenPanel(page)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{page.title}</div>
                          <div className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                            <Globe className="w-3.5 h-3.5" /> {page.handle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                        page.status === 'Published' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {page.status === 'Published' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {page.lastUpdated}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleToggleStatus(page.id, page.status, e)} className={`p-2 rounded-lg transition-colors ${page.status === 'Hidden' ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`} title={page.status === 'Hidden' ? 'Publish' : 'Unpublish'}>
                          {page.status === 'Hidden' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toast.info('Previewing ' + page.handle); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Preview">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => handleDelete(page.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                  Edit Page
                </h2>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Page Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. About Us" 
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                  />
                </div>

                {/* URL Slug */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">URL Slug</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-medium">
                      /
                    </div>
                    <input 
                      type="text" 
                      value={formData.urlSlug.replace('/', '')} 
                      onChange={e => setFormData({...formData, urlSlug: '/' + e.target.value})}
                      placeholder="about-us" 
                      className="w-full h-11 pl-8 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cover / Feature Image</label>
                  <div className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer transition-colors group">
                    <ImageIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Click to upload image</span>
                  </div>
                </div>

                {/* Content Placeholder */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                    Content
                    <span className="text-xs font-normal text-slate-400">Rich Text Editor</span>
                  </label>
                  <div className="w-full h-64 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col">
                    {/* Mock Editor Toolbar */}
                    <div className="flex gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                    <textarea 
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      placeholder="Write your page content here..."
                      className="w-full flex-1 bg-transparent resize-none outline-none text-slate-700 dark:text-slate-300 font-medium"
                    ></textarea>
                  </div>
                </div>

                {/* Visibility */}
                <div className="space-y-2 p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Visibility</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={formData.status === 'Published'} onChange={() => setFormData({...formData, status: 'Published'})} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Visible (Published)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={formData.status === 'Hidden'} onChange={() => setFormData({...formData, status: 'Hidden'})} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Hidden (Draft)</span>
                    </label>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white">Search engine listing preview</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Page title</label>
                      <input 
                        type="text" 
                        value={formData.seoTitle} 
                        onChange={e => setFormData({...formData, seoTitle: e.target.value})}
                        className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-sm text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Meta description</label>
                      <textarea 
                        value={formData.seoDescription} 
                        onChange={e => setFormData({...formData, seoDescription: e.target.value})}
                        className="w-full h-20 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-sm text-slate-900 dark:text-white outline-none resize-none"
                      ></textarea>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Keywords</label>
                      <input 
                        type="text" 
                        value={formData.keywords} 
                        onChange={e => setFormData({...formData, keywords: e.target.value})}
                        placeholder="e.g. store, fashion, about us"
                        className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-sm text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Panel Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsPanelOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
                  Save Page
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
