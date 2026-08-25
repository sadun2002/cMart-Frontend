import { AuraHome } from "@/components/storefront/themes/aura/pages/AuraHome";
import { VerdantHome } from "@/components/storefront/themes/verdant/pages/VerdantHome";
import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistBanners } from "@/components/storefront/themes/minimalist/MinimalistBanners";
import { MinimalistProductGrid } from "@/components/storefront/themes/minimalist/MinimalistProductGrid";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import { MarketHome } from "@/components/storefront/themes/market/pages/MarketHome";

export default async function StorefrontHomePage(props: { 
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;


  if (theme === 'market') {
    return <MarketHome storeName={storeName} domain={params.domain} />;
  }
  if (theme === 'aura') {
    return <AuraHome storeName={storeName} domain={params.domain} />;
  }

  if (theme === 'verdant') {
    return <VerdantHome storeName={storeName} domain={params.domain} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow">
        <MinimalistBanners domain={params.domain} />
        <MinimalistProductGrid domain={params.domain} title="New Arrivals" />
        <MinimalistProductGrid domain={params.domain} title="Best Sellers" />
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
