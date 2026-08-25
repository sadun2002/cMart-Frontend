'use client';
import { useState, useMemo, useEffect } from 'react';
import { 
  Store, Search, Filter, MoreVertical, Edit, Ban, 
  CheckCircle, ArrowUpRight, ShieldAlert, Globe, LayoutGrid, List, Maximize, Minimize,
  Plus, ExternalLink, Calendar, MapPin, X
} from 'lucide-react';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await superAdminAPI.getTenants();
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      // Store management should only show non-pending stores (Active or Suspended)
      setStores(data.filter((s: any) => {
        const status = s.suspended ? 'Suspended' : s.active ? 'Active' : 'Pending';
        return status !== 'Pending';
      }));
    } catch (err) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const bName = store.businessName || store.name || '';
      const owner = store.owner?.name || store.ownerName || '';
      const email = store.email || store.owner?.email || '';
      const status = store.suspended ? 'Suspended' : store.active ? 'Active' : 'Pending';
      const plan = store.subscription?.plan || store.plan?.name || store.plan || 'Free';

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !bName.toLowerCase().includes(searchLower) &&
          !owner.toLowerCase().includes(searchLower) &&
          !email.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      
      if (statusFilter !== 'all' && status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (planFilter !== 'all' && plan.toLowerCase() !== planFilter.toLowerCase()) return false;
      
      return true;
    });
  }, [stores, searchTerm, statusFilter, planFilter]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Store className="w-8 h-8 text-blue-600" />
            Store Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage and monitor all tenant stores.</p>
        </div>
        
        <button 
          onClick={() => window.open('/register', '_blank')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Add Store
        </button>
      </div>

      {/* ──────────────── SEARCH BAR & FILTERS ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            {(statusFilter !== 'all' || planFilter !== 'all') && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
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

      {/* Filter Panel */}
      <FilterPanel 
        isOpen={isFilterOpen}
        title="Filter Stores"
        onClose={() => setIsFilterOpen(false)}
        onClear={() => {
          setStatusFilter('all');
          setPlanFilter('all');
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' }
              ]}
              label="Select Status"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Plan</label>
            <CustomSelect
              value={planFilter}
              onChange={setPlanFilter}
              options={[
                { value: 'all', label: 'All Plans' },
                { value: 'free', label: 'Free' },
                { value: 'pro', label: 'Pro' },
                { value: 'enterprise', label: 'Enterprise' }
              ]}
              label="Select Plan"
            />
          </div>
        </div>
      </FilterPanel>

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
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
              <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4 font-bold text-slate-500">Store Name</th>
                  <th className="px-5 py-4 font-bold text-slate-500">Owner</th>
                  <th className="px-5 py-4 font-bold text-slate-500">Requested Domain</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-center">Plan</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-center">Status</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-center">Joined</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                        <p className="font-medium text-sm">Loading stores...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStores.map((store) => {
                  const bName = store.businessName || store.name || 'Unknown';
                  const owner = store.owner?.name || store.ownerName || 'Unknown';
                  const domain = store.requestedDomain || store.domain || '';
                  const status = store.status || 'Active';
                  const plan = store.plan?.name || store.plan || 'Free';
                  const joined = store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'N/A';
                  
                  return (
                  <tr key={store.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          status === 'Active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                          status === 'Pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                          'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                          {bName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{bName}</p>
                          <p className="text-xs font-medium text-slate-500">ID: {store.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{owner}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{store.email || store.owner?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {domain}.cmart.lk
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium">
                        Requested: {joined}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                        plan === 'PRO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {status === 'Active' && <CheckCircle className="w-3.5 h-3.5" />}
                        {status === 'Pending' && <CheckCircle className="w-3.5 h-3.5" />}
                        {status === 'Suspended' && <Ban className="w-3.5 h-3.5" />}
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                      {joined}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-xl transition-all" title="View Store">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition-all" title="Edit Settings">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl transition-all" title="Suspend Store">
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
                {!loading && filteredStores.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Store className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-bold text-lg text-slate-900 dark:text-white">No stores found</p>
                        <p className="text-sm font-medium mt-1">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                 <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                 <p className="font-medium text-sm">Loading stores...</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStores.map((store) => {
                  const bName = store.businessName || store.name || 'Unknown';
                  const owner = store.owner?.name || store.ownerName || 'Unknown';
                  const domain = store.requestedDomain || store.domain || '';
                  const status = store.status || 'Active';
                  const plan = store.plan?.name || store.plan || 'Free';
                  const joined = store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'N/A';

                  return (
                  <div key={store.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                        status === 'Active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        status === 'Pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        {bName.charAt(0)}
                      </div>
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                        plan === 'PRO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {plan}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate pr-6">{bName}</h3>
                    
                    <div className="flex items-center gap-2 mt-1 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {status === 'Active' && <CheckCircle className="w-3 h-3" />}
                        {status === 'Pending' && <CheckCircle className="w-3 h-3" />}
                        {status === 'Suspended' && <Ban className="w-3 h-3" />}
                        {status}
                      </span>
                    </div>
                    
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 flex flex-col mb-5 truncate bg-blue-50 dark:bg-blue-500/10 p-2.5 rounded-xl border border-blue-100 dark:border-blue-500/20">
                      <span>{domain}.cmart.lk</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Requested: {joined}</span>
                    </div>
                    
                    <div className="space-y-2 mb-5 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Owner</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{owner}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Products</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{store.products || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Branches</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{store.branches || 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <button className="flex-1 py-2 flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </button>
                      <button className="flex-1 py-2 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button className="p-2 flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
            {!loading && filteredStores.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <Store className="w-16 h-16 mb-4 text-slate-300" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">No stores found</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 text-center max-w-md">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
