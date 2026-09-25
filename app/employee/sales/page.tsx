'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Receipt, Search, Plus, Printer, Eye, ChevronDown, CheckCircle, XCircle, Clock, Banknote, ShoppingBag, LayoutGrid, List, Maximize, Minimize, X, Calendar, Filter, FileText, UserCircle, User, Package, CreditCard, DollarSign, Minus, ShoppingCart, Lock, Trash2, Tag, ChevronUp, QrCode, RotateCcw
} from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { processRefundLocally } from '@/lib/local-services';
import { useAuthStore } from '@/lib/auth-store';

export default function SalesPage() {
  const user = useAuthStore(state => state.user);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Sales Filters
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Side Panel state for viewing sale details
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Refund State
  const [isRefundPanelOpen, setIsRefundPanelOpen] = useState(false);
  const [refundSale, setRefundSale] = useState<any>(null);

  const handleProcessRefund = async (itemsToRefund: any[], totalRefundAmount: number) => {
    try {
      if (!refundSale) return;
      await processRefundLocally(refundSale.id, itemsToRefund, totalRefundAmount, user?.branchId || 1, user?.tenantId || null);
      toast.success('Refund processed successfully! Sync queued.');
      setIsRefundPanelOpen(false);
      setRefundSale(null);
      fetchSales();
    } catch (e: any) {
      toast.error('Refund failed: ' + e.message);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerAPI.getRecentSales();
      // Ensure we sort by date descending
      const sorted = (res.data?.data || res.data || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSales(sorted);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = 
        s.invoiceNo?.toLowerCase().includes(q) ||
        s.customer?.name?.toLowerCase().includes(q) ||
        s.customer?.phone?.toLowerCase().includes(q) ||
        s.user?.name?.toLowerCase().includes(q);
        
      let matchesPayment = true;
      if (paymentMethodFilter !== 'all') matchesPayment = s.paymentMethod === paymentMethodFilter.toUpperCase();
      
      let matchesStatus = true;
      if (statusFilter !== 'all') matchesStatus = s.paymentStatus === statusFilter.toUpperCase();

      let matchesChannel = true;
      if (channelFilter === 'pos') matchesChannel = s.channel === 'POS' || !s.channel;
      if (channelFilter === 'online') matchesChannel = s.channel === 'ONLINE';

      let matchesDate = true;
      const targetDate = new Date(s.createdAt);
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (targetDate < from) matchesDate = false;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (targetDate > to) matchesDate = false;
      }

      return matchesSearch && matchesPayment && matchesStatus && matchesChannel && matchesDate;
    });
  }, [sales, search, paymentMethodFilter, statusFilter, channelFilter, fromDate, toDate]);

  const kpis = useMemo(() => {
    const totalTransactions = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysSales = sales.filter(s => new Date(s.createdAt) >= today);
    const todaysRevenue = todaysSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
    
    return [
      { 
        title: 'Total Revenue', 
        value: `Rs. ${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
        icon: DollarSign, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50 dark:bg-emerald-500/10' 
      },
      { 
        title: 'Total Transactions', 
        value: totalTransactions.toString(), 
        icon: Receipt, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-500/10' 
      },
      { 
        title: "Today's Revenue", 
        value: `Rs. ${todaysRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
        icon: Clock, 
        color: 'text-violet-500', 
        bg: 'bg-violet-50 dark:bg-violet-500/10' 
      },
      { 
        title: 'Avg Order Value', 
        value: `Rs. ${avgOrderValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
        icon: Banknote, 
        color: 'text-orange-500', 
        bg: 'bg-orange-50 dark:bg-orange-500/10' 
      }
    ];
  }, [sales]);

  const openViewPanel = (sale: any) => {
    setSelectedSale(sale);
    setIsPanelOpen(true);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (val: any) => {
    return Number(val || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  };

  const handlePrintReceipt = (sale: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const customerName = sale.customer?.name || "Guest";
    const dateStr = formatDate(sale.createdAt) + " at " + formatTime(sale.createdAt);
    let itemsHtml = "";
    if (sale.items) {
      sale.items.forEach((item: any) => {
        itemsHtml += `
          <tr>
            <td style="padding: 5px 0;">${item.productName}<br><small>${item.quantity} x Rs. ${formatCurrency(item.price)}</small></td>
            <td style="padding: 5px 0; text-align: right;">Rs. ${formatCurrency(item.subtotal)}</td>
          </tr>
        `;
      });
    }
    const html = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: #000; }
            h2 { text-align: center; margin: 0 0 10px 0; }
            p { margin: 5px 0; font-size: 14px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>cMart</h2>
          <p class="text-center">Receipt</p>
          <div class="divider"></div>
          <p>Invoice: ${sale.invoiceNo}</p>
          <p>Date: ${dateStr}</p>
          <p>Customer: ${customerName}</p>
          <p>Pay Method: ${sale.paymentMethod}</p>
          <div class="divider"></div>
          <table>
            ${itemsHtml}
          </table>
          <div class="divider"></div>
          <table>
            <tr><td>Subtotal:</td><td class="text-right">Rs. ${formatCurrency(sale.subtotal)}</td></tr>
            ${Number(sale.discount) > 0 ? `<tr><td>Discount:</td><td class="text-right">-Rs. ${formatCurrency(sale.discount)}</td></tr>` : ""}
            ${Number(sale.tax) > 0 ? `<tr><td>Tax:</td><td class="text-right">+Rs. ${formatCurrency(sale.tax)}</td></tr>` : ""}
            <tr><td class="bold">Total:</td><td class="text-right bold">Rs. ${formatCurrency(sale.total)}</td></tr>
          </table>
          ${
            sale.paymentMethod === "CASH" && sale.cashReceived
              ? `
          <div class="divider"></div>
          <table>
            <tr><td>Tendered:</td><td class="text-right">Rs. ${formatCurrency(sale.cashReceived)}</td></tr>
            <tr><td>Change:</td><td class="text-right">Rs. ${formatCurrency(sale.changeGiven || 0)}</td></tr>
          </table>
          `
              : ""
          }
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

  return (
    <div className={`flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 ${isFullscreen ? 'p-0 fixed inset-0 z-50' : 'p-6 lg:p-8'}`}>
      
      {/* ──────────────── HEADER & KPIS ──────────────── */}
      {!isFullscreen && (
        <div className="mb-8">
          <div className="font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Receipt className="w-8 h-8 text-blue-600" />
                Sales History
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                View and manage all transactions elegantly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.location.href = '/employee/pos'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                New Sale
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => (
              <KpiCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                iconColorClass={kpi.color}
                iconBgClass={kpi.bg}
              />
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── TOOLBAR CARD ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Search Bar on Left */}
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text"
            placeholder="Search invoice, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none text-sm"
          />
          {search && (
            <button 
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toolbar Controls on Right: Filter, List/Grid, Fullscreen */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto">
          <button 
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center px-4 h-full rounded-xl transition-all gap-2 font-bold relative cursor-pointer text-xs sm:text-sm ${
              (statusFilter !== 'all' || paymentMethodFilter !== 'all' || channelFilter !== 'all' || fromDate || toDate)
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Filter Sales"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(statusFilter !== 'all' || paymentMethodFilter !== 'all' || channelFilter !== 'all' || fromDate || toDate) && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button 
            type="button"
            onClick={() => setViewMode('list')}
            title="List View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>

          <button 
            type="button"
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' 
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Full Screen"
            className="flex items-center justify-center w-10 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────── DATA CONTAINER ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none h-screen' : ''}`}>
        {viewMode === 'list' ? (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div className="col-span-2">Invoice</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-1">Payment</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-medium">Loading sales...</p>
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                    <Receipt className="w-12 h-12 opacity-20" />
                    <p className="font-medium text-lg text-slate-500">No sales found.</p>
                  </div>
                ) : (
                  filteredSales.map((s) => (
                    <div key={s.id} onClick={() => openViewPanel(s)} className="grid grid-cols-12 gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                      
                      {/* Invoice */}
                      <div className="col-span-2 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{s.invoiceNo}</h3>
                          <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <UserCircle className="w-3 h-3" /> {s.user?.name || 'Cashier'}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(s.createdAt)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatTime(s.createdAt)}
                        </div>
                      </div>

                      {/* Customer */}
                      <div className="col-span-2 flex flex-col justify-center min-w-0">
                        {s.customer ? (
                          <>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{s.customer.name}</p>
                            <p className="text-xs text-slate-500 truncate">{s.customer.phone || 'No phone'}</p>
                          </>
                        ) : (
                          <span className="text-sm font-medium italic text-slate-400">Walk-in Customer</span>
                        )}
                      </div>

                      {/* Payment Method */}
                      <div className="col-span-1 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5">
                          {s.paymentMethod === 'CASH' ? <Banknote className="w-4 h-4 text-emerald-500 shrink-0" /> : s.paymentMethod === 'PAYHERE_QR' ? <QrCode className="w-4 h-4 text-violet-500 shrink-0" /> : <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />}
                          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                            {s.paymentMethod === 'PAYHERE_QR' ? 'Mobile QR' : s.paymentMethod === 'CARD' ? 'Card' : 'Cash'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 uppercase tracking-wider font-semibold">
                          {s.channel || 'POS'}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="col-span-2 flex flex-col justify-center min-w-0">
                        <p className="text-base font-black text-slate-900 dark:text-white truncate">
                          Rs. {formatCurrency(s.total)}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {s.items?.length || 0} items
                        </p>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex items-center justify-center min-w-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          s.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          s.paymentStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          <span className="w-2 h-2 rounded-full bg-current" />
                          {s.paymentStatus === 'REFUNDED' ? 'Refunded' : s.paymentStatus === 'PARTIAL_REFUND' ? 'Partial Refund' : s.paymentStatus}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintReceipt(s);
                          }}
                          title="Print Receipt"
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {s.paymentStatus !== 'REFUNDED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRefundSale(s);
                              setIsRefundPanelOpen(true);
                            }}
                            title="Refund Sale"
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium">Loading sales...</p>
                </div>
              ) : filteredSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <Receipt className="w-12 h-12 opacity-20" />
                  <p className="font-medium text-lg text-slate-500">No sales found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredSales.map((s) => (
                    <div key={s.id} onClick={() => openViewPanel(s)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full hover:border-blue-500/50">
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                          s.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          s.paymentStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          {s.paymentStatus === 'REFUNDED' ? 'REFUND' : s.paymentStatus === 'PARTIAL_REFUND' ? 'PARTIAL REFUND' : s.paymentStatus}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col mb-4">
                        <h3 className="font-black text-slate-900 dark:text-white text-lg mb-1">{s.invoiceNo}</h3>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-3">
                          <Calendar className="w-3 h-3" /> {formatDate(s.createdAt)} at {formatTime(s.createdAt)}
                        </p>
                        
                        <div className="space-y-2 mt-auto">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="truncate">{s.customer?.name || 'Walk-in Customer'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            {s.paymentMethod === 'CASH' ? <Banknote className="w-4 h-4 text-slate-400" /> : <CreditCard className="w-4 h-4 text-slate-400" />}
                            <span>{s.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.items?.length || 0} Items</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">Rs. {formatCurrency(s.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }
      </div>

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Sales"
        onClear={() => { 
          setPaymentMethodFilter('all'); 
          setStatusFilter('all'); 
          setChannelFilter('all'); 
          setFromDate(''); 
          setToDate(''); 
          setIsFilterOpen(false); 
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Payment Method</label>
          <CustomSelect
            value={paymentMethodFilter}
            onChange={setPaymentMethodFilter}
            options={[
              { value: 'all', label: 'All Methods' },
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Payment Status</label>
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sales Channel</label>
          <CustomSelect
            value={channelFilter}
            onChange={setChannelFilter}
            options={[
              { value: 'all', label: 'All Channels' },
              { value: 'pos', label: 'POS System' },
              { value: 'online', label: 'Online Store' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Date Range</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">From</label>
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">To</label>
              <input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── SLIDE OUT PANEL FOR SALE DETAILS ──────────────── */}
      <AnimatePresence>
        {isPanelOpen && selectedSale && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Sale Details
                </h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => handlePrintReceipt(selectedSale)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-colors shadow-sm shadow-blue-500/20">
                    <Printer className="w-4 h-4" /> Print Receipt
                  </button>
                  {selectedSale.paymentStatus !== 'REFUNDED' && (
                    <button onClick={() => {
                      if(window.confirm('Are you sure you want to process a refund for this sale?')) {
                        setRefundSale(selectedSale);
                        setIsRefundPanelOpen(true);
                      }
                    }} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/10 font-bold transition-colors">
                      Refund
                    </button>
                  )}
                  <button onClick={() => setIsPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50 space-y-6">
                
                {/* Invoice Header */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedSale.invoiceNo}</h3>
                      <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {formatDate(selectedSale.createdAt)} at {formatTime(selectedSale.createdAt)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold ${
                      selectedSale.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                      selectedSale.paymentStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {selectedSale.paymentStatus === 'REFUNDED' ? 'REFUND' : selectedSale.paymentStatus === 'PARTIAL_REFUND' ? 'PARTIAL REFUND' : selectedSale.paymentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Info</p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedSale.customer?.name || 'Walk-in Customer'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{selectedSale.customer?.phone || 'No phone provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Info</p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          {selectedSale.paymentMethod === 'CASH' ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedSale.paymentMethod}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Processed by {selectedSale.user?.name || 'System'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-500" />
                      Purchased Items
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-6">Item</div>
                      <div className="col-span-2 text-right">Price</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-right">Subtotal</div>
                    </div>
                    
                    {selectedSale.items && selectedSale.items.map((item: any) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                        <div className="col-span-6">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.productName}</p>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-sm text-slate-600 dark:text-slate-300">Rs. {formatCurrency(item.price)}</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-sm font-black text-slate-900 dark:text-white">Rs. {formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm ml-auto sm:w-80">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>Rs. {formatCurrency(selectedSale.subtotal)}</span>
                    </div>
                    {Number(selectedSale.discount) > 0 && (
                      <div className="flex justify-between items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <span>Discount</span>
                        <span>- Rs. {formatCurrency(selectedSale.discount)}</span>
                      </div>
                    )}
                    {Number(selectedSale.tax) > 0 && (
                      <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400">
                        <span>Tax</span>
                        <span>+ Rs. {formatCurrency(selectedSale.tax)}</span>
                      </div>
                    )}
                    
                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Total</span>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-500">Rs. {formatCurrency(selectedSale.total)}</span>
                    </div>
                  </div>
                </div>
                
                {selectedSale.notes && (
                  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-2">Order Notes</h4>
                    <p className="text-sm text-amber-900 dark:text-amber-400">{selectedSale.notes}</p>
                  </div>
                )}
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {isRefundPanelOpen && refundSale && (
        <RefundPanel 
          sale={refundSale} 
          onClose={() => {
            setIsRefundPanelOpen(false);
            setRefundSale(null);
          }} 
          onConfirm={handleProcessRefund}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

function RefundPanel({ sale, onClose, onConfirm, formatCurrency }: { sale: any, onClose: () => void, onConfirm: (items: any[], totalRefundAmount: number) => void, formatCurrency: any }) {
  const [refundItems, setRefundItems] = useState<any[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingConfirmData, setPendingConfirmData] = useState<{items: any[], total: number} | null>(null);
  
  useEffect(() => {
    if (sale?.items) {
      setRefundItems(sale.items.map((item: any) => {
        const availableQty = item.quantity - (item.refundedQuantity || 0);
        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          originalPrice: item.price,
          maxQty: availableQty,
          cartQty: availableQty // Initially, all items are in the customer's bag
        };
      }).filter((item: any) => item.maxQty > 0)); // Only show items that can be refunded
    }
  }, [sale]);

  const updateQty = (id: number, delta: number) => {
    setRefundItems(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(0, Math.min(item.maxQty, item.cartQty + delta));
        return { ...item, cartQty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: any) => {
    // Removing from cart means customer returns all of it (cartQty = 0)
    setRefundItems(prev => prev.map(item => item.productId === id ? { ...item, cartQty: 0 } : item));
  };
  
  // Cart reflects what is currently in the customer's bag
  const cart = refundItems.filter(item => item.cartQty > 0).map(item => ({ ...item, quantity: item.cartQty }));
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const customer = sale?.customer;
  const formatLKR = (val: any) => "Rs. " + formatCurrency(val);
  const focusedSection: string = "";
  const focusedCartIndex = -1;
  const discount = 0;
  const discountAmount = 0;
  
  // Total Refund Amount is calculated from the items REMOVED from the bag
  const totalRefundAmount = refundItems.reduce((acc, item) => {
    const refundedQty = item.maxQty - item.cartQty;
    return acc + (refundedQty * item.price);
  }, 0);
  
  const subtotal = totalRefundAmount;
  const originalTaxPercentage = (sale?.subtotal && sale.subtotal > 0) ? (Number(sale.tax) / Number(sale.subtotal)) : 0;
  const taxAmount = subtotal * originalTaxPercentage;
  const total = subtotal + taxAmount;
  
  const handleHoldOrder = () => {};
  const setPaymentModal = (a: any) => {
    const itemsToRefund = refundItems
      .map(item => ({ ...item, refundQty: item.maxQty - item.cartQty }))
      .filter(item => item.refundQty > 0);
      
    if (itemsToRefund.length === 0) {
      toast.error('No items selected for refund. Reduce quantities to refund items.');
      return;
    }
    
    setPendingConfirmData({ items: itemsToRefund, total });
    setIsConfirmOpen(true);
  };
  const setDiscountInputValue = (a: any) => {};
  const setDiscountFocusedBtn = (a: any) => {};
  const setIsDiscountModalOpen = (a: any) => {};
  const setCart = (a: any) => {
    // Clear all means customer returns EVERYTHING
    setRefundItems(prev => prev.map(item => ({ ...item, cartQty: 0 })));
  };
  const setDiscount = (a: any) => {};
  const user = { tenant: { plan: "PRO" } };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="fixed inset-y-0 right-0 z-[210] w-[400px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white leading-tight">
                Refund Details
              </h2>
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">
                {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
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
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight pr-4 truncate">
                    {item.productName.length > 30 ? item.productName.substring(0, 30) + "..." : item.productName}
                  </h4>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                  >
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
                      onClick={() =>
                        updateQty(item.productId, -1)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= item.maxQty}
                      onClick={() =>
                        updateQty(item.productId, 1)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-xs text-gray-400 mt-1">
                Scan or tap products to add
              </p>
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
              <span>Tax ({(originalTaxPercentage * 100).toFixed(0)}%)</span>
              <span>{formatLKR(taxAmount)}</span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-3 border-t border-gray-200 dark:border-slate-700">
            <span className="text-gray-900 dark:text-white font-black uppercase tracking-wider text-sm">
              Refund Total
            </span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight truncate ml-2 text-right">
              {formatLKR(total)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              disabled={total === 0}
              id="cart-pay-btn"
              onClick={() => {
                setPaymentModal({ open: true, method: "CASH", cashAmount: "" });
              }}
              className={`w-full relative group overflow-hidden bg-red-600 text-white font-black text-lg h-14 rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3 ${focusedSection === "cart" && focusedCartIndex === cart.length + 3 ? "ring-4 ring-red-300 dark:ring-red-700" : ""}`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex flex-col items-center justify-center">
                <span className="flex items-center justify-center gap-2 font-bold">
                  <Banknote className="w-5 h-5" />
                  REFUND NOW
                </span>
              </span>
            </button>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {isConfirmOpen && pendingConfirmData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Banknote className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Confirm Refund</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Are you sure you want to refund <span className="font-bold text-slate-900 dark:text-white">{formatLKR(pendingConfirmData.total)}</span>?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => { setIsConfirmOpen(false); onConfirm(pendingConfirmData.items, pendingConfirmData.total); }} className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
