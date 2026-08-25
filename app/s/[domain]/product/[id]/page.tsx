"use client";
import { AuraProductDetails } from "@/components/storefront/themes/aura/pages/AuraProductDetails";
import { MarketProductDetails } from "@/components/storefront/themes/market/pages/MarketProductDetails";

import { VerdantProductDetails } from "@/components/storefront/themes/verdant/pages/VerdantProductDetails";

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
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80",
    ],
    category: "Accessories",
    description: "Spacious and stylish. Handcrafted from premium full-grain leather, featuring a padded laptop compartment and multiple interior pockets.",
    stock: 3,
  }
];

export default function StorefrontProductPage(props: { 
  params: Promise<{ domain: string; id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  // We handle searchParams safely in case it is undefined
  const searchParams = props.searchParams ? use(props.searchParams) : undefined;
  
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;
  const productId = parseInt(params.id);
  
  const product = EXTENDED_PRODUCTS.find(p => p.id === productId) || {
    ...MOCK_PRODUCTS[0],
    id: productId,
    images: [MOCK_PRODUCTS[0].image],
    description: "This is a great product that you will love. It has many features and is very affordable.",
    stock: 10,
    category: "General",
  };

  const relatedProducts = MOCK_PRODUCTS.filter(p => p.id !== productId).slice(0, 4);

  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const addItem = useStorefrontCart((state) => state.addItem);
  const router = useRouter();

  const handleAddToCart = () => {
    addItem({
      productId: typeof product.id === 'string' ? parseInt(product.id) || 0 : product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: activeImage,
    });
    toast.success(`${quantity}x ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/s/${params.domain}/checkout`);
  };


  if (theme === 'market') {
    return <MarketProductDetails storeName={storeName} domain={params.domain} productId={params.id} />;
  }
  if (theme === 'aura') {
    return <AuraProductDetails storeName={storeName} domain={params.domain} productId={params.id} />;
  }

  if (theme === 'verdant') {
    return <VerdantProductDetails storeName={storeName} domain={params.domain} product={{ id: parseInt(params.id), name: "Premium Organic Product", price: 1500, compareAtPrice: 1800, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800", description: "<p>Detailed description for this premium product.</p>", isOrganic: true, category: "Fresh Produce" }} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          
          <Link href={`/s/${params.domain}/shop`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div className="lg:w-1/2">
              <div className="flex flex-col-reverse md:flex-row gap-4">
                {/* Thumbnails */}
                <div className="flex md:flex-col gap-4 overflow-x-auto pb-2 md:pb-0">
                  {product.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                        activeImage === img ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <div className="flex-grow bg-accent rounded-lg overflow-hidden aspect-[4/5] relative">
                  <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2 flex flex-col">
              {product.category && (
                <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">{product.category}</p>
              )}
              
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                {product.name}
              </h1>

              {/* Reviews summary */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground underline cursor-pointer">124 Reviews</span>
              </div>

              <div className="text-3xl font-bold text-foreground mb-6">
                {formatLKR(product.price)}
              </div>

              <div className="prose prose-sm sm:prose-base dark:prose-invert text-muted-foreground mb-8">
                <p>{product.description}</p>
              </div>

              <div className="mb-8 p-4 bg-accent/50 rounded-lg border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium text-foreground">Quantity</span>
                  <div className="flex items-center border border-border rounded-md">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-muted-foreground hover:text-foreground"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-medium min-w-[2.5rem] text-center text-foreground">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 text-muted-foreground hover:text-foreground"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Stock status */}
                <div className="text-sm font-medium text-green-600 dark:text-green-500 mb-6 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-500 mr-2"></span>
                  In Stock ({product.stock} available)
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-background border border-foreground text-foreground font-medium py-3 px-6 rounded-md hover:bg-accent transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-primary text-primary-foreground font-medium py-3 px-6 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" /> Buy it Now
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over 10k</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Secure Checkout</p>
                    <p className="text-xs text-muted-foreground">100% Protected</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Related Products Section */}
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-foreground mb-8">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} domain={params.domain} />
              ))}
            </div>
          </div>

        </div>
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
