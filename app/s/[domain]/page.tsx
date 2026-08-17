import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistHero } from "@/components/storefront/themes/minimalist/MinimalistHero";
import { MinimalistProductGrid } from "@/components/storefront/themes/minimalist/MinimalistProductGrid";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";

export default async function StorefrontHomePage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  // In the future, we will fetch the store details and active theme using params.domain
  // For now, we hardcode the "Minimalist Store" theme layout
  
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow">
        <MinimalistHero domain={params.domain} />
        <MinimalistProductGrid domain={params.domain} title="New Arrivals" />
        <MinimalistProductGrid domain={params.domain} title="Best Sellers" />
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
