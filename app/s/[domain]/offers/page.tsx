"use client";
import { AuraOffers } from "@/components/storefront/themes/aura/pages/AuraOffers";
import { MarketOffers } from "@/components/storefront/themes/market/pages/MarketOffers";

import { VerdantOffers } from "@/components/storefront/themes/verdant/pages/VerdantOffers";

import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import Link from "next/link";
import { use } from "react";
import { Heart, ShoppingCart, Tag } from "lucide-react";
import { formatLKR, MOCK_PRODUCTS } from "@/lib/constants";
import { useStorefrontCart } from "@/store/useStorefrontCart";
import { toast } from "sonner";

// Dummy products with offers — compareAtPrice marks them as on sale
const DUMMY_OFFERS = [
  {
    id: "prod-7",
    name: "Ceramic Minimalist Vase",
    price: 3200,
    compareAtPrice: 4500,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=800&auto=format&fit=crop",
    category: "Decor",
  },
  {
    id: "prod-8",
    name: "Leather Notebook",
    price: 1800,
    compareAtPrice: 2400,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop",
    category: "Stationery",
  },
  {
    id: "prod-9",
    name: "Minimalist Wall Clock",
    price: 5500,
    compareAtPrice: 7000,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=800&auto=format&fit=crop",
    category: "Home",
  },
  // Also include MOCK_PRODUCTS as on-sale items for variety
  { id: "1", name: "Essential White Tee", price: 2800, compareAtPrice: 3500, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80", category: "Clothing" },
  { id: "2", name: "Classic Denim Jacket", price: 6500, compareAtPrice: 8500, image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80", category: "Clothing" },
  { id: "4", name: "Leather Tote Bag", price: 7200, compareAtPrice: 9500, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80", category: "Accessories" },
];


export default function StorefrontOffersPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const searchParams = props.searchParams ? use(props.searchParams) : {};
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;

  const addItem = useStorefrontCart((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent, product: typeof DUMMY_OFFERS[0]) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: parseInt(product.id) || 0,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const getDiscountPercent = (price: number, compareAt: number) =>
    Math.round(((compareAt - price) / compareAt) * 100);


  if (theme === 'market') {
    return <MarketOffers storeName={storeName} domain={params.domain} />;
  }
  if (theme === 'aura') {
    return <AuraOffers storeName={storeName} domain={params.domain} />;
  }

  if (theme === 'verdant') {
    return <VerdantOffers storeName={storeName} domain={params.domain} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />

      <main className="flex-grow bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-background border border-border text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Tag className="w-4 h-4" />
              Limited Time Deals
            </div>
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Offers &amp; Sale
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
              Discover our latest discounts and special deals on curated items.
            </p>
          </div>

          {DUMMY_OFFERS.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 md:gap-y-8 lg:gap-x-8">
              {DUMMY_OFFERS.map((product) => (
                <div key={product.id} className="group relative flex flex-col bg-background rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
                  <Link href={`/s/${params.domain}/product/${product.id}`} className="block">
                    <div className="relative w-full h-56 bg-muted overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-destructive text-destructive-foreground">
                        -{getDiscountPercent(product.price, product.compareAtPrice)}%
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                      <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{formatLKR(product.price)}</p>
                        <p className="text-xs text-muted-foreground line-through">{formatLKR(product.compareAtPrice)}</p>
                      </div>
                    </div>
                  </Link>
                  <div className="px-3 pb-3 mt-auto">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 rounded-md transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-background rounded-lg shadow-sm border border-border">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No active offers</h3>
              <p className="mt-1 text-sm text-muted-foreground">Check back later for new discounts and sales!</p>
            </div>
          )}
        </div>
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
