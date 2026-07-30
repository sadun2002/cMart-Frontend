'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { formatLKR, formatDate } from '@/lib/constants';

interface Theme {
  id: number;
  name: string;
  description: string;
  price: string;
  type: string;
  isActive: boolean;
  version: string;
  createdAt: string;
}

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    type: 'FREE',
    version: '1.0.0',
    // Mock URLs for now
    previewUrl: 'https://via.placeholder.com/600x400.png?text=Theme+Preview',
    zipUrl: 'https://example.com/theme.zip',
  });

  const fetchThemes = async () => {
    try {
      const response = await api.get('/themes/all');
      setThemes(response.data);
    } catch (error) {
      toast.error('Failed to load themes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      await api.post('/themes', formData);
      toast.success('Theme successfully added to the marketplace!');
      setIsModalOpen(false);
      fetchThemes();
      setFormData({ ...formData, name: '', description: '', price: 0 }); // reset
    } catch (error) {
      toast.error('Failed to upload theme');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleThemeStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/themes/${id}/status`, { isActive: !currentStatus });
      toast.success(`Theme ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchThemes();
    } catch (error) {
      toast.error('Failed to update theme status');
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Theme Library</h1>
          <p className="text-gray-500">Upload and manage themes for tenant stores.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          + Upload New Theme
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading themes...</div>
        ) : themes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No themes uploaded yet</h3>
            <p className="text-gray-500 mt-1">Click the button above to add your first store theme.</p>
          </div>
        ) : (
          themes.map((theme) => (
            <div key={theme.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 border-b border-gray-100 flex items-center justify-center relative">
                <span className="text-gray-400 font-medium">Preview Image</span>
                {!theme.isActive && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                    INACTIVE
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{theme.name}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    theme.type === 'FREE' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {theme.type}
                  </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{theme.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-900">
                    {theme.type === 'FREE' ? 'Free' : formatLKR(Number(theme.price))}
                  </span>
                  <span className="text-gray-400">v{theme.version}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => toggleThemeStatus(theme.id, theme.isActive)}
                    className="flex-1 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {theme.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Upload New Theme</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Name</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Minimalist Dark"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the theme..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="FREE">Free</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
                  <input 
                    type="number" min="0" required disabled={formData.type === 'FREE'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    value={formData.type === 'FREE' ? 0 : formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme ZIP File</label>
                <input 
                  type="file" accept=".zip"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                <p className="text-xs text-gray-500 mt-1">Upload the HTML/CSS/JS bundle</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isUploading}
                  className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Publish Theme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
