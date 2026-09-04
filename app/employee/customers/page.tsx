'use client';
import { Suspense } from 'react';

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Edit, Trash2, 
  MapPin, Phone, Mail, FileText, CheckCircle, XCircle, UserCircle,
  Filter, List, LayoutGrid, Maximize, Minimize, X, Gift, ShoppingBag, Banknote, ChevronDown, Copy
} from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara', 'Negombo', 'Moratuwa', 'Sri Jayawardenepura Kotte'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya', 'Gampola', 'Dambulla'],
  'Southern': ['Galle', 'Matara', 'Hambantota', 'Tangalle', 'Weligama'],
  'North Western': ['Kurunegala', 'Puttalam', 'Kuliyapitiya', 'Chilaw'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle', 'Balangoda', 'Embilipitiya'],
  'Eastern': ['Trincomalee', 'Batticaloa', 'Ampara', 'Kattankudy'],
  'Uva': ['Badulla', 'Monaragala', 'Bandarawela', 'Haputale'],
  'North Central': ['Anuradhapura', 'Polonnaruwa', 'Kekirawa', 'Medawachchiya'],
  'Northern': ['Jaffna', 'Vavuniya', 'Mannar', 'Kilinochchi', 'Point Pedro']
};


function CustomerHistoryView({ customer, onBack, formatCurrency }: { customer: any, onBack: () => void, formatCurrency: (v: any) => string }) {
  const orders = [
    { id: 'ORD-1029', date: '2023-10-01T10:00:00', items: '2x Wireless Mouse, 1x Keyboard', total: 15000, discount: 500, netTotal: 14500, pointsEarned: 145, payMethod: 'CARD', status: 'COMPLETED', cashier: 'Admin' },
    { id: 'ORD-1035', date: '2023-10-05T14:30:00', items: '1x Monitor, 1x HDMI Cable', total: 45000, discount: 0, netTotal: 45000, pointsEarned: 450, payMethod: 'CASH', status: 'COMPLETED', cashier: 'Cashier' },
    { id: 'ORD-1042', date: '2023-10-12T09:15:00', items: '3x USB Drive 64GB', total: 7500, discount: 0, netTotal: 7500, pointsEarned: 75, payMethod: 'CREDIT', status: 'PENDING', cashier: 'Admin' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {customer.name} - Order History
          </h2>
          <p className="text-sm font-medium text-slate-500">View all past purchases, points earned, and payment details.</p>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto bg-white dark:bg-slate-900">
        <div className="min-w-max h-full flex flex-col">
          <div className="grid grid-cols-[150px_120px_250px_120px_120px_120px_120px_150px_120px_120px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            <div>Date</div>
            <div>Order ID</div>
            <div>Items Summary</div>
            <div className="text-right">Total (Rs)</div>
            <div className="text-right">Discount (Rs)</div>
            <div className="text-right">Net Total (Rs)</div>
            <div className="text-center">Points Earned</div>
            <div className="text-center">Pay Method</div>
            <div className="text-center">Status</div>
            <div>Cashier</div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {orders.map((o, i) => (
              <div key={i} className="grid grid-cols-[150px_120px_250px_120px_120px_120px_120px_150px_120px_120px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(o.date).toLocaleDateString()} {new Date(o.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{o.id}</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{o.items}</div>
                <div className="text-sm font-bold text-slate-600 text-right">{o.total > 0 ? o.total.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</div>
                <div className="text-sm font-bold text-red-600 text-right">{o.discount > 0 ? o.discount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 text-right">{o.netTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                <div className="text-center text-sm font-bold text-amber-500">+{o.pointsEarned}</div>
                <div className="text-center">
                  <span className="inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{o.payMethod.replace('_', ' ')}</span>
                </div>
                <div className="text-center">
                  <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>{o.status}</span>
                </div>
                <div className="text-sm font-medium text-slate-500">{o.cashier}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomersPageContent() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [termsFilter, setTermsFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc'); 
  
  // History Panel state
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    customerGroup: 'REGULAR',
    dateOfBirth: '',
    gender: 'OTHER',
    openingBalance: '',
    creditLimit: '',
    paymentTerms: 'CASH',
    loyaltyEnabled: false,
    loyaltyPoints: '',
    active: true,
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsPanelOpen(true);
    }
  }, [searchParams]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerAPI.getCustomers();
      setCustomers(res.data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingId) {
        await storeOwnerAPI.updateCustomer(editingId, formData);
        toast.success('Customer updated successfully!');
      } else {
        await storeOwnerAPI.createCustomer(formData);
        toast.success('Customer added successfully!');
      }
      setIsPanelOpen(false);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddPanel = () => {
    resetForm();
    setEditingId(null);
    setIsPanelOpen(true);
  };

  const openHistory = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const handleEdit = (c: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      city: c.city || '',
      province: c.province || '',
      customerGroup: c.customerGroup || 'REGULAR',
      dateOfBirth: c.dateOfBirth || '',
      gender: c.gender || 'OTHER',
      openingBalance: c.openingBalance || '',
      creditLimit: c.creditLimit || '',
      paymentTerms: c.paymentTerms || 'CASH',
      loyaltyEnabled: c.loyaltyEnabled || false,
      loyaltyPoints: c.points || '',
      active: c.active !== false,
      notes: c.notes || '',
    });
    setEditingId(c.id);
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await storeOwnerAPI.deleteCustomer(id);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (err) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', phone: '', email: '', address: '', city: '', province: '',
      customerGroup: 'REGULAR', dateOfBirth: '', gender: 'OTHER',
      openingBalance: '', creditLimit: '', paymentTerms: 'CASH',
      loyaltyEnabled: false, loyaltyPoints: '', active: true, notes: ''
    });
  };

  const filteredCustomers = useMemo(() => {
    let result = customers.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = 
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.province?.toLowerCase().includes(q);
        
      if (!matchesSearch) return false;

      if (statusFilter === 'active' && c.active === false) return false;
      if (statusFilter === 'inactive' && c.active !== false) return false;
      
      if (groupFilter !== 'all' && c.customerGroup !== groupFilter) return false;
      if (genderFilter !== 'all' && c.gender !== genderFilter) return false;
      if (termsFilter !== 'all' && c.paymentTerms !== termsFilter) return false;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'spent-desc': return Number(b.totalSpent || 0) - Number(a.totalSpent || 0);
        case 'spent-asc': return Number(a.totalSpent || 0) - Number(b.totalSpent || 0);
        case 'points-desc': return Number(b.points || 0) - Number(a.points || 0);
        case 'points-asc': return Number(a.points || 0) - Number(b.points || 0);
        case 'orders-desc': return Number(b.totalOrders || 0) - Number(a.totalOrders || 0);
        case 'orders-asc': return Number(a.totalOrders || 0) - Number(b.totalOrders || 0);
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'name-asc': 
        default: return (a.name || '').localeCompare(b.name || '');
      }
    });

    return result;
  }, [customers, search, statusFilter, groupFilter, genderFilter, termsFilter, sortBy]);

  const kpis = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.active !== false).length;
    const recent = customers.filter(c => {
      if (!c.createdAt) return false;
      const days = (new Date().getTime() - new Date(c.createdAt).getTime()) / (1000 * 3600 * 24);
      return days <= 7;
    }).length;
    const totalSpent = customers.reduce((acc, c) => acc + (Number(c.totalSpent) || 0), 0);
    return { total, active, recent, totalSpent };
  }, [customers]);

  const formatCurrency = (val: any) => {
    return Number(val || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Customer Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Add, update, and manage your loyal customers.</p>
        </div>
        
        <button 
          onClick={openAddPanel}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard 
          title="Total Customers" 
          value={kpis.total} 
          icon={Users} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active" 
          value={kpis.active} 
          icon={CheckCircle} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Total Spent" 
          value={`Rs. ${formatCurrency(kpis.totalSpent)}`}
          icon={Banknote} 
          iconColorClass="text-orange-600" 
          iconBgClass="bg-orange-50 dark:bg-orange-500/10" 
        />
        <KpiCard 
          title="New (7 Days)" 
          value={kpis.recent} 
          icon={Users} 
          iconColorClass="text-purple-600" 
          iconBgClass="bg-purple-50 dark:bg-purple-500/10" 
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
            placeholder="Search customers..."
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
            {statusFilter !== 'all' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
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

      {/* ──────────────── DATA TABLE / HISTORY VIEW ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'fixed inset-y-0 right-0 left-[68px] z-[100] m-0 rounded-none border-none' : ''}`}>
        
        {isFullscreen && (
          <button 
            onClick={() => setIsFullscreen(false)} 
            className="absolute top-4 right-4 z-[110] p-3 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/80 transition-colors backdrop-blur-md shadow-lg"
          >
            <Minimize className="w-5 h-5" />
          </button>
        )}

        {selectedCustomer ? (
          <CustomerHistoryView 
            customer={selectedCustomer} 
            onBack={() => setSelectedCustomer(null)} 
            formatCurrency={formatCurrency}
          />
        ) : viewMode === 'list' ? (
          <>
            {/* Table wrapper for horizontal scroll */}
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap min-w-[1500px]">
                <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider z-10 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-bold text-slate-500">Customer Name</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Contact</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Location</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Group</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Gender & DOB</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Balance</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Credit Limit</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Terms</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Loyalty Pts</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Total Spent</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Orders</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Status</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="px-5 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                          <p className="font-medium text-sm">Loading customers...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-5 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Users className="w-12 h-12 mb-3 opacity-20" />
                          <p className="font-medium text-sm">No customers found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr 
                        key={c.id}
                        onClick={() => openHistory(c)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{c.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 group/copy">
                              <Phone className="w-3.5 h-3.5 text-slate-400" /> 
                              <span className="truncate">{c.phone || 'N/A'}</span>
                              {c.phone && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.phone); toast.success('Phone copied!'); }}
                                  className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded"
                                  title="Copy Phone"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 group/copy">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> 
                              <span className="truncate">{c.email || 'N/A'}</span>
                              {c.email && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.email); toast.success('Email copied!'); }}
                                  className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded"
                                  title="Copy Email"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.city || 'No city'}
                            </p>
                            {c.province && <p className="text-xs text-slate-500 ml-5.5">{c.province}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            c.customerGroup === 'VIP' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                            c.customerGroup === 'WHOLESALE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {c.customerGroup || 'REGULAR'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300 capitalize">{c.gender?.toLowerCase() || 'Other'}</p>
                            <p className="text-xs text-slate-500">{c.dateOfBirth || 'No DOB'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className={`text-sm font-bold ${Number(c.openingBalance) < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                            Rs. {formatCurrency(c.openingBalance || 0)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Rs. {formatCurrency(c.creditLimit || 0)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                            {c.paymentTerms?.replace('NET_', '')?.concat(' Days')?.replace('CASH Days', 'CASH') || 'CASH'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-sm font-bold text-amber-500">
                            {c.points || 0}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex justify-end items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5" /> Rs. {formatCurrency(c.totalSpent)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <p className="text-sm font-bold text-slate-900 dark:text-white flex justify-center items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" /> {c.totalOrders || 0}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border items-center justify-center gap-1.5 ${
                            c.active !== false 
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${c.active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                            {c.active !== false ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleEdit(c, e)}
                              className="p-2 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                              title="Edit Customer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(c.id, e)}
                              className="p-2 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Grid View */
          <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="font-medium text-sm">Loading customers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium text-sm">No customers found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCustomers.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => openHistory(c)}
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 group cursor-pointer relative"
                  >
                    <div className="absolute top-4 right-4">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 ${
                        c.active !== false
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}>
                        {c.active !== false ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-black text-2xl mb-4">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <h3 className="font-black text-lg text-slate-900 dark:text-white truncate pr-16">{c.name}</h3>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 group/copy">
                        <Phone className="w-4 h-4 opacity-70" />
                        <span className="truncate">{c.phone || 'N/A'}</span>
                        {c.phone && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.phone); toast.success('Phone copied!'); }}
                            className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded ml-auto"
                            title="Copy Phone"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 group/copy">
                        <Mail className="w-4 h-4 opacity-70" />
                        <span className="truncate">{c.email || 'N/A'}</span>
                        {c.email && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.email); toast.success('Email copied!'); }}
                            className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded ml-auto"
                            title="Copy Email"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4 opacity-70" />
                        <span className="truncate">{c.city || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Orders</p>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                          {c.totalOrders || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total Spent</p>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                          Rs. {formatCurrency(c.totalSpent)}
                        </p>
                      </div>
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10">
                      <button 
                        onClick={(e) => handleEdit(c, e)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all"
                        title="Edit Customer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(c.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* ──────────────── SLIDE-OUT PANEL ──────────────── */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[200]"
            />
            
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[210] border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{editingId ? 'Update customer details' : 'Register a new loyal customer'}</p>
                </div>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="customerForm" onSubmit={handleSave} className="font-sans space-y-6">
                  {/* Basic Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">Basic Details</h3>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Customer Name *</label>
                      <div className="relative mt-1.5 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full pl-10 pr-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          placeholder="e.g. Nimesha Denuwanthi"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone</label>
                        <div className="relative mt-1.5 group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full pl-9 pr-3 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                            placeholder="07XXXXXXXX"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                        <div className="relative mt-1.5 group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-9 pr-3 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                            placeholder="user@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">Address Info</h3>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Province (Optional)</label>
                        <CustomSelect
                          value={formData.province}
                          onChange={val => {
                            setFormData({...formData, province: val, city: ''});
                          }}
                          options={[
                            { value: '', label: 'Select Province' },
                            ...Object.keys(CITIES_BY_PROVINCE).map(p => ({ value: p, label: p }))
                          ]}
                          label="Select Province"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                        <CustomSelect
                          value={formData.city}
                          onChange={val => setFormData({...formData, city: val})}
                          options={[
                            { value: '', label: 'Select City' },
                            ...(formData.province && CITIES_BY_PROVINCE[formData.province] 
                                ? CITIES_BY_PROVINCE[formData.province].map(c => ({ value: c, label: c }))
                                : [])
                          ]}
                          label="Select City"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">Customer Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Customer Group</label>
                        <CustomSelect
                          value={formData.customerGroup}
                          onChange={val => setFormData({...formData, customerGroup: val})}
                          options={[
                            { value: 'REGULAR', label: 'Regular' },
                            { value: 'WHOLESALE', label: 'Wholesale' },
                            { value: 'VIP', label: 'VIP' },
                          ]}
                          label="Select Group"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Gender</label>
                        <CustomSelect
                          value={formData.gender}
                          onChange={val => setFormData({...formData, gender: val})}
                          options={[
                            { value: 'MALE', label: 'Male' },
                            { value: 'FEMALE', label: 'Female' },
                            { value: 'OTHER', label: 'Other' },
                          ]}
                          label="Select Gender"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date of Birth (Optional)</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                          className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">Financial Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Opening Balance</label>
                        <input
                          type="number"
                          value={formData.openingBalance}
                          onChange={e => setFormData({...formData, openingBalance: e.target.value})}
                          className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Credit Limit</label>
                        <input
                          type="number"
                          value={formData.creditLimit}
                          onChange={e => setFormData({...formData, creditLimit: e.target.value})}
                          className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Terms</label>
                        <CustomSelect
                          value={formData.paymentTerms}
                          onChange={val => setFormData({...formData, paymentTerms: val})}
                          options={[
                            { value: 'CASH', label: 'Cash' },
                            { value: 'NET_7', label: '7 Days' },
                            { value: 'NET_15', label: '15 Days' },
                            { value: 'NET_30', label: '30 Days' },
                          ]}
                          label="Select Terms"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Loyalty & Status */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">Loyalty & Options</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">Enable Loyalty Program</p>
                        <p className="text-xs text-slate-500">Allow customer to earn points</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.loyaltyEnabled} onChange={e => setFormData({...formData, loyaltyEnabled: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.loyaltyEnabled && (
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Opening Loyalty Points</label>
                        <input
                          type="number"
                          value={formData.loyaltyPoints}
                          onChange={e => setFormData({...formData, loyaltyPoints: e.target.value})}
                          className="mt-1.5 w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          placeholder="0"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">Active Status</p>
                        <p className="text-xs text-slate-500">Customer account is active</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notes / Remarks</label>
                      <textarea
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        className="mt-1.5 w-full p-4 h-24 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none resize-none"
                        placeholder="Any additional notes..."
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="customerForm"
                    disabled={isSubmitting}
                    className="flex-[2] px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" /> Save Customer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──────────────── FILTER FLYOUT ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Customers"
        onClear={() => { 
          setStatusFilter('all'); 
          setGroupFilter('all');
          setGenderFilter('all');
          setTermsFilter('all');
          setSortBy('name-asc');
          setIsFilterOpen(false); 
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By</label>
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'name-asc', label: 'Name (A-Z)' },
                { value: 'name-desc', label: 'Name (Z-A)' },
                { value: 'spent-desc', label: 'Total Spent (Highest)' },
                { value: 'spent-asc', label: 'Total Spent (Lowest)' },
                { value: 'orders-desc', label: 'Total Orders (Highest)' },
                { value: 'orders-asc', label: 'Total Orders (Lowest)' },
                { value: 'points-desc', label: 'Loyalty Points (Highest)' },
                { value: 'points-asc', label: 'Loyalty Points (Lowest)' }
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Status</label>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Customers' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' }
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Customer Group</label>
            <CustomSelect
              value={groupFilter}
              onChange={setGroupFilter}
              options={[
                { value: 'all', label: 'All Groups' },
                { value: 'REGULAR', label: 'Regular' },
                { value: 'WHOLESALE', label: 'Wholesale' },
                { value: 'VIP', label: 'VIP' }
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Gender</label>
            <CustomSelect
              value={genderFilter}
              onChange={setGenderFilter}
              options={[
                { value: 'all', label: 'All Genders' },
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' }
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Payment Terms</label>
            <CustomSelect
              value={termsFilter}
              onChange={setTermsFilter}
              options={[
                { value: 'all', label: 'All Terms' },
                { value: 'CASH', label: 'Cash' },
                { value: 'NET_7', label: '7 Days' },
                { value: 'NET_15', label: '15 Days' },
                { value: 'NET_30', label: '30 Days' }
              ]}
            />
          </div>

        </div>
      </FilterPanel>

    </div>
  );
}


export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-8">Loading...</div>}>
      <CustomersPageContent />
    </Suspense>
  );
}
