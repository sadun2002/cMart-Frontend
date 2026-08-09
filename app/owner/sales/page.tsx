'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Receipt, Search, Plus, Printer, Eye, ChevronDown, CheckCircle, XCircle, Clock, Banknote, ShoppingBag, LayoutGrid, List, Maximize, Minimize, X, Calendar, Filter, FileText, UserCircle, User, Package, CreditCard, DollarSign, Target
} from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { getSetting, setSetting } from '@/lib/db';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filters
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Side Panel state for viewing sale details
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Goal State
  const [isGoalPanelOpen, setIsGoalPanelOpen] = useState(false);
  const [goalAmount, setGoalAmount] = useState('500000');
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      const val = await getSetting('monthly_sales_goal', '500000');
      setGoalAmount(val);
    } catch (e) {
      console.error(e);
    }
  };

  const saveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGoal(true);
    try {
      await setSetting('monthly_sales_goal', goalAmount);
      toast.success('Monthly sales goal updated successfully!');
      setIsGoalPanelOpen(false);
    } catch (error) {
      toast.error('Failed to update sales goal');
    } finally {
      setIsSavingGoal(false);
    }
  };

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
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">View and manage all transactions elegantly.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsGoalPanelOpen(true)}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl font-bold shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Target className="w-5 h-5" />
                Set Goal
              </button>
              <button 
                onClick={() => window.location.href = '/owner/pos'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
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

      {/* ──────────────── SEARCH BAR & FILTERS ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search invoice, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden flex-shrink-0 sm:ml-auto">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative"
            title="Filter & Sort"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {(statusFilter !== 'all' || paymentMethodFilter !== 'all' || channelFilter !== 'all' || fromDate || toDate) && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
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
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Full Screen"
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800`}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ──────────────── DATA TABLE ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none h-screen' : ''}`}>
        
        {viewMode === 'list' ? (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <div className="col-span-2">Invoice</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Payment</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-center">Status</div>
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
                    <div className="col-span-2 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2">
                        {s.paymentMethod === 'CASH' ? <Banknote className="w-4 h-4 text-emerald-500" /> : <CreditCard className="w-4 h-4 text-blue-500" />}
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{s.paymentMethod}</span>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="col-span-2 text-right flex flex-col justify-center min-w-0">
                      <p className="text-base font-black text-slate-900 dark:text-white truncate">Rs. {formatCurrency(s.total)}</p>
                      <p className="text-xs font-bold text-slate-500 truncate">{s.items?.length || 0} Items</p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        s.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                        s.paymentStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {s.paymentStatus}
                      </span>
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
                        {s.paymentStatus}
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
        )}
      </div>

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Sales"
        onClear={() => { setPaymentMethodFilter('all'); setStatusFilter('all'); setChannelFilter('all'); setFromDate(''); setToDate(''); setIsFilterOpen(false); }}
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
                <button onClick={() => setIsPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
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
                      {selectedSale.paymentStatus}
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

      {/* ──────────────── GOAL SETTING SLIDE-OUT PANEL ──────────────── */}
      <AnimatePresence>
        {isGoalPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalPanelOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[200]"
            />
            
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[210] border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Set Monthly Goal
                  </h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Set your sales target for this month</p>
                </div>
                <button 
                  onClick={() => setIsGoalPanelOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <form id="goalForm" onSubmit={saveGoal}>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Target Amount (LKR)</label>
                  <div className="relative mt-1.5 group">
                    <input
                      type="number"
                      required
                      value={goalAmount}
                      onChange={e => setGoalAmount(e.target.value)}
                      className="w-full px-4 h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-lg text-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    This goal will be reflected in your main dashboard's progress tracker. Set a challenging but achievable goal to keep the momentum going!
                  </p>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsGoalPanelOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    form="goalForm"
                    disabled={isSavingGoal}
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {isSavingGoal ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Target className="w-5 h-5" />
                        Save Goal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
