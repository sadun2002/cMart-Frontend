import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function StorefrontCategoriesPage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";

  const categories = [
    { name: "Clothing", count: "12 products", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80", href: `/s/${params.domain}/shop` },
    { name: "Accessories", count: "8 products", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", href: `/s/${params.domain}/shop` },
    { name: "Bags", count: "4 products", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80", href: `/s/${params.domain}/shop` },
    { name: "Outerwear", count: "6 products", image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80", href: `/s/${params.domain}/shop` },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Shop by Category
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Find exactly what you're looking for by browsing our curated collections.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {categories.map((category) => (
              <div key={category.name} className="group relative">
                <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-3 sm:h-64 lg:aspect-w-1 lg:aspect-h-1 transition-opacity">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-center object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 p-6">
                    <h3 className="text-xl font-bold text-white">
                      <Link href={category.href}>
                        <span className="absolute inset-0" />
                        {category.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-200 mt-1">{category.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
             <Link 
                href={`/s/${params.domain}/shop`}
                className="inline-flex items-center text-base font-medium text-black hover:text-gray-600 transition-colors"
             >
                View all products
                <ArrowRight className="ml-2 w-5 h-5" />
             </Link>
          </div>
        </div>
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
