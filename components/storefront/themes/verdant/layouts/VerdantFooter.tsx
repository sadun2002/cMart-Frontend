'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, Facebook, Instagram, Twitter, Youtube, Linkedin, Phone as WhatsappIcon, MapPin, Mail, Phone } from 'lucide-react';
import { useThemeCustomizations } from '@/components/storefront/theme-provider';
import { useSearchParams } from 'next/navigation';

export function VerdantFooter({ storeName, domain }: { storeName: string; domain: string }) {
  const { customizations } = useThemeCustomizations();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  const formatUrl = (url: string) => {
    if (!url) return '#';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-verdant-surface text-verdant-on-surface-variant border-t border-verdant-surface-container mt-auto">
      <div className="container mx-auto px-4 md:px-8 max-w-[1280px] py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <Link href={`/s/${domain}${themeQuery}`} className="flex items-center gap-2 group w-fit">
              <div className="bg-primary text-primary-foreground p-2 rounded-xl">
                <Leaf size={24} />
              </div>
              <span className="font-verdant-heading font-bold text-2xl tracking-tight text-verdant-on-surface">
                {storeName}
              </span>
            </Link>
            <p className="font-verdant-body text-sm mt-2 leading-relaxed">
              {customizations.pageData?.about?.subtitle || 'Providing you with the freshest and highest quality products.'}
            </p>
            
            <div className="flex items-center gap-4 mt-2">
              {customizations.socialLinks?.facebook?.enabled && (
                <a href={formatUrl(customizations.socialLinks.facebook.url)} target="_blank" rel="noopener noreferrer" className="p-2 bg-verdant-surface-container rounded-full hover:bg-primary hover:text-white transition-colors">
                  <Facebook size={18} />
                </a>
              )}
              {customizations.socialLinks?.instagram?.enabled && (
                <a href={formatUrl(customizations.socialLinks.instagram.url)} target="_blank" rel="noopener noreferrer" className="p-2 bg-verdant-surface-container rounded-full hover:bg-primary hover:text-white transition-colors">
                  <Instagram size={18} />
                </a>
              )}
              {customizations.socialLinks?.twitter?.enabled && (
                <a href={formatUrl(customizations.socialLinks.twitter.url)} target="_blank" rel="noopener noreferrer" className="p-2 bg-verdant-surface-container rounded-full hover:bg-primary hover:text-white transition-colors">
                  <Twitter size={18} />
                </a>
              )}
              {customizations.socialLinks?.whatsapp?.enabled && (
                <a href={formatUrl(customizations.socialLinks.whatsapp.url)} target="_blank" rel="noopener noreferrer" className="p-2 bg-verdant-surface-container rounded-full hover:bg-primary hover:text-white transition-colors">
                  <WhatsappIcon size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-verdant-heading font-semibold text-lg text-verdant-on-surface mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-3 font-verdant-body text-sm">
              <li><Link href={`/s/${domain}/shop${themeQuery}`} className="hover:text-primary transition-colors">Shop All</Link></li>
              <li><Link href={`/s/${domain}/categories${themeQuery}`} className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link href={`/s/${domain}/offers${themeQuery}`} className="hover:text-primary transition-colors">Special Offers</Link></li>
              <li><Link href={`/s/${domain}/about${themeQuery}`} className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-verdant-heading font-semibold text-lg text-verdant-on-surface mb-4">Support</h3>
            <ul className="flex flex-col gap-3 font-verdant-body text-sm">
              <li><Link href={`/s/${domain}/contact${themeQuery}`} className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href={`/s/${domain}/faq${themeQuery}`} className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href={`/s/${domain}/shipping${themeQuery}`} className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link href={`/s/${domain}/terms${themeQuery}`} className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href={`/s/${domain}/privacy${themeQuery}`} className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-verdant-heading font-semibold text-lg text-verdant-on-surface mb-4">Contact Info</h3>
            <ul className="flex flex-col gap-4 font-verdant-body text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <span>{customizations.pageData?.contact?.address || '123 Grocery Lane, Fresh City'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>{customizations.pageData?.contact?.phone || '+94 123 456 789'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span>{customizations.pageData?.contact?.email || 'hello@store.com'}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-verdant-surface-container flex flex-col md:flex-row items-center justify-between gap-4 font-verdant-body text-sm text-verdant-on-surface-variant/70">
          <p>{customizations.footerText || `© ${currentYear} ${storeName}. All rights reserved.`}</p>
          <div className="flex gap-4">
            <span className="bg-verdant-surface-container px-2 py-1 rounded">Visa</span>
            <span className="bg-verdant-surface-container px-2 py-1 rounded">Mastercard</span>
            <span className="bg-verdant-surface-container px-2 py-1 rounded">Amex</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
