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
    hero: {
      title: 'Welcome to our store',
      subtitle: 'Discover our curated collection of essential pieces designed for modern living. Quality materials, timeless design, and unmatched comfort.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
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

function isColorDark(hex: string) {
  if (!hex) return false;
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
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
        
        // Only attempt to fetch if we might have a token, to prevent the axios interceptor from redirecting to /login
        const hasToken = document.cookie.includes('accessToken=');
        if (hasToken) {
          const myThemeRes = await themeApi.getMyTheme().catch(() => null);
          const myThemeData = myThemeRes as any;
          myTheme = myThemeData?.data?.theme || myThemeData?.theme || myThemeData?.data || myThemeData;
        }
        
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

  // 3. Inject CSS Variables into the DOM dynamically using a <style> tag
  // This allows dark mode to work because it prevents inline styles from overriding the .dark class
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

    // Apply colors via <style> tag to allow .dark class overriding
    let styleTag = document.getElementById('dynamic-theme-colors');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme-colors';
      document.head.appendChild(styleTag);
    }

    let cssText = '';

    if (customizations.colors) {
      const primaryHsl = customizations.colors.primary ? hexToHslString(customizations.colors.primary) : '';
      const secondaryHsl = customizations.colors.secondary ? hexToHslString(customizations.colors.secondary) : '';
      const accentHsl = customizations.colors.accent ? hexToHslString(customizations.colors.accent) : '';
      const bgHsl = customizations.colors.background ? hexToHslString(customizations.colors.background) : '';
      const textHsl = customizations.colors.text ? hexToHslString(customizations.colors.text) : '';
      const mutedTextHsl = customizations.colors.mutedText ? hexToHslString(customizations.colors.mutedText) : '';

      const primaryIsDark = customizations.colors.primary ? isColorDark(customizations.colors.primary) : false;
      const darkPrimaryHsl = primaryIsDark ? '0 0% 98%' : primaryHsl;

      cssText += `
        :root:not(.dark) {
          ${primaryHsl ? `--primary: ${primaryHsl}; --ring: ${primaryHsl};` : ''}
          ${secondaryHsl ? `--secondary: ${secondaryHsl}; --border: ${secondaryHsl}; --input: ${secondaryHsl};` : ''}
          ${accentHsl ? `--accent: ${accentHsl}; --muted: ${accentHsl};` : ''}
          ${bgHsl ? `--background: ${bgHsl}; --card: ${bgHsl}; --popover: ${bgHsl};` : ''}
          ${textHsl ? `--foreground: ${textHsl}; --card-foreground: ${textHsl}; --popover-foreground: ${textHsl};` : ''}
          ${mutedTextHsl ? `--muted-foreground: ${mutedTextHsl};` : ''}
        }
        
        .dark {
          --background: 240 10% 3.9%;
          --foreground: 0 0% 98%;
          --card: 240 10% 3.9%;
          --card-foreground: 0 0% 98%;
          --popover: 240 10% 3.9%;
          --popover-foreground: 0 0% 98%;
          --secondary: 240 3.7% 15.9%;
          --muted: 240 3.7% 15.9%;
          --muted-foreground: 240 5% 64.9%;
          --border: 240 3.7% 15.9%;
          --input: 240 3.7% 15.9%;
          --ring: 240 4.9% 83.9%;
          ${darkPrimaryHsl ? `--primary: ${darkPrimaryHsl};` : ''}
          ${primaryIsDark ? `--primary-foreground: 240 5.9% 10%;` : ''}
        }
      `;
    }

    styleTag.textContent = cssText;

    // Clean up inline styles that might have been left over from previous versions
    root.style.removeProperty('--primary');
    root.style.removeProperty('--ring');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--border');
    root.style.removeProperty('--input');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--muted');
    root.style.removeProperty('--background');
    root.style.removeProperty('--card');
    root.style.removeProperty('--popover');
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--card-foreground');
    root.style.removeProperty('--popover-foreground');
    root.style.removeProperty('--muted-foreground');

  }, [customizations]);

  return (
    <ThemeContext.Provider value={{ customizations, isPreview }}>
      {children}
    </ThemeContext.Provider>
  );
}

