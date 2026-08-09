'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatLKR } from '@/lib/constants';
import type { CartItem, Customer } from '@/lib/types';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
  Search, Plus, Minus, CreditCard, Banknote,
  ShoppingCart, Package, User, Trash2, X, ChevronRight,
  Smartphone, Shirt, Pill, Apple, Wrench, Grid, QrCode, Tag, Printer
} from 'lucide-react';

type PaymentMethod = 'CASH' | 'CARD' | 'PAYHERE_QR';

interface PaymentModal {
  open: boolean;
  method: PaymentMethod;
  cashAmount: string;
}

const getCategoryDetails = (catName: string) => {
  const name = catName.toLowerCase();
  if (name.includes('electr') || name.includes('device') || name.includes('phone') || name.includes('tech')) 
    return { icon: Smartphone, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' };
  if (name.includes('cloth') || name.includes('apparel') || name.includes('fashion') || name.includes('wear')) 
    return { icon: Shirt, color: 'from-pink-500 to-rose-600', bg: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' };
  if (name.includes('med') || name.includes('pharm') || name.includes('health') || name.includes('drug')) 
    return { icon: Pill, color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' };
  if (name.includes('groc') || name.includes('food') || name.includes('fruit') || name.includes('veg')) 
    return { icon: Apple, color: 'from-orange-400 to-red-500', bg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' };
  if (name.includes('hard') || name.includes('tool') || name.includes('build') || name.includes('paint')) 
    return { icon: Wrench, color: 'from-gray-600 to-slate-700', bg: 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300' };
  
  return { icon: Package, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' };
};

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [paymentModal, setPaymentModal] = useState<PaymentModal>({ open: false, method: 'CASH', cashAmount: '' });
  const [saleComplete, setSaleComplete] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const searchCustomers = async (q: string) => {
    try {
      const res = await storeOwnerAPI.getCustomers(q);
      setCustomersList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (customerModalOpen) {
      searchCustomers(customerSearch);
    }
  }, [customerModalOpen, customerSearch]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) return toast.error('Name is required');
    try {
      const res = await storeOwnerAPI.createCustomer(newCustomer);
      setCustomer(res.data);
      setCustomerModalOpen(false);
      setNewCustomer({ name: '', phone: '' });
      setIsCreatingCustomer(false);
      toast.success('Customer added successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await storeOwnerAPI.getProducts();
        setProducts(res.data);
      } catch (err) {
        toast.error('Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const found = products.find(
        (p) => p.barcode === search || p.name.toLowerCase() === search.toLowerCase()
      );
      if (found) addToCart(found);
      else toast.error('Product not found');
    }
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const discountAmount = discountType === 'percent' ? (subtotal * discount) / 100 : discount;
  const taxAmount = 0; 
  const total = Math.max(0, subtotal - discountAmount + taxAmount);

  const change = paymentModal.method === 'CASH' && parseFloat(paymentModal.cashAmount || '0') >= total
    ? parseFloat(paymentModal.cashAmount || '0') - total
    : 0;

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      await storeOwnerAPI.createSale({
        items: cart.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, price: i.price })),
        paymentMethod: paymentModal.method,
        amountLKR: total,
        customerId: customer?.id
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
    const res = await storeOwnerAPI.getProducts();
    setProducts(res.data);
    setLoading(false);
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const customerName = customer ? customer.name : 'Guest';
    const dateStr = new Date().toLocaleString('en-GB');
    
    let itemsHtml = '';
    cart.forEach(item => {
      itemsHtml += `
        <tr>
          <td style="padding: 5px 0;">${item.productName}<br><small>${item.quantity} x ${formatLKR(item.price)}</small></td>
          <td style="padding: 5px 0; text-align: right;">${formatLKR(item.subtotal)}</td>
        </tr>
      `;
    });

    const html = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: #000; }
            h2 { text-align: center; margin: 0 0 10px 0; }
            p { margin: 5px 0; font-size: 14px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { w-full; width: 100%; border-collapse: collapse; font-size: 14px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>cMart</h2>
          <p class="text-center">Receipt</p>
          <div class="divider"></div>
          <p>Date: ${dateStr}</p>
          <p>Customer: ${customerName}</p>
          <p>Pay Method: ${paymentModal.method}</p>
          <div class="divider"></div>
          <table>
            ${itemsHtml}
          </table>
          <div class="divider"></div>
          <table>
            <tr><td>Subtotal:</td><td class="text-right">${formatLKR(subtotal)}</td></tr>
            ${discount > 0 ? `<tr><td>Discount:</td><td class="text-right">-${formatLKR(discountAmount)}</td></tr>` : ''}
            <tr><td class="bold">Total:</td><td class="text-right bold">${formatLKR(total)}</td></tr>
          </table>
          ${paymentModal.method === 'CASH' ? `
          <div class="divider"></div>
          <table>
            <tr><td>Tendered:</td><td class="text-right">${formatLKR(parseFloat(paymentModal.cashAmount || '0'))}</td></tr>
            <tr><td>Change:</td><td class="text-right">${formatLKR(change)}</td></tr>
          </table>
          ` : ''}
          <div class="divider"></div>
          <p class="text-center">Thank you for your business!</p>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-900/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 animate-pulse">Initializing POS Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden min-h-0 bg-[#f4f7f6] dark:bg-[#0b1120]">
      {/* ──────────────────────── LEFT PANEL: PRODUCTS ──────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
        
        {/* Top Header: Search & Ribbon */}
        <div className="p-4 lg:p-6 pb-0 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Scan barcode or search products... (F3)"
              className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white transition-all placeholder:text-gray-400"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-[10px] font-bold text-gray-400 tracking-wider">
              ENTER
            </div>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              const { icon: CatIcon, bg } = getCategoryDetails(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-100' 
                      : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/80 scale-95 hover:scale-100'
                  }`}
                >
                  {cat === 'All' ? <Grid className="w-4 h-4" /> : <CatIcon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((p) => {
              const { icon: CatIcon, color, bg } = getCategoryDetails(p.category?.name || '');
              const isOutOfStock = p.stockQuantity <= 0;
              return (
                <motion.div
                  layoutId={`product-${p.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${isOutOfStock ? 'opacity-50 grayscale pointer-events-none' : 'hover:-translate-y-1'}`}
                >
                  <div className={`h-32 w-full bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden`}>
                    <CatIcon className="w-12 h-12 text-white/50 mix-blend-overlay group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    {/* Price Overlay */}
                    <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                      <span className="text-white font-black text-lg tracking-tight drop-shadow-md">
                        {formatLKR(p.price)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md ${isOutOfStock ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white'}`}>
                        {p.stockQuantity} in stock
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-semibold truncate">
                      {p.barcode || 'NO BARCODE'}
                    </p>
                  </div>
                  
                  {/* Hover Overlay Add Button */}
                  <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Plus className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="font-sans h-full flex flex-col items-center justify-center text-center opacity-50">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">No products found</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Try scanning a different barcode or change the category.</p>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────── RIGHT PANEL: CART & CHECKOUT ──────────────────────── */}
      <div className="w-[400px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] dark:shadow-none z-10">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white leading-tight">Current Order</h2>
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</p>
            </div>
          </div>
          <button 
            onClick={() => setCustomerModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              customer 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{customer ? customer.name : 'Walk-in'}</span>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3 relative">
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={item.productId}
                className="group flex flex-col p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight pr-4">{item.productName}</h4>
                  <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {formatLKR(item.price)}
                  </span>
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-lg p-0.5 border border-gray-100 dark:border-slate-700">
                    <button 
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {cart.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
              <ShoppingCart className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-bold text-gray-500">Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Scan or tap products to add</p>
            </div>
          )}
        </div>

        {/* Order Summary & Actions */}
        <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 space-y-4">
          
          {/* Discount & Clear Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const val = prompt('Enter discount amount (Rs.):');
                if (val && !isNaN(Number(val))) {
                  setDiscountType('fixed');
                  setDiscount(Number(val));
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" /> Discount
            </button>
            <button 
              onClick={() => { setCart([]); setDiscount(0); }}
              disabled={cart.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-slate-400 font-medium">
              <span>Subtotal</span>
              <span>{formatLKR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-orange-500 font-bold">
                <span>Discount</span>
                <span>-{formatLKR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500 dark:text-slate-400 font-medium">
              <span>Tax (0%)</span>
              <span>{formatLKR(taxAmount)}</span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-3 border-t border-gray-200 dark:border-slate-700">
            <span className="text-gray-900 dark:text-white font-black uppercase tracking-wider text-sm">Total</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight truncate ml-2 text-right">{formatLKR(total)}</span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setPaymentModal({ open: true, method: 'CASH', cashAmount: '' })}
            className="w-full relative group overflow-hidden bg-blue-600 text-white font-black text-lg py-5 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <CreditCard className="w-6 h-6" />
              PAY NOW
            </span>
          </button>
        </div>
      </div>

      {/* ──────────────────────── MODAL: CUSTOMER SELECTION ──────────────────────── */}
      <AnimatePresence>
        {customerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCustomerModalOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {isCreatingCustomer ? 'New Customer' : 'Select Customer'}
                </h2>
                <button onClick={() => setCustomerModalOpen(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {isCreatingCustomer ? (
                  <form onSubmit={handleCreateCustomer} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Name <span className="text-red-500">*</span></label>
                      <input autoFocus type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Phone</label>
                      <input type="text" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="07XXXXXXXX" />
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button type="button" onClick={() => setIsCreatingCustomer(false)} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                      <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-colors">Save Customer</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input autoFocus type="text" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} placeholder="Search by name or phone..." className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-shadow" />
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto min-h-[150px]">
                      <button onClick={() => { setCustomer(null); setCustomerModalOpen(false); }} className="w-full p-3 text-left bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-400 transition-colors">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">Walk-in Customer</p>
                            <p className="text-xs text-gray-500">No tracking</p>
                          </div>
                        </div>
                      </button>

                      {customersList.map(c => (
                        <button key={c.id} onClick={() => { setCustomer(c); setCustomerModalOpen(false); }} className="w-full p-3 text-left bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                              <p className="text-xs text-gray-500">{c.phone || 'No phone'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{c.points || 0} pts</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button onClick={() => router.push('/employee/customers?action=add')} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl text-gray-600 dark:text-slate-400 font-bold hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors">
                      <Plus className="w-5 h-5" /> Add New Customer
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────── MODAL: PAYMENT ──────────────────────── */}
      <AnimatePresence>
        {paymentModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setPaymentModal(prev => ({ ...prev, open: false }))} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex"
            >
              {/* Modal Left: Order Summary */}
              <div className="w-2/5 bg-gray-50 dark:bg-slate-800/50 p-8 border-r border-gray-100 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-6">Payment Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-gray-600 dark:text-slate-300">
                      <span>Items ({totalItems})</span>
                      <span className="font-bold">{formatLKR(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-orange-500">
                        <span>Discount</span>
                        <span className="font-bold">-{formatLKR(discountAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Total Due</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight break-words">{formatLKR(total)}</p>
                </div>
              </div>

              {/* Modal Right: Payment Execution */}
              <div className="w-3/5 flex flex-col p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Complete Payment</h2>
                  <button onClick={() => setPaymentModal(prev => ({ ...prev, open: false }))} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {saleComplete ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-64 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                      <CreditCard className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
                    <p className="text-gray-500 dark:text-slate-400 mb-8">Change due: <span className="font-bold text-gray-900 dark:text-white">{formatLKR(change)}</span></p>
                    <div className="flex gap-4">
                      <button onClick={printReceipt} className="px-6 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Printer className="w-5 h-5" />
                        Print Receipt
                      </button>
                      <button onClick={resetPOS} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-colors">
                        Start New Sale
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {[
                        { id: 'CASH', icon: Banknote, label: 'Cash' },
                        { id: 'CARD', icon: CreditCard, label: 'Card' },
                        { id: 'PAYHERE_QR', icon: QrCode, label: 'Mobile/QR' },
                      ].map(method => {
                        const Icon = method.icon;
                        const isSelected = paymentModal.method === method.id;
                        return (
                           <button
                            key={method.id}
                            onClick={() => setPaymentModal(prev => ({ ...prev, method: method.id as PaymentMethod }))}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:hover:border-slate-700'
                            }`}
                          >
                            <Icon className="w-7 h-7" />
                            <span className="font-bold text-sm tracking-wide">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {paymentModal.method === 'CASH' && (
                      <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Tendered Amount (Rs.)</label>
                        <input
                          type="number"
                          autoFocus
                          value={paymentModal.cashAmount}
                          onChange={(e) => setPaymentModal(prev => ({ ...prev, cashAmount: e.target.value }))}
                          className="w-full text-2xl font-black p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          placeholder={total.toString()}
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Array.from(new Set([
                            total,
                            Math.ceil(total / 100) * 100,
                            Math.ceil(total / 500) * 500,
                            Math.ceil(total / 1000) * 1000,
                            Math.ceil(total / 5000) * 5000,
                            Math.ceil(total / 10000) * 10000,
                            Math.ceil(total / 50000) * 50000
                          ]))
                            .filter(v => v >= total && v > 0)
                            .sort((a, b) => a - b)
                            .slice(0, 3)
                            .map(amt => (
                              <button
                                key={amt}
                                onClick={() => setPaymentModal(prev => ({ ...prev, cashAmount: amt.toString() }))}
                                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                {formatLKR(amt)}
                              </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={checkout}
                      disabled={paymentModal.method === 'CASH' && (parseFloat(paymentModal.cashAmount) < total && paymentModal.cashAmount !== '')}
                      className="w-full bg-blue-600 text-white font-black text-xl py-5 rounded-2xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      Confirm Payment
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
