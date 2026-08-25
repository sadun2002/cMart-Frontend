'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { superAdminAPI } from '@/lib/api';
import { toast } from 'sonner';

interface AddThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddThemeModal({ isOpen, onClose, onSuccess }: AddThemeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'FREE',
    price: '',
    previewUrl: '',
    tags: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        price: formData.type === 'PREMIUM' ? Number(formData.price) : 0,
        previewUrl: formData.previewUrl,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        version: '1.0.0',
      };

      await superAdminAPI.createTheme(payload);
      toast.success('Theme created successfully');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'FREE',
        price: '',
        previewUrl: '',
        tags: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create theme');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Theme</h2>
            <p className="text-sm text-slate-500">Publish a new storefront theme to the marketplace</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="add-theme-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Theme Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Verdant Pro"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tags <span className="text-slate-400 font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Modern, Minimal, Grocery"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief description of the theme's aesthetics and best use cases..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tier / Type
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value, price: e.target.value === 'FREE' ? '' : formData.price })}
                >
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>

              {formData.type === 'PREMIUM' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Price (LKR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="2500"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Preview URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 sm:text-sm">https://</span>
                  </div>
                  <input
                    type="text"
                    placeholder="preview-image-url.jpg or demo link"
                    className="w-full pl-16 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.previewUrl}
                    onChange={e => setFormData({ ...formData, previewUrl: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Provide a URL for the theme's preview screenshot or live demo iframe.</p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-theme-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Publish Theme
          </button>
        </div>

      </div>
    </div>
  );
}
