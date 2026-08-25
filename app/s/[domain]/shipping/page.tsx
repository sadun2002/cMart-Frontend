"use client";
import { AuraPolicies } from "@/components/storefront/themes/aura/pages/AuraPolicies";
import { MarketPolicies } from "@/components/storefront/themes/market/pages/MarketPolicies";


import { use } from "react";
import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import { useThemeCustomizations, defaultThemeCustomizations } from "@/components/storefront/theme-provider";
import { VerdantShipping } from "@/components/storefront/themes/verdant/pages/VerdantPolicies";


export default function ShippingPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const searchParams = props.searchParams ? use(props.searchParams) : {};
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;

  const { customizations } = useThemeCustomizations();
  const content = customizations.pageData?.shipping?.content || defaultThemeCustomizations.pageData.shipping.content;

  if (theme === 'market') {
    return <MarketPolicies storeName={storeName} domain={params.domain} />;
  }
  if (theme === 'aura') {
    return <AuraPolicies storeName={storeName} domain={params.domain} title="Shipping & Returns" lastUpdated="March 2027" children={<><h3>Standard Shipping</h3><p>Delivery within 2-4 business days.</p></>} />;
  }

  if (theme === 'verdant') {
    return <VerdantShipping storeName={storeName} domain={params.domain} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      <main className="flex-grow bg-background py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">Shipping & Returns</h1>
          <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </main>
      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
