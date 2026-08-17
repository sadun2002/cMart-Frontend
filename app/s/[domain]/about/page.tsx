"use client";

import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import { use } from "react";
import { useThemeCustomizations } from "@/components/storefront/theme-provider";

export default function StorefrontAboutPage(props: { params: Promise<{ domain: string }> }) {
  const params = use(props.params);
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const { customizations } = useThemeCustomizations();
  const aboutData = customizations.pageData?.about;

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow bg-background py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              {aboutData?.title || `About ${storeName}`}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
              {aboutData?.subtitle || 'Curating quality and simplicity for the modern lifestyle.'}
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Our Story</h2>
                <div className="mt-4 text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {aboutData?.story || 'Founded with a passion for exceptional design...'}
                </div>
              </div>
              <div className="bg-muted aspect-w-4 aspect-h-3 rounded-lg overflow-hidden flex items-center justify-center">
                <span className="text-muted-foreground font-medium">[ Brand Image ]</span>
              </div>
            </div>
          </div>

          <div className="mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-muted">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-foreground">Quality First</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  We rigorously test every product to ensure it meets our high standards for durability and craftsmanship.
                </p>
              </div>
              <div>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-muted">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-foreground">Timeless Design</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Our selections are free from passing trends, focusing on clean lines and forms that never go out of style.
                </p>
              </div>
              <div>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-muted">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-foreground">Sustainable Sourcing</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  We care about our planet. We prioritize materials and manufacturing processes that minimize environmental impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
