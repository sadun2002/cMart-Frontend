'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { ChevronRight, Star, ShoppingCart, Heart, Check, Truck, Leaf } from 'lucide-react';

const PRODUCT = {
  id: '1',
  name: 'Organic Hass Avocados',
  vendor: 'Verdant Farms',
  price: 1499,
  compareAtPrice: 1999,
  rating: 4.8,
  reviews: 120,
  badge: 'Organic',
  badge2: 'Best Seller',
  description: 'Creamy, rich, and perfectly ripe. Our organic Hass avocados are hand-picked from Verdant Farms, ensuring the highest quality and flavor for your guacamole, toast, or salads.',
  images: [
    'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=800&q=80',
    'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800&q=80',
    'https://images.unsplash.com/photo-1482012792084-a0c3725f289f?w=800&q=80',
    'https://images.unsplash.com/photo-1549503485-1d44cbbf37be?w=800&q=80',
  ],
  details: ['Certified Organic — USDA certified organic farming practices.', 'High Fiber Content — Supports digestive health.', 'Rich in Healthy Fats — Packed with monounsaturated fats.', 'Versatile Ingredient — Perfect for savory or sweet applications.'],
  nutrition: { calories: 80, totalFat: '8g', saturatedFat: '1g', sodium: '0mg', carbs: '4g', fiber: '3g', protein: '1g', potassium: '250mg' },
  related: [
    { id: '9', name: 'Organic Cherry Tomatoes', vendor: 'Sunny Farms', price: 890, rating: 4.9, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80' },
    { id: '10', name: 'Organic Meyer Lemons', vendor: 'Citrus Grove', price: 800, compareAtPrice: 990, rating: 4.7, image: 'https://images.unsplash.com/photo-1575377427642-087cf684b99d?w=400&q=80' },
    { id: '11', name: 'Organic Red Onions', vendor: 'Root & Soil', price: 600, rating: 4.6, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80' },
    { id: '12', name: 'Artisan Sourdough Loaf', vendor: 'Hearth Bakery', price: 1800, rating: 5.0, image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80' },
  ],
};

export function MarketProductDetails({ storeName, domain, productId }: { storeName: string; domain: string; productId: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [qty, setQty] = useState(1);
  const { addItem } = useStorefrontCart();

  const handleAddToCart = () => {
    addItem({ productId: 1, name: PRODUCT.name, price: PRODUCT.price, quantity: qty, image: PRODUCT.images[0] });
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--color-market-on-surface-muted)' }}>
            <Link href={`/s/${domain}${themeQuery}`} className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/s/${domain}/categories${themeQuery}`} className="hover:underline">Fruits & Veg</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/s/${domain}/categories${themeQuery}`} className="hover:underline">Fresh Produce</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'var(--color-market-on-surface)' }}>{PRODUCT.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="relative rounded-2xl overflow-hidden aspect-square mb-4"
                style={{ backgroundColor: 'var(--color-market-surface-low)' }}>
                <img src={PRODUCT.images[activeImage]} alt={PRODUCT.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'var(--color-market-sage)', color: 'var(--color-market-sage-dark)' }}>{PRODUCT.badge}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--color-market-amber)' }}>{PRODUCT.badge2}</span>
                </div>
              </div>
              <div className="flex gap-3">
                {PRODUCT.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="w-20 h-20 rounded-xl overflow-hidden border-2 transition-all"
                    style={{ borderColor: activeImage === i ? 'var(--color-market-primary)' : 'var(--color-market-border)' }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold mb-2"
                style={{ color: 'var(--color-market-primary)' }}>{PRODUCT.vendor}</p>
              <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                {PRODUCT.name}
              </h1>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: i < Math.floor(PRODUCT.rating) ? '#fea619' : '#e5e7eb' }} />
                  ))}
                </div>
                <span className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>{PRODUCT.rating} · {PRODUCT.reviews} Reviews</span>
              </div>
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-bold" style={{ color: 'var(--color-market-primary)', fontFamily: 'var(--font-market-heading)' }}>
                  LKR {PRODUCT.price.toLocaleString()}
                </span>
                {PRODUCT.compareAtPrice && (
                  <span className="text-lg line-through" style={{ color: 'var(--color-market-on-surface-subtle)' }}>
                    LKR {PRODUCT.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                {PRODUCT.description}
              </p>

              {/* In Stock */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full w-fit mb-6"
                style={{ backgroundColor: 'var(--color-market-primary-light)', color: 'var(--color-market-primary)' }}>
                <Check className="w-4 h-4" />
                <span className="text-sm font-semibold">In Stock — Ready to ship</span>
              </div>

              {/* Qty + Add to Cart */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border rounded-xl overflow-hidden"
                  style={{ borderColor: 'var(--color-market-border)' }}>
                  <button className="w-10 h-12 flex items-center justify-center text-xl font-light hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--color-market-on-surface)' }}
                    onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span className="w-10 text-center text-sm font-semibold" style={{ color: 'var(--color-market-on-surface)' }}>{qty}</span>
                  <button className="w-10 h-12 flex items-center justify-center text-xl font-light hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--color-market-on-surface)' }}
                    onClick={() => setQty(qty + 1)}>+</button>
                </div>
                <button onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-market-secondary)', fontFamily: 'var(--font-market-heading)' }}>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button className="p-3 rounded-xl border transition-colors hover:opacity-70"
                  style={{ borderColor: 'var(--color-market-border)', color: 'var(--color-market-on-surface-muted)' }}>
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Info strips */}
              <div className="flex items-center gap-6 text-xs pt-4 border-t" style={{ borderColor: 'var(--color-market-border)', color: 'var(--color-market-on-surface-muted)' }}>
                <div className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Next-day delivery</div>
                <div className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" /> 100% Organic</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16 border-b" style={{ borderColor: 'var(--color-market-border)' }}>
            <div className="flex gap-8">
              {[{ id: 'description', label: 'Description' }, { id: 'reviews', label: `Reviews (${PRODUCT.reviews})` }, { id: 'shipping', label: 'Shipping Info' }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="py-3 text-sm font-semibold border-b-2 transition-colors -mb-px"
                  style={{
                    borderColor: activeTab === tab.id ? 'var(--color-market-primary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--color-market-primary)' : 'var(--color-market-on-surface-muted)',
                    fontFamily: 'var(--font-market-body)',
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Farm Fresh Goodness</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                Grown in the sun-drenched valleys of California, our organic Hass avocados are cultivated without the use of synthetic pesticides or fertilizers. We partner directly with Verdant Farms, a family-owned cooperative dedicated to sustainable agriculture and soil health.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {PRODUCT.details.map((d) => {
                  const [bold, rest] = d.split(' — ');
                  return (
                    <div key={d} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-market-primary)' }} />
                      <p className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                        <strong style={{ color: 'var(--color-market-on-surface)' }}>{bold}</strong> {rest && `— ${rest}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: 'var(--color-market-on-surface-muted)' }}>Nutrition Facts</p>
              <p className="text-xs mb-3" style={{ color: 'var(--color-market-on-surface-muted)' }}>Serving Size: 1/3 medium avocado (50g)</p>
              <div className="space-y-2">
                {Object.entries(PRODUCT.nutrition).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm border-b pb-1"
                    style={{ borderColor: 'var(--color-market-border)', color: 'var(--color-market-on-surface)' }}>
                    <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Frequently bought together</h2>
                <p className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>Perfect pairings for your fresh produce.</p>
              </div>
              <Link href={`/s/${domain}/shop${themeQuery}`} className="flex items-center gap-1 text-sm font-semibold"
                style={{ color: 'var(--color-market-primary)' }}>View all <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PRODUCT.related.map((p) => (
                <Link key={p.id} href={`/s/${domain}/product/${p.id}${themeQuery}`} className="group rounded-xl overflow-hidden block"
                  style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                  <div className="relative aspect-square overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>{p.vendor}</p>
                    <h4 className="text-xs font-bold line-clamp-2 mb-1" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{p.name}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" style={{ color: '#fea619' }} />
                        <span className="text-[10px]" style={{ color: 'var(--color-market-on-surface-muted)' }}>{p.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: 'var(--color-market-primary)' }}>LKR {p.price.toLocaleString()}</span>
                        <button className="w-6 h-6 rounded-full flex items-center justify-center text-white ml-1"
                          style={{ backgroundColor: 'var(--color-market-primary)' }}>
                          <span className="text-xs font-bold">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
