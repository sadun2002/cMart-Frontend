'use client';

import { useState, useRef, useEffect } from 'react';
import { formatLKR } from '@/lib/constants';
import type { CartItem, Customer } from '@/lib/types';
import { employeeAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Bell, Plus, Minus, CreditCard, Banknote, ChevronRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

type PaymentMethod = 'CASH' | 'CARD' | 'PAYHERE_QR';

interface PaymentModal {
  open: boolean;
  method: PaymentMethod;
  cashAmount: string;
}

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentModal, setPaymentModal] = useState<PaymentModal>({ open: false, method: 'CASH', cashAmount: '' });
  const [saleComplete, setSaleComplete] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await employeeAPI.getProducts();
        setProducts(res.data);
      } catch (err) {
        toast.error('Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category?.name || 'Uncategorized')))];

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search);
    const matchCat = selectedCategory === 'All' || (p.category?.name || 'Uncategorized') === selectedCategory;
    return matchSearch && matchCat;
  });

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stockQuantity) {
          toast.error(`Only ${product.stockQuantity} in stock`);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
            : i
        );
      }
      if (product.stockQuantity < 1) {
        toast.error('Out of stock');
        return prev;
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        discount: 0,
        subtotal: product.price,
      }];
    });
    setSearch('');
    searchRef.current?.focus();
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    const product = products.find(p => p.id === productId);
    if (product && qty > product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} in stock`);
      return;
    }
    setCart((prev) =>
      prev.map((i) => i.productId === productId ? { ...i, quantity: qty, subtotal: qty * i.price } : i)
    );
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const discountAmount = discountType === 'percent' ? (subtotal * discount) / 100 : discount;
  const taxAmount = 0; 
  const total = subtotal - discountAmount + taxAmount;

  const change = paymentModal.method === 'CASH' && parseFloat(paymentModal.cashAmount || '0') >= total
    ? parseFloat(paymentModal.cashAmount || '0') - total
    : 0;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const found = products.find(
        (p) => p.barcode === search || p.name.toLowerCase() === search.toLowerCase()
      );
      if (found) addToCart(found);
      else toast.error('Product not found');
    }
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      await employeeAPI.createSale({
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        paymentMethod: paymentModal.method,
        amountLKR: total
      });
      setSaleComplete(true);
      toast.success('Sale completed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete sale');
    }
  };

  const resetPOS = async () => {
    setCart([]);
    setCustomer(null);
    setDiscount(0);
    setPaymentModal({ open: false, method: 'CASH', cashAmount: '' });
    setSaleComplete(false);
    setLoading(true);
    const res = await employeeAPI.getProducts();
    setProducts(res.data);
    setLoading(false);
  };

  const handleCheckoutModal = () => {
    if (cart.length === 0) return;
    setPaymentModal(p => ({ ...p, open: true }));
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground animate-in fade-in duration-500 font-sans">
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 p-4 md:p-6 lg:p-8 overflow-y-auto no-scrollbar">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                className="pl-12 h-12 rounded-full border-transparent bg-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] focus-visible:ring-primary/20 text-md"
                placeholder="Search menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                ref={searchRef}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground">Employee User</p>
                <p className="text-xs text-muted-foreground">{currentDate}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center relative shadow-sm border border-border/50">
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Categories</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex flex-col items-center justify-center min-w-[100px] h-[100px] rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 ${
                    selectedCategory === cat 
                      ? 'bg-primary/5 border-2 border-primary text-primary shadow-sm' 
                      : 'bg-white border-2 border-transparent text-muted-foreground shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] hover:shadow-md'
                  }`}
                >
                  <div className={`w-8 h-8 mb-2 flex items-center justify-center rounded-full ${selectedCategory === cat ? 'bg-primary/10' : 'bg-muted'}`}>
                    <span className="text-lg opacity-70">🍽️</span>
                  </div>
                  <span className={`text-xs font-semibold ${selectedCategory === cat ? 'text-primary' : 'text-foreground'}`}>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Select Menu</h2>
              <span className="text-sm text-muted-foreground">Showing {filteredProducts.length} Items</span>
            </div>
            
            {loading ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground animate-pulse">Loading menu...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                {filteredProducts.map(product => {
                  const inCart = cart.find(i => i.productId === product.id);
                  const qty = inCart ? inCart.quantity : 0;
                  return (
                    <Card key={product.id} className="p-5 border-none shadow-[0_4px_24px_-2px_rgba(0,0,0,0.04)] flex flex-col h-full bg-white rounded-[2rem] transition-transform hover:-translate-y-1 duration-200">
                      <div className="flex gap-4 mb-4">
                        <div className="w-20 h-20 bg-secondary rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl">
                          🥤
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className="font-bold text-sm leading-tight mb-1">{product.name}</h3>
                          <p className="text-xs text-muted-foreground mb-1">{product.stockQuantity} Available</p>
                          <p className="font-bold text-primary text-lg mt-1">{formatLKR(product.price)}</p>
                        </div>
                      </div>
                      
                      {/* Variations (Mocked for visual style matching reference) */}
                      <div className="mt-auto space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Cup Size</p>
                            <div className="flex gap-1.5">
                              {['S', 'M', 'L'].map(sz => (
                                <div key={sz} className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold cursor-default ${sz === 'S' ? 'border-2 border-primary text-primary bg-primary/5' : 'border border-border/50 text-muted-foreground'}`}>{sz}</div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Ice Level</p>
                            <div className="flex gap-1.5">
                              {['30', '60', '100'].map(lvl => (
                                <div key={lvl} className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold cursor-default ${lvl === '100' ? 'border-2 border-primary text-primary bg-primary/5' : 'border border-border/50 text-muted-foreground'}`}>{lvl}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Sugar Level</p>
                            <div className="flex gap-1.5">
                              {['30', '60', '100'].map(lvl => (
                                <div key={lvl} className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold cursor-default ${lvl === '100' ? 'border-2 border-primary text-primary bg-primary/5' : 'border border-border/50 text-muted-foreground'}`}>{lvl}</div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex-1 max-w-[110px]">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">Amount</p>
                            <div className="flex items-center justify-between border border-border/60 rounded-full p-1 bg-background/50">
                              <button onClick={() => updateQty(product.id, qty - 1)} disabled={qty===0} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white text-muted-foreground disabled:opacity-30 transition-colors">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-sm w-4 text-center">{qty}</span>
                              <button onClick={() => addToCart(product)} className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary/90 transition-colors">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className={`w-full mt-4 h-11 text-sm rounded-xl font-bold transition-all ${qty > 0 ? 'bg-primary text-white shadow-[0_8px_16px_-4px_rgba(0,183,97,0.4)]' : 'bg-background hover:bg-primary/10 hover:text-primary text-foreground'}`} 
                          onClick={() => { if(qty===0) addToCart(product); }}
                        >
                          {qty > 0 ? 'Add More To Cart' : 'Add To Cart'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: BILL DETAILS */}
        <div className="w-full md:w-[380px] bg-white border-l border-border/50 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 relative">
          <div className="p-6 md:p-8 flex-1 overflow-y-auto no-scrollbar flex flex-col">
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Bill Details</h2>
              <span className="text-sm font-medium text-muted-foreground">#146234</span>
            </div>
            
            <div className="mb-8">
              <label className="text-sm font-bold mb-2 block">Customer Name</label>
              <Input 
                placeholder="Customer Name"
                className="h-12 rounded-full border-transparent bg-background/60 shadow-sm focus-visible:ring-primary/20 text-sm px-5"
                value={customer?.name || ''}
                onChange={(e) => setCustomer({ id: 0, name: e.target.value, phone: '', totalSpent: 0, totalOrders: 0, createdAt: new Date().toISOString() })}
              />
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto no-scrollbar mb-6 min-h-[150px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40">
                  <ShoppingCart className="w-12 h-12 mb-4" />
                  <p className="font-medium">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {cart.map(item => (
                    <div key={item.productId} className="flex justify-between items-start group">
                      <div className="flex-1">
                        <div className="font-bold text-sm leading-tight text-foreground/90">{item.productName}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.quantity} (Items)</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary text-sm">{formatLKR(item.subtotal)}</div>
                        <button onClick={() => removeFromCart(item.productId)} className="text-[10px] text-destructive opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Totals */}
            <div className="border-t border-border/60 pt-6 space-y-4 mb-8 text-sm">
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Item</span>
                <span className="text-foreground">{totalItems} (Items)</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span className="text-foreground">{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Discount</span>
                <span className="text-primary">-{formatLKR(discountAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Tax (0%)</span>
                <span className="text-foreground">{formatLKR(taxAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center font-bold text-lg pt-4 border-t border-border/60">
                <span>Total</span>
                <span className="text-primary text-xl">{formatLKR(total)}</span>
              </div>
            </div>

            {/* Select Table (Mock) */}
            <div className="mb-6">
              <label className="text-sm font-bold mb-2 block">Select Table</label>
              <button className="w-full h-12 rounded-full border border-border/50 bg-background/30 flex items-center justify-between px-5 text-muted-foreground text-sm font-medium hover:bg-background/80 transition-colors">
                <span>Select Table</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Select Payment */}
            <div className="mb-6">
              <label className="text-sm font-bold mb-2 block">Select Payment</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentModal(p => ({ ...p, method: 'CASH' }))}
                  className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${paymentModal.method === 'CASH' ? 'border-2 border-primary bg-primary/5 text-primary shadow-[0_4px_16px_-4px_rgba(0,183,97,0.2)]' : 'border border-border/50 text-muted-foreground hover:bg-background/50'}`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="text-xs font-bold">Pay with Cash</span>
                </button>
                <button 
                  onClick={() => setPaymentModal(p => ({ ...p, method: 'CARD' }))}
                  className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${paymentModal.method === 'CARD' ? 'border-2 border-primary bg-primary/5 text-primary shadow-[0_4px_16px_-4px_rgba(0,183,97,0.2)]' : 'border border-border/50 text-muted-foreground hover:bg-background/50'}`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs font-bold">Pay with Card</span>
                </button>
              </div>
            </div>

            {/* Process Transaction Button */}
            <Button 
              onClick={handleCheckoutModal} 
              disabled={cart.length === 0}
              className="w-full h-[52px] rounded-full text-base font-bold shadow-[0_8px_20px_-6px_rgba(0,183,97,0.5)] transition-all hover:shadow-[0_12px_24px_-8px_rgba(0,183,97,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:shadow-none"
            >
              Process Transaction
            </Button>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL OVERLAY */}
      {paymentModal.open && (
        <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-border/50">
            {/* Header */}
            <div className="bg-primary/5 p-6 text-foreground border-b border-border/50">
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              <p className="text-muted-foreground mt-1">Total due: <span className="text-primary font-bold">{formatLKR(total)}</span></p>
            </div>
            
            {!saleComplete ? (
              <div className="p-6 space-y-6">
                {/* Methods */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentModal({...paymentModal, method: 'CASH'})} className={`py-3 rounded-2xl border font-bold transition-all ${paymentModal.method === 'CASH' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-muted text-muted-foreground'}`}>Cash</button>
                  <button onClick={() => setPaymentModal({...paymentModal, method: 'CARD'})} className={`py-3 rounded-2xl border font-bold transition-all ${paymentModal.method === 'CARD' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-muted text-muted-foreground'}`}>Card</button>
                </div>

                {/* Cash Input */}
                {paymentModal.method === 'CASH' && (
                  <div className="space-y-4 animate-in slide-in-from-left-2">
                    <div>
                      <label className="text-sm font-bold text-foreground mb-2 block">Cash Received (LKR)</label>
                      <input 
                        type="number" 
                        autoFocus
                        value={paymentModal.cashAmount} 
                        onChange={e => setPaymentModal({...paymentModal, cashAmount: e.target.value})}
                        className="w-full text-2xl font-bold p-4 border rounded-2xl bg-background focus:ring-2 focus:ring-primary focus:outline-none" 
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {[500, 1000, 2000, 5000].map(amt => (
                        <button key={amt} onClick={() => setPaymentModal({...paymentModal, cashAmount: amt.toString()})} className="py-2.5 bg-background border rounded-xl font-bold hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-colors">+{amt}</button>
                      ))}
                    </div>

                    <div className="flex justify-between items-center p-5 bg-background rounded-2xl border">
                      <span className="font-bold text-muted-foreground">Change Due:</span>
                      <span className={`text-2xl font-black ${change < 0 ? 'text-destructive' : 'text-primary'}`}>
                        {formatLKR(Math.max(0, change))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Placeholder */}
                {paymentModal.method !== 'CASH' && (
                  <div className="py-10 text-center animate-in slide-in-from-right-2 bg-background rounded-2xl border">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary shadow-inner">
                      <CreditCard className="w-10 h-10" />
                    </div>
                    <p className="font-bold text-foreground">Awaiting Card Payment</p>
                    <p className="text-sm text-muted-foreground mt-2 px-8">Please ask the customer to complete the transaction on the terminal.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setPaymentModal({...paymentModal, open: false})} className="flex-1 h-12 rounded-full font-bold">Cancel</Button>
                  <Button 
                    onClick={checkout}
                    disabled={paymentModal.method === 'CASH' && (change < 0 || !paymentModal.cashAmount)}
                    className="flex-1 h-12 rounded-full font-bold shadow-[0_8px_20px_-6px_rgba(0,183,97,0.5)]"
                  >
                    Confirm Sale
                  </Button>
                </div>
              </div>
            ) : (
              // Success Screen
              <div className="p-8 text-center space-y-6 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black">Payment Successful!</h3>
                  <p className="text-muted-foreground mt-2 font-medium">Receipt has been generated.</p>
                  {paymentModal.method === 'CASH' && (
                    <div className="mt-6 p-5 bg-background rounded-2xl border border-border/50">
                      <span className="block text-sm font-bold text-muted-foreground mb-1">Change Due</span>
                      <span className="block text-3xl font-black text-primary">{formatLKR(change)}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 h-12 rounded-full font-bold">Print Receipt</Button>
                  <Button onClick={resetPOS} className="flex-1 h-12 rounded-full font-bold shadow-[0_8px_20px_-6px_rgba(0,183,97,0.5)]">New Sale</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
