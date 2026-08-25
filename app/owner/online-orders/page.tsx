'use client';

import { useState, useMemo, useEffect } from 'react';
import { storeOwnerAPI } from '@/lib/api';
import { 
  Search, Filter, CheckCircle, Clock, XCircle, AlertTriangle, 
  Maximize, Minimize, List, LayoutGrid, X, Download, User as UserIcon, 
  Eye, FileText, Printer, ChevronDown, ShoppingBag, Globe, Truck, MapPin, CreditCard, CalendarDays, Edit, Package, Trash2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import PrintOrderModal from '@/components/PrintOrderModal';
import { toast } from 'sonner';

// Mock Data
const mockOnlineOrders = [
  { 
    id: 'ORD-ON-8001', 
    customerName: 'Sahan Dissanayake', 
    customerPhone: '071 234 5678',
    customerEmail: 'sahan@example.com',
    shippingAddress: '45, Kandy Road, Peradeniya',
    orderDate: '2026-08-01', 
    items: [
      { name: 'Wireless Mouse', qty: 2, price: 2500, total: 5000 },
      { name: 'Gaming Keyboard', qty: 1, price: 8500, total: 8500 }
    ],
    subtotal: 13500,
    deliveryFee: 450,
    totalAmount: 13950, 
    paymentMethod: 'Card', 
    paymentStatus: 'Paid',
    orderStatus: 'Processing' 
  },
  { 
    id: 'ORD-ON-8002', 
    customerName: 'Nipuni Fernando', 
    customerPhone: '077 987 6543',
    customerEmail: 'nipuni@example.com',
    shippingAddress: '12/A, Galle Road, Colombo 03',
    orderDate: '2026-08-01', 
    items: [
      { name: 'Bluetooth Headphones', qty: 1, price: 12000, total: 12000 }
    ],
    subtotal: 12000,
    deliveryFee: 300,
    totalAmount: 12300, 
    paymentMethod: 'COD', 
    paymentStatus: 'Pending',
    orderStatus: 'Pending' 
  },
  { 
    id: 'ORD-ON-8003', 
    customerName: 'Kasun Kalhara', 
    customerPhone: '070 111 2222',
    customerEmail: 'kasun@example.com',
    shippingAddress: '23, Temple Lane, Malabe',
    orderDate: '2026-07-30', 
    items: [
      { name: 'USB-C Cable', qty: 3, price: 1200, total: 3600 },
      { name: 'Power Bank 10000mAh', qty: 1, price: 6500, total: 6500 }
    ],
    subtotal: 10100,
    deliveryFee: 400,
    totalAmount: 10500, 
    paymentMethod: 'Bank Transfer', 
    paymentStatus: 'Paid',
    orderStatus: 'Shipped' 
  },
  { 
    id: 'ORD-ON-8004', 
    customerName: 'Ayesha Silva', 
    customerPhone: '076 555 4444',
    customerEmail: 'ayesha@example.com',
    shippingAddress: '88, New Town, Kurunegala',
    orderDate: '2026-07-28', 
    items: [
      { name: 'Smart Watch', qty: 1, price: 15000, total: 15000 }
    ],
    subtotal: 15000,
    deliveryFee: 500,
    totalAmount: 15500, 
    paymentMethod: 'COD', 
    paymentStatus: 'Paid',
    orderStatus: 'Delivered' 
  },
  { 
    id: 'ORD-ON-8005', 
    customerName: 'Tharindu Peiris', 
    customerPhone: '071 888 9999',
    customerEmail: 'tharindu@example.com',
    shippingAddress: '15/2, Beach Road, Negombo',
    orderDate: '2026-07-25', 
    items: [
      { name: 'Laptop Stand', qty: 1, price: 4500, total: 4500 }
    ],
    subtotal: 4500,
    deliveryFee: 350,
    totalAmount: 4850, 
    paymentMethod: 'Card', 
    paymentStatus: 'Paid',
    orderStatus: 'Cancelled' 
  },
];

const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Returned', 'Cancelled'];
const PAYMENT_STATUSES = ['All', 'Paid', 'Pending', 'Refunded'];

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Filter Panel State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Order Details Panel State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editStatusData, setEditStatusData] = useState({
    orderStatus: '',
    paymentStatus: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingInline, setUpdatingInline] = useState<{ id: string, field: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoadingData(true);
      const res: any = await storeOwnerAPI.getOnlineOrders();
      const data = res.data || res;
      // Map database format to UI format
      const formatted = data.map((o: any) => ({
        realId: o.id,
        id: o.orderNumber || `ORD-ON-${o.id}`,
        customerName: o.customerName || 'Guest',
        customerPhone: o.customerPhone || 'N/A',
        customerEmail: o.customerEmail || 'N/A',
        shippingAddress: o.shippingAddress || 'N/A',
        orderDate: new Date(o.createdAt).toLocaleDateString(),
        orderTime: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNewCustomer: o.user ? (o.user._count?.onlineOrders <= 1) : true,
        items: o.items.map((i: any) => ({
          name: i.productName,
          qty: i.quantity,
          price: i.price,
          total: i.subtotal,
        })),
        subtotal: o.subtotal,
        deliveryFee: o.shipping || 0,
        totalAmount: o.total,
        paymentMethod: o.paymentMethod === 'CASH' ? 'COD' : 'Card',
        paymentStatus: o.paymentStatus === 'COMPLETED' ? 'Paid' : 
                       o.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Pending',
        orderStatus: o.status.charAt(0).toUpperCase() + o.status.slice(1).toLowerCase()
      }));
      setOrders(formatted);
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch online orders');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchOrdersSilent = async () => {
    try {
      const res: any = await storeOwnerAPI.getOnlineOrders();
      const data = res.data || res;
      const formatted = data.map((o: any) => ({
        realId: o.id,
        id: o.orderNumber || `ORD-ON-${o.id}`,
        customerName: o.customerName || 'Guest',
        customerPhone: o.customerPhone || 'N/A',
        customerEmail: o.customerEmail || 'N/A',
        shippingAddress: o.shippingAddress || 'N/A',
        orderDate: new Date(o.createdAt).toLocaleDateString(),
        orderTime: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNewCustomer: o.user ? (o.user._count?.onlineOrders <= 1) : true,
        items: o.items.map((i: any) => ({
          name: i.productName,
          qty: i.quantity,
          price: i.price,
          total: i.subtotal,
        })),
        subtotal: o.subtotal,
        deliveryFee: o.shipping || 0,
        totalAmount: o.total,
        paymentMethod: o.paymentMethod === 'CASH' ? 'COD' : 'Card',
        paymentStatus: o.paymentStatus === 'COMPLETED' ? 'Paid' : 
                       o.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Pending',
        orderStatus: o.status.charAt(0).toUpperCase() + o.status.slice(1).toLowerCase()
      }));
      setOrders(formatted);
    } catch (e) {
      // fail silently for polling
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchOrdersSilent, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        const orderToCancel = orders.find(o => o.id === deleteConfirmId);
        if (orderToCancel?.realId) {
          await storeOwnerAPI.updateOnlineOrder(orderToCancel.realId, { status: 'CANCELLED' });
        }
        setOrders(orders.map(o => o.id === deleteConfirmId ? { ...o, orderStatus: 'Cancelled' } : o));
        toast.success('Order cancelled successfully');
      } catch (e) {
        toast.error('Failed to cancel order');
      } finally {
        setDeleteConfirmId(null);
      }
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setEditStatusData({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus
    });
    setIsDetailsPanelOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder?.realId) return;

    setIsUpdating(true);
    try {
      let finalPaymentStatus = editStatusData.paymentStatus;
      if (['Processing', 'Shipped', 'Delivered'].includes(editStatusData.orderStatus) && selectedOrder.paymentMethod === 'Card') {
        finalPaymentStatus = 'Paid';
      }
      if (editStatusData.orderStatus === 'Cancelled' && finalPaymentStatus === 'Paid') {
        finalPaymentStatus = 'Refunded';
      }
      const payloadPaymentStatus = finalPaymentStatus === 'Paid' ? 'COMPLETED' : 
                                   finalPaymentStatus === 'Refunded' ? 'REFUNDED' : 
                                   finalPaymentStatus.toUpperCase();

      await storeOwnerAPI.updateOnlineOrder(selectedOrder.realId, {
        status: editStatusData.orderStatus.toUpperCase(),
        paymentStatus: payloadPaymentStatus
      });
      
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, orderStatus: editStatusData.orderStatus, paymentStatus: finalPaymentStatus } : o));
      toast.success('Order status updated successfully');
      setIsDetailsPanelOpen(false);
      setSelectedOrder(null);
    } catch (e) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInlineStatusUpdate = async (orderId: string, type: 'orderStatus' | 'paymentStatus', newValue: string) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate?.realId) return;

    setUpdatingInline({ id: orderId, field: type });
    try {
      if (type === 'orderStatus') {
        const updates: any = { status: newValue.toUpperCase() };
        let newPaymentStatus = orderToUpdate.paymentStatus;
        
        if (['Processing', 'Shipped', 'Delivered'].includes(newValue) && orderToUpdate.paymentMethod === 'Card') {
          updates.paymentStatus = 'COMPLETED';
          newPaymentStatus = 'Paid';
        }
        
        if (newValue === 'Cancelled' && newPaymentStatus === 'Paid') {
          updates.paymentStatus = 'REFUNDED';
          newPaymentStatus = 'Refunded';
        }

        await storeOwnerAPI.updateOnlineOrder(orderToUpdate.realId, updates);
        setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: newValue, paymentStatus: newPaymentStatus } : o));
      } else if (type === 'paymentStatus') {
        const payloadStatus = newValue === 'Paid' ? 'COMPLETED' : newValue.toUpperCase();
        await storeOwnerAPI.updateOnlineOrder(orderToUpdate.realId, { paymentStatus: payloadStatus });
        setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newValue } : o));
      }
      toast.success(`${type === 'orderStatus' ? 'Order' : 'Payment'} status updated`);
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingInline(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = search.toLowerCase();
      const matchesSearch = o.customerName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
      const matchesPayment = paymentFilter === 'All' || o.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const kpis = useMemo(() => {
    return {
      totalOrders: orders.length,
      pending: orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length,
      revenue: orders.filter(o => o.paymentStatus === 'Paid' && o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0),
      cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
    };
  }, [orders]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden relative">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            Online Orders
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage e-commerce orders, update delivery status, and track online revenue.</p>
        </div>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard 
          title="Total Online Orders" 
          value={kpis.totalOrders} 
          icon={ShoppingBag} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Action Required (Pending)" 
          value={kpis.pending} 
          icon={Clock} 
          iconColorClass="text-amber-600" 
          iconBgClass="bg-amber-50 dark:bg-amber-500/10" 
        />
        <KpiCard 
          title="Online Revenue (Paid)" 
          value={`Rs. ${(kpis.revenue/1000).toFixed(1)}k`} 
          icon={CheckCircle} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Cancelled Orders" 
          value={kpis.cancelled} 
          icon={XCircle} 
          iconColorClass="text-red-600" 
          iconBgClass="bg-red-50 dark:bg-red-500/10" 
        />
      </div>

      {/* ──────────────── SEARCH BAR & FILTERS ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search orders (ID, Customer)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden flex-shrink-0 sm:ml-auto">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative"
            title="Filter"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {(statusFilter !== 'All' || paymentFilter !== 'All') && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          
          <button 
            onClick={() => setViewMode('list')}
            title="List View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <List className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button 
            onClick={() => setIsFullscreen(true)}
            title="Full Screen"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800`}
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ──────────────── DATA TABLE / GRID ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'fixed inset-y-0 right-0 left-[68px] z-[100] m-0 rounded-none border-none' : ''}`}>
        
        {isFullscreen && (
          <button 
            onClick={() => setIsFullscreen(false)} 
            className="absolute top-4 right-4 z-[110] p-3 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/80 transition-colors backdrop-blur-md shadow-lg"
          >
            <Minimize className="w-5 h-5" />
          </button>
        )}

        {viewMode === 'list' ? (
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[140px_1fr_120px_150px_150px_160px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Order ID</div>
                <div>Customer</div>
                <div>Date</div>
                <div className="text-right">Total Amount</div>
                <div className="text-center">Payment</div>
                <div className="text-center">Status</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                    <ShoppingBag className="w-12 h-12 opacity-20" />
                    <p className="font-medium text-lg text-slate-500">No online orders found.</p>
                  </div>
                ) : (
                  <>
                  {filteredOrders.map((order) => (
                    <div key={order.id} onClick={() => openOrderDetails(order)} className="cursor-pointer grid grid-cols-[140px_1fr_120px_150px_150px_160px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                        {order.id}
                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(order.id); toast.success('Order ID copied'); }} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0" title="Copy ID"><Copy className="w-3.5 h-3.5" /></button>
                      </div>

                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-slate-500">{order.isNewCustomer ? 'New' : 'Regular'}</span>
                          <div className="flex items-center gap-2 -mt-0.5">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{order.customerName}</h3>
                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(order.customerName); toast.success('Copied'); }} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0" title="Copy Name"><Copy className="w-3.5 h-3.5" /></button>
                          </div>
                          <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{order.items.length} items</p>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{order.orderDate}</span>
                        <span className="text-xs font-medium text-slate-500">{order.orderTime}</span>
                      </div>

                      <div className="text-base font-black text-blue-600 dark:text-blue-400 text-right">
                        Rs. {order.totalAmount.toLocaleString()}
                      </div>

                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{order.paymentMethod}</span>
                        {updatingInline?.id === order.id && updatingInline?.field === 'paymentStatus' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 animate-pulse">
                            <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            Updating...
                          </span>
                        ) : order.paymentMethod === 'COD' && order.paymentStatus === 'Pending' && order.orderStatus === 'Delivered' ? (
                          <div className="relative group/payment cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-500">
                            {order.paymentStatus} <ChevronDown className="w-3 h-3" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-24 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover/payment:opacity-100 group-hover/payment:visible transition-all z-50 overflow-hidden flex flex-col py-1">
                              <button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'paymentStatus', 'Paid'); }} className="px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">Paid</button>
                            </div>
                          </div>
                        ) : (
                          <span className={`text-[11px] font-medium ${
                            order.paymentStatus === 'Paid' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-center">
                        {updatingInline?.id === order.id && updatingInline?.field === 'orderStatus' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 animate-pulse">
                            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            Updating...
                          </span>
                        ) : ['Pending', 'Processing', 'Shipped'].includes(order.orderStatus) ? (
                          <div className={`relative group/status cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${

                            order.orderStatus === 'Shipped' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}>
                            {order.orderStatus} <ChevronDown className="w-3.5 h-3.5" />
                            <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-50 overflow-hidden flex flex-col py-1">
                              {order.orderStatus === 'Pending' && <><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Processing'); }} className="px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Processing</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Shipped'); }} className="px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Shipped</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Delivered'); }} className="px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Delivered</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Cancelled'); }} className="px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Cancelled</button></>}
                              {order.orderStatus === 'Processing' && <><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Shipped'); }} className="px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Shipped</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Delivered'); }} className="px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Delivered</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Cancelled'); }} className="px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Cancelled</button></>}
                              {order.orderStatus === 'Shipped' && <><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Delivered'); }} className="px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Delivered</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Cancelled'); }} className="px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Cancelled</button></>}
                            </div>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                            order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            order.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {order.orderStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <ShoppingBag className="w-12 h-12 opacity-20" />
                <p className="font-medium text-lg text-slate-500">No online orders found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} onClick={() => openOrderDetails(order)} className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col min-h-[260px]">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <UserIcon className="w-6 h-6" />
                      </div>

                      {updatingInline?.id === order.id && updatingInline?.field === 'orderStatus' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 animate-pulse">
                          <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </div>
                      ) : ['Pending', 'Processing', 'Shipped'].includes(order.orderStatus) ? (
                        <div className={`relative group/status cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          order.orderStatus === 'Shipped' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {order.orderStatus} <ChevronDown className="w-3 h-3" />
                          <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-50 overflow-hidden flex flex-col py-1">
                            {order.orderStatus === 'Pending' && <><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Processing'); }} className="px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">Processing</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Shipped'); }} className="px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">Shipped</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Delivered'); }} className="px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">Delivered</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Cancelled'); }} className="px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs">Cancelled</button></>}
                            {order.orderStatus === 'Processing' && <><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Shipped'); }} className="px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">Shipped</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Delivered'); }} className="px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">Delivered</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Cancelled'); }} className="px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs">Cancelled</button></>}
                            {order.orderStatus === 'Shipped' && <><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Delivered'); }} className="px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">Delivered</button><button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'orderStatus', 'Cancelled'); }} className="px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs">Cancelled</button></>}
                          </div>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          order.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {order.orderStatus}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col mb-4">
                      <div className="flex flex-col mb-1">
                        <span className="text-[10px] text-slate-500">{order.isNewCustomer ? 'New' : 'Regular'}</span>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight truncate">{order.customerName}</h3>
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(order.customerName); toast.success('Copied'); }} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0" title="Copy Name"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                          {order.id} &bull; {order.orderDate} {order.orderTime}
                        </p>
                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(order.id); toast.success('Order ID copied'); }} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0" title="Copy ID"><Copy className="w-3 h-3" /></button>
                      </div>
                      
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-medium">Items</span>
                          <span className="font-bold">{order.items.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-medium">Payment</span>
                          {updatingInline?.id === order.id && updatingInline?.field === 'paymentStatus' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 animate-pulse">
                              <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                              Updating...
                            </span>
                          ) : order.paymentMethod === 'COD' && order.paymentStatus === 'Pending' && order.orderStatus === 'Delivered' ? (
                            <div className="relative group/payment cursor-pointer flex items-center gap-1">
                              <span className="font-bold">{order.paymentMethod}</span>
                              <span className="text-amber-600 flex items-center gap-0.5">{order.paymentStatus} <ChevronDown className="w-3 h-3" /></span>
                              <div className="absolute top-full right-0 mt-1 w-20 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover/payment:opacity-100 group-hover/payment:visible transition-all z-50 overflow-hidden flex flex-col py-1">
                                <button onClick={(e) => { e.stopPropagation(); handleInlineStatusUpdate(order.id, 'paymentStatus', 'Paid'); }} className="px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">Paid</button>
                              </div>
                            </div>
                          ) : (
                            <span><span className="font-bold">{order.paymentMethod}</span> <span className={order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-slate-500'}>{order.paymentStatus}</span></span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-medium">Total</span>
                          <span className="font-black text-blue-600 dark:text-blue-400">Rs. {order.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openOrderDetails(order); }} className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">
                        Manage Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <FilterPanel 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="Filter Orders" 
        onClear={() => {
          setStatusFilter('All');
          setPaymentFilter('All');
          setIsFilterOpen(false);
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="font-sans space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Status</label>
            <CustomSelect options={ORDER_STATUSES.map(t => ({ label: t, value: t }))} value={statusFilter} onChange={setStatusFilter} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Status</label>
            <CustomSelect options={PAYMENT_STATUSES.map(t => ({ label: t, value: t }))} value={paymentFilter} onChange={setPaymentFilter} />
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── ORDER DETAILS SLIDE OUT PANEL ──────────────── */}
      <AnimatePresence>
        {isDetailsPanelOpen && selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDetailsPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Order Details
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{selectedOrder.id}</p>
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(selectedOrder.id); toast.success('Order ID copied'); }} className="text-slate-400 hover:text-blue-600 transition-colors" title="Copy ID"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <button onClick={() => setIsDetailsPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Customer Info Card */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-blue-500" /> Customer Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-500 font-medium">Name</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.customerName}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(selectedOrder.customerName); toast.success('Copied'); }} className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-500 font-medium">Phone</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.customerPhone}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(selectedOrder.customerPhone); toast.success('Copied'); }} className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-500 font-medium">Email</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.customerEmail}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(selectedOrder.customerEmail); toast.success('Copied'); }} className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 group">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Shipping Address</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(selectedOrder.shippingAddress); toast.success('Copied'); }} className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white leading-relaxed">{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" /> Ordered Items ({selectedOrder.items.length})
                  </h4>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.qty} x Rs. {item.price.toLocaleString()}</p>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">Rs. {item.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500" /> Payment Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Subtotal</span>
                      <span className="font-bold text-slate-900 dark:text-white">Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Delivery Fee</span>
                      <span className="font-bold text-slate-900 dark:text-white">Rs. {selectedOrder.deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                {/* Status Update Form */}
                <form id="updateStatusForm" onSubmit={handleUpdateStatus} className="space-y-5">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit className="w-4 h-4 text-blue-500" /> Update Order Status
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Status</label>
                      {!['Pending', 'Processing', 'Shipped'].includes(selectedOrder.orderStatus) ? (
                        <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed">
                          {selectedOrder.orderStatus}
                        </div>
                      ) : (
                        <select 
                          value={editStatusData.orderStatus}
                          onChange={e => setEditStatusData({...editStatusData, orderStatus: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                        >
                          {selectedOrder.orderStatus === 'Pending' && <><option value="Processing">Processing</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></>}
                          {selectedOrder.orderStatus === 'Processing' && <><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></>}
                          {selectedOrder.orderStatus === 'Shipped' && <><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></>}
                          {/* We still include the current status as an option if they don't change anything */}
                          <option value={selectedOrder.orderStatus} hidden>{selectedOrder.orderStatus}</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Status</label>
                      {!(selectedOrder.paymentMethod === 'COD' && selectedOrder.paymentStatus === 'Pending' && selectedOrder.orderStatus === 'Delivered') ? (
                        <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed">
                          {selectedOrder.paymentStatus}
                        </div>
                      ) : (
                        <select 
                          value={editStatusData.paymentStatus}
                          onChange={e => setEditStatusData({...editStatusData, paymentStatus: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>
                      )}
                    </div>
                  </div>
                </form>
                
              </div>

              {/* Panel Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto shrink-0 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5 text-slate-500" />
                  Print
                </button>
                <button 
                  type="submit" 
                  form="updateStatusForm"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PrintOrderModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        order={selectedOrder}
        storeName="Smart POS"
        storePhone="071 234 5678"
      />

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
        cancelText="Close"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
