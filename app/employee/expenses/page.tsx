'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { 
  Banknote, Search, Plus, Trash2, LayoutGrid, List, Filter, FileText, CheckCircle, Clock, X, Maximize, Minimize, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getDb } from '@/lib/db';
import { KpiCard } from '@/components/ui/kpi-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { encryptData, decryptData } from '@/lib/local-db';

// Generate a random UUID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function ExpensesPageContent() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Water Bill', 'Electric Bill', 'Telephone Bill', 'Internet Bill', 
    'Rent', 'Maintenance', 'Salaries', 'Office Supplies', 'Marketing', 'Other'
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const db = await getDb();
      const res = await db.select('SELECT * FROM expenses ORDER BY date DESC') as any[];
      
      const decryptedExpenses = await Promise.all((res || []).map(async (exp) => {
        try {
          const description = await decryptData(exp.description) || exp.description;
          const amountStr = await decryptData(exp.amount) || exp.amount;
          const category = await decryptData(exp.category) || exp.category;
          return {
            ...exp,
            description,
            amount: isNaN(Number(amountStr)) ? exp.amount : Number(amountStr),
            category
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

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || isNaN(Number(amount))) {
      toast.error('Please provide valid description and amount');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const db = await getDb();
      const encDesc = await encryptData(desc);
      const encAmount = await encryptData(String(amount));
      const encCat = await encryptData(category);

      await db.execute(
        'INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), encDesc, encAmount, encCat, date]
      );
      toast.success('Expense added successfully!');
      setIsAddOpen(false);
      setDesc('');
      setAmount('');
      fetchExpenses();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add expense');
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
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, filterCategory]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  const thisMonthExpenses = useMemo(() => {
    return filteredExpenses.filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + Number(e.amount), 0);
  }, [filteredExpenses]);

  const avgExpense = filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length) : 0;

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
            value={`Rs. ${totalExpenses.toLocaleString()}`} 
            icon={Banknote} 
            iconColorClass="text-blue-600"
            iconBgClass="bg-blue-50 dark:bg-blue-500/10"
          />
          <KpiCard 
            title="Expense Records" 
            value={filteredExpenses.length.toString()} 
            icon={FileText} 
            iconColorClass="text-purple-600"
            iconBgClass="bg-purple-50 dark:bg-purple-500/10"
          />
          <KpiCard 
            title="This Month" 
            value={`Rs. ${thisMonthExpenses.toLocaleString()}`} 
            icon={Calendar} 
            iconColorClass="text-emerald-600"
            iconBgClass="bg-emerald-50 dark:bg-emerald-500/10"
          />
          <KpiCard 
            title="Avg Expense" 
            value={`Rs. ${avgExpense.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
            icon={CheckCircle} 
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
            placeholder="Search expenses..."
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
            {filterCategory !== 'all' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
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
            className="flex items-center justify-center w-12 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ──────────────── DATA TABLE ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>

        {/* Content */}
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
                    <th className="px-5 py-4 font-bold text-slate-500">Date</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Description</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Category</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Amount</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{exp.date}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{exp.description}</div>
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
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {filteredExpenses.map(exp => (
                <div key={exp.id} className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white truncate">{exp.description}</h4>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> {exp.date}</div>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-[10px] font-bold">
                      {exp.category}
                    </span>
                  </div>
                  <div className="pt-3 mt-auto border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-lg font-black text-gray-900 dark:text-white">Rs. {Number(exp.amount).toLocaleString()}</span>
                    <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ──────────────── SLIDE-OUT PANEL ──────────────── */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
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
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-blue-600" />
                    Add New Expense
                  </h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Record a new store expense</p>
                </div>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="expenseForm" onSubmit={handleAddExpense} className="space-y-6">
                  {/* Expense Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">Expense Details</h3>
                    
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description *</label>
                      <div className="relative mt-1.5 group">
                        <input
                          type="text"
                          required
                          value={desc}
                          onChange={e => setDesc(e.target.value)}
                          className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          placeholder="e.g. Paid electricity bill"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount (LKR) *</label>
                        <div className="relative mt-1.5 group">
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date *</label>
                        <div className="relative mt-1.5 group">
                          <input
                            type="date"
                            required
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Category *</label>
                      <CustomSelect
                        value={category}
                        onChange={setCategory}
                        options={categories.map(c => ({ value: c, label: c }))}
                      />
                    </div>
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
                    <Filter className="w-5 h-5 text-blue-600" />
                    Filters
                  </h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Refine expense list</p>
                </div>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  onClick={() => {
                    setFilterCategory('all');
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
