"use client";

import { use } from "react";
import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import { useThemeCustomizations, defaultThemeCustomizations } from "@/components/storefront/theme-provider";

export default function PrivacyPage(props: { params: Promise<{ domain: string }> }) {
  const params = use(props.params);
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const { customizations } = useThemeCustomizations();
  const content = customizations.pageData?.privacy?.content || defaultThemeCustomizations.pageData.privacy.content;

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      <main className="flex-grow bg-background py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">Privacy Policy</h1>
          <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </main>
      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
