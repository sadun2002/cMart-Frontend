"use client";
import { AuraContact } from "@/components/storefront/themes/aura/pages/AuraContact";
import { MarketContact } from "@/components/storefront/themes/market/pages/MarketContact";

import { VerdantContact } from "@/components/storefront/themes/verdant/pages/VerdantContact";

import { use } from "react";
import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import { useThemeCustomizations } from "@/components/storefront/theme-provider";


export default function ContactPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const searchParams = props.searchParams ? use(props.searchParams) : {};
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;

  const { customizations } = useThemeCustomizations();
  const contactData = customizations.pageData?.contact;


  if (theme === 'market') {
    return <MarketContact storeName={storeName} domain={params.domain} />;
  }
  if (theme === 'aura') {
    return <AuraContact storeName={storeName} domain={params.domain} />;
  }

  if (theme === 'verdant') {
    return <VerdantContact storeName={storeName} domain={params.domain} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      <main className="flex-grow bg-background py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">Contact Us</h1>
          <div className="prose prose-sm text-muted-foreground">
            <p>We'd love to hear from you. Please reach out using the details below or fill out the form.</p>
            <div className="mt-8 space-y-4">
              <p><strong>Email:</strong> {contactData?.email || `support@${params.domain}.com`}</p>
              <p><strong>Phone:</strong> {contactData?.phone || '+94 11 234 5678'}</p>
              <p><strong>Address:</strong> {contactData?.address || '123 Main Street, Colombo 01, Sri Lanka'}</p>
            </div>
            
            <form className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground">Name</label>
                <input type="text" className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Email</label>
                <input type="email" className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Message</label>
                <textarea rows={4} className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3"></textarea>
              </div>
              <button type="button" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
