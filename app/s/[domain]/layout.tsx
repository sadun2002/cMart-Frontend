import { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/storefront/theme-provider";
import { StorefrontNavigationObserver } from "@/components/storefront/navigation-observer";

export const metadata: Metadata = {
  title: "Online Store",
  description: "Powered by cMart",
};

export default async function StorefrontLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const params = await paramsPromise;
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-foreground bg-background">
      {/* 
        This is the root Theme Engine layout. 
        In the future, we will fetch the active theme for params.domain 
        and conditionally render the correct Header/Footer components.
      */}
      <ThemeProvider>
        <StorefrontNavigationObserver domain={params.domain} />
        {children}
        <Toaster position="bottom-center" />
      </ThemeProvider>
    </div>
  );
}
