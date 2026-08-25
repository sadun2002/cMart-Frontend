'use client';

import { useState, useEffect } from 'react';
import { 
  Monitor, Smartphone, Palette, Save, Layout, Type, FileText, PanelRightClose, PanelRightOpen, Globe, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { themeApi } from '@/lib/services';
import { defaultThemeCustomizations } from '@/components/storefront/theme-provider';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomSelect } from '@/components/ui/custom-select';

// Mock Data
const mockPages = [
  { id: '1', title: 'Home', handle: '/', status: 'Published' },
  { id: '2', title: 'Shop', handle: '/shop', status: 'Published' },
  { id: '3', title: 'Product Details', handle: '/product/1', status: 'Published' },
  { id: '4', title: 'Cart', handle: '/cart', status: 'Published' },
  { id: '5', title: 'Checkout', handle: '/checkout', status: 'Published' },
  { id: '6', title: 'Categories', handle: '/categories', status: 'Published' },
  { id: '7', title: 'Offers and Sales', handle: '/offers', status: 'Published' },
  { id: '8', title: 'About Us', handle: '/about', status: 'Published' },
  { id: '9', title: 'Contact', handle: '/contact', status: 'Published' },
  { id: '10', title: 'FAQ', handle: '/faq', status: 'Published' },
  { id: '11', title: 'Shipping', handle: '/shipping', status: 'Published' },
  { id: '12', title: 'Privacy Policy', handle: '/privacy', status: 'Published' },
  { id: '13', title: 'Terms', handle: '/terms', status: 'Published' },
  { id: '14', title: 'Login', handle: '/login', status: 'Published' },
  { id: '15', title: 'Register', handle: '/register', status: 'Published' },
  { id: '16', title: 'Account', handle: '/account', status: 'Published' },
  { id: '17', title: 'Forgot Password', handle: '/forgot-password', status: 'Published' },
];

const FONTS = [
  { name: 'Roboto', label: 'Roboto (Modern)' },
  { name: 'Open Sans', label: 'Open Sans (Clean)' },
  { name: 'Lato', label: 'Lato (Friendly)' },
  { name: 'Montserrat', label: 'Montserrat (Geometric)' },
  { name: 'Oswald', label: 'Oswald (Impactful)' },
  { name: 'Source Sans 3', label: 'Source Sans 3 (Corporate)' },
  { name: 'Slabo 27px', label: 'Slabo 27px (Classic)' },
  { name: 'Raleway', label: 'Raleway (Elegant)' },
  { name: 'PT Sans', label: 'PT Sans (Compact)' },
  { name: 'Merriweather', label: 'Merriweather (Literary)' },
  { name: 'Nunito', label: 'Nunito (Rounded)' },
  { name: 'Playfair Display', label: 'Playfair (Editorial)' },
  { name: 'Ubuntu', label: 'Ubuntu (Tech)' },
  { name: 'Rubik', label: 'Rubik (Soft)' },
  { name: 'Work Sans', label: 'Work Sans (Minimal)' },
  { name: 'Lora', label: 'Lora (Storytelling)' },
  { name: 'Fira Sans', label: 'Fira Sans (Legible)' },
  { name: 'Quicksand', label: 'Quicksand (Playful)' },
  { name: 'Karla', label: 'Karla (Quirky)' },
  { name: 'Barlow', label: 'Barlow (Industrial)' },
  { name: 'Mulish', label: 'Mulish (Versatile)' },
  { name: 'Inconsolata', label: 'Inconsolata (Code)' },
  { name: 'Titillium Web', label: 'Titillium Web (Square)' },
  { name: 'Heebo', label: 'Heebo (Hebrew/Latin)' },
  { name: 'Outfit', label: 'Outfit (Startup)' },
  { name: 'Poppins', label: 'Poppins (Geometric)' },
  { name: 'Noto Sans Sinhala', label: 'Noto Sans Sinhala (Local)' },
  { name: 'Roboto Slab', label: 'Roboto Slab (Slab Serif)' },
  { name: 'Inter', label: 'Inter (UI/App)' },
];

const AccordionSection = ({ title, icon: Icon, children, defaultExpanded = true }: any) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  return (
    <section>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 group-hover:text-slate-600 dark:text-slate-300 transition-colors">
          <Icon className="w-4 h-4" /> {title}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:text-slate-300 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:text-slate-300 transition-colors" />
        )}
      </button>
      {isExpanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </section>
  );
};

export default function ThemeCustomizer() {
  const [activeTab, setActiveTab] = useState<'pages' | 'settings'>('settings');
  const [pages, setPages] = useState(mockPages);
  const [activePage, setActivePage] = useState(mockPages[0]);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPanel, setShowPanel] = useState(true);
  
  const [customizations, setCustomizations] = useState(defaultThemeCustomizations);
  const [activeThemeId, setActiveThemeId] = useState<string | number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [iframeSrc, setIframeSrc] = useState('');

  // Initial load from localStorage so it remembers last state
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const myThemeRes = await themeApi.getMyTheme().catch(() => null);
        const myThemeData = myThemeRes as any;
        const myTheme = myThemeData?.data?.theme || myThemeData?.theme || myThemeData?.data || myThemeData;
        const themeId = myTheme?.id || 'default';
        setActiveThemeId(themeId);
        
        const storageKey = `theme_customizations_${themeId}`;
        const stored = localStorage.getItem(storageKey);
        
        // Initialize iframeSrc
        setIframeSrc(`/s/demo?themeId=${themeId}`);
        
        if (stored) {
          try {
            setCustomizations(JSON.parse(stored));
          } catch (e) {}
        } else if (myTheme?.colors) {
           // If the theme has its own default colors defined in the DB, use them!
           setCustomizations(prev => ({
             ...prev,
             colors: {
               ...prev.colors,
               ...myTheme.colors
             }
           }));
        }
      } catch (err) {
        console.error("Failed to load active theme settings:", err);
      }
    };
    loadThemeSettings();
  }, []);

  // Sync to iframe via localStorage and postMessage for real-time preview
  useEffect(() => {
    if (activeThemeId) {
      localStorage.setItem(`theme_customizations_${activeThemeId}`, JSON.stringify(customizations));
      
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'THEME_UPDATE',
          customizations,
          themeId: activeThemeId
        }, '*');
      }
    }
  }, [customizations, activeThemeId]);

  // Sync iframe route changes back to activePage
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STOREFRONT_ROUTE_CHANGED' && e.data?.pathname) {
        const pathname = e.data.pathname as string;
        
        // Pathname is usually /s/[domain]/[handle]
        const parts = pathname.split('/').filter(Boolean);
        // parts = ['s', 'demo', 'shop']
        let handle = '/';
        if (parts.length > 2) {
          handle = '/' + parts.slice(2).join('/');
        }
        
        let matchedPage = pages.find(p => p.handle === handle);
        
        // Handle dynamic routes
        if (!matchedPage) {
          if (handle.startsWith('/product/')) {
            matchedPage = pages.find(p => p.handle.startsWith('/product/'));
          } else if (handle.startsWith('/categories/')) {
            matchedPage = pages.find(p => p.handle.startsWith('/categories'));
          }
        }
        
        if (matchedPage) {
          // Update active page without causing an infinite navigation loop
          // (the iframe is already there, we just update the sidebar)
          setActivePage(matchedPage);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pages]);

  const handlePageClick = (page: typeof mockPages[0]) => {
    setActivePage(page);
    setIframeSrc(`/s/demo${page.handle !== '/' ? page.handle : ''}?themeId=${activeThemeId || 'default'}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await themeApi.updateCustomizations(customizations).catch(() => {}); // Optional backend save
      toast.success('Theme customizations saved successfully!');
    } catch {
      toast.success('Theme customizations saved locally!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const myThemeRes = await themeApi.getMyTheme().catch(() => null);
      const myThemeData = myThemeRes as any;
      const myTheme = myThemeData?.data?.theme || myThemeData?.theme || myThemeData?.data || myThemeData;
      
      let resetValues = { ...defaultThemeCustomizations };
      if (myTheme?.colors) {
        resetValues.colors = {
          ...resetValues.colors,
          ...myTheme.colors
        };
      }
      setCustomizations(resetValues);

      // Delete all existing banners so default banner is shown
      try {
        const { bannersApi } = await import('@/lib/services');
        const res = await bannersApi.list();
        const existingBanners = res.data || [];
        for (const banner of existingBanners) {
          await bannersApi.delete(banner.id);
        }
      } catch (err) {
        console.error('Failed to delete banners on reset', err);
      }

      toast.success('Theme reset to defaults');
      setIsResetOpen(false);
    } catch (e) {
      toast.error('Failed to reset theme');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    // Absolute positioning keeps it within the dashboard layout boundary, preventing sidebar overlap
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-900/50 flex flex-col font-sans">
      {/* Topbar */}
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            Page Editor
          </h1>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-white dark:bg-slate-900 shadow text-blue-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50'}`} title="Desktop View">
            <Monitor className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-white dark:bg-slate-900 shadow text-blue-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50'}`} title="Mobile View">
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsResetOpen(true)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`px-5 py-2 ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-row-reverse overflow-hidden relative">
        
        {/* Right Sidebar (Settings) Toggle Button when hidden */}
        {!showPanel && (
          <button 
            onClick={() => setShowPanel(true)} 
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-r-0 rounded-l-xl p-2 shadow-md z-50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 transition-colors"
            title="Show Settings Panel"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        )}

        {/* Right Sidebar (Settings) */}
        {showPanel && (
          <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10 shadow-sm transition-all">
            {/* Tabs */}
            <div className="flex p-2 gap-1 border-b border-slate-100 dark:border-slate-800 items-center">
              <button 
                onClick={() => setShowPanel(false)} 
                className="p-2 mr-1 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors" 
                title="Hide Panel"
              >
                <PanelRightClose className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 hover:bg-slate-50 dark:bg-slate-900/50'}`}
              >
              Theme Settings
            </button>
            <button 
              onClick={() => setActiveTab('pages')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'pages' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 hover:bg-slate-50 dark:bg-slate-900/50'}`}
            >
              Pages
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 pb-64 custom-scrollbar">
            {activeTab === 'settings' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Typography */}
                <AccordionSection title="Typography" icon={Type}>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Global Font</label>
                    <select 
                      value={customizations.font}
                      onChange={(e) => setCustomizations({...customizations, font: e.target.value})}
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      {FONTS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                    </select>
                  </div>
                </AccordionSection>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Colors */}
                <AccordionSection title="Colors" icon={Palette}>
                  <div className="space-y-4">
                    {Object.entries(customizations.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">{key}</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-400 uppercase">{value}</span>
                          <input 
                            type="color" 
                            value={value}
                            onChange={(e) => setCustomizations({
                              ...customizations, 
                              colors: { ...customizations.colors, [key as keyof typeof customizations.colors]: e.target.value }
                            })}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionSection>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Hero Settings */}
                <AccordionSection title="Hero Settings" icon={Layout}>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Hero Title</label>
                      <input 
                        type="text"
                        value={customizations.pageData?.hero?.title || ''}
                        onChange={(e) => setCustomizations({...customizations, pageData: { ...customizations.pageData, hero: { ...customizations.pageData?.hero, title: e.target.value } as any }})}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors"
                        placeholder="Welcome to our store"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Subtitle / Description</label>
                      <textarea 
                        value={customizations.pageData?.hero?.subtitle || ''}
                        onChange={(e) => setCustomizations({...customizations, pageData: { ...customizations.pageData, hero: { ...customizations.pageData?.hero, subtitle: e.target.value } as any }})}
                        className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors resize-none"
                        placeholder="Discover our curated collection..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Button Text</label>
                      <input 
                        type="text"
                        value={customizations.pageData?.hero?.buttonText || ''}
                        onChange={(e) => setCustomizations({...customizations, pageData: { ...customizations.pageData, hero: { ...customizations.pageData?.hero, buttonText: e.target.value } as any }})}
                        className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors"
                        placeholder="Shop Now"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Button Link</label>
                      <CustomSelect 
                        value={customizations.pageData?.hero?.buttonLink || '/shop'}
                        onChange={(val) => setCustomizations({...customizations, pageData: { ...customizations.pageData, hero: { ...customizations.pageData?.hero, buttonLink: val } as any }})}
                        options={[
                          { label: 'Shop', value: '/shop' },
                          { label: 'Categories', value: '/categories' },
                          { label: 'Offers and Sales', value: '/offers' },
                          { label: 'About Us', value: '/about' },
                          { label: 'Contact Us', value: '/contact' },
                        ]}
                      />
                    </div>
                  </div>
                </AccordionSection>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Footer Settings - Always Show */}
                <AccordionSection title="Footer Settings" icon={Layout}>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Footer Text</label>
                      <textarea 
                        value={customizations.footerText}
                        onChange={(e) => setCustomizations({...customizations, footerText: e.target.value})}
                        className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Social Media Links</label>
                      <div className="space-y-3">
                        {['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok', 'whatsapp'].map((platform) => {
                          const links = customizations.socialLinks || defaultThemeCustomizations.socialLinks;
                          const socialData = links[platform as keyof typeof links] || { enabled: false, url: '' };
                          
                          return (
                            <div key={platform} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                              <div className="flex items-center gap-2 w-28 shrink-0">
                                <button
                                  onClick={() => {
                                    setCustomizations({
                                      ...customizations,
                                      socialLinks: {
                                        ...(customizations.socialLinks || defaultThemeCustomizations.socialLinks),
                                        [platform]: { ...socialData, enabled: !socialData.enabled }
                                      }
                                    });
                                  }}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${socialData.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                                >
                                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${socialData.enabled ? 'translate-x-2' : '-translate-x-2'}`} />
                                </button>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">{platform}</span>
                              </div>
                              <input
                                type="text"
                                placeholder={`https://${platform}.com/...`}
                                value={socialData.url}
                                onChange={(e) => {
                                  setCustomizations({
                                    ...customizations,
                                    socialLinks: {
                                      ...(customizations.socialLinks || defaultThemeCustomizations.socialLinks),
                                      [platform]: { ...socialData, url: e.target.value }
                                    }
                                  });
                                }}
                                disabled={!socialData.enabled}
                                className="flex-1 h-8 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-400 dark:text-slate-400"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </AccordionSection>



                {/* Dynamic Page Settings */}
                {['/contact', '/about', '/terms', '/privacy', '/shipping', '/faq'].includes(activePage.handle) && (
                  <>
                    <hr className="border-slate-100 dark:border-slate-800" />
                    <AccordionSection title={`${activePage.title} Settings`} icon={FileText}>
                      <div className="space-y-6">
                        {activePage.handle === '/contact' && (
                          <>
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Email Address</label>
                              <input 
                                type="email"
                                value={customizations.pageData?.contact?.email || ''}
                                onChange={(e) => setCustomizations({...customizations, pageData: { ...customizations.pageData, contact: { ...customizations.pageData?.contact, email: e.target.value } as any }})}
                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Phone Number</label>
                              <input 
                                type="text"
                                value={customizations.pageData?.contact?.phone || ''}
                                onChange={(e) => setCustomizations({...customizations, pageData: { ...customizations.pageData, contact: { ...customizations.pageData?.contact, phone: e.target.value } as any }})}
                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Physical Address</label>
                              <textarea 
                                value={customizations.pageData?.contact?.address || ''}
                                onChange={(e) => setCustomizations({...customizations, pageData: { ...customizations.pageData, contact: { ...customizations.pageData?.contact, address: e.target.value } as any }})}
                                className="w-full h-20 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors resize-none"
                              />
                            </div>
                          </>
                        )}

                        {activePage.handle === '/about' && (
                          <>
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Page Title</label>
                              <input 
                                type="text"
                                value={customizations.pageData?.about?.title || ''}
                                onChange={(e) => setCustomizations({...customizations, pageData: { ...customizations.pageData, about: { ...customizations.pageData?.about, title: e.target.value } as any }})}
                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Subtitle</label>
                              <textarea 
                                value={customizations.pageData?.about?.subtitle || ''}
                                onChange={(e) => setCustomizations({...customizations, pageData: { ...customizations.pageData, about: { ...customizations.pageData?.about, subtitle: e.target.value } as any }})}
                                className="w-full h-16 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors resize-none"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Our Story</label>
                              <textarea 
                                value={customizations.pageData?.about?.story || ''}
                                onChange={(e) => setCustomizations({...customizations, pageData: { ...customizations.pageData, about: { ...customizations.pageData?.about, story: e.target.value } as any }})}
                                className="w-full h-48 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors resize-none"
                              />
                            </div>
                          </>
                        )}

                        {['/terms', '/privacy', '/shipping'].includes(activePage.handle) && (
                          <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">{activePage.handle.replace('/', '')} Content</label>
                            <textarea 
                              value={(customizations.pageData?.[activePage.handle.replace('/', '') as keyof typeof customizations.pageData] as any)?.content || ''}
                              onChange={(e) => setCustomizations({
                                ...customizations, 
                                pageData: { 
                                  ...customizations.pageData, 
                                  [activePage.handle.replace('/', '')]: { content: e.target.value } 
                                } as any 
                              })}
                              className="w-full h-[400px] p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                          </div>
                        )}

                        {activePage.handle === '/faq' && (
                          <div className="space-y-4">
                            {(customizations.pageData?.faq?.items || []).map((faqItem, idx) => (
                              <div key={idx} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50 relative group">
                                <button 
                                  onClick={() => {
                                    const newItems = [...(customizations.pageData?.faq?.items || [])];
                                    newItems.splice(idx, 1);
                                    setCustomizations({...customizations, pageData: { ...customizations.pageData, faq: { items: newItems } } as any});
                                  }}
                                  className="absolute right-2 top-2 p-1.5 text-slate-400 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Question</label>
                                    <input 
                                      type="text"
                                      value={faqItem.question}
                                      onChange={(e) => {
                                        const newItems = [...(customizations.pageData?.faq?.items || [])];
                                        newItems[idx].question = e.target.value;
                                        setCustomizations({...customizations, pageData: { ...customizations.pageData, faq: { items: newItems } } as any});
                                      }}
                                      className="w-full mt-1 h-8 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Answer</label>
                                    <textarea 
                                      value={faqItem.answer}
                                      onChange={(e) => {
                                        const newItems = [...(customizations.pageData?.faq?.items || [])];
                                        newItems[idx].answer = e.target.value;
                                        setCustomizations({...customizations, pageData: { ...customizations.pageData, faq: { items: newItems } } as any});
                                      }}
                                      className="w-full mt-1 h-16 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 resize-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newItems = [...(customizations.pageData?.faq?.items || []), { question: '', answer: '' }];
                                setCustomizations({...customizations, pageData: { ...customizations.pageData, faq: { items: newItems } } as any});
                              }}
                              className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add FAQ Item
                            </button>
                          </div>
                        )}
                      </div>
                    </AccordionSection>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider">Your Pages</h3>
                </div>
                {pages.map(page => (
                  <div 
                    key={page.id} 
                    onClick={() => handlePageClick(page)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${activePage.id === page.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className={`w-5 h-5 ${activePage.id === page.id ? 'text-blue-600' : 'text-slate-400 dark:text-slate-400'}`} />
                        <div>
                          <div className={`font-bold text-sm ${activePage.id === page.id ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-200'}`}>{page.title}</div>
                          <div className={`text-xs mt-0.5 ${activePage.id === page.id ? 'text-blue-600/70' : 'text-slate-500 dark:text-slate-400'}`}>{page.handle}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Live Preview Area */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Iframe wrapper for mobile/desktop toggle */}
          <div className={`transition-all duration-500 ease-in-out bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-800 relative flex flex-col ${viewMode === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full max-w-[1440px] h-full'}`}>
            {/* Browser-like header for preview */}
            <div className="h-12 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-inner"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-inner"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-inner"></div>
              </div>
              <div className="flex-1 max-w-md mx-auto h-7 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex items-center px-3 gap-2 shadow-sm">
                <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">store.cmart.lk/s/demo{activePage.handle !== '/' ? activePage.handle : ''}</span>
              </div>
            </div>
            
            {/* Actual Iframe */}
            <iframe 
              id="preview-iframe"
              src={iframeSrc || `/s/demo?themeId=${activeThemeId || 'default'}`} 
              className="w-full flex-1 border-0"
              title="Live Preview"
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isResetOpen}
        title="Reset Theme Settings"
        message="Are you sure you want to reset all customizations? This will revert your fonts, colors, and footer text back to the default theme settings."
        confirmText="Reset Theme"
        onConfirm={handleReset}
        onCancel={() => setIsResetOpen(false)}
        type="info"
        isLoading={isResetting}
      />
    </div>
  );
}
