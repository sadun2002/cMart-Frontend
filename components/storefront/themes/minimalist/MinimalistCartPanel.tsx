"use client";

import { useStorefrontCart } from "@/store/useStorefrontCart";
import { formatLKR } from "@/lib/constants";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MinimalistCartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
}

export function MinimalistCartPanel({ isOpen, onClose, domain }: MinimalistCartPanelProps) {
  const { items, removeItem, updateQuantity, getTotal } = useStorefrontCart();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity animate-in fade-in" 
        onClick={onClose}
      />
      
      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-1/3 min-w-[320px] max-w-md bg-background shadow-xl flex flex-col animate-in slide-in-from-right duration-300 ease-in-out">
        <div className="px-4 py-6 sm:px-6 flex items-center justify-between border-b border-border">
          <h2 className="text-lg font-medium text-foreground flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shopping Cart
          </h2>
          <button
            type="button"
            className="-m-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClose}
          >
            <span className="sr-only">Close panel</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {!mounted || items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Your cart is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start adding items to your cart to see them here.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/s/${domain}/shop`);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-my-6 divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="py-6 flex">
                    <div className="flex-shrink-0 w-24 h-24 border border-border rounded-md overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>

                    <div className="ml-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-base font-medium text-foreground">
                          <h3>
                            <Link href={`/s/${domain}/product/${item.id}`} onClick={onClose}>
                              {item.name}
                            </Link>
                          </h3>
                          <p className="ml-4">{formatLKR(item.price * item.quantity)}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{formatLKR(item.price)} each</p>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center border border-input rounded-md">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 font-medium text-foreground">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="font-medium text-destructive hover:opacity-80 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {mounted && items.length > 0 && (
          <div className="border-t border-border px-4 py-6 sm:px-6 bg-muted">
            <div className="flex justify-between text-base font-medium text-foreground mb-4">
              <p>Subtotal</p>
              <p>{formatLKR(getTotal())}</p>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground mb-6">Shipping and taxes calculated at checkout.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  onClose();
                  router.push(`/s/${domain}/checkout`);
                }}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-foreground bg-primary hover:opacity-90 transition-colors"
              >
                Checkout
              </button>
            </div>
            <div className="mt-6 flex justify-center text-sm text-center text-muted-foreground">
              <p>
                <button
                  type="button"
                  className="text-foreground font-medium hover:opacity-80"
                  onClick={onClose}
                >
                  Continue Shopping<span aria-hidden="true"> &rarr;</span>
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
