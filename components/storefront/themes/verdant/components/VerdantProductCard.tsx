"use client";

import { useSearchParams } from "next/navigation";

import Link from "next/link";
import { formatLKR } from "@/lib/constants";
import { ShoppingCart, Heart } from "lucide-react";
import { useStorefrontCart } from "@/store/useStorefrontCart";
import { toast } from "sonner";
import { motion } from "framer-motion";

export interface ProductCardProps {
  product: {
    id: string | number;
    name: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    category?: string;
    isOrganic?: boolean;
  };
  domain: string;
}

export function VerdantProductCard({ product, domain }: ProductCardProps) {
  const addItem = useStorefrontCart((state) => state.addItem);
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

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
    toast.success(`${product.name} added to cart`, {
      icon: <ShoppingCart className="w-4 h-4 text-verdant-primary" />
    });
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const getDiscountPercent = (price: number, compareAt: number) =>
    Math.round(((compareAt - price) / compareAt) * 100);

  // For the premium Verdant theme, we'll randomize an "Organic" badge for sample data 
  // if not explicitly provided, to fit the grocery theme.
  const isOrganic = product.isOrganic ?? Math.random() > 0.5;

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex flex-col bg-verdant-surface-container-lowest rounded-[16px] overflow-hidden soft-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-verdant-surface-container"
    >
      <Link href={`/s/${domain}/product/${product.id}${themeQuery}`} className="block relative">
        <div className="relative w-full h-48 bg-verdant-surface-container-low overflow-hidden sm:h-56 md:h-64">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-verdant-secondary-container text-verdant-on-secondary-container shadow-sm">
                -{getDiscountPercent(product.price, product.compareAtPrice!)}%
              </span>
            )}
            {isOrganic && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-verdant-surface-bright text-verdant-on-surface shadow-sm">
                Organic
              </span>
            )}
          </div>
          <button 
            className="absolute top-3 right-3 p-2 bg-verdant-surface-bright/80 backdrop-blur text-verdant-on-surface-variant hover:text-verdant-error rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={(e) => { e.preventDefault(); toast("Added to wishlist"); }}
          >
            <Heart size={18} />
          </button>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          {product.category && (
            <p className="text-xs font-verdant-body text-verdant-on-surface-variant/70 mb-1.5 uppercase tracking-wide">
              {product.category}
            </p>
          )}
          <h3 className="text-base font-verdant-heading font-semibold text-verdant-on-surface line-clamp-2 leading-tight mb-3">
            {product.name}
          </h3>
          
          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-lg font-bold text-primary">
                {formatLKR(product.price)}
              </p>
              {hasDiscount && (
                <p className="text-xs font-medium text-verdant-on-surface-variant/60 line-through">
                  {formatLKR(product.compareAtPrice!)}
                </p>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center p-2.5 bg-verdant-secondary-container text-verdant-on-secondary-container hover:bg-verdant-secondary hover:text-verdant-on-secondary rounded-xl transition-colors shadow-sm"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
