'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatLKR } from '@/lib/constants';
import type { CartItem, Customer } from '@/lib/types';
import {
  getLocalCustomers,
  saveCustomerLocally,
  createSaleLocally,
  getRecentSoldProductIds,
  getLocalProducts
} from '@/lib/local-services';
import { useAuthStore } from '@/lib/auth-store';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
  Search, Plus, Minus, CreditCard, Banknote,
  ShoppingCart, Package, User, Trash2, X, ChevronRight,
  Smartphone, Shirt, Pill, Apple, Wrench, Grid, QrCode, Tag, Printer,
  List, ChevronDown, ChevronUp
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
  
  return {
    icon: Package,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  };
};

export default function POSPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [paymentModal, setPaymentModal] = useState<PaymentModal>({ open: false, method: 'CASH', cashAmount: '' });
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountInputValue, setDiscountInputValue] = useState("");
  const [discountFocusedBtn, setDiscountFocusedBtn] = useState<"ok" | "cancel">("ok");

  const [saleComplete, setSaleComplete] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  
  // -- Keyboard Navigation State --
  const [focusedSection, setFocusedSection] = useState<'search' | 'chips' | 'grid' | 'cart' | 'none'>('search');
  const [focusedChipIndex, setFocusedChipIndex] = useState(-1);
  const [focusedProductIndex, setFocusedProductIndex] = useState(-1);
  const [focusedCartIndex, setFocusedCartIndex] = useState(-1);
  const [focusedPaymentMethodIdx, setFocusedPaymentMethodIdx] = useState(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [recentSoldIds, setRecentSoldIds] = useState<number[]>([]);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const searchCustomers = async (q: string) => {
    try {
      const res = await getLocalCustomers(user?.tenantId || null, q);
      setCustomersList(res);
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
      const customerData = await saveCustomerLocally(newCustomer, user?.tenantId || null);
      setCustomer(customerData);
      setCustomerModalOpen(false);
      setNewCustomer({ name: '', phone: '' });
      setIsCreatingCustomer(false);
      toast.success('Customer added successfully!');
    } catch (err: any) {
      toast.error('Failed to add customer');
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await getLocalProducts(user?.tenantId || null, user?.branchId || 1);
        setProducts(res);
        const recent = await getRecentSoldProductIds(user?.tenantId || null, 30);
        setRecentSoldIds(recent);
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
      if (e.key === 'F1 / Ctrl+H') {
        e.preventDefault();
        setIsHelpModalOpen(true);
      } else if (e.key === 'F3 / Ctrl+K') {
        e.preventDefault();
        setFocusedSection('search');
        searchRef.current?.focus();
      } else if (e.key === 'F4 / Ctrl+C') {
        e.preventDefault();
        setFocusedSection('chips');
        setFocusedChipIndex(prev => prev === -1 ? 0 : prev);
        searchRef.current?.blur();
      } else if (e.key === 'F6 / Ctrl+P') {
        e.preventDefault();
        setFocusedSection('grid');
        setFocusedProductIndex(prev => prev === -1 ? 0 : prev);
        searchRef.current?.blur();
      } else if (e.key === "Enter" && paymentModal.open) {
        e.preventDefault();
        checkout();
      } else if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        if (!paymentModal.open && cart.length > 0) {
          setPaymentModal({ open: true, method: 'CASH', cashAmount: '' });
        }
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        toast.success("Cash Drawer Opened");
      } else if (e.key === 'F7' || (e.ctrlKey && e.key.toLowerCase() === 'l')) {
        e.preventDefault();
        setFocusedSection('cart');
        const userPlan = user?.tenant?.plan?.toUpperCase() || 'STARTUP';
        setFocusedCartIndex(userPlan === 'STARTUP' ? 0 : -1);
        searchRef.current?.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsHelpModalOpen(false);
        setCustomerModalOpen(false);
        setPaymentModal(prev => ({ ...prev, open: false }));
        setIsDiscountModalOpen(false);
        setFocusedSection('none');
      }
    };
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, [cart.length, paymentModal.open]);

  const staticFilters = ['Recent', 'All', 'In Stock', 'Low Stock', 'Out of Stock', 'Favorites', 'Top Selling', 'Discounts'];
  const dynamicCategories = Array.from(new Set(products.map((p) => p.category?.name).filter(Boolean)));
  const allChips = [...staticFilters, ...dynamicCategories];

  const filteredProducts = products.filter((p) => {
    const s = search.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(s) || 
                          p.barcode?.toLowerCase().includes(s) ||
                          p.sku?.toLowerCase().includes(s) ||
                          p.aliases?.toLowerCase().includes(s) ||
                          p.category?.name?.toLowerCase().includes(s);
    let matchesChip = false;

    if (selectedCategory === 'All') matchesChip = true;
    else if (selectedCategory === 'Recent') matchesChip = recentSoldIds.includes(p.id);
    else if (selectedCategory === 'In Stock') matchesChip = p.stockQuantity > 0;
    else if (selectedCategory === 'Low Stock') matchesChip = p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockLevel || 5);
    else if (selectedCategory === 'Out of Stock') matchesChip = p.stockQuantity <= 0;
    else if (selectedCategory === 'Favorites') matchesChip = p.isFavorite === 1;
    else if (selectedCategory === 'Top Selling') matchesChip = true;
    else if (selectedCategory === 'Discounts') matchesChip = p.discount > 0;
    else matchesChip = p.category?.name === selectedCategory;

    return matchesSearch && matchesChip;
  });

  const finalProducts =
    selectedCategory === 'Recent' && !search
      ? filteredProducts.filter((p) => recentSoldIds.includes(p.id))
      : filteredProducts;

  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (paymentModal.open) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setFocusedPaymentMethodIdx((prev) => {
            const next = (prev + 1) % 3;
            const methods: PaymentMethod[] = ["CASH", "CARD", "PAYHERE_QR"];
            const selected = methods[next];
            setPaymentModal((pm) => ({ ...pm, method: selected }));
            if (selected === "CASH") setTimeout(() => cashInputRef.current?.focus(), 50);
            else cashInputRef.current?.blur();
            return next;
          });
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setFocusedPaymentMethodIdx((prev) => {
            const next = (prev - 1 + 3) % 3;
            const methods: PaymentMethod[] = ["CASH", "CARD", "PAYHERE_QR"];
            const selected = methods[next];
            setPaymentModal((pm) => ({ ...pm, method: selected }));
            if (selected === "CASH") setTimeout(() => cashInputRef.current?.focus(), 50);
            else cashInputRef.current?.blur();
            return next;
          });
        }
        return;
      }

      if (customerModalOpen || isHelpModalOpen) return;

      if (focusedSection === "search") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedSection("chips");
          setFocusedChipIndex(prev => prev === -1 ? 0 : prev);
          searchRef.current?.blur();
        }
      } else if (focusedSection === 'chips') {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedSection("search");
          searchRef.current?.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedSection("grid");
          setFocusedProductIndex(prev => prev === -1 ? 0 : prev);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setFocusedChipIndex(prev => Math.min(prev + 1, allChips.length - 1));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setFocusedChipIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && focusedChipIndex >= 0 && focusedChipIndex < allChips.length) {
          e.preventDefault();
          setSelectedCategory(allChips[focusedChipIndex]);
        }
      } else if (focusedSection === 'grid') {
        const getCols = () => {
          if (viewMode === "list") return 1;
          const container = document.getElementById("product-grid");
          if (!container || container.children.length === 0) return 1;
          const first = container.children[0] as HTMLElement;
          let c = 1;
          for (let i = 1; i < container.children.length; i++) {
            const child = container.children[i] as HTMLElement;
            if (child.offsetTop > first.offsetTop + 10) break;
            c++;
          }
          return c;
        };
        const cols = getCols();

        if (e.key === 'ArrowRight') {
          if (cols > 1) {
            e.preventDefault();
            setFocusedProductIndex(prev => Math.min(prev + 1, finalProducts.length - 1));
          }
        } else if (e.key === 'ArrowLeft') {
          if (cols > 1) {
            e.preventDefault();
            setFocusedProductIndex(prev => Math.max(prev - 1, 0));
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedProductIndex(prev => Math.min(prev + cols, finalProducts.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (focusedProductIndex < cols) {
            setFocusedSection("chips");
            setFocusedChipIndex(prev => prev === -1 ? 0 : prev);
          } else {
            setFocusedProductIndex(prev => Math.max(prev - cols, 0));
          }
        } else if (
          e.key === 'Enter' &&
          focusedProductIndex >= 0 &&
          focusedProductIndex < finalProducts.length
        ) {
          e.preventDefault();
          const p = finalProducts[focusedProductIndex];
          if (p.stockQuantity > 0) addToCart(p);
        }
      } else if (focusedSection === "cart") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedCartIndex((prev) => {
            if (prev === cart.length || prev === cart.length + 1) return cart.length + 2;
            return Math.min(prev + 1, cart.length + 2);
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedCartIndex((prev) => {
            if (prev === cart.length + 2) return cart.length;
            return Math.max(prev - 1, -1);
          });
        } else if (e.key === "ArrowLeft") {
          if (focusedCartIndex >= 0 && focusedCartIndex < cart.length) {
            e.preventDefault();
            const item = cart[focusedCartIndex];
            updateQty(item.productId, item.quantity - 1);
          } else if (focusedCartIndex === cart.length + 1) {
            e.preventDefault();
            setFocusedCartIndex(cart.length);
          }
        } else if (e.key === "ArrowRight") {
          if (focusedCartIndex >= 0 && focusedCartIndex < cart.length) {
            e.preventDefault();
            const item = cart[focusedCartIndex];
            updateQty(item.productId, item.quantity + 1);
          } else if (focusedCartIndex === cart.length) {
            e.preventDefault();
            setFocusedCartIndex(cart.length + 1);
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (focusedCartIndex === -1) {
            setCustomerModalOpen(true);
          } else if (focusedCartIndex === cart.length) {
            setDiscountInputValue(discount > 0 ? discount.toString() : "");
            setDiscountFocusedBtn("ok");
            setIsDiscountModalOpen(true);
          } else if (focusedCartIndex === cart.length + 1) {
            setCart([]);
            setDiscount(0);
            setFocusedCartIndex(-1);
          } else if (focusedCartIndex === cart.length + 2) {
            if (cart.length > 0) {
              setPaymentModal({ open: true, method: "CASH", cashAmount: "" });
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [
    focusedSection,
    focusedChipIndex,
    focusedProductIndex,
    focusedCartIndex,
    cart,
    discount,
    paymentModal.open, customerModalOpen, isHelpModalOpen, allChips, finalProducts, focusedPaymentMethodIdx, viewMode]);

  // Auto-scroll for chips
  useEffect(() => {
    if (focusedSection === "chips" && focusedChipIndex !== -1) {
      const el = document.getElementById(`chip-${focusedChipIndex}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [focusedChipIndex, focusedSection]);

  // Auto-scroll for grid
  useEffect(() => {
    if (focusedSection === 'grid' && focusedProductIndex !== -1) {
      const el = document.getElementById(`product-${focusedProductIndex}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedProductIndex, focusedSection]);

  // Auto-scroll for cart
  useEffect(() => {
    if (focusedSection === "cart" && focusedCartIndex >= 0 && focusedCartIndex < cart.length) {
      const el = document.getElementById(`cart-item-${focusedCartIndex}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [focusedCartIndex, focusedSection, cart.length]);

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
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedSection("chips");
      setFocusedChipIndex(prev => prev === -1 ? 0 : prev);
      searchRef.current?.blur();
    } else if (e.key === "ArrowRight") {
      if (searchRef.current?.selectionStart === searchRef.current?.value.length) {
        e.preventDefault();
        document.getElementById("help-btn")?.focus();
      }
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
      toast.success('Payment completed successfully!');
      setSaleComplete(true);
      setCart([]);
      setDiscount(0);
      setCustomer(null);
      const recent = await getRecentSoldProductIds(user?.tenantId || null, 30);
      setRecentSoldIds(recent);
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
    <div className="flex-1 flex overflow-hidden min-h-0 bg-[#f7f7f7] dark:bg-[#0b1120]">
      {/* ──────────────────────── LEFT PANEL: PRODUCTS ──────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
        
        {/* Top Header: Search & Ribbon */}
        <div className="p-4 lg:p-6 pb-0 space-y-4">
          <div className="relative group flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setFocusedSection('search')}
                placeholder="Scan barcode or search products..."
                className="w-full h-14 pl-12 pr-28 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white transition-all placeholder:text-gray-400"
              />
              <span className="absolute right-14 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-500 opacity-60 cursor-help" title="Press F3 / Ctrl+K to focus Search">
                F3 / Ctrl+K
              </span>
              <button
                id="help-btn"
                onClick={() => {
                  if (search) setSearch("");
                  else setIsHelpModalOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    searchRef.current?.focus();
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (search) setSearch("");
                    else setIsHelpModalOpen(true);
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {search ? (
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600" />
                ) : (
                  <span className="text-sm font-black text-gray-500 dark:text-gray-400 group-hover:text-blue-600">!</span>
                )}
              </button>
            </div>
            <button
              onClick={() => toast.success("Cash Drawer Opened")}
              className="h-14 w-14 rounded-2xl flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0 transition-colors"
              title="Open Cash Drawer (Ctrl+O)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="10" y1="15" x2="14" y2="15"/></svg>
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0 relative">
              <div className="flex overflow-x-auto no-scrollbar gap-2 flex-1 py-1 px-2">
                {allChips.map((cat, idx) => {
                  const isActive = selectedCategory === cat;
                  const isFocused = focusedSection === 'chips' && focusedChipIndex === idx;
                  const { icon: CatIcon, bg } = getCategoryDetails(cat);
                  return (
                    <button
                      id={`chip-${idx}`}
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setFocusedSection('chips'); setFocusedChipIndex(idx); }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-100' 
                          : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/80 scale-95 hover:scale-100'
                      } ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                    >
                      {cat === 'All' ? <Grid className="w-4 h-4" /> : <CatIcon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
          </div>
        </div>

        {/* Product Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {viewMode === 'grid' ? (
            <div id="product-grid" className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
              {finalProducts.map((p, idx) => {
                const { icon: CatIcon, color, bg } = getCategoryDetails(p.category?.name || '');
                const isOutOfStock = p.stockQuantity <= 0;
                const isFocused = focusedSection === 'grid' && focusedProductIndex === idx;
                return (
                  <motion.div
                    id={`product-${idx}`}
                    layoutId={`product-grid-${p.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={p.id}
                    onClick={() => {
                      if (!isOutOfStock) addToCart(p);
                      setFocusedSection('grid');
                      setFocusedProductIndex(idx);
                    }}
                    className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-300 cursor-pointer ${isOutOfStock ? 'pointer-events-none' : 'hover:-translate-y-1 hover:shadow-xl'} ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 shadow-xl scale-[1.02]' : ''}`}
                  >
                    <div className={`h-32 w-full bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden`}>
                      {p.images && p.images.length > 0 ? (
                        <img src={typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <CatIcon className="w-12 h-12 text-white/50 mix-blend-overlay group-hover:scale-110 transition-transform duration-500" />
                      )}
                      
                      {/* Stock Badge Overlay */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                        {isOutOfStock ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100/90 dark:bg-red-900/90 text-red-700 dark:text-red-300 shadow-sm uppercase tracking-wider backdrop-blur-sm">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100/90 dark:bg-green-900/90 text-green-700 dark:text-green-300 shadow-sm uppercase tracking-wider backdrop-blur-sm">
                            {p.stockQuantity} in stock
                          </span>
                        )}
                      </div>
                      
                      {/* Price Overlay */}
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end z-10">
                        <span className="text-white font-black text-sm tracking-tight bg-black/40 dark:bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                          {formatLKR(p.price)}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex flex-col mt-1">
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold truncate">
                          {p.barcode || "NO BARCODE"}
                        </p>
                        {p.category?.name && (
                          <p className="text-[10px] text-blue-500/80 uppercase tracking-wider font-semibold truncate mt-0.5">
                            {p.category.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Hover Overlay Add Button */}
                    <div className="absolute inset-x-0 top-0 h-32 bg-blue-600/10 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div id="product-grid" className="flex flex-col gap-3">
              {finalProducts.map((p, idx) => {
                const { icon: CatIcon, color, bg } = getCategoryDetails(p.category?.name || '');
                const isOutOfStock = p.stockQuantity <= 0;
                const isExpanded = expandedItemId === p.id;
                const isFocused = focusedSection === 'grid' && focusedProductIndex === idx;

                return (
                  <motion.div
                    id={`product-${idx}`}
                    layoutId={`product-list-${p.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={p.id}
                    className={`flex flex-col bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-blue-200 dark:hover:border-blue-800 transition-colors ${isOutOfStock ? 'pointer-events-none' : ''} ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md' : ''}`}
                  >
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => { if (!isOutOfStock) addToCart(p); setFocusedSection('grid'); setFocusedProductIndex(idx); }}>
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex flex-shrink-0 items-center justify-center cursor-pointer overflow-hidden`}>
                          {p.images && p.images.length > 0 ? (
                            <img src={typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <CatIcon className="w-6 h-6 text-white mix-blend-overlay" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold truncate">
                              {p.barcode || "NO BARCODE"}
                            </p>
                            {p.brand && (
                              <>
                                <span className="text-gray-300 dark:text-slate-600 text-[10px]">•</span>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold truncate">
                                  {p.brand}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-1.5 ml-2">
                          <span className="text-blue-600 dark:text-blue-400 font-black text-sm whitespace-nowrap leading-none">
                            {formatLKR(p.price)}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap leading-none ${isOutOfStock ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-green-100 text-green-600 dark:bg-green-900/30"}`}
                          >
                            {p.stockQuantity} IN STOCK
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <button
                          disabled={isOutOfStock}
                          onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                          className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedItemId(isExpanded ? null : p.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors bg-gray-50 dark:bg-slate-800/50 rounded-lg"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 overflow-hidden"
                        >
                          <div className="p-4 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400 dark:text-slate-500 text-xs font-semibold block mb-1">
                                SKU
                              </span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {p.sku || "N/A"}
                              </p>
                            </div>
                            <div className="text-center">
                              <span className="text-gray-400 dark:text-slate-500 text-xs font-semibold block mb-1">
                                Category
                              </span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {p.category?.parent?.name || p.category?.name || "Uncategorized"}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-400 dark:text-slate-500 text-xs font-semibold block mb-1">
                                Subcategory
                              </span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {p.category?.parent ? p.category.name : "N/A"}
                              </p>
                            </div>
                            {p.aliases && (
                              <div className="col-span-3">
                                <span className="text-gray-400 dark:text-slate-500 text-xs font-semibold block mb-1">
                                  Aliases
                                </span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {p.aliases}
                                </p>
                              </div>
                            )}
                            {(p.brand || p.color || p.size) && (
                              <div className="col-span-3 flex gap-4">
                                {p.brand && <div><span className="text-gray-400 dark:text-slate-500 text-xs block">Brand</span>{p.brand}</div>}
                                {p.color && <div><span className="text-gray-400 dark:text-slate-500 text-xs block">Color</span>{p.color}</div>}
                                {p.size && <div><span className="text-gray-400 dark:text-slate-500 text-xs block">Size</span>{p.size}</div>}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {finalProducts.length === 0 && (
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
              <button
                onClick={() => setCustomerModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${customer ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'} ${focusedSection === "cart" && focusedCartIndex === -1 ? "ring-2 ring-blue-500" : ""}`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{customer ? customer.name : 'Walk-in'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3 relative">
          <AnimatePresence initial={false}>
            {cart.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={item.productId}
                id={`cart-item-${index}`}
                className={`group flex flex-col p-3 border rounded-xl shadow-sm hover:border-blue-200 transition-colors ${focusedSection === "cart" && focusedCartIndex === index ? "bg-blue-50 dark:bg-slate-800 border-blue-400 ring-2 ring-blue-400" : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"}`}
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
          <div className="flex gap-2 w-full pt-2">
            <button
              onClick={() => {
                setDiscountInputValue(discount > 0 ? discount.toString() : "");
                setDiscountFocusedBtn("ok");
                setIsDiscountModalOpen(true);
              }}
              disabled={cart.length === 0}
              id="cart-discount-btn"
              className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${focusedSection === "cart" && focusedCartIndex === cart.length ? "bg-blue-100 dark:bg-slate-700 ring-2 ring-blue-500 text-blue-700 dark:text-blue-300" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"}`}
            >
              <Tag className="w-3.5 h-3.5" /> Discount
            </button>
            <button
              onClick={() => {
                setCart([]);
                setDiscount(0);
              }}
              disabled={cart.length === 0}
              id="cart-clear-btn"
              className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${focusedSection === "cart" && focusedCartIndex === cart.length + 1 ? "bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500 text-red-700 dark:text-red-400" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"}`}
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
            id="cart-pay-btn"
            onClick={() => {
              setPaymentModal({ open: true, method: 'CASH', cashAmount: '' });
            }}
            className={`w-full relative group overflow-hidden bg-blue-600 text-white font-black text-lg py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3 ${focusedSection === "cart" && focusedCartIndex === cart.length + 2 ? "ring-4 ring-blue-300 dark:ring-blue-700" : ""}`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex flex-col items-center justify-center">
              <span className="flex items-center justify-center gap-2 font-bold">
                <CreditCard className="w-5 h-5" />
                PAY NOW
              </span>
              <span className="text-[10px] font-medium opacity-60 mt-0.5 tracking-wider">Ctrl + Enter</span>
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
              className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex"
            >
              {/* Modal Left: Order Summary */}
              <div className="w-2/5 bg-gray-50 dark:bg-slate-800/50 p-8 border-r border-gray-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex-1 min-h-0 flex flex-col mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                      Payment Summary
                    </h3>
                  </div>
                  
                  {/* Bill Preview Wrapper */}
                  <div className="flex-1 overflow-y-auto no-scrollbar rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900 p-2 relative">
                    <div className="w-full max-w-[302px] mx-auto bg-white shadow-sm p-4 pb-8 flex flex-col relative" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                      {/* Top Zig Zag or Gradient to simulate thermal paper roll top */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-b from-gray-200 to-transparent opacity-50"></div>
                      
                      <div className="text-center text-black mb-4">
                        <h2 className="font-bold text-lg mb-1">{user?.tenant?.name || 'cMart POS'}</h2>
                      </div>

                      <div className="border-b border-dashed border-gray-300 pb-2 mb-2 flex justify-between text-[10px] text-black">
                        <span>{new Date().toLocaleDateString()}</span>
                        <span>{new Date().toLocaleTimeString()}</span>
                      </div>

                      <table className="w-full mb-3 text-[11px] text-black">
                        <thead>
                          <tr className="border-b border-dashed border-gray-300">
                            <th className="text-left font-bold pb-1">Item</th>
                            <th className="text-right font-bold pb-1">Qty</th>
                            <th className="text-right font-bold pb-1">Amt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-1 truncate max-w-[120px]">{item.productName}</td>
                              <td className="text-right py-1">{item.quantity}</td>
                              <td className="text-right py-1">{item.price * item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="border-t border-dashed border-gray-300 pt-2 flex flex-col gap-1 text-[11px] text-black">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatLKR(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between">
                            <span>Discount</span>
                            <span>-{formatLKR(discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-sm mt-1">
                          <span>TOTAL</span>
                          <span>{formatLKR(total)}</span>
                        </div>
                        {saleComplete && paymentModal.cashAmount && paymentModal.method === 'CASH' && (
                          <>
                            <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-gray-300">
                              <span>CASH</span>
                              <span>{formatLKR(parseFloat(paymentModal.cashAmount))}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>CHANGE</span>
                              <span>{formatLKR(change)}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="border-t border-dashed border-gray-300 mt-4 pt-3 text-[10px] text-black">
                        <div className="flex justify-between mb-1">
                          <span>Customer:</span>
                          <span className="font-bold">{customer ? customer.name : 'Walk-in Customer'}</span>
                        </div>
                        <div className="flex justify-between mb-3">
                          <span>Cashier:</span>
                          <span className="font-bold">{user?.name || 'Admin'}</span>
                        </div>
                        <div className="text-center space-y-1 text-gray-600">
                          <p>Tel: {user?.tenant?.phone || '011-2345678'}</p>
                          <p>Email: {user?.tenant?.email || 'contact@store.com'}</p>
                          <p className="mt-2 text-[9px] italic">Returns/Refunds accepted within 7 days with original receipt.</p>
                          <p className="font-bold mt-2">Thank you for shopping with us!</p>
                        </div>
                      </div>
                    </div>
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
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="h-64 flex flex-col items-center justify-center text-center focus:outline-none"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
                        e.preventDefault();
                        printReceipt();
                      }
                    }}
                  >
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                      <CreditCard className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
                    <p className="text-gray-500 dark:text-slate-400 mb-8">Change due: <span className="font-bold text-gray-900 dark:text-white">{formatLKR(change)}</span></p>
                    <div className="flex gap-4">
                      <button onClick={printReceipt} className="flex flex-col items-center justify-center px-6 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-2">
                          <Printer className="w-5 h-5" />
                          <span>Print Receipt</span>
                        </div>
                        <span className="text-[10px] font-medium opacity-60 tracking-wider mt-1">Ctrl + P</span>
                      </button>
                      <button autoFocus onClick={resetPOS} className="flex flex-col items-center justify-center px-8 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-colors">
                        <span>Start New Sale</span>
                        <span className="text-[10px] font-medium opacity-80 tracking-wider text-blue-200 mt-1">Enter</span>
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
                      ].map((method, idx) => {
                        const Icon = method.icon;
                        const isSelected = paymentModal.method === method.id;
                        const isFocused = focusedPaymentMethodIdx === idx;
                        return (
                           <button
                            key={method.id}
                            onClick={() => {
                              setPaymentModal(prev => ({ ...prev, method: method.id as PaymentMethod }));
                              setFocusedPaymentMethodIdx(idx);
                            }}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all relative ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:hover:border-slate-700'
                            } ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md' : ''}`}
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
                          ref={cashInputRef}
                          type="number"
                          autoFocus
                          value={paymentModal.cashAmount}
                          onChange={(e) => setPaymentModal(prev => ({ ...prev, cashAmount: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                               e.preventDefault();
                               if (parseFloat(paymentModal.cashAmount || '0') >= total) {
                                 checkout();
                               }
                            } else if (e.key === 'ArrowDown') {
                               e.preventDefault();
                               const shortcut = document.getElementById('cash-shortcut-0');
                               if (shortcut) shortcut.focus();
                               else document.getElementById('confirm-payment-btn')?.focus();
                            }
                          }}
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
                            .map((amt, idx) => (
                              <button
                                key={amt}
                                id={`cash-shortcut-${idx}`}
                                onClick={() => setPaymentModal(prev => ({ ...prev, cashAmount: amt.toString() }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'ArrowRight') {
                                    e.preventDefault();
                                    document.getElementById(`cash-shortcut-${idx + 1}`)?.focus();
                                  } else if (e.key === 'ArrowLeft') {
                                    e.preventDefault();
                                    document.getElementById(`cash-shortcut-${idx - 1}`)?.focus();
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    cashInputRef.current?.focus();
                                  } else if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    document.getElementById('confirm-payment-btn')?.focus();
                                  } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    setPaymentModal(prev => ({ ...prev, cashAmount: amt.toString() }));
                                    setTimeout(() => document.getElementById('confirm-payment-btn')?.focus(), 50);
                                  }
                                }}
                                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 focus:bg-blue-100 focus:text-blue-700 dark:focus:bg-blue-900/40 dark:focus:text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                              >
                                {formatLKR(amt)}
                              </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      id="confirm-payment-btn"
                      onClick={checkout}
                      disabled={paymentModal.method === 'CASH' && (!paymentModal.cashAmount || parseFloat(paymentModal.cashAmount) < total)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!(paymentModal.method === "CASH" && (!paymentModal.cashAmount || parseFloat(paymentModal.cashAmount) < total))) {
                            checkout();
                          }
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          const shortcut = document.getElementById('cash-shortcut-0');
                          if (shortcut) shortcut.focus();
                          else cashInputRef.current?.focus();
                        }
                      }}
                      className="w-full bg-blue-600 text-white font-black text-lg py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 focus:outline-none transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      Confirm Payment
                      <span className="block text-[10px] font-bold text-blue-200 mt-1 uppercase tracking-widest">
                        Enter
                      </span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsHelpModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-blue-50 dark:bg-slate-800/50">
                <h2 className="text-xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  Keyboard Shortcuts
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-500 opacity-60 ml-2 mt-1 hidden sm:inline-block">F1 / Ctrl+H</span>
                </h2>
                <button onClick={() => setIsHelpModalOpen(false)} className="p-2 bg-blue-100 dark:bg-slate-800 rounded-full text-blue-500 hover:text-blue-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
                {[
                  { key: 'F3 / Ctrl+K', desc: 'Focus Search Bar' },
                  { key: "F4 / Ctrl+C", desc: "Focus Categories (Use Arrows & Enter)" },
                  { key: "F6 / Ctrl+P", desc: "Focus Product Grid (Use Arrows & Enter)" },
                  { key: "F7 / Ctrl+L", desc: "Focus Cart (Use Arrows & Enter)" },
                  { key: "Ctrl + Enter", desc: "Pay Now / Checkout" },
                  { key: "Ctrl + O", desc: "Open Cash Drawer" },
                  { key: "Enter", desc: "Confirm Payment (in payment popup)" },
                  { key: 'ESC', desc: 'Close Modals / Unfocus' },
                ].map(hk => (
                  <div key={hk.key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">{hk.desc}</span>
                    <span className="px-3 py-1 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600 text-sm font-black text-gray-900 dark:text-white">{hk.key}</span>
                  </div>
                ))}
              </div>
              <div className="p-6 pt-2">
                <button onClick={() => setIsHelpModalOpen(false)} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-colors">
                  Got It!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discount Modal */}
      <AnimatePresence>
        {isDiscountModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsDiscountModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Apply Discount</h2>
                <button
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Discount Amount (Rs)</label>
                <input
                  type="number"
                  autoFocus
                  value={discountInputValue}
                  onChange={(e) => setDiscountInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = Number(discountInputValue);
                      if (!isNaN(val) && val >= 0) {
                        setDiscountType("fixed");
                        setDiscount(val);
                        setIsDiscountModalOpen(false);
                      }
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setIsDiscountModalOpen(false);
                    } else if (e.key === "ArrowRight") {
                      e.preventDefault();
                      setDiscountFocusedBtn("cancel");
                    } else if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      setDiscountFocusedBtn("ok");
                    }
                  }}
                  className="w-full text-2xl font-black p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setIsDiscountModalOpen(false)}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                    discountFocusedBtn === "cancel"
                      ? "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white ring-2 ring-gray-400"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const val = Number(discountInputValue);
                    if (!isNaN(val) && val >= 0) {
                      setDiscountType("fixed");
                      setDiscount(val);
                      setIsDiscountModalOpen(false);
                    }
                  }}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                    discountFocusedBtn === "ok"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discount Modal */}
      <AnimatePresence>
        {isDiscountModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsDiscountModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Apply Discount</h2>
                <button
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Discount Amount (Rs)</label>
                <input
                  type="number"
                  autoFocus
                  value={discountInputValue}
                  onChange={(e) => setDiscountInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = Number(discountInputValue);
                      if (!isNaN(val) && val >= 0) {
                        setDiscountType("fixed");
                        setDiscount(val);
                        setIsDiscountModalOpen(false);
                      }
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setIsDiscountModalOpen(false);
                    } else if (e.key === "ArrowRight") {
                      e.preventDefault();
                      setDiscountFocusedBtn("cancel");
                    } else if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      setDiscountFocusedBtn("ok");
                    }
                  }}
                  className="w-full text-2xl font-black p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setIsDiscountModalOpen(false)}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                    discountFocusedBtn === "cancel"
                      ? "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white ring-2 ring-gray-400"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const val = Number(discountInputValue);
                    if (!isNaN(val) && val >= 0) {
                      setDiscountType("fixed");
                      setDiscount(val);
                      setIsDiscountModalOpen(false);
                    }
                  }}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                    discountFocusedBtn === "ok"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}




