"use client";
import { AuraCart } from "@/components/storefront/themes/aura/pages/AuraCart";
import { MarketCart } from "@/components/storefront/themes/market/pages/MarketCart";

import { VerdantCart } from "@/components/storefront/themes/verdant/pages/VerdantCart";

import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import { formatLKR } from "@/lib/constants";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { use } from "react";
import { useStorefrontCart } from "@/store/useStorefrontCart";
import { useEffect, useState } from "react";


export default function StorefrontCartPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const searchParams = props.searchParams ? use(props.searchParams) : {};
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;

  const { items, updateQuantity, removeItem, getTotal } = useStorefrontCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = mounted ? getTotal() : 0;
  const tax = subtotal * 0.05; // 5% dummy tax
  const total = subtotal + tax;


  if (theme === 'market') {
    return <MarketCart storeName={storeName} domain={params.domain} />;
  }
  if (theme === 'aura') {
    return <AuraCart storeName={storeName} domain={params.domain} />;
  }

  if (theme === 'verdant') {
    return <VerdantCart storeName={storeName} domain={params.domain} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />
      
      <main className="flex-grow bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Shopping Cart</h1>

          {mounted && items.length === 0 ? (
            <div className="mt-12 text-center py-12 bg-muted rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Link href={`/s/${params.domain}/shop`} className="text-primary font-medium hover:underline">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-12">
              <section aria-labelledby="cart-heading">
                <ul role="list" className="border-t border-b border-border divide-y divide-border">
                  {mounted && items.map((item) => (
                    <li key={item.id} className="flex py-6">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 rounded-md object-center object-cover"
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col justify-between">
                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-sm">
                                <Link href={`/s/${params.domain}/product/${item.productId}`} className="font-medium text-foreground hover:opacity-80">
                                  {item.name}
                                </Link>
                              </h3>
                            </div>
                            <p className="mt-1 text-sm font-medium text-foreground">{formatLKR(item.price)}</p>
                          </div>

                          <div className="mt-4 sm:mt-0 sm:pr-9">
                            <label htmlFor={`quantity-${item.id}`} className="sr-only">
                              Quantity, {item.name}
                            </label>
                            <select
                              id={`quantity-${item.id}`}
                              name={`quantity-${item.id}`}
                              className="max-w-full rounded-md border border-input bg-background py-1.5 text-base leading-5 font-medium text-foreground text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>

                            <div className="absolute top-0 right-0">
                              <button 
                                type="button" 
                                onClick={() => removeItem(item.id)}
                                className="-m-2 p-2 inline-flex text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <span className="sr-only">Remove</span>
                                <Trash2 className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="summary-heading" className="mt-10">
                <div className="bg-muted rounded-lg px-4 py-6 sm:p-6 lg:p-8 border border-border">
                  <h2 id="summary-heading" className="sr-only">
                    Order summary
                  </h2>

                  <div className="flow-root">
                    <dl className="-my-4 text-sm divide-y divide-border">
                      <div className="py-4 flex items-center justify-between">
                        <dt className="text-muted-foreground">Subtotal</dt>
                        <dd className="font-medium text-foreground">{formatLKR(subtotal)}</dd>
                      </div>
                      <div className="py-4 flex items-center justify-between">
                        <dt className="text-muted-foreground">Tax</dt>
                        <dd className="font-medium text-foreground">{formatLKR(tax)}</dd>
                      </div>
                      <div className="py-4 flex items-center justify-between">
                        <dt className="text-base font-bold text-foreground">Order total</dt>
                        <dd className="text-base font-bold text-foreground">{formatLKR(total)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="mt-10">
                  <Link
                    href={`/s/${params.domain}/checkout`}
                    className="w-full bg-primary border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors block text-center cursor-pointer"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
