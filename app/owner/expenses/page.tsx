'use client';

import { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { 
  Banknote, Search, Plus, Trash2, LayoutGrid, List, Filter, FileText, CheckCircle, Clock, X, Maximize, Minimize, Calendar, Lock, Upload, Eye, File as FileIcon, Download, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getDb } from '@/lib/db';
import { KpiCard } from '@/components/ui/kpi-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { encryptData, decryptData } from '@/lib/local-db';
import { useAuthStore } from '@/lib/auth-store';
import { useBranchStore } from '@/lib/branch-store';
import { storeOwnerAPI } from '@/lib/api';

// Generate a random UUID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const EXPENSE_CATEGORIES = {
  'Utilities': ['Electricity', 'Water', 'Internet', 'Telephone'],
  'Operations': ['Rent', 'Maintenance', 'Transport', 'Office Supplies'],
  'Marketing': ['Facebook Ads', 'Printing', 'Promotions', 'Marketing'],
  'Financial': ['Tax', 'Bank Charges', 'Insurance'],
  'Other': ['Salary', 'Software / Subscription', 'Other']
};

const FLAT_CATEGORIES = Object.values(EXPENSE_CATEGORIES).flat();

function ExpensesPageContent() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Filter States
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all'); // all, today, this_month, last_month
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterVendor, setFilterVendor] = useState('all');
  
  // Auth & External Data
  const user = useAuthStore(state => state.user);
  const isStartup = user?.tenant?.plan?.toUpperCase() === 'STARTUP';
  const branches = useBranchStore(state => state.branches);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Rent');
  const [type, setType] = useState('One-time');
  const [frequency, setFrequency] = useState('Monthly');
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidFromAccount, setPaidFromAccount] = useState('Cash Drawer');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({ basic: true, payment: true, additional: true });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState('');

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // View Modal State
  const [viewingExpense, setViewingExpense] = useState<any | null>(null);

  useEffect(() => {
    fetchExpenses();
    if (!isStartup) {
      storeOwnerAPI.getSuppliers().then(res => setSuppliers(res.data || res)).catch(console.error);
    }
  }, [isStartup]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const db = await getDb();
      const res = await db.select('SELECT * FROM expenses ORDER BY date DESC') as any[];
      
      const decryptedExpenses = await Promise.all((res || []).map(async (exp) => {
        try {
          const name = await decryptData(exp.name) || exp.name;
          const description = await decryptData(exp.description) || exp.description;
          const amountStr = await decryptData(exp.amount) || exp.amount;
          const category = await decryptData(exp.category) || exp.category;
          const taxStr = exp.tax ? await decryptData(exp.tax) : '0';
          const paidFromAccount = exp.paidFromAccount ? await decryptData(exp.paidFromAccount) : '';
          const notes = exp.notes ? await decryptData(exp.notes) : '';
          const attachment = exp.attachment ? await decryptData(exp.attachment) : '';

          return {
            ...exp,
            name: name || description,
            amount: isNaN(Number(amountStr)) ? exp.amount : Number(amountStr),
            category,
            tax: isNaN(Number(taxStr)) ? 0 : Number(taxStr),
            paidFromAccount,
            notes,
            attachment
          };
        } catch {
          return exp;
        }
      }));
      
      setExpenses(decryptedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setAttachment(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setName('');
    setCategory('Rent');
    setType('One-time');
    setFrequency('Monthly');
    setAmount('');
    setTax('');
    setPaymentStatus('Paid');
    setPaymentMethod('Cash');
    setPaidFromAccount('Cash Drawer');
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setVendorId('');
    setBranchId('');
    setNotes('');
    setAttachment('');
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || isNaN(Number(amount))) {
      toast.error('Please provide valid expense name and amount');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const db = await getDb();
      const encName = await encryptData(name);
      const encDesc = await encryptData(name); // fallback for older schema
      const encAmount = await encryptData(String(amount));
      const encCat = await encryptData(category);
      
      const encTax = await encryptData(String(tax || 0));
      const encPaidFrom = await encryptData(paidFromAccount);
      const encNotes = await encryptData(notes);
      const encAttachment = await encryptData(attachment);

      await db.execute(
        `INSERT INTO expenses (
          id, name, description, amount, category, date, 
          type, recurringFrequency, tax, dueDate, paymentStatus, paymentMethod, 
          paidFromAccount, vendorId, branchId, notes, attachment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(), encName, encDesc, encAmount, encCat, date,
          type, type === 'Recurring' ? frequency : null, encTax, dueDate || null, paymentStatus, paymentMethod,
          encPaidFrom, vendorId || null, user?.branchId || 1, encNotes, encAttachment
        ]
      );
      toast.success('Expense added successfully!');
      setIsAddOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add expense. Ensure database migration ran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const db = await getDb();
      await db.execute('DELETE FROM expenses WHERE id = ?', [id]);
      toast.success('Expense deleted');
      setViewingExpense(null);
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = (e.name || e.description || '').toLowerCase().includes(search.toLowerCase()) || 
                            e.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || e.paymentStatus === filterStatus;
      const matchesMethod = filterMethod === 'all' || e.paymentMethod === filterMethod;
      const matchesBranch = filterBranch === 'all' || e.branchId === filterBranch;
      const matchesVendor = filterVendor === 'all' || e.vendorId === filterVendor;
      
      let matchesDate = true;
      if (filterDateRange !== 'all') {
        const d = new Date(e.date);
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const dateStr = d.toISOString().split('T')[0];
        
        if (filterDateRange === 'today') {
          matchesDate = dateStr === todayStr;
        } else if (filterDateRange === 'this_month') {
          matchesDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } else if (filterDateRange === 'last_month') {
          let lastMonth = now.getMonth() - 1;
          let year = now.getFullYear();
          if (lastMonth < 0) {
            lastMonth = 11;
            year -= 1;
          }
          matchesDate = d.getMonth() === lastMonth && d.getFullYear() === year;
        }
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesMethod && matchesBranch && matchesVendor && matchesDate;
    });
  }, [expenses, search, filterCategory, filterStatus, filterMethod, filterBranch, filterVendor, filterDateRange]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  const thisMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const lastMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      let lastMonth = now.getMonth() - 1;
      let year = now.getFullYear();
      if (lastMonth < 0) {
        lastMonth = 11;
        year -= 1;
      }
      return d.getMonth() === lastMonth && d.getFullYear() === year;
    }).reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const recurringExpensesTotal = useMemo(() => {
    return filteredExpenses.filter(e => e.type === 'Recurring').reduce((sum, e) => sum + Number(e.amount), 0);
  }, [filteredExpenses]);

  const monthDiff = thisMonthExpenses - lastMonthExpenses;
  const isMonthHigher = monthDiff > 0;
  const isMonthLower = monthDiff < 0;

  return (
    <div className={`flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 ${isFullscreen ? 'p-0 fixed inset-0 z-50' : 'p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Banknote className="w-8 h-8 text-blue-600" />
              Expenses Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Track and manage your store expenses.
            </p>
          </div>
          
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>
      )}

      {/* ──────────────── KPI CARDS ──────────────── */}
      {!isFullscreen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard 
            title="Total Expenses" 
            value={`Rs. ${totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
            icon={Banknote} 
            iconColorClass="text-blue-600"
            iconBgClass="bg-blue-50 dark:bg-blue-500/10"
          />
          <KpiCard 
            title="This Month vs Last" 
            value={
              <div className="flex items-center gap-2">
                Rs. {thisMonthExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}
                {isMonthHigher && <span className="text-sm font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">+Rs. {monthDiff.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>}
                {isMonthLower && <span className="text-sm font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">-Rs. {Math.abs(monthDiff).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>}
                {!isMonthHigher && !isMonthLower && <span className="text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">No Change</span>}
              </div>
            } 
            icon={FileText} 
            iconColorClass="text-purple-600"
            iconBgClass="bg-purple-50 dark:bg-purple-500/10"
          />
          <KpiCard 
            title="This Month" 
            value={`Rs. ${thisMonthExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
            icon={Calendar} 
            iconColorClass="text-emerald-600"
            iconBgClass="bg-emerald-50 dark:bg-emerald-500/10"
          />
          <KpiCard 
            title="Recurring Expenses" 
            value={`Rs. ${recurringExpensesTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
            icon={RefreshCw} 
            iconColorClass="text-orange-600"
            iconBgClass="bg-orange-50 dark:bg-orange-500/10"
          />
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
            placeholder="Search expense ID, name, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden flex-shrink-0 sm:ml-auto">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-2 font-bold relative"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {(filterCategory !== 'all' || filterStatus !== 'all' || filterMethod !== 'all' || filterDateRange !== 'all') && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <List className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center justify-center w-12 h-full rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center justify-center w-12 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ──────────────── DATA TABLE ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="font-sans h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Banknote className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No expenses found</h3>
              <p className="text-gray-500 dark:text-slate-400 max-w-sm">
                You haven't recorded any expenses yet, or none match your search.
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="min-w-full inline-block align-middle">
              <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider z-10 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-bold text-slate-500">Expense ID</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Date</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Expense Name</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Category</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Amount</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Status</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} onClick={() => setViewingExpense(exp)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {exp.id ? `EXP-${exp.id.substring(0,6).toUpperCase()}` : 'EXP-UNKNOWN'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{exp.date}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{exp.name || exp.description}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs font-bold tracking-wide">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-slate-900 dark:text-white text-right">
                        Rs. {Number(exp.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${
                          exp.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          exp.paymentStatus === 'Unpaid' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {exp.paymentStatus || 'Paid'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setViewingExpense(exp); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {filteredExpenses.map(exp => (
                <div key={exp.id} onClick={() => setViewingExpense(exp)} className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white truncate">{exp.name || exp.description}</h4>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> {exp.date}</div>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-[10px] font-bold">
                      {exp.category}
                    </span>
                  </div>
                  <div className="pt-3 mt-auto border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-lg font-black text-gray-900 dark:text-white">Rs. {Number(exp.amount).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                      exp.paymentStatus === 'Paid' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {exp.paymentStatus || 'Paid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ──────────────── VIEW EXPENSE DETAILS MODAL ──────────────── */}
      <AnimatePresence>
        {viewingExpense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingExpense(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[210] border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    {viewingExpense.id ? `EXP-${viewingExpense.id.substring(0,6).toUpperCase()}` : 'EXP-UNKNOWN'}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[280px]">
                    {viewingExpense.name || viewingExpense.description}
                  </h2>
                </div>
                <button onClick={() => setViewingExpense(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Amount</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">Rs. {Number(viewingExpense.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                    viewingExpense.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    viewingExpense.paymentStatus === 'Unpaid' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {viewingExpense.paymentStatus || 'Paid'}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Category:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{viewingExpense.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Type:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {viewingExpense.type || 'One-time'} 
                        {viewingExpense.type === 'Recurring' && ` (${viewingExpense.recurringFrequency})`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Date:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{viewingExpense.date}</span>
                    </div>
                    {viewingExpense.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Due Date:</span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">{viewingExpense.dueDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Payment Method:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{viewingExpense.paymentMethod || 'Cash'}</span>
                    </div>
                    {viewingExpense.paidFromAccount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Paid From:</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{viewingExpense.paidFromAccount}</span>
                      </div>
                    )}
                    {viewingExpense.vendorId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Vendor:</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {suppliers.find(s => String(s.id) === viewingExpense.vendorId)?.name || `Vendor #${viewingExpense.vendorId}`}
                        </span>
                      </div>
                    )}
                    {viewingExpense.branchId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Branch:</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {branches.find(b => String(b.id) === viewingExpense.branchId)?.name || `Branch #${viewingExpense.branchId}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {viewingExpense.notes && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">Description</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{viewingExpense.notes}</p>
                    </div>
                  </div>
                )}

                {viewingExpense.attachment && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Attachment</h3>
                    {viewingExpense.attachment.startsWith('data:image') ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                        <img src={viewingExpense.attachment} alt="Receipt" className="w-full object-cover" />
                      </div>
                    ) : (
                      <a href={viewingExpense.attachment} download="receipt" className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group">
                        <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                          <FileIcon className="w-6 h-6" />
                          <span className="font-bold text-sm">View Receipt Document</span>
                        </div>
                        <Download className="w-5 h-5 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
                <button 
                  onClick={() => handleDelete(viewingExpense.id)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-red-600 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──────────────── ADD EXPENSE SLIDE-OUT PANEL ──────────────── */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
            />
            
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[210] border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-blue-600" />
                    Add New Expense
                  </h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Record a new business expense</p>
                </div>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="expenseForm" onSubmit={handleAddExpense} className="space-y-6 font-sans">
                  
                  {/* 1. Basic Information */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl relative z-30">
                    <button 
                      type="button" 
                      onClick={() => toggleSection('basic')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none rounded-t-xl"
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Basic Information</span>
                      {openSections.basic ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.basic && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expense Name <span className="text-red-500">*</span></label>
                              <input
                                required
                                autoFocus
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                                placeholder="e.g. Electricity Bill"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                                <CustomSelect 
                                  value={category} 
                                  onChange={setCategory} 
                                  label="Select Category" 
                                  options={FLAT_CATEGORIES.map(c => ({ value: c, label: c }))} 
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expense Type</label>
                                <CustomSelect 
                                  value={type} 
                                  onChange={setType} 
                                  label="Select Type" 
                                  options={[
                                    { value: 'One-time', label: 'One-time' },
                                    { value: 'Recurring', label: 'Recurring' }
                                  ]} 
                                />
                              </div>
                            </div>

                            {type === 'Recurring' && (
                              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Frequency <span className="text-red-500">*</span></label>
                                <CustomSelect 
                                  value={frequency} 
                                  onChange={setFrequency} 
                                  label="Select Frequency" 
                                  options={[
                                    { value: 'Daily', label: 'Daily' },
                                    { value: 'Weekly', label: 'Weekly' },
                                    { value: 'Monthly', label: 'Monthly' },
                                    { value: 'Yearly', label: 'Yearly' }
                                  ]} 
                                />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 2. Amount & Payment Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl relative z-20">
                    <button 
                      type="button" 
                      onClick={() => toggleSection('payment')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none rounded-t-xl"
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Amount & Payment Details</span>
                      {openSections.payment ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.payment && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount <span className="text-red-500">*</span></label>
                                <input
                                  type="number"
                                  required
                                  min="0"
                                  step="0.01"
                                  value={amount}
                                  onChange={e => setAmount(e.target.value)}
                                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                                  placeholder="Rs. 15,000"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tax / VAT (Optional)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={tax}
                                  onChange={e => setTax(e.target.value)}
                                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                                  placeholder="Rs. 0.00"
                                />
                              </div>
                            </div>

                            <div className="p-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl flex justify-between items-center">
                              <span className="font-bold text-slate-700 dark:text-slate-300">Total Amount</span>
                              <span className="text-2xl font-black text-slate-900 dark:text-white">
                                Rs. {(Number(amount || 0) + Number(tax || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</label>
                                <CustomSelect 
                                  value={paymentStatus} 
                                  onChange={setPaymentStatus} 
                                  label="Select Status" 
                                  options={[
                                    { value: 'Paid', label: 'Paid' },
                                    { value: 'Unpaid', label: 'Unpaid' },
                                    { value: 'Partially Paid', label: 'Partially Paid' }
                                  ]} 
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Method</label>
                                <CustomSelect 
                                  value={paymentMethod} 
                                  onChange={setPaymentMethod} 
                                  label="Select Method" 
                                  options={[
                                    { value: 'Cash', label: 'Cash' },
                                    { value: 'Card', label: 'Card' },
                                    { value: 'Bank Transfer', label: 'Bank Transfer' },
                                    { value: 'Cheque', label: 'Cheque' },
                                    { value: 'Other', label: 'Other' }
                                  ]} 
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Paid From</label>
                                <CustomSelect 
                                  value={paidFromAccount} 
                                  onChange={setPaidFromAccount} 
                                  label="Select Account" 
                                  options={[
                                    { value: 'Cash Drawer', label: 'Cash Drawer' },
                                    { value: 'Main Bank', label: 'Main Bank' },
                                    { value: 'Petty Cash', label: 'Petty Cash' }
                                  ]} 
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. Additional Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-xl relative z-10">
                    <button 
                      type="button" 
                      onClick={() => toggleSection('additional')}
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none rounded-t-xl"
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Additional Details</span>
                      {openSections.additional ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.additional && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-500">
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expense Date <span className="text-red-500">*</span></label>
                                <input
                                  type="date"
                                  required
                                  value={date}
                                  onChange={e => setDate(e.target.value)}
                                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Due Date (Optional)</label>
                                <input
                                  type="date"
                                  value={dueDate}
                                  onChange={e => setDueDate(e.target.value)}
                                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Vendor / Payee
                              </label>
                              <CustomSelect 
                                value={vendorId} 
                                onChange={setVendorId} 
                                label="Select Vendor"
                                locked={isStartup}
                                onLockedClick={() => {
                                  setUpgradeFeatureName('Vendor Management');
                                  setIsUpgradeModalOpen(true);
                                }}
                                options={[
                                  { value: '', label: '-- None --' },
                                  ...suppliers.map(s => ({ value: s.id.toString(), label: s.name }))
                                ]} 
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description / Notes</label>
                              <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full p-4 min-h-[100px] bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white resize-y"
                                placeholder="e.g. August electricity bill for main branch"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Attach Receipt / Bill</label>
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                  attachment 
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700'
                                }`}
                              >
                                {attachment ? (
                                  <>
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">File Attached Successfully</span>
                                    <span className="text-xs text-slate-500 mt-1">Click to replace</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Click to upload bill</span>
                                    <span className="text-xs text-slate-400 mt-1">JPG, PNG, PDF up to 5MB</span>
                                  </>
                                )}
                              </div>
                              <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".jpg,.jpeg,.png,.pdf" 
                                onChange={handleFileUpload}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>

              {/* Panel Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    form="expenseForm"
                    disabled={isSubmitting}
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Banknote className="w-5 h-5" />
                        Save Expense
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ──────────────── FILTER SLIDE-OUT PANEL ──────────────── */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
            />
            
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[210] border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    Filters
                  </h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Refine expense list</p>
                </div>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Date Range</label>
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                  >
                    <option value="all">All Categories</option>
                    {FLAT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Payment Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Payment Method</label>
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                  >
                    <option value="all">All Methods</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                {!isStartup && branches.length > 0 && (
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Branch</label>
                    <select
                      value={filterBranch}
                      onChange={(e) => setFilterBranch(e.target.value)}
                      className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                    >
                      <option value="all">All Branches</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterStatus('all');
                    setFilterMethod('all');
                    setFilterDateRange('all');
                    setFilterBranch('all');
                    setFilterVendor('all');
                    setSearch('');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureName={upgradeFeatureName} 
      />
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-8">Loading...</div>}>
      <ExpensesPageContent />
    </Suspense>
  );
}
