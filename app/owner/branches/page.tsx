'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, MapPin, Building2, User, Users, X, 
  ChevronDown, ChevronUp, List, LayoutGrid, Maximize, Minimize, Filter,
  BarChart3, CheckCircle2, Phone, ShieldCheck, Navigation, ArrowRight, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBranchStore, Branch } from '@/lib/branch-store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { MainRightPanel } from '@/components/ui/right-panel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableEmptyState } from '@/components/ui/table-empty-state';

interface BranchesOverviewDashboardProps {
  branches: Branch[];
  setActiveTab: (tab: 'overview' | 'table') => void;
  openAdd: () => void;
  openEdit: (b: Branch) => void;
  setManagerFilter: (filter: string) => void;
}

function BranchesOverviewDashboard({
  branches,
  setActiveTab,
  openAdd,
  openEdit,
  setManagerFilter,
}: BranchesOverviewDashboardProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalBranches = branches.length;
  const withManagerCount = branches.filter(b => Boolean(b.manager)).length;
  const withContactCount = branches.filter(b => Boolean(b.contact)).length;
  const locationsCount = new Set(branches.map(b => b.location)).size;

  // Chart data: Branches distribution by Location
  const chartData = useMemo(() => {
    const locMap = new Map<string, number>();
    branches.forEach(b => {
      const loc = b.location?.split(',')[0]?.trim() || 'Central';
      locMap.set(loc, (locMap.get(loc) || 0) + 1);
    });
    return Array.from(locMap.entries()).map(([name, count]) => ({
      name,
      branches: count
    })).slice(0, 8);
  }, [branches]);

  // Top 5 Branches
  const topBranches = useMemo(() => {
    return [...branches].slice(0, 5);
  }, [branches]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-10 space-y-6">
      {/* ──────────────── 1. REUSABLE TOP 4 KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Branches" 
          value={totalBranches.toString()} 
          icon={Building2} 
          iconColorClass="text-blue-600" 
          iconBgClass="bg-blue-50 dark:bg-blue-500/10" 
        />
        <KpiCard 
          title="Active Locations" 
          value={locationsCount.toString()} 
          icon={MapPin} 
          iconColorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10" 
        />
        <KpiCard 
          title="Assigned Managers" 
          value={withManagerCount.toString()} 
          icon={User} 
          iconColorClass="text-purple-600" 
          iconBgClass="bg-purple-50 dark:bg-purple-500/10" 
        />
        <KpiCard 
          title="Contact Configured" 
          value={withContactCount.toString()} 
          icon={Phone} 
          iconColorClass="text-amber-600" 
          iconBgClass="bg-amber-50 dark:bg-amber-500/10" 
        />
      </div>

      {/* ──────────────── 2. MAIN ROW: CHART (2 Cols) + KEY BRANCHES LIST (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (h-[400px]) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Store Location & Regional Spread
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Physical POS branch network density across operational regions
              </p>
            </div>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Bar
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${chartType === 'line' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Line
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            {mounted ? (
              chartData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No branch location records available to plot chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(v: any) => [`${v} Outlets`, 'Branches']} 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="branches" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(v: any) => [`${v} Outlets`, 'Branches']} 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="branches" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 font-medium">
            <span>Total Configured Outlets</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {totalBranches} POS Branch Locations
            </span>
          </div>
        </div>

        {/* Right: Key Branch Outlets (h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Branch Outlets
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              Directory
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topBranches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No branches configured yet.
              </div>
            ) : (
              topBranches.map((branch, i) => (
                <div
                  key={branch.id}
                  onClick={() => openEdit(branch)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to edit branch"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-xs shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {branch.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {branch.location}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                    {branch.manager || 'No Mgr'}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Branch Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 INSIGHTS WIDGETS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Manager Coverage */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Leadership & Managers
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Staffing
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            <div 
              onClick={() => {
                setManagerFilter('assigned');
                setActiveTab('table');
              }}
              className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Assigned Store Managers
                </span>
                <span>{withManagerCount} Branches</span>
              </div>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                Branch operations head actively appointed
              </p>
            </div>

            <div 
              onClick={() => {
                setManagerFilter('unassigned');
                setActiveTab('table');
              }}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Unassigned Manager Roles</span>
                <span>{Math.max(0, totalBranches - withManagerCount)} Branches</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Managed directly by Owner account
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block mb-1">
                Phone Contact Directory
              </span>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80">
                {withContactCount} of {totalBranches} branches have hotline contacts saved.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Branch Table →
            </button>
          </div>
        </div>

        {/* Card 2: Regional Network Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Regional Network
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Coverage
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {branches.map(b => (
              <div
                key={b.id}
                onClick={() => openEdit(b)}
                className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group border border-slate-100 dark:border-slate-800/60"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {b.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {b.id}</span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{b.location}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Branch Table →
            </button>
          </div>
        </div>

        {/* Card 3: Quick Branch Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Multi-Branch POS System
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Active
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Centralized Synchronization
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Products, inventory, and invoices are automatically synchronized across all registered store outlets.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block mb-1">
                Expand Your Store
              </span>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mb-3">
                Quickly add another store outlet or warehouse location.
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Branch
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Branch Table →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function BranchesPage() {
  const { branches, addBranch, updateBranch, deleteBranch } = useBranchStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [managerFilter, setManagerFilter] = useState('all'); // all, assigned, unassigned
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: ''
  });

  const isMainBranch = (branch: Branch) => {
    return branch.isMain === true || (branches.length > 0 && branches[0].id === branch.id) || branch.id === 'b1';
  };

  const handleClose = () => {
    setShowDiscardConfirm(true);
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    contact: ''
  });

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    details: true,
    management: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        details: false,
        management: false,
        [section]: true
      };
    });
  };

  const filteredBranches = useMemo(() => {
    return branches.filter(b => {
      const q = search.toLowerCase();
      const matchesSearch = 
        !search ||
        b.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        (b.manager && b.manager.toLowerCase().includes(q)) ||
        (b.contact && b.contact.toLowerCase().includes(q));

      let matchesManager = true;
      if (managerFilter === 'assigned') matchesManager = Boolean(b.manager);
      if (managerFilter === 'unassigned') matchesManager = !b.manager;

      return matchesSearch && matchesManager;
    });
  }, [branches, search, managerFilter]);

  const openAdd = () => {
    setEditingBranch(null);
    try {
      const saved = localStorage.getItem('draft_branch_form');
      if (saved) {
        setFormData(JSON.parse(saved));
      } else {
        setFormData({ name: '', location: '', manager: '', contact: '' });
      }
    } catch (e) {
      setFormData({ name: '', location: '', manager: '', contact: '' });
    }
    setIsDialogOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({ 
      name: branch.name, 
      location: branch.location, 
      manager: branch.manager || '', 
      contact: branch.contact || '' 
    });
    setIsDialogOpen(true);
  };

  // Auto-save draft for new branch
  useEffect(() => {
    if (editingBranch || !isDialogOpen) return;
    const hasData = Boolean(formData.name || formData.location || formData.manager || formData.contact);
    if (hasData) {
      try {
        localStorage.setItem('draft_branch_form', JSON.stringify(formData));
      } catch (e) {}
    }
  }, [formData, editingBranch, isDialogOpen]);

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_branch_form');
    } catch (e) {}
    setFormData({ name: '', location: '', manager: '', contact: '' });
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      toast.error('Name and location are required');
      return;
    }

    if (editingBranch) {
      updateBranch(editingBranch.id, formData);
      toast.success('Branch updated successfully');
    } else {
      addBranch({
        id: 'b' + Date.now(),
        ...formData
      });
      toast.success('Branch created successfully');
    }
    try {
      localStorage.removeItem('draft_branch_form');
    } catch (e) {}
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const branch = branches.find(b => b.id === id);
    if (branch && isMainBranch(branch)) {
      toast.error('The Main Branch cannot be deleted.');
      return;
    }
    setDeleteConfirmDialog({
      isOpen: true,
      id,
      name
    });
  };

  const confirmDeleteBranch = () => {
    if (!deleteConfirmDialog.id) return;
    deleteBranch(deleteConfirmDialog.id);
    toast.success(`Branch "${deleteConfirmDialog.name}" deleted successfully`);
    setDeleteConfirmDialog({ isOpen: false, id: null, name: '' });
  };

  return (
    <div className={`font-sans flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Branch Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your store locations and branches</p>
          </div>
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Branch
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Branch Overview | Branch Table) */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0">
          <button 
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Branch Overview
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          <button 
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer ${
              activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Branch Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search branches..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (activeTab === 'overview' && e.target.value.trim() !== '') {
                  setActiveTab('table');
                }
              }}
              className="w-full bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Filter Button */}
          <button 
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-center px-3 sm:px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-1.5 font-bold text-xs cursor-pointer relative"
            title="Filter"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {managerFilter !== 'all' && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* View Mode Toggles */}
          <button 
            type="button"
            onClick={() => {
              setActiveTab('table');
              setViewMode('list');
            }}
            title="List View"
            className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          
          <button 
            type="button"
            onClick={() => {
              setActiveTab('table');
              setViewMode('grid');
            }}
            title="Grid View"
            className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />
          
          {/* Fullscreen Toggle */}
          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
            className="flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter panel dropdown */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <span className="text-xs font-bold text-slate-500">Manager:</span>
              {[
                { label: 'All', value: 'all' },
                { label: 'Assigned', value: 'assigned' },
                { label: 'Unassigned', value: 'unassigned' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setManagerFilter(opt.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    managerFilter === opt.value
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {managerFilter !== 'all' && (
                <button
                  onClick={() => setManagerFilter('all')}
                  className="text-xs text-rose-500 hover:underline font-bold ml-auto cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── CONTENT (OVERVIEW OR TABLE) ──────────────── */}
      {activeTab === 'overview' ? (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <BranchesOverviewDashboard
            branches={branches}
            setActiveTab={setActiveTab}
            openAdd={openAdd}
            openEdit={openEdit}
            setManagerFilter={setManagerFilter}
          />
        </div>
      ) : (
        /* ──────────────── DATA TABLE (CARD GRID OR LIST) ──────────────── */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
          <div className="flex-1 overflow-auto custom-scrollbar p-6">
            {filteredBranches.length === 0 ? (
              <TableEmptyState
                icon={Building2}
                title="No branches found"
                description="You haven't added any branch locations yet, or none match your search. Click below to add your first branch."
                actionLabel="Create First Branch"
                onAction={openAdd}
              />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBranches.map(branch => {
                  const isMain = isMainBranch(branch);
                  return (
                  <div key={branch.id} className="bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{branch.name}</h3>
                              {isMain && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                  Main Branch
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1 font-mono">ID: {branch.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(branch)} className="p-2 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer" title="Edit branch">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!isMain ? (
                            <button onClick={() => handleDelete(branch.id, branch.name)} className="p-2 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer" title="Delete branch">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="p-2 text-slate-300 dark:text-slate-600 cursor-not-allowed inline-flex items-center justify-center" title="Main branch cannot be deleted">
                              <Trash2 className="w-4 h-4 opacity-30" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mt-5">
                        <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                          <span>{branch.location}</span>
                        </div>
                        {(branch.manager || branch.contact) && (
                          <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                            <User className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                            <div className="text-sm">
                              {branch.manager && <div className="font-bold text-slate-900 dark:text-slate-200">{branch.manager}</div>}
                              {branch.contact && <div className="text-slate-500 font-mono text-xs mt-0.5">{branch.contact}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden w-full">
                {/* Table Header */}
                <div className="grid grid-cols-[minmax(240px,2fr)_minmax(180px,1.4fr)_minmax(140px,1.2fr)_minmax(130px,1.1fr)_120px] gap-4 h-14 px-5 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                  <div>Branch & Identity</div>
                  <div>Location & Address</div>
                  <div>Manager</div>
                  <div>Contact</div>
                  <div className="text-right pr-2">Actions</div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredBranches.map(branch => {
                    const isMain = isMainBranch(branch);
                    const isExpanded = expandedBranchId === branch.id;

                    return (
                      <div key={branch.id} className="flex flex-col">
                        <div
                          onClick={() => setExpandedBranchId(prev => prev === branch.id ? null : branch.id)}
                          className={`grid grid-cols-[minmax(240px,2fr)_minmax(180px,1.4fr)_minmax(140px,1.2fr)_minmax(130px,1.1fr)_120px] gap-4 p-4 sm:px-5 items-center transition-colors cursor-pointer group ${
                            isExpanded ? 'bg-blue-50/60 dark:bg-blue-900/15' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Col 1: Branch & Identity */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white block text-sm truncate">{branch.name}</span>
                                {isMain && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shrink-0">
                                    Main
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {branch.id}</span>
                            </div>
                          </div>

                          {/* Col 2: Location */}
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{branch.location}</span>
                          </div>

                          {/* Col 3: Manager */}
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 min-w-0">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{branch.manager || <span className="text-slate-400 font-normal italic">Unassigned</span>}</span>
                          </div>

                          {/* Col 4: Contact */}
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1.5 min-w-0">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{branch.contact || <span className="text-slate-400 font-sans italic">None</span>}</span>
                          </div>

                          {/* Col 5: Actions */}
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(branch);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                              title="Edit branch"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {!isMain ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(branch.id, branch.name);
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                                title="Delete branch"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span
                                className="p-2 text-slate-300 dark:text-slate-600 cursor-not-allowed inline-flex items-center justify-center"
                                title="Main branch cannot be deleted"
                              >
                                <Trash2 className="w-4 h-4 opacity-30" />
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedBranchId(prev => prev === branch.id ? null : branch.id);
                              }}
                              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse' : 'Expand Details'}
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Drawer */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/30 p-6"
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                      <Building2 className="w-4 h-4 text-blue-600" />
                                      Branch Location Details: {branch.name}
                                    </h4>
                                    <p className="text-xs text-slate-500">Physical address, assigned management, and terminal operations</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openEdit(branch)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                      Edit Branch
                                    </button>
                                  </div>
                                </div>

                                {/* 4 Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Branch Type</span>
                                    <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                      {isMain ? 'Headquarters / Main Branch' : 'Standard Store Outlet'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1 font-mono">ID: {branch.id}</p>
                                  </div>

                                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Operating Location</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                                      {branch.location}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1">Configured POS geo-fence</p>
                                  </div>

                                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Manager</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                      <User className="w-4 h-4 text-blue-500 shrink-0" />
                                      {branch.manager || 'No Manager Assigned'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1">Authorized store supervisor</p>
                                  </div>

                                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Primary Hotline</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5 truncate">
                                      <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                      {branch.contact || 'No phone set'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1">Receipt & communication hotline</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── SLIDE OUT PANEL ──────────────── */}
      <MainRightPanel
        isOpen={isDialogOpen}
        onClose={handleClose}
        onDiscard={handleDiscardChanges}
        title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
        subtitle={editingBranch ? 'Modify branch and location details' : 'Configure a new store location'}
        icon={Building2}
        formId="branchForm"
        isSubmitting={false}
        saveText={editingBranch ? 'Save Changes' : 'Save Branch'}
      >
        <form id="branchForm" onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Details */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('details')}
              className="w-full flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-sm"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Branch Location Details</span>
              </div>
              {openSections.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.details && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Branch Name *</label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Colombo Main Branch"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Physical Location / Address *</label>
                  <Input 
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. 123 Galle Road, Colombo 03"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Management */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('management')}
              className="w-full flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-sm"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Management & Contact</span>
              </div>
              {openSections.management ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.management && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Branch Manager</label>
                  <Input 
                    value={formData.manager}
                    onChange={e => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="e.g. Nimal Silva"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Hotline / Contact Number</label>
                  <Input 
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="e.g. +94 11 234 5678"
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </MainRightPanel>

      {/* Discard confirmation */}
      <ConfirmDialog
        isOpen={showDiscardConfirm}
        onCancel={() => setShowDiscardConfirm(false)}
        onConfirm={handleDiscardChanges}
        title="Discard Unsaved Changes?"
        message="Are you sure you want to discard your changes? Any unsaved branch information will be lost."
      />

      {/* Delete Branch Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmDialog.isOpen}
        onCancel={() => setDeleteConfirmDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDeleteBranch}
        title="Delete Branch"
        message={`Are you sure you want to delete branch "${deleteConfirmDialog.name}"? This action cannot be undone and will remove all local data associated with this branch.`}
        confirmText="Delete Branch"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
