"use client";

import { MinimalistHeader } from "@/components/storefront/themes/minimalist/MinimalistHeader";
import { MinimalistFooter } from "@/components/storefront/themes/minimalist/MinimalistFooter";
import Link from "next/link";
import { use } from "react";
import { useStorefrontAuth } from "@/store/useStorefrontAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, User, LogOut, MapPin, CheckCircle, Truck, Clock, CreditCard } from "lucide-react";
import { formatLKR } from "@/lib/constants";

import { OrderDetailsPanel, OrderDetails } from "@/components/storefront/themes/minimalist/OrderDetailsPanel";
import { AddressFormPanel, AddressData } from "@/components/storefront/themes/minimalist/AddressFormPanel";
import { CardFormPanel, CardData } from "@/components/storefront/themes/minimalist/CardFormPanel";

// Dummy initial data
const DUMMY_ORDERS: OrderDetails[] = [
  { id: "ORD-7392", date: "Aug 10, 2026", total: 12500, status: "Processing", items: 2 },
  { id: "ORD-6218", date: "Aug 02, 2026", total: 8500, status: "Shipped", items: 1 },
  { id: "ORD-5103", date: "Jul 15, 2026", total: 24000, status: "Delivered", items: 3 },
];

const INITIAL_ADDRESSES: AddressData[] = [
  { id: 1, type: "Home", name: "John Doe", street: "123 Galle Road", city: "Colombo 03", country: "Sri Lanka", phone: "+94 77 123 4567", isDefault: true }
];

const INITIAL_CARDS: CardData[] = [
  { id: 1, brand: "Visa", last4: "4242", expiry: "12/28", isDefault: true },
  { id: 2, brand: "Mastercard", last4: "8888", expiry: "05/27", isDefault: false }
];

import { useThemeCustomizations } from "@/components/storefront/theme-provider";

export default function StorefrontAccountPage(props: { params: Promise<{ domain: string }> }) {
  const params = use(props.params);
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const router = useRouter();
  
  const { user, isAuthenticated, logout } = useStorefrontAuth();
  const { isPreview } = useThemeCustomizations();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");

  // State for Lists
  const [addresses, setAddresses] = useState<AddressData[]>(INITIAL_ADDRESSES);
  const [cards, setCards] = useState<CardData[]>(INITIAL_CARDS);

  // State for Panels
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [isAddressPanelOpen, setIsAddressPanelOpen] = useState(false);
  const [isCardPanelOpen, setIsCardPanelOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated && !isPreview) {
      router.push(`/s/${params.domain}/login`);
    }
  }, [mounted, isAuthenticated, isPreview, router, params.domain]);

  const handleLogout = () => {
    logout();
    router.push(`/s/${params.domain}`);
  };

  if (!mounted || (!isAuthenticated && !isPreview)) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing": return <Clock className="w-4 h-4 text-amber-500 mr-1.5" />;
      case "Shipped": return <Truck className="w-4 h-4 text-blue-500 mr-1.5" />;
      case "Delivered": return <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <MinimalistHeader storeName={storeName} domain={params.domain} />
        
        <main className="flex-grow bg-muted py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl sm:truncate">
                  My Account
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Welcome back, {user?.name || "John"}</p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer transition-colors"
                >
                  <LogOut className="-ml-1 mr-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar Navigation */}
              <div className="md:w-64 flex-shrink-0">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`${activeTab === "orders" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full transition-colors`}
                  >
                    <Package className={`${activeTab === "orders" ? "text-muted-foreground" : "text-muted-foreground group-hover:text-foreground"} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
                    <span className="truncate">Order History</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`${activeTab === "profile" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full transition-colors`}
                  >
                    <User className={`${activeTab === "profile" ? "text-muted-foreground" : "text-muted-foreground group-hover:text-foreground"} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
                    <span className="truncate">Profile Details</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("address")}
                    className={`${activeTab === "address" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full transition-colors`}
                  >
                    <MapPin className={`${activeTab === "address" ? "text-muted-foreground" : "text-muted-foreground group-hover:text-foreground"} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
                    <span className="truncate">Address Book</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("payment")}
                    className={`${activeTab === "payment" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full transition-colors`}
                  >
                    <CreditCard className={`${activeTab === "payment" ? "text-muted-foreground" : "text-muted-foreground group-hover:text-foreground"} flex-shrink-0 -ml-1 mr-3 h-5 w-5`} />
                    <span className="truncate">Payment Methods</span>
                  </button>
                </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1">
                
                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div className="bg-background shadow sm:rounded-lg overflow-hidden animate-in fade-in border border-border">
                    <div className="px-4 py-5 border-b border-border sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-foreground">Order History</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Check the status of recent orders, manage returns, and discover similar products.</p>
                    </div>
                    <ul role="list" className="divide-y divide-border">
                      {DUMMY_ORDERS.map((order) => (
                        <li key={order.id} className="p-4 sm:p-6 hover:bg-muted transition-colors">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">Order number</p>
                              <p className="mt-1 text-sm text-muted-foreground">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Date placed</p>
                              <p className="mt-1 text-sm text-muted-foreground">{order.date}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Total amount</p>
                              <p className="mt-1 text-sm text-muted-foreground">{formatLKR(order.total)}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </div>
                            <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                              <button 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderPanelOpen(true);
                                }}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-input shadow-sm text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="bg-background shadow sm:rounded-lg overflow-hidden animate-in fade-in border border-border">
                    <div className="px-4 py-5 border-b border-border sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-foreground">Profile Information</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Personal details and preferences.</p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-muted-foreground">Full name</dt>
                          <dd className="mt-1 text-sm text-foreground">{user?.name || "John Doe"}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-muted-foreground">Email address</dt>
                          <dd className="mt-1 text-sm text-foreground">{user?.email || "john.doe@example.com"}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}

                {/* Address Tab */}
                {activeTab === "address" && (
                  <div className="bg-background shadow sm:rounded-lg overflow-hidden animate-in fade-in border border-border">
                    <div className="px-4 py-5 border-b border-border sm:px-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-foreground">Address Book</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Manage your shipping and billing addresses.</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsAddressPanelOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Add New
                      </button>
                    </div>
                    {addresses.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">No addresses saved.</div>
                    ) : (
                      <ul role="list" className="divide-y divide-border">
                        {addresses.map((address) => (
                          <li key={address.id} className="p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-foreground">{address.name}</h4>
                                  {address.isDefault && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{address.type}</p>
                                <div className="mt-3 text-sm text-muted-foreground space-y-1">
                                  <p>{address.street}</p>
                                  <p>{address.city}, {address.country}</p>
                                  <p>{address.phone}</p>
                                </div>
                              </div>
                              <div className="flex space-x-3">
                                <button 
                                  onClick={() => setAddresses(addresses.filter(a => a.id !== address.id))}
                                  className="text-sm font-medium text-destructive hover:opacity-80 transition-opacity"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Payment Methods Tab */}
                {activeTab === "payment" && (
                  <div className="bg-background shadow sm:rounded-lg overflow-hidden animate-in fade-in border border-border">
                    <div className="px-4 py-5 border-b border-border sm:px-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-foreground">Payment Methods</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Manage your saved credit and debit cards.</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsCardPanelOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Add New Card
                      </button>
                    </div>
                    {cards.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">No payment methods saved.</div>
                    ) : (
                      <ul role="list" className="divide-y divide-border">
                        {cards.map((card) => (
                          <li key={card.id} className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-8 w-12 bg-muted border border-border rounded flex items-center justify-center text-xs font-bold text-muted-foreground">
                                  {card.brand}
                                </div>
                                <div className="ml-4">
                                  <div className="flex items-center">
                                    <h4 className="text-sm font-medium text-foreground">•••• {card.last4}</h4>
                                    {card.isDefault && (
                                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm text-muted-foreground">Expires {card.expiry}</p>
                                </div>
                              </div>
                              <div className="flex space-x-3">
                                <button 
                                  onClick={() => setCards(cards.filter(c => c.id !== card.id))}
                                  className="text-sm font-medium text-destructive hover:opacity-80 transition-opacity"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>

        <MinimalistFooter storeName={storeName} domain={params.domain} />
      </div>

      {/* Slide-over Panels */}
      <OrderDetailsPanel 
        isOpen={isOrderPanelOpen} 
        onClose={() => setIsOrderPanelOpen(false)} 
        order={selectedOrder} 
      />
      
      <AddressFormPanel 
        isOpen={isAddressPanelOpen} 
        onClose={() => setIsAddressPanelOpen(false)} 
        onAddAddress={(address) => setAddresses([...addresses, address])} 
      />
      
      <CardFormPanel 
        isOpen={isCardPanelOpen} 
        onClose={() => setIsCardPanelOpen(false)} 
        onAddCard={(card) => setCards([...cards, card])} 
      />
    </>
  );
}
