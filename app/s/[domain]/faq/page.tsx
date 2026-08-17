"use client";

import { use } from "react";
import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import Link from "next/link";
import { useThemeCustomizations } from "@/components/storefront/theme-provider";
import { defaultThemeCustomizations } from "@/components/storefront/theme-provider";

export default function FAQPage(props: { params: Promise<{ domain: string }> }) {
  const params = use(props.params);
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const { customizations } = useThemeCustomizations();
  
  const faqs = customizations.pageData?.faq?.items || defaultThemeCustomizations.pageData.faq.items;

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      <main className="flex-grow bg-background py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">Frequently Asked Questions</h1>
          <div className="space-y-8">
            {faqs.map((faq, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-medium text-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-muted rounded-lg px-6 py-8 sm:p-10 text-center border border-border">
            <h3 className="text-lg font-medium text-foreground">Still have questions?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <div className="mt-6">
              <Link
                href={`/s/${params.domain}/contact`}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
