'use client';

import { useState, useEffect } from 'react';
import { 
  Search, AlertCircle, Plus
} from 'lucide-react';
import { superAdminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ThemeCard, type Theme } from '@/components/themes/theme-card';
import { AddThemeModal } from '@/components/themes/add-theme-modal';

export default function AdminThemesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchThemes = async () => {
    try {
      setIsLoading(true);
      const res: any = await superAdminAPI.getThemes();
      const data = res.data || res;
      const mapped: Theme[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        price: Number(t.price) || 0,
        type: t.type,
        previewUrl: t.previewUrl,
        tags: t.tags,
        version: t.version,
        isActive: t.isActive,
      }));
      setThemes(mapped);
    } catch (err: any) {
      console.error("Error fetching themes:", err);
      setError(err.response?.data?.message || "Failed to load themes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleToggleStatus = async (id: number | string) => {
    const theme = themes.find(t => t.id === id);
    if (!theme) return;
    
    const newStatus = !theme.isActive;
    try {
      // Optimistic update
      setThemes(themes.map(t => t.id === id ? { ...t, isActive: newStatus } : t));
      await superAdminAPI.toggleThemeStatus(id, newStatus);
      toast.success(`Theme ${newStatus ? 'published' : 'unpublished'} successfully`);
    } catch (e: any) {
      // Revert on error
      setThemes(themes.map(t => t.id === id ? { ...t, isActive: !newStatus } : t));
      toast.error('Failed to update theme status');
    }
  };

  const filteredThemes = themes.filter(theme => 
    theme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans p-6 lg:p-8 max-w-[1600px] mx-auto h-full overflow-y-auto custom-scrollbar flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Theme Gallery</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage e-commerce themes available to your tenants</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search themes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow text-slate-900 dark:text-white"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Theme
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Themes Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              variant="admin"
              isActive={theme.isActive}
              onPreview={(id) => window.open(theme.previewUrl || `/s/demo?theme=${theme.name.toLowerCase()}`, '_blank')}
              onDelete={handleToggleStatus}
            />
          ))}
        </div>
      )}

      <AddThemeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchThemes} 
      />
    </div>
  );
}
