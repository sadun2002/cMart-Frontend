"use client";

import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import { formatLKR, MOCK_PRODUCTS } from "@/lib/constants";
import { Star, Truck, ShieldCheck, ArrowLeft, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/themes/minimalist/ProductCard";
import { use } from "react";
import { useStorefrontCart } from "@/store/useStorefrontCart";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Extended mock with multiple images per product
const EXTENDED_PRODUCTS = [
  {
    id: 1,
    name: "Essential White Tee",
    price: 3500,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    ],
    category: "Clothing",
    description: "The perfect everyday essential. Crafted from 100% organic cotton for a soft, breathable feel and maximum durability that lasts through countless washes.",
    stock: 12,
  },
  {
    id: 2,
    name: "Classic Denim Jacket",
    price: 8500,
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
      "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80",
      "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80",
    ],
    category: "Clothing",
    description: "A timeless wardrobe staple. This classic denim jacket features a tailored fit, reinforced stitching, and a vintage wash that only gets better with age.",
    stock: 8,
  },
  {
    id: 3,
    name: "Minimalist Watch",
    price: 12000,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      "https://images.unsplash.com/photo-1619134778706-7015533a6150?w=800&q=80",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
    ],
    category: "Accessories",
    description: "Precision engineering meets understated elegance. With a Swiss-movement mechanism and a sapphire crystal face, this watch is built to last a lifetime.",
    stock: 5,
  },
  {
    id: 4,
    name: "Leather Tote Bag",
    price: 9500,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
    ],
    category: "Accessories",
    description: "Hand-stitched from full-grain vegetable-tanned leather, this tote develops a unique patina over time. Spacious enough for all your daily essentials.",
    stock: 10,
  },
];

export default function StorefrontProductPage(props: { params: Promise<{ domain: string; id: string }> }) {
  const params = use(props.params);
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const router = useRouter();

  const addItem = useStorefrontCart((state) => state.addItem);

  // Find the product or fall back to first
  const found = EXTENDED_PRODUCTS.find((p) => p.id.toString() === params.id);
  const product = found || {
    id: parseInt(params.id),
    name: "Essential White Tee",
    price: 3500,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
    category: "Store Items",
    description: "The perfect everyday item. Crafted for a soft, breathable feel and maximum durability.",
    stock: 12,
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const images = product.images;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: images[0],
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: images[0],
    });
    router.push(`/s/${params.domain}/checkout`);
  };

  // Related products: others in the same category or just others
  const relatedProducts = EXTENDED_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />

      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/s/${params.domain}/shop`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 cursor-pointer transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Shop
          </Link>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
            {/* ── Image Gallery ── */}
            <div className="flex flex-col gap-4">
              {/* Main image */}
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={images[selectedImage]}
                  alt={`${product.name} view ${selectedImage + 1}`}
                  className="w-full h-full object-center object-cover transition-opacity duration-300"
                />
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                        selectedImage === idx
                          ? "border-foreground"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ── */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">{product.category}</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{product.name}</h1>

              <div className="mt-3">
                <p className="text-3xl text-foreground font-bold">{formatLKR(product.price)}</p>
              </div>

              {/* Reviews */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star key={rating} className="h-4 w-4 flex-shrink-0 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">24 reviews</span>
              </div>

              <div className="mt-6 text-base text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* Stock indicator */}
              <div className="mt-4">
                {product.stock > 5 ? (
                  <span className="inline-flex items-center text-sm text-green-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center text-sm text-amber-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                    Only {product.stock} left!
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex gap-3 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-background border-2 border-foreground text-foreground rounded-md py-3 px-6 text-base font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md py-3 px-6 text-base font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer"
                >
                  <Zap className="w-5 h-5" />
                  Buy Now
                </button>
              </div>

              <div className="mt-8 border-t border-border pt-8 flex gap-6 flex-wrap">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Truck className="w-5 h-5 mr-2 text-muted-foreground" />
                  Free shipping over LKR 10,000
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 mr-2 text-muted-foreground" />
                  Secure checkout
                </div>
              </div>
            </div>
          </div>

          {/* ── You May Also Like ── */}
          <div className="mt-24 border-t border-border pt-16">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-8">You may also like</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 lg:gap-x-8">
              {relatedProducts.map((related) => (
                <ProductCard 
                  key={related.id} 
                  product={{
                    id: related.id,
                    name: related.name,
                    price: related.price,
                    image: related.images[0]
                  }} 
                  domain={params.domain} 
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
