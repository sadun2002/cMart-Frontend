"use client";

import Link from "next/link";
import { formatLKR, MOCK_PRODUCTS } from "@/lib/constants";
import { ProductCard } from "@/components/storefront/themes/minimalist/ProductCard";

export function MinimalistProductGrid({ domain = "", products = MOCK_PRODUCTS, title = "Featured Products" }) {
  return (
    <div className="bg-background">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h2>
          <Link href={`/s/${domain}/shop`} className="hidden text-sm font-medium text-primary hover:opacity-80 md:block cursor-pointer">
            Shop the collection <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-8 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} domain={domain} />
          ))}
        </div>

        <div className="mt-8 text-sm md:hidden">
          <Link href={`/s/${domain}/shop`} className="font-medium text-primary hover:opacity-80">
            Shop the collection<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
