'use client';

import { useState, useMemo } from 'react';
import { 
  Search, Filter, CheckCircle, Clock, XCircle, AlertTriangle, 
  Maximize, Minimize, List, LayoutGrid, X, Download, User as UserIcon, 
  Eye, FileText, Printer, ChevronDown, ShoppingBag, Globe, Truck, MapPin, CreditCard, CalendarDays, Edit, Package, Trash2, Ban, Mail, Phone, Users, Banknote, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

// Mock Data for Online Customers
const mockOnlineCustomers = [
  { 
    id: 'WEB-CUS-1001', 
    name: 'Sahan Dissanayake', 
    phone: '071 234 5678',
    email: 'sahan@example.com',
    address: '15/2, Beach Road, Negombo',
    registeredDate: '2026-01-15',
    lastLogin: '2026-08-01T10:30:00',
    totalOrders: 12,
    totalSpent: 45000,
    status: 'Active' 
  },
  { 
    id: 'WEB-CUS-1002', 
    name: 'Nipuni Fernando', 
    phone: '077 987 6543',
    email: 'nipuni@example.com',
    address: '45, Kandy Road, Kadawatha',
    registeredDate: '2026-03-22',
    lastLogin: '2026-07-28T14:15:00',
    totalOrders: 3,
    totalSpent: 12500,
    status: 'Active' 
  },
  { 
    id: 'WEB-CUS-1003', 
    name: 'Kasun Kalhara', 
    phone: '070 111 2222',
    email: 'kasun@example.com',
    address: '128/A, Highlevel Road, Nugegoda',
    registeredDate: '2026-06-10',
    lastLogin: '2026-08-02T09:45:00',
    totalOrders: 5,
    totalSpent: 28000,
    status: 'Blocked' 
  },
  { 
    id: 'WEB-CUS-1004', 
    name: 'Ayesha Silva', 
    phone: '076 555 4444',
    email: 'ayesha@example.com',
    address: '7th Lane, Kollupitiya, Colombo 03',
    registeredDate: '2026-07-05',
    lastLogin: '2026-07-20T16:20:00',
    totalOrders: 1,
    totalSpent: 4500,
    status: 'Inactive' 
  },
  { 
    id: 'WEB-CUS-1005', 
    name: 'Tharindu Peiris', 
    phone: '071 888 9999',
    email: 'tharindu@example.com',
    address: 'No 10, Galle Road, Mount Lavinia',
    registeredDate: '2026-07-25',
    lastLogin: '2026-08-03T08:10:00',
    totalOrders: 0,
    totalSpent: 0,
    status: 'Active' 
  },
];

const ACCOUNT_STATUSES = ['All', 'Active', 'Inactive', 'Blocked'];

export default function OnlineCustomersPage() {
  const [customers, setCustomers] = useState(mockOnlineCustomers);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Filter Panel State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  // Customer Details Panel State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [blockConfirmId, setBlockConfirmId] = useState<string | null>(null);

  const openCustomerDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsPanelOpen(true);
  };

  const handleToggleBlockStatus = () => {
    if (blockConfirmId) {
      setCustomers(customers.map(c => 
        c.id === blockConfirmId 
          ? { ...c, status: c.status === 'Blocked' ? 'Active' : 'Blocked' } 
          : c
      ));
      toast.success('Account status updated successfully');
      
      // Update selected customer if panel is open
      if (selectedCustomer && selectedCustomer.id === blockConfirmId) {
        setSelectedCustomer({ ...selectedCustomer, status: selectedCustomer.status === 'Blocked' ? 'Active' : 'Blocked' });
      }
      
      setBlockConfirmId(null);
    }
  };

  const handleSendPasswordReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    setTimeout(() => {
      toast.success('Password reset link sent successfully');
      setIsUpdating(false);
    }, 800);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const kpis = useMemo(() => {
    const activeCustomers = customers.filter(c => c.status === 'Active');
    return {
      totalRegistered: customers.length,
      activeAccounts: activeCustomers.length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      // Mocking recent signups logic
      recentSignups: customers.filter(c => new Date(c.registeredDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 2,
    };
  }, [customers]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden relative">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            Website Customers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage registered website users, track their behavior and manage account access.</p>
        </div>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard 
          title="Total Registered" 
          value={kpis.totalRegistered} 
          icon={UserIcon} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active Accounts" 
          value={kpis.activeAccounts} 
          icon={CheckCircle} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Total Online Revenue" 
          value={`Rs. ${(kpis.totalRevenue/1000).toFixed(1)}k`} 
          icon={Banknote} 
          iconColorClass="text-amber-600" 
          iconBgClass="bg-amber-50 dark:bg-amber-500/10" 
        />
        <KpiCard 
          title="New Signups (7d)" 
          value={kpis.recentSignups} 
          icon={Clock} 
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
            placeholder="Search by name, ID, email or phone..."
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
            {statusFilter !== 'All' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
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

      {/* ──────────────── LIST/GRID VIEWS ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'fixed inset-y-0 right-0 left-[68px] z-[100] m-0 rounded-none border-none' : ''}`}>
        
        {isFullscreen && (
          <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Online Customers Fullscreen View
            </h2>
            <button onClick={() => setIsFullscreen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Minimize className="w-5 h-5" />
            </button>
          </div>
        )}

        {viewMode === 'list' ? (
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
              <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4 font-bold text-slate-500">Customer ID</th>
                  <th className="px-5 py-4 font-bold text-slate-500">Customer Info</th>
                  <th className="px-5 py-4 font-bold text-slate-500">Contact & Address</th>
                  <th className="px-5 py-4 font-bold text-slate-500">Registered / Last Login</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-right">Lifetime Value</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-center">Status</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Users className="w-12 h-12 opacity-20" />
                        <p className="font-medium text-lg text-slate-500">No online customers found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                  {filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => openCustomerDetails(customer)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 font-bold text-slate-500 text-sm">{customer.id}</td>
                      
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="font-black text-slate-900 dark:text-white text-sm">{customer.name}</div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2 group/copy">
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(customer.email); toast.success('Email copied'); }} className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-blue-500 transition-all">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 group/copy">
                            <span className="text-slate-500 font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>
                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(customer.phone); toast.success('Phone copied'); }} className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-blue-500 transition-all">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {customer.address && (
                            <span className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5"><MapPin className="w-3.5 h-3.5" /> {customer.address}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-xs font-bold text-slate-500">
                          <span>Reg: {customer.registeredDate}</span>
                          <span>Login: {new Date(customer.lastLogin).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="font-black text-blue-600 dark:text-blue-400">Rs. {customer.totalSpent.toLocaleString()}</span>
                          <span className="text-xs font-bold text-slate-500">{customer.totalOrders} Orders</span>
                        </div>
                      </td>
                      
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                          customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          customer.status === 'Blocked' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {customer.status === 'Blocked' ? 'Suspended' : customer.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); }} className={`p-2 rounded-lg transition-colors ${customer.status === 'Blocked' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`} title={customer.status === 'Blocked' ? 'Activate Account' : 'Suspend Account'}>
                            <Ban className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
            {filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <Users className="w-12 h-12 opacity-20" />
                <p className="font-medium text-lg text-slate-500">No online customers found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} onClick={() => openCustomerDetails(customer)} className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col min-h-[260px]">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                        {customer.name.charAt(0)}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                        customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        customer.status === 'Blocked' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                        'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col mb-4">
                      <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate">{customer.name}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate mb-3">
                        {customer.id}
                      </p>
                      
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-medium">Total Orders</span>
                          <span className="font-bold">{customer.totalOrders}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-medium">Total Spent</span>
                          <span className="font-black text-blue-600 dark:text-blue-400">Rs. {customer.totalSpent.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setBlockConfirmId(customer.id); }} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${customer.status === 'Blocked' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                        {customer.status === 'Blocked' ? 'Activate' : 'Suspend'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openCustomerDetails(customer); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">
                        Details
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
        title="Filter Customers" 
        onClear={() => {
          setStatusFilter('All');
          setIsFilterOpen(false);
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="font-sans space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Status</label>
            <CustomSelect options={ACCOUNT_STATUSES.map(t => ({ label: t, value: t }))} value={statusFilter} onChange={setStatusFilter} />
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── CUSTOMER DETAILS SLIDE OUT PANEL ──────────────── */}
      <AnimatePresence>
        {isDetailsPanelOpen && selectedCustomer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDetailsPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Account Details
                  </h2>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">{selectedCustomer.id}</p>
                </div>
                <button onClick={() => setIsDetailsPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Profile Overview */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-3xl shrink-0">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{selectedCustomer.name}</h3>
                    <span className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                      selectedCustomer.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      selectedCustomer.status === 'Blocked' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                      'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-blue-500" /> Contact Info
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-500 font-medium flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email Address</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-500 font-medium flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedCustomer.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Activity & Value */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-500" /> Lifetime Value
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Total Orders</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedCustomer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Registered Date</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedCustomer.registeredDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Last Login</span>
                      <span className="font-bold text-slate-900 dark:text-white">{new Date(selectedCustomer.lastLogin).toLocaleDateString()} {new Date(selectedCustomer.lastLogin).toLocaleTimeString()}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">Total Spent</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">Rs. {selectedCustomer.totalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Quick Actions</h4>
                  
                  <button 
                    onClick={handleSendPasswordReset}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    ) : (
                      <><Mail className="w-4 h-4" /> Send Password Reset</>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setBlockConfirmId(selectedCustomer.id)}
                    className={`w-full flex items-center justify-center gap-2 py-3 border rounded-xl font-bold transition-colors ${
                      selectedCustomer.status === 'Blocked' 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                        : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20'
                    }`}
                  >
                    <Ban className="w-4 h-4" />
                    {selectedCustomer.status === 'Blocked' ? 'Activate Account' : 'Suspend Account'}
                  </button>
                </div>
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={!!blockConfirmId}
        title={customers.find(c => c.id === blockConfirmId)?.status === 'Blocked' ? "Activate Account" : "Suspend Account"}
        message={customers.find(c => c.id === blockConfirmId)?.status === 'Blocked' 
          ? "Are you sure you want to activate this account? The user will be able to log in again." 
          : "Are you sure you want to suspend this account? The user will no longer be able to log in to the online store."}
        confirmText={customers.find(c => c.id === blockConfirmId)?.status === 'Blocked' ? "Activate" : "Suspend"}
        cancelText="Cancel"
        type={customers.find(c => c.id === blockConfirmId)?.status === 'Blocked' ? "info" : "danger"}
        onConfirm={handleToggleBlockStatus}
        onCancel={() => setBlockConfirmId(null)}
      />
    </div>
  );
}
