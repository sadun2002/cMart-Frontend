"use client";

import Link from "next/link";
import { formatLKR } from "@/lib/constants";
import { ShoppingCart } from "lucide-react";
import { useStorefrontCart } from "@/store/useStorefrontCart";
import { toast } from "sonner";

export interface ProductCardProps {
  product: {
    id: string | number;
    name: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    category?: string;
  };
  domain: string;
}

export function ProductCard({ product, domain }: ProductCardProps) {
  const addItem = useStorefrontCart((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const getDiscountPercent = (price: number, compareAt: number) =>
    Math.round(((compareAt - price) / compareAt) * 100);

  return (
    <div className="group relative flex flex-col bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
      <Link href={`/s/${domain}/product/${product.id}`} className="block">
        <div className="relative w-full h-56 bg-accent overflow-hidden lg:h-72 xl:h-80">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
              -{getDiscountPercent(product.price, product.compareAtPrice!)}%
            </span>
          )}
        </div>
        <div className="p-3">
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          )}
          <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">{formatLKR(product.price)}</p>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">{formatLKR(product.compareAtPrice!)}</p>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3 mt-auto">
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 rounded-md transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
