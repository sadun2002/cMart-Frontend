"use client";

import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import { formatLKR } from "@/lib/constants";
import Link from "next/link";
import { use } from "react";
import { useStorefrontCart } from "@/store/useStorefrontCart";
import { useStorefrontAuth } from "@/store/useStorefrontAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { CheckCircle } from "lucide-react";

const PROVINCES = [
  "Western Province",
  "Central Province",
  "Southern Province",
  "Northern Province",
  "Eastern Province",
  "North Western Province",
  "North Central Province",
  "Uva Province",
  "Sabaragamuwa Province",
];

// Dummy saved data (mirrors what account page stores in state)
const DUMMY_SAVED_ADDRESS = {
  name: "John Doe",
  street: "123 Galle Road",
  city: "Colombo 03",
  province: "Western Province",
  phone: "+94 77 123 4567",
};

const DUMMY_SAVED_CARD = {
  brand: "Visa",
  last4: "4242",
  expiry: "12/28",
};

export default function StorefrontCheckoutPage(props: { params: Promise<{ domain: string }> }) {
  const params = use(props.params);
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const router = useRouter();

  const { getTotal, clearCart, items } = useStorefrontCart();
  const { isAuthenticated, user } = useStorefrontAuth();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");

  // Delivery form state — pre-fill from saved address if logged in
  const [delivery, setDelivery] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    province: "Western Province",
  });

  // Card form state
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated && user) {
      // Auto-fill delivery from saved address
      setDelivery({
        fullName: DUMMY_SAVED_ADDRESS.name || "",
        email: user.email,
        phone: DUMMY_SAVED_ADDRESS.phone,
        street: DUMMY_SAVED_ADDRESS.street,
        city: DUMMY_SAVED_ADDRESS.city,
        province: DUMMY_SAVED_ADDRESS.province,
      });
      // Auto-select card payment if they have a saved card
      setPaymentMethod("card");
    }
  }, [isAuthenticated, user]);

  const subtotal = mounted ? getTotal() : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  // Card number auto-format
  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.replace(/(.{4})/g, "$1 ").trim();
    setCard({ ...card, number: val });
    if (val.length === 19) expiryRef.current?.focus();
  };

  const handleCardExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.substring(0, 2) + "/" + val.substring(2, 4);
    setCard({ ...card, expiry: val });
    if (val.length === 5) cvcRef.current?.focus();
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1800);
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <MinimalistHeader storeName={storeName} domain={params.domain} />
        <main className="flex-grow bg-muted flex items-center justify-center py-12">
          <div className="text-center bg-background rounded-xl shadow-lg px-12 py-16 max-w-md w-full mx-4 border border-border">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-6">
              <CheckCircle className="h-9 w-9 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Order Placed!</h2>
            <p className="mt-3 text-muted-foreground">
              Thank you for your purchase. We'll send a confirmation to{" "}
              <strong>{delivery.email || user?.email}</strong>.
            </p>
            <Link
              href={`/s/${params.domain}`}
              className="mt-8 inline-block w-full py-3 px-6 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 rounded-md transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <MinimalistFooter storeName={storeName} domain={params.domain} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MinimalistHeader storeName={storeName} domain={params.domain} />

      <main className="flex-grow bg-muted">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {mounted && items.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-lg shadow px-4 sm:p-6 border border-border">
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Link href={`/s/${params.domain}/shop`} className="text-primary font-medium hover:underline">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="bg-background shadow px-4 py-5 sm:rounded-lg sm:p-6 border border-border">
              <form onSubmit={handleCheckout}>
                {/* ── Delivery Information ── */}
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-foreground">Delivery Information</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Where should we send your order?</p>
                    {isAuthenticated && (
                      <p className="mt-2 text-xs text-green-600 font-medium">
                        ✓ Auto-filled from your account
                      </p>
                    )}
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-6 sm:col-span-6">
                        <label htmlFor="full-name" className="block text-sm font-medium text-foreground">Full name</label>
                        <input
                          required type="text" id="full-name"
                          value={delivery.fullName}
                          onChange={(e) => setDelivery({ ...delivery, fullName: e.target.value })}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-input bg-background text-foreground rounded-md py-2 px-3 border"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="email-address" className="block text-sm font-medium text-foreground">Email address</label>
                        <input
                          required type="email" id="email-address"
                          value={delivery.email}
                          onChange={(e) => setDelivery({ ...delivery, email: e.target.value })}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-input bg-background text-foreground rounded-md py-2 px-3 border"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground">Phone</label>
                        <input
                          required type="tel" id="phone"
                          value={delivery.phone}
                          onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-input bg-background text-foreground rounded-md py-2 px-3 border"
                        />
                      </div>
                      <div className="col-span-6">
                        <label htmlFor="street-address" className="block text-sm font-medium text-foreground">Street address</label>
                        <input
                          required type="text" id="street-address"
                          value={delivery.street}
                          onChange={(e) => setDelivery({ ...delivery, street: e.target.value })}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-input bg-background text-foreground rounded-md py-2 px-3 border"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="city" className="block text-sm font-medium text-foreground">City</label>
                        <input
                          required type="text" id="city"
                          value={delivery.city}
                          onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-input bg-background text-foreground rounded-md py-2 px-3 border"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="province" className="block text-sm font-medium text-foreground">Province</label>
                        <select
                          required id="province"
                          value={delivery.province}
                          onChange={(e) => setDelivery({ ...delivery, province: e.target.value })}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-input bg-background text-foreground rounded-md py-2 px-3 border"
                        >
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block" aria-hidden="true">
                  <div className="py-5"><div className="border-t border-border" /></div>
                </div>

                {/* ── Payment ── */}
                <div className="mt-10 sm:mt-0">
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-foreground">Payment</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Choose your preferred payment method.</p>
                      {isAuthenticated && paymentMethod === "card" && (
                        <p className="mt-2 text-xs text-green-600 font-medium">
                          ✓ Saved card detected
                        </p>
                      )}
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="bg-background rounded-md border border-border mb-6 overflow-hidden">
                        <div className="p-4 border-b border-border">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio" name="payment-method" value="cod"
                              checked={paymentMethod === "cod"}
                              onChange={() => setPaymentMethod("cod")}
                              className="h-4 w-4 text-primary focus:ring-primary border-input bg-background"
                            />
                            <span className="ml-3 block text-sm font-medium text-foreground">
                              Cash on Delivery (COD)
                            </span>
                          </label>
                        </div>

                        <div className="p-4">
                          <label className="flex items-center cursor-pointer mb-4">
                            <input
                              type="radio" name="payment-method" value="card"
                              checked={paymentMethod === "card"}
                              onChange={() => setPaymentMethod("card")}
                              className="h-4 w-4 text-primary focus:ring-primary border-input bg-background"
                            />
                            <span className="ml-3 block text-sm font-medium text-foreground">
                              Credit / Debit Card
                            </span>
                          </label>

                          {paymentMethod === "card" && (
                            <div className="ml-7 mt-4 grid grid-cols-6 gap-4 animate-in fade-in slide-in-from-top-2">
                              {/* Saved card banner */}
                              {isAuthenticated && (
                                <div className="col-span-6 flex items-center gap-3 bg-muted border border-border rounded-md p-3">
                                  <div className="h-7 w-10 bg-background border border-border rounded flex items-center justify-center text-xs font-bold text-muted-foreground">
                                    {DUMMY_SAVED_CARD.brand}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">•••• {DUMMY_SAVED_CARD.last4}</p>
                                    <p className="text-xs text-muted-foreground">Expires {DUMMY_SAVED_CARD.expiry}</p>
                                  </div>
                                  <span className="ml-auto text-xs text-green-600 font-medium">Saved</span>
                                </div>
                              )}
                              <div className="col-span-6">
                                <label htmlFor="name-on-card" className="block text-xs font-medium text-foreground">Name on card</label>
                                <input
                                  required type="text" id="name-on-card"
                                  value={card.name}
                                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                                  className="mt-1 block w-full border-input bg-background text-foreground rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border"
                                />
                              </div>
                              <div className="col-span-6">
                                <label htmlFor="co-card-number" className="block text-xs font-medium text-foreground">Card number</label>
                                <input
                                  required type="text" id="co-card-number"
                                  placeholder="0000 0000 0000 0000"
                                  maxLength={19}
                                  value={card.number}
                                  onChange={handleCardNumber}
                                  className="mt-1 block w-full border-input bg-background text-foreground rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border"
                                />
                              </div>
                              <div className="col-span-3">
                                <label htmlFor="co-expiry" className="block text-xs font-medium text-foreground">Expiry (MM/YY)</label>
                                <input
                                  required type="text" id="co-expiry"
                                  ref={expiryRef}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  value={card.expiry}
                                  onChange={handleCardExpiry}
                                  className="mt-1 block w-full border-input bg-background text-foreground rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border"
                                />
                              </div>
                              <div className="col-span-3">
                                <label htmlFor="co-cvc" className="block text-xs font-medium text-foreground">CVC</label>
                                <input
                                  required type="text" id="co-cvc"
                                  ref={cvcRef}
                                  placeholder="123"
                                  maxLength={4}
                                  value={card.cvc}
                                  onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").substring(0, 4) })}
                                  className="mt-1 block w-full border-input bg-background text-foreground rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm py-2 px-3 border"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order summary */}
                      <div className="bg-muted p-4 rounded-md border border-border mb-4 space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                          <span>{formatLKR(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Tax (5%)</span>
                          <span>{formatLKR(tax)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border pt-2">
                          <span className="font-medium text-foreground">Total</span>
                          <span className="text-xl font-bold text-foreground">{formatLKR(total)}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing
                          ? "Processing..."
                          : paymentMethod === "cod"
                          ? "Place Order (Cash on Delivery)"
                          : "Pay Now"}
                      </button>

                      <div className="mt-4 text-center">
                        <Link href={`/s/${params.domain}/shop`} className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                          ← Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <MinimalistFooter storeName={storeName} domain={params.domain} />
    </div>
  );
}
