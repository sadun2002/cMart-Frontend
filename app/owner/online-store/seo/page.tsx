'use client';

import { useState } from 'react';
import { 
  Search, Globe, Image as ImageIcon, BarChart, 
  Settings2, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function SEOPage() {
  const [formData, setFormData] = useState({
    homeTitle: 'C-Mart Online Store | Premium Electronics & Fashion',
    homeDescription: 'Shop the best electronics, fashion, and groceries at C-Mart. Enjoy fast delivery and great prices!',
    ogImage: '',
    googleAnalytics: 'G-XXXXXXXXXX',
    facebookPixel: ''
  });

  const handleSave = () => {
    toast.success('SEO preferences saved successfully');
  };

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6 relative overflow-hidden overflow-y-auto">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-600" />
            SEO & Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage how your store appears in search engines and social media.</p>
        </div>
        <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors shrink-0">
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full pb-10">
        
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Global SEO */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Storefront SEO
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">This information is used by search engines (like Google) to display your homepage.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Homepage Title</label>
                <input 
                  type="text" 
                  value={formData.homeTitle}
                  onChange={e => setFormData({...formData, homeTitle: e.target.value})}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                  maxLength={70}
                />
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>Used as the title tag. Keep it under 70 characters.</span>
                  <span>{formData.homeTitle.length} / 70</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Homepage Meta Description</label>
                <textarea 
                  value={formData.homeDescription}
                  onChange={e => setFormData({...formData, homeDescription: e.target.value})}
                  className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all resize-none"
                  maxLength={320}
                ></textarea>
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>Keep it under 320 characters.</span>
                  <span>{formData.homeDescription.length} / 320</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Social Media Image
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">This image appears when a link to your store is shared on social media (Facebook, WhatsApp, Twitter).</p>
            </div>
            
            <div className="p-6">
              <div className="w-full max-w-md aspect-[1.91/1] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer transition-all group overflow-hidden relative">
                {formData.ogImage ? (
                  <img src={formData.ogImage} alt="Social Share" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Upload Social Image</span>
                    <span className="text-xs font-medium mt-1 opacity-70">Recommended: 1200 x 630 px</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Analytics & Tracking */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Analytics & Tracking
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Connect tracking tools to analyze your store traffic.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Google Analytics (Measurement ID)</label>
                <input 
                  type="text" 
                  value={formData.googleAnalytics}
                  onChange={e => setFormData({...formData, googleAnalytics: e.target.value})}
                  placeholder="e.g. G-ABC123XYZ"
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all uppercase placeholder:normal-case"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Facebook Pixel ID</label>
                <input 
                  type="text" 
                  value={formData.facebookPixel}
                  onChange={e => setFormData({...formData, facebookPixel: e.target.value})}
                  placeholder="e.g. 123456789012345"
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-900 dark:text-white font-medium outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Live Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Search Engine Preview
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                <div className="text-xs text-slate-500 font-medium mb-1 truncate">https://mystore.cmart.lk/</div>
                <div className="text-[18px] text-[#1a0dab] dark:text-[#8ab4f8] font-normal hover:underline cursor-pointer truncate leading-tight">
                  {formData.homeTitle || 'Your Store Title'}
                </div>
                <div className="text-sm text-[#4d5156] dark:text-[#bdc1c6] mt-1 line-clamp-2 leading-snug">
                  {formData.homeDescription || 'Your store description will appear here in search results.'}
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  It can take up to 48 hours for search engines to reflect these changes after saving.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
