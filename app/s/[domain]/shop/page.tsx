import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistProductGrid } from "@/components/storefront/themes/minimalist/MinimalistProductGrid";
import { MOCK_PRODUCTS } from "@/lib/constants";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";

export default async function StorefrontShopPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";

  const q = searchParams.q as string;
  const filteredProducts = q 
    ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    : [...MOCK_PRODUCTS, ...MOCK_PRODUCTS.map(p => ({ ...p, id: p.id + 4 }))]; // Double the products if no search

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow">
        <div className="bg-background">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {q ? `Search results for "${q}"` : "All Products"}
            </h1>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">
              {q ? `Showing ${filteredProducts.length} results.` : "Browse our complete collection of products."}
            </p>
          </div>
        </div>
        
        {filteredProducts.length > 0 ? (
          <MinimalistProductGrid domain={params.domain} title="" products={filteredProducts} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-muted-foreground">
            No products found matching your search.
          </div>
        )}
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
