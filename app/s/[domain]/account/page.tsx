"use client";
import { AuraAccount } from "@/components/storefront/themes/aura/pages/AuraAccount";
import { MarketAccount } from "@/components/storefront/themes/market/pages/MarketAccount";

import { VerdantAccount } from "@/components/storefront/themes/verdant/pages/VerdantAccount";

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
import { MinimalistConfirmDialog } from "@/components/storefront/themes/minimalist/MinimalistConfirmDialog";

import { storefrontAPI } from "@/lib/api";
import { useThemeCustomizations } from "@/components/storefront/theme-provider";
import { toast } from "sonner";

export default function StorefrontAccountPage(props: { 
  params: Promise<{ domain: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const searchParams = props.searchParams ? use(props.searchParams) : {};
  const storeName = params.domain.replace("-", " ").toUpperCase() || "My Store";
  const theme = searchParams?.theme as string;
  const router = useRouter();

  const { user, isAuthenticated, logout } = useStorefrontAuth();
  const { isPreview } = useThemeCustomizations();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // State for Panels
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [isAddressPanelOpen, setIsAddressPanelOpen] = useState(false);
  const [isCardPanelOpen, setIsCardPanelOpen] = useState(false);

  // State for Confirm Dialog
  const [deleteItem, setDeleteItem] = useState<{ type: 'address' | 'card', id: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated && !isPreview) {
      router.push(`/s/${params.domain}/login`);
    } else if (mounted && isAuthenticated && !isPreview) {
      fetchAccountData();
    }
  }, [mounted, isAuthenticated, isPreview, router, params.domain]);

  const fetchAccountData = async () => {
    try {
      setLoadingData(true);
      const [profileRes, ordersRes, addressesRes, cardsRes] = await Promise.all([
        storefrontAPI.getProfile(),
        storefrontAPI.getOrders(),
        storefrontAPI.getAddresses(),
        storefrontAPI.getCards(),
      ] as any[]);
      setProfile(profileRes.data || profileRes);
      setOrders(ordersRes.data || []);
      setAddresses(addressesRes.data || []);
      setCards(cardsRes.data || []);
    } catch (error: any) {
      console.warn("Failed to fetch account data:", error?.message);
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        router.push(`/s/${params.domain}/login`);
      } else {
        toast.error("Failed to load account data");
      }
    } finally {
      setLoadingData(false);
    }
  };

  const fetchOrdersSilent = async () => {
    try {
      const ordersRes: any = await storefrontAPI.getOrders();
      setOrders(ordersRes.data || []);
    } catch (e) {
      // Ignore polling errors
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated && !isPreview && activeTab === "orders") {
      const interval = setInterval(fetchOrdersSilent, 5000);

  return () => clearInterval(interval);
    }
  }, [mounted, isAuthenticated, isPreview, activeTab]);

  const handleLogout = () => {
    logout();
    router.push(`/s/${params.domain}`);
  };

  const handleAddAddress = async (address: any) => {
    try {
      const { id, ...addressData } = address;
      const res: any = await storefrontAPI.addAddress(addressData);
      const newAddress = res.data || res;
      setAddresses([...addresses, newAddress]);
      toast.success("Address added");
      return newAddress;
    } catch (e) {
      toast.error("Failed to add address");
      throw e;
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await storefrontAPI.deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
      toast.success("Address removed");
    } catch (e) {
      toast.error("Failed to remove address");
    }
  };

  const handleAddCard = async (card: any) => {
    try {
      const { id, ...cardData } = card;
      const res: any = await storefrontAPI.addCard(cardData);
      const newCard = res.data || res;
      setCards([...cards, newCard]);
      toast.success("Card added");
      return newCard;
    } catch (e) {
      toast.error("Failed to add card");
      throw e;
    }
  };

  const handleDeleteCard = async (id: number) => {
    try {
      await storefrontAPI.deleteCard(id);
      setCards(cards.filter(c => c.id !== id));
      toast.success("Card removed");
    } catch (e) {
      toast.error("Failed to remove card");
    }
  };

  const handleCancelOrder = async (id: number | string) => {
    try {
      await storefrontAPI.cancelOrder(Number(id));
      toast.success("Order cancelled successfully");
      setIsOrderPanelOpen(false);
      // Optimistically update
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o));
    } catch (e) {
      toast.error("Failed to cancel order");
    }
  };

  const handleReturnOrder = async (id: number | string) => {
    try {
      await storefrontAPI.returnOrder(Number(id));
      toast.success("Return requested successfully");
      setIsOrderPanelOpen(false);
      // Optimistically update
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'RETURNED' } : o));
    } catch (e) {
      toast.error("Failed to request return");
    }
  };

  if (!mounted || (!isAuthenticated && !isPreview)) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PROCESSING": return <Clock className="w-4 h-4 text-amber-500 mr-1.5" />;
      case "SHIPPED": return <Truck className="w-4 h-4 text-blue-500 mr-1.5" />;
      case "DELIVERED": return <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />;
      default: return null;
    }
  };

  const LoadingState = () => (
    <div className="p-12 flex flex-col items-center justify-center text-muted-foreground animate-in fade-in">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
      <p>Loading your data...</p>
    </div>
  );

  const EmptyState = ({ icon, title, description }: any) => (
    <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );

  if (theme === 'market') {
    return <MarketAccount storeName={storeName} domain={params.domain} />;
  }
  if (theme === 'aura') {
    return <AuraAccount storeName={storeName} domain={params.domain} />;
  }

  if (theme === 'verdant') {
    return <VerdantAccount storeName={storeName} domain={params.domain} />;
  }

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
                <p className="mt-1 text-sm text-muted-foreground">Welcome back, {profile?.name || user?.name}</p>
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
                      {loadingData ? (
                        <LoadingState />
                      ) : orders.length === 0 ? (
                        <EmptyState 
                          icon={<Package className="w-8 h-8" />}
                          title="No orders yet"
                          description="When you place your first order, it will appear here so you can track its progress."
                        />
                      ) : (
                        orders.map((order) => (
                        <li key={order.id} className="p-4 sm:p-6 hover:bg-muted transition-colors">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">Order number</p>
                              <p className="mt-1 text-sm text-muted-foreground">{order.orderNumber || order.id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Date placed</p>
                              <p className="mt-1 text-sm text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}</p>
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
                      )))}
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
                          <dd className="mt-1 text-sm text-foreground">{profile?.name || user?.name}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-muted-foreground">Email address</dt>
                          <dd className="mt-1 text-sm text-foreground">{profile?.email || user?.email}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-muted-foreground">Phone number</dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {profile?.phone || addresses.find(a => a.isDefault)?.phone || addresses[0]?.phone || "Not set"}
                          </dd>
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
                    {loadingData ? (
                      <LoadingState />
                    ) : addresses.length === 0 ? (
                      <EmptyState 
                        icon={<MapPin className="w-8 h-8" />}
                        title="No addresses saved"
                        description="Add a shipping address to checkout faster next time."
                      />
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
                                  onClick={() => setDeleteItem({ type: 'address', id: address.id })}
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
                    {loadingData ? (
                      <LoadingState />
                    ) : cards.length === 0 ? (
                      <EmptyState 
                        icon={<CreditCard className="w-8 h-8" />}
                        title="No payment methods saved"
                        description="Save your card details securely for a faster checkout experience."
                      />
                    ) : (
                      <ul role="list" className="divide-y divide-border">
                        {cards.map((card) => (
                          <li key={card.id} className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-8 w-12 bg-muted border border-border rounded flex items-center justify-center text-xs font-bold text-muted-foreground">
                                  CARD
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
                                  onClick={() => setDeleteItem({ type: 'card', id: card.id })}
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
        onCancelOrder={handleCancelOrder}
        onReturnOrder={handleReturnOrder}
      />
      
      <AddressFormPanel
        isOpen={isAddressPanelOpen}
        onClose={() => setIsAddressPanelOpen(false)}
        onAddAddress={handleAddAddress}
        initialName={profile?.name || user?.name || ''}
        isFirstAddress={addresses.length === 0}
      />
      
      <CardFormPanel 
        isOpen={isCardPanelOpen} 
        onClose={() => setIsCardPanelOpen(false)} 
        onAddCard={handleAddCard} 
      />

      <MinimalistConfirmDialog
        isOpen={deleteItem !== null}
        title={deleteItem?.type === 'address' ? "Delete Address" : "Remove Payment Method"}
        message={deleteItem?.type === 'address' 
          ? "Are you sure you want to delete this address? This action cannot be undone."
          : "Are you sure you want to remove this payment method? This action cannot be undone."
        }
        confirmText={deleteItem?.type === 'address' ? "Delete" : "Remove"}
        onConfirm={() => {
          if (deleteItem?.type === 'address') handleDeleteAddress(deleteItem.id);
          if (deleteItem?.type === 'card') handleDeleteCard(deleteItem.id);
        }}
        onClose={() => setDeleteItem(null)}
        isDestructive={true}
      />
    </>
  );
}
