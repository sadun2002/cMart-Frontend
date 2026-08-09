'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Edit, Trash2, 
  MapPin, Phone, Mail, FileText, CheckCircle, XCircle, Building2, UserCircle,
  Filter, List, LayoutGrid, Maximize, Minimize, Package, X, Truck, Copy, Banknote, CreditCard, ChevronDown, Info
} from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';

const PROVINCES = [
  'Western', 'Central', 'Southern', 'North Western', 'Sabaragamuwa', 
  'Eastern', 'Uva', 'North Central', 'Northern'
];

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara', 'Negombo', 'Moratuwa', 'Sri Jayawardenepura Kotte'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya', 'Gampola', 'Dambulla'],
  'Southern': ['Galle', 'Matara', 'Hambantota', 'Tangalle', 'Weligama'],
  'North Western': ['Kurunegala', 'Puttalam', 'Kuliyapitiya', 'Chilaw'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle', 'Balangoda', 'Embilipitiya'],
  'Eastern': ['Trincomalee', 'Batticaloa', 'Ampara', 'Kattankudy'],
  'Uva': ['Badulla', 'Moneragala', 'Bandarawela', 'Haputale'],
  'North Central': ['Anuradhapura', 'Polonnaruwa', 'Hingurakgoda'],
  'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu']
};

const CATEGORIES = [
  'Electronics', 'Clothing', 'Groceries', 'Beverages', 'Hardware', 'Furniture', 
  'Stationery', 'Cosmetics', 'Toys', 'Automotive', 'Pharmaceuticals', 
  'Sporting Goods', 'Home Appliances', 'Footwear', 'Jewelry', 'Books', 
  'Music Instruments', 'Pet Supplies', 'Garden Supplies', 'Kitchenware',
  'Tools', 'Lighting', 'Plumbing', 'Paints', 'Textiles', 'Plastics',
  'Packaging', 'Chemicals', 'Cleaning Supplies', 'Office Supplies'
];

function SearchableSelect({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: string[], placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filteredOptions = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium cursor-pointer flex justify-between items-center"
      >
        <span className={value ? 'text-slate-900 dark:text-white truncate mr-2' : 'text-slate-400 truncate mr-2'}>{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-[70] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-slate-100 dark:border-slate-700 shrink-0">
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none"
              />
            </div>
            <div className="overflow-y-auto p-1 flex-1">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-sm text-slate-400 text-center">No results found</div>
              ) : (
                filteredOptions.map(opt => (
                  <div 
                    key={opt}
                    onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                    className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg cursor-pointer transition-colors"
                  >
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}



function TransactionHistoryView({ supplier, onBack }: { supplier: any, onBack: () => void }) {
  const txs = [
    { id: 'TXN-1029', date: '2023-10-01T10:00:00', ref: 'INV-001', desc: 'Stock Purchase - Electronics', debit: 0, credit: 150000, balance: 150000, method: 'BANK_TRANSFER', status: 'COMPLETED', createdBy: 'Admin' },
    { id: 'TXN-1035', date: '2023-10-05T14:30:00', ref: 'PAY-001', desc: 'Payment for INV-001', debit: 50000, credit: 0, balance: 100000, method: 'CASH', status: 'COMPLETED', createdBy: 'Cashier' },
    { id: 'TXN-1042', date: '2023-10-12T09:15:00', ref: 'INV-002', desc: 'Stock Purchase - Accessories', debit: 0, credit: 75000, balance: 175000, method: 'CREDIT', status: 'PENDING', createdBy: 'Admin' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {supplier.name} - Transaction History
          </h2>
          <p className="text-sm font-medium text-slate-500">View all debit, credit, and balance records.</p>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto bg-white dark:bg-slate-900">
        <div className="min-w-max h-full flex flex-col">
          <div className="grid grid-cols-[150px_120px_120px_250px_120px_120px_120px_150px_120px_120px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            <div>Date</div>
            <div>Txn ID</div>
            <div>Reference</div>
            <div>Description</div>
            <div className="text-right">Debit (Rs)</div>
            <div className="text-right">Credit (Rs)</div>
            <div className="text-right">Balance (Rs)</div>
            <div className="text-center">Pay Method</div>
            <div className="text-center">Status</div>
            <div>Created By</div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {txs.map((t, i) => (
              <div key={i} className="grid grid-cols-[150px_120px_120px_250px_120px_120px_120px_150px_120px_120px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.id}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.ref}</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{t.desc}</div>
                <div className="text-sm font-bold text-emerald-600 text-right">{t.debit > 0 ? t.debit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</div>
                <div className="text-sm font-bold text-red-600 text-right">{t.credit > 0 ? t.credit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</div>
                <div className="text-sm font-black text-slate-900 dark:text-white text-right">{t.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                <div className="text-center">
                  <span className="inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{t.method.replace('_', ' ')}</span>
                </div>
                <div className="text-center">
                  <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>{t.status}</span>
                </div>
                <div className="text-sm font-medium text-slate-500">{t.createdBy}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactionSort, setTransactionSort] = useState('default');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    contactPersonPhone: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Sri Lanka',
    province: '',
    category: '',
    brNumber: '',
    openingBalance: '',
    creditLimit: '',
    paymentTerms: 'CASH',
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    notes: '',
    active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerAPI.getSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingSupplier) {
        await storeOwnerAPI.updateSupplier(editingSupplier.id, formData);
        toast.success('Supplier updated successfully!');
      } else {
        await storeOwnerAPI.createSupplier(formData);
        toast.success('Supplier added successfully!');
      }
      setIsPanelOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!confirmDialog.id) return;
    try {
      setIsDeleting(true);
      await storeOwnerAPI.deleteSupplier(confirmDialog.id);
      toast.success('Supplier deleted');
      fetchSuppliers();
      setConfirmDialog({ isOpen: false, id: null });
    } catch (err) {
      toast.error('Failed to delete supplier');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddPanel = () => {
    setEditingSupplier(null);
    setFormData({
      name: '', contactPerson: '', contactPersonPhone: '', phone: '', email: '', 
      address: '', city: '', country: '', province: '',
      category: '', brNumber: '',
      openingBalance: '', creditLimit: '', paymentTerms: 'CASH',
      bankName: '', accountName: '', accountNumber: '', branch: '',
      notes: '', active: true
    });
    setIsPanelOpen(true);
  };

  const openEditPanel = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      contactPersonPhone: supplier.contactPersonPhone || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
      province: supplier.province || '',
      category: supplier.category || '',
      brNumber: supplier.brNumber || '',
      openingBalance: supplier.openingBalance || '',
      creditLimit: supplier.creditLimit || '',
      paymentTerms: supplier.paymentTerms || 'CASH',
      bankName: supplier.bankName || '',
      accountName: supplier.accountName || '',
      accountNumber: supplier.accountNumber || '',
      branch: supplier.branch || '',
      notes: supplier.notes || '',
      active: supplier.active !== undefined ? supplier.active : true
    });
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({
      name: '', contactPerson: '', contactPersonPhone: '', phone: '', email: '', 
      address: '', city: '', country: '', province: '',
      category: '', brNumber: '',
      openingBalance: '', creditLimit: '', paymentTerms: 'CASH',
      bankName: '', accountName: '', accountNumber: '', branch: '',
      notes: '', active: true
    });
  };

  const filteredSuppliers = useMemo(() => {
    let result = suppliers.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = 
        s.name?.toLowerCase().includes(q) ||
        s.contactPerson?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q);
        
        let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = s.active === true;
      if (statusFilter === 'inactive') matchesStatus = s.active === false;

      let matchesCategory = true;
      if (categoryFilter !== 'all') matchesCategory = s.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (transactionSort === 'most') {
      result.sort((a, b) => (b.transactionCount || 0) - (a.transactionCount || 0));
    } else if (transactionSort === 'least') {
      result.sort((a, b) => (a.transactionCount || 0) - (b.transactionCount || 0));
    } else {
      // default: latest transaction
      result.sort((a, b) => new Date(b.lastTransactionDate || b.createdAt).getTime() - new Date(a.lastTransactionDate || a.createdAt).getTime());
    }

    return result;
  }, [suppliers, search, statusFilter, transactionSort]);

  const kpis = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.active).length;
    const inactive = total - active;
    const recent = suppliers.filter(s => {
      const days = (new Date().getTime() - new Date(s.createdAt).getTime()) / (1000 * 3600 * 24);
      return days <= 7;
    }).length;
    return { total, active, inactive, recent };
  }, [suppliers]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Supplier Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Add, update, and manage your store's suppliers efficiently.</p>
        </div>
        
        <button 
          onClick={openAddPanel}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard 
          title="Total Suppliers" 
          value={kpis.total} 
          icon={Building2} 
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
          title="Inactive" 
          value={kpis.inactive} 
          icon={XCircle} 
          iconColorClass="text-red-600" 
          iconBgClass="bg-red-50 dark:bg-red-500/10" 
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
            placeholder="Search suppliers..."
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

      {/* ──────────────── DATA TABLE ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'fixed inset-y-0 right-0 left-[68px] z-[100] m-0 rounded-none border-none' : ''}`}>
        
        {isFullscreen && (
          <button 
            onClick={() => setIsFullscreen(false)} 
            className="absolute top-4 right-4 z-[110] p-3 bg-slate-900/50 text-white rounded-full hover:bg-slate-900/80 transition-colors backdrop-blur-md shadow-lg"
          >
            <Minimize className="w-5 h-5" />
          </button>
        )}

        {viewingSupplier ? (
          <TransactionHistoryView supplier={viewingSupplier} onBack={() => setViewingSupplier(null)} />
        ) : viewMode === 'list' ? (
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max h-full flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[250px_150px_250px_200px_150px_150px_150px_100px_100px] gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <div>Supplier Name</div>
                <div>Category & BR</div>
                <div>Contact Details</div>
                <div>Location</div>
                <div>Financial Info</div>
                <div>Bank Details</div>
                <div>Transactions</div>
                <div className="text-right">Status</div>
                <div className="text-center">Action</div>
              </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium">Loading suppliers...</p>
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <Building2 className="w-12 h-12 opacity-20" />
                  <p className="font-medium text-lg text-slate-500">No suppliers found.</p>
                </div>
              ) : (
                <>
                {filteredSuppliers.map((s) => (
                  <div key={s.id} onClick={() => setViewingSupplier(s)} className="cursor-pointer grid grid-cols-[250px_150px_250px_200px_150px_150px_150px_100px_100px] gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    
                    {/* Supplier Name */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{s.name}</h3>
                        <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                          <UserCircle className="w-3 h-3" />
                          {s.contactPerson || 'No contact person'}
                        </p>
                      </div>
                    </div>

                    {/* Category & BR */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{s.category || '-'}</span>
                      <span className="text-xs text-slate-500 truncate">BR: {s.brNumber || '-'}</span>
                    </div>

                    {/* Contact Details */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      {s.phone ? (
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 group/copy">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{s.phone}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.phone); toast.success('Phone copied!'); }}
                            className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded"
                            title="Copy Phone"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : <span className="text-xs italic text-slate-400">No phone</span>}
                      
                      {s.email ? (
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 group/copy">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{s.email}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.email); toast.success('Email copied!'); }}
                            className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1 rounded"
                            title="Copy Email"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Location */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{s.city ? `${s.city}, ${s.province}` : '-'}</span>
                      <span className="text-xs text-slate-500 truncate">{s.country || 'Sri Lanka'}</span>
                    </div>

                    {/* Financial Info */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">Limit: {s.creditLimit || '0.00'}</span>
                      <span className="text-xs text-slate-500 truncate">Terms: {s.paymentTerms || 'CASH'}</span>
                    </div>

                    {/* Bank Details */}
                    <div className="flex flex-col justify-center min-w-0 space-y-1">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{s.bankName || '-'}</span>
                      <span className="text-xs text-slate-500 truncate">{s.accountNumber || '-'}</span>
                    </div>

                    {/* Transactions */}
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{s.transactionCount || 0} Txns</p>
                          <p className="text-xs text-slate-500 truncate">{s.lastTransactionDate ? new Date(s.lastTransactionDate).toLocaleDateString() : 'No history'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-end">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                        s.active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditPanel(s); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Supplier">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Supplier">
                        <Trash2 className="w-5 h-5" />
                      </button>
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
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-medium">Loading suppliers...</p>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <Building2 className="w-12 h-12 opacity-20" />
                <p className="font-medium text-lg text-slate-500">No suppliers found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSuppliers.map((s) => (
                  <div key={s.id} onClick={() => setViewingSupplier(s)} className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col min-h-[240px]">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                        s.active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col mb-4">
                      <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate">{s.name}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate mb-3 flex items-center gap-1">
                        <UserCircle className="w-3 h-3" />
                        {s.contactPerson || 'No Contact Person'}
                      </p>
                      
                      <div className="space-y-1.5 mb-4">
                        {s.phone && (
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 group/copy">
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{s.phone}</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.phone); toast.success('Phone copied!'); }}
                              className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1"
                              title="Copy Phone"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {s.email && (
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 group/copy">
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{s.email}</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.email); toast.success('Email copied!'); }}
                              className="opacity-0 group-hover/copy:opacity-100 hover:text-blue-500 transition-colors p-1"
                              title="Copy Email"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-auto flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{s.transactionCount || 0} Transactions</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditPanel(s); }} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">
                        Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
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
        title="Filter Suppliers"
        onClear={() => { setStatusFilter('all'); setTransactionSort('default'); setCategoryFilter('all'); setIsFilterOpen(false); }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Status</label>
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Suppliers' },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive Only' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Sort by Transactions</label>
          <CustomSelect
            value={transactionSort}
            onChange={setTransactionSort}
            options={[
              { value: 'default', label: 'Last Transaction (Default)' },
              { value: 'most', label: 'Most Transactions' },
              { value: 'least', label: 'Least Transactions' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Category</label>
          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'All Categories' },
              ...Array.from(new Set(suppliers.map(s => s.category).filter(Boolean))).map(cat => ({ value: cat, label: cat }))
            ]}
          />
        </div>
      </FilterPanel>

      {/* ──────────────── SLIDE OUT PANEL FOR ADD/EDIT ──────────────── */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="supplierForm" onSubmit={handleSave} className="font-sans space-y-6">
                  
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Basic Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Supplier Name *</label>
                          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. Acme Corporation" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                          <SearchableSelect 
                            value={formData.category} 
                            onChange={v => setFormData({...formData, category: v})} 
                            options={CATEGORIES} 
                            placeholder="e.g. Electronics" 
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            BR Number
                            <div className="relative group flex items-center">
                              <Info className="w-4 h-4 text-slate-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                Business Registration
                              </div>
                            </div>
                          </label>
                          <input type="text" value={formData.brNumber} onChange={e => setFormData({...formData, brNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. PV012345" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Supplier Phone Number</label>
                          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. 011 234 5678" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. contact@acme.com" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Contact Person</label>
                          <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. John Smith" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Contact Person Phone</label>
                          <input type="text" value={formData.contactPersonPhone} onChange={e => setFormData({...formData, contactPersonPhone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. 077 123 4567" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Location Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Location
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
                        <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none" rows={2} placeholder="Street address" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Province</label>
                          <SearchableSelect 
                            value={formData.province} 
                            onChange={v => setFormData({...formData, province: v, city: ''})} 
                            options={PROVINCES} 
                            placeholder="Select Province" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">City</label>
                          <SearchableSelect 
                            value={formData.city} 
                            onChange={v => setFormData({...formData, city: v})} 
                            options={formData.province ? CITIES_BY_PROVINCE[formData.province] || [] : Object.values(CITIES_BY_PROVINCE).flat()} 
                            placeholder="Select City" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Country</label>
                        <input readOnly type="text" value={formData.country} className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 outline-none cursor-not-allowed" placeholder="e.g. Sri Lanka" />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Financial Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Banknote className="w-4 h-4" /> Financial Info
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Opening Balance</label>
                          <input type="number" value={formData.openingBalance} onChange={e => setFormData({...formData, openingBalance: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="Default 0.00" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Credit Limit</label>
                          <input type="number" value={formData.creditLimit} onChange={e => setFormData({...formData, creditLimit: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Payment Terms</label>
                        <CustomSelect 
                          value={formData.paymentTerms} 
                          onChange={v => setFormData({...formData, paymentTerms: v})} 
                          options={[
                            { value: 'CASH', label: 'Cash (Immediate)' },
                            { value: '7_DAYS', label: '7 Days' },
                            { value: '15_DAYS', label: '15 Days' },
                            { value: '30_DAYS', label: '30 Days' },
                            { value: '60_DAYS', label: '60 Days' },
                            { value: 'AFTER_SELL', label: 'After Sell' }
                          ]} 
                          label="Select Terms" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Bank Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Bank Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bank Name</label>
                          <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. Commercial Bank" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Name</label>
                          <input type="text" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. John Smith" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Number</label>
                          <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. 1234567890" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Branch</label>
                          <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" placeholder="e.g. Colombo 03" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Other Info */}
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Notes / Remarks</label>
                        <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none" rows={3} placeholder="Any additional details..." />
                      </div>
                      <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                        <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <div>
                          <span className="block text-sm font-bold text-slate-900 dark:text-white">Active Supplier</span>
                          <span className="block text-xs font-medium text-slate-500">Toggle whether this supplier is currently active.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  type="submit" 
                  form="supplierForm" 
                  disabled={isSubmitting} 
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Truck className="w-5 h-5" />
                      {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──────────────── DELETE CONFIRMATION ──────────────── */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Supplier?</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">This action cannot be undone. Are you sure you want to proceed?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDialog({isOpen: false, id: null})} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={executeDelete} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50">
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
