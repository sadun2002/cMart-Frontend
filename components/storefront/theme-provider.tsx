'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { themeApi } from '@/lib/services';

export const defaultThemeCustomizations = {
  font: 'Inter',
  colors: {
    primary: '#000000',     
    secondary: '#ffffff',
    accent: '#f3f4f6',      
    background: '#ffffff',  
    text: '#111827',
    mutedText: '#6b7280',        
  },
  footerText: '© 2026 cMart Store. All rights reserved.',
  socialLinks: {
    facebook: { enabled: true, url: '' },
    instagram: { enabled: true, url: '' },
    twitter: { enabled: true, url: '' },
    youtube: { enabled: true, url: '' },
    linkedin: { enabled: true, url: '' },
    tiktok: { enabled: true, url: '' },
    whatsapp: { enabled: true, url: '' },
  },
  pageData: {
    contact: {
      email: 'support@cmart.lk',
      phone: '+94 11 234 5678',
      address: '123 Main Street, Colombo 01, Sri Lanka',
    },
    about: {
      title: 'About Our Store',
      subtitle: 'Curating quality and simplicity for the modern lifestyle.',
      story: 'Founded with a passion for exceptional design and everyday utility, we started as a small project to bring beautifully crafted products to people who appreciate minimalism. We believe that the objects we interact with daily should not only be functional but also bring a sense of joy and calm to our lives.\n\nOver the years, we\'ve partnered with artisans and independent creators to curate a collection that reflects our core values: quality, sustainability, and timeless aesthetics.',
    },
    terms: {
      content: 'These are the terms and conditions. Please read them carefully before using our services.',
    },
    privacy: {
      content: 'This is the privacy policy. We respect your privacy and are committed to protecting your personal data.',
    },
    shipping: {
      content: 'We offer standard shipping which usually takes 3-5 business days. International shipping is currently unavailable.',
    },
    faq: {
      items: [
        { question: 'What is your return policy?', answer: 'You can return any unused item within 14 days of purchase.' },
        { question: 'How long does shipping take?', answer: 'Standard shipping usually takes 3-5 business days.' },
        { question: 'Do you offer international shipping?', answer: 'Currently, we only ship within Sri Lanka.' },
        { question: 'How can I track my order?', answer: 'Once your order is shipped, you will receive an email with a tracking link.' }
      ]
    }
  }
};

export const ThemeContext = createContext<{
  customizations: typeof defaultThemeCustomizations;
  isPreview: boolean;
}>({
  customizations: defaultThemeCustomizations,
  isPreview: false,
});

export const useThemeCustomizations = () => useContext(ThemeContext);

function hexToHslString(hex: string) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [customizations, setCustomizations] = useState(defaultThemeCustomizations);
  const [activeThemeId, setActiveThemeId] = useState<string | number | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Check if running inside an iframe (preview mode)
    if (typeof window !== 'undefined') {
      setIsPreview(window.self !== window.top);
    }
    
    const loadThemeSettings = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        let themeId = params.get('themeId');
        
        let myTheme = null;
        const myThemeRes = await themeApi.getMyTheme().catch(() => null);
        const myThemeData = myThemeRes as any;
        myTheme = myThemeData?.data?.theme || myThemeData?.theme || myThemeData?.data || myThemeData;
        
        if (!themeId || themeId === 'default') {
          themeId = myTheme?.id || 'default';
        }
        setActiveThemeId(themeId);
        
        const storageKey = `theme_customizations_${themeId}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          try {
            setCustomizations(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse theme customizations from localStorage');
          }
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

  useEffect(() => {
    if (!activeThemeId) return;
    const storageKey = `theme_customizations_${activeThemeId}`;

    // 2. Listen to storage events from the customizer iframe (fallback)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setCustomizations(JSON.parse(e.newValue));
        } catch (e) {
          console.error('Failed to parse incoming theme customizations');
        }
      }
    };

    // 3. Listen to postMessage events from parent window for real-time updates
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'THEME_UPDATE' && e.data?.customizations) {
        // In the customizer context, always accept the update from the parent.
        setCustomizations(e.data.customizations);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('message', handleMessage);
    };
  }, [activeThemeId]);

  // 3. Inject CSS Variables into the DOM dynamically
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font dynamically from Google Fonts
    if (customizations.font) {
      root.style.setProperty('--font-sans', `"${customizations.font}", sans-serif`);
      
      // Load the Google Font dynamically
      const fontName = customizations.font.replace(/ /g, '+');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700;800;900&display=swap`;
      
      let link = document.getElementById('dynamic-theme-font') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = 'dynamic-theme-font';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      if (link.href !== fontUrl) {
        link.href = fontUrl;
      }
    }

    // Apply colors (Convert Hex to HSL for Tailwind globals.css)
    if (customizations.colors) {
      if (customizations.colors.primary) {
        const primaryHsl = hexToHslString(customizations.colors.primary);
        root.style.setProperty('--primary', primaryHsl);
        root.style.setProperty('--ring', primaryHsl); // typically ring matches primary
        // For primary-foreground, we should ideally calculate contrast, but for now we fallback to white/black
        // Since default is dark primary, white foreground is safe. We will let it use globals.css default
        // unless we want to force it. For now, leave --primary-foreground to globals.css
      }
      if (customizations.colors.secondary) {
        const secondaryHsl = hexToHslString(customizations.colors.secondary);
        root.style.setProperty('--secondary', secondaryHsl);
        root.style.setProperty('--border', secondaryHsl);
        root.style.setProperty('--input', secondaryHsl);
      }
      if (customizations.colors.accent) {
        const accentHsl = hexToHslString(customizations.colors.accent);
        root.style.setProperty('--accent', accentHsl);
        root.style.setProperty('--muted', accentHsl);
      }
      if (customizations.colors.background) {
        const bgHsl = hexToHslString(customizations.colors.background);
        root.style.setProperty('--background', bgHsl);
        root.style.setProperty('--card', bgHsl);
        root.style.setProperty('--popover', bgHsl);
      }
      if (customizations.colors.text) {
        const textHsl = hexToHslString(customizations.colors.text);
        root.style.setProperty('--foreground', textHsl);
        root.style.setProperty('--card-foreground', textHsl);
        root.style.setProperty('--popover-foreground', textHsl);
      }
      if (customizations.colors.mutedText) {
        root.style.setProperty('--muted-foreground', hexToHslString(customizations.colors.mutedText));
      }
    }
  }, [customizations]);

  return (
    <ThemeContext.Provider value={{ customizations, isPreview }}>
      {children}
    </ThemeContext.Provider>
  );
}
