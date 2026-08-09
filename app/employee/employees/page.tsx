'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Edit, Trash2, Mail, Phone, Calendar, Shield, MapPin, Building2, UserCircle, Briefcase, ChevronDown, CheckCircle, XCircle, Filter, X, List, LayoutGrid, Maximize, Minimize, KeyRound, Clock, UserPlus
} from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';

import { DEFAULT_ROLES } from '@/lib/roles';
import { AddEmployeePanel } from './components/AddEmployeePanel';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await storeOwnerAPI.getEmployees();
      setEmployees(res.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      setIsSubmitting(true);
      await storeOwnerAPI.createEmployee(data);
      toast.success('Employee account created successfully!');
      setIsPanelOpen(false);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddPanel = () => {
    setIsPanelOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const q = search.toLowerCase();
      const matchesSearch = 
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q);
        
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = e.active === true;
      if (statusFilter === 'inactive') matchesStatus = e.active === false;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  const kpis = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.active !== false).length;
    const recent = employees.filter(e => {
      if (!e.createdAt) return false;
      const days = (new Date().getTime() - new Date(e.createdAt).getTime()) / (1000 * 3600 * 24);
      return days <= 7;
    }).length;
    const inactive = total - active;
    return { total, active, recent, inactive };
  }, [employees]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Employee Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Add, update, and manage your cashier and staff accounts.</p>
        </div>
        
        <button 
          onClick={openAddPanel}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserPlus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* ──────────────── KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard 
          title="Total Employees" 
          value={kpis.total} 
          icon={Users} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active Accounts" 
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
          icon={UserPlus} 
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
            placeholder="Search employees..."
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

        {viewMode === 'list' ? (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <div className="col-span-4">Employee Name</div>
              <div className="col-span-3">Contact Email</div>
              <div className="col-span-3">Activity Info</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                  <p className="font-medium text-sm">Loading employees...</p>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <Shield className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium text-sm">No employees found.</p>
                </div>
              ) : (
                filteredEmployees.map((e) => (
                  <div 
                    key={e.id}
                    className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                  >
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {e.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white truncate">{e.name}</p>
                        <p className="text-xs font-bold text-blue-500 truncate flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                          <Shield className="w-3 h-3" /> CASHIER
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {e.email || 'N/A'}
                      </p>
                    </div>

                    <div className="col-span-3 space-y-1">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Joined: {formatDate(e.createdAt)}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Last Login: {e.lastLogin ? formatDate(e.lastLogin) : 'Never'}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                        e.active !== false 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${e.active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                        {e.active !== false ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Grid View */
          <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="font-medium text-sm">Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Shield className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium text-sm">No employees found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEmployees.map(e => (
                  <div 
                    key={e.id} 
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 group cursor-pointer relative"
                  >
                    <div className="absolute top-4 right-4">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1 ${
                        e.active !== false
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}>
                        {e.active !== false ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-black text-2xl mb-4">
                      {e.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <h3 className="font-black text-lg text-slate-900 dark:text-white truncate pr-16">{e.name}</h3>
                    <p className="text-xs font-bold text-blue-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-3 h-3" /> CASHIER
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4 opacity-70" />
                        <span className="truncate">{e.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(e.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last Login</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{e.lastLogin ? formatDate(e.lastLogin) : 'Never'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────────── SLIDE-OUT PANEL ──────────────── */}
      <AddEmployeePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />

      {/* ──────────────── FILTER FLYOUT ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Employees"
        onClear={() => { setStatusFilter('all'); setIsFilterOpen(false); }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white">Account Status</label>
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Employees' },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive Only' }
            ]}
          />
        </div>
      </FilterPanel>

    </div>
  );
}
