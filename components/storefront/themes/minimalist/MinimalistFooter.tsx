'use client';
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { useThemeCustomizations } from "@/components/storefront/theme-provider";

export function MinimalistFooter({ storeName = "My Store", domain = "" }) {
  const { customizations } = useThemeCustomizations();
  
  const formatUrl = (url?: string) => {
    if (!url) return "#";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Col 1: Brand ── */}
          <div className="space-y-4">
            <span className="text-2xl font-bold tracking-tight text-foreground">{storeName}</span>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {customizations.footerText}
            </p>
            <div className="flex flex-wrap gap-4">
              {customizations.socialLinks?.facebook?.enabled && (
                <a href={formatUrl(customizations.socialLinks.facebook.url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">Facebook</span>
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {customizations.socialLinks?.instagram?.enabled && (
                <a href={formatUrl(customizations.socialLinks.instagram.url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">Instagram</span>
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {customizations.socialLinks?.twitter?.enabled && (
                <a href={formatUrl(customizations.socialLinks.twitter.url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {customizations.socialLinks?.youtube?.enabled && (
                <a href={formatUrl(customizations.socialLinks.youtube.url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">YouTube</span>
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {customizations.socialLinks?.linkedin?.enabled && (
                <a href={formatUrl(customizations.socialLinks.linkedin.url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {customizations.socialLinks?.whatsapp?.enabled && (
                <a href={formatUrl(customizations.socialLinks.whatsapp.url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">WhatsApp</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                </a>
              )}
              {customizations.socialLinks?.tiktok?.enabled && (
                <a href={formatUrl(customizations.socialLinks.tiktok.url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">TikTok</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 448 512" aria-hidden="true">
                    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* ── Col 2: Shop ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/s/${domain}/shop`} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  All Products
                </Link>
              </li>
              <li>
                <Link href={`/s/${domain}/categories`} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Categories
                </Link>
              </li>
              <li>
                <Link href={`/s/${domain}/offers`} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer">
                  Offers &amp; Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Col 3: Support ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/s/${domain}/contact`} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href={`/s/${domain}/faq`} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href={`/s/${domain}/shipping`} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Shipping &amp; Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Col 4: Company ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/s/${domain}/about`} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={`/s/${domain}/privacy`} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={`/s/${domain}/terms`} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 border-t border-gray-100 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved. Powered by cMart.
          </p>
        </div>

      </div>
    </footer>
  );
}
