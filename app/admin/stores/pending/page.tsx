'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Search, Filter, CheckCircle, XCircle, Mail, Phone, LayoutGrid, List, Maximize, Minimize, Copy
} from 'lucide-react';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { superAdminAPI } from '@/lib/api';

export default function ApprovalsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await superAdminAPI.getTenants();
      // Assume the backend returns data array
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    const filtered = requests.filter(req => {
      const status = req.suspended ? 'Rejected' : req.active ? 'Approved' : 'Pending';

      const bName = req.businessName || req.name || '';
      const bType = req.businessType || req.category || '';
      const owner = req.owner?.name || req.ownerName || '';
      const email = req.email || req.owner?.email || '';
      const phone = req.phone || req.owner?.phone || '';
      const domain = req.subdomain || req.requestedDomain || req.domain || '';
      const plan = req.subscription?.plan || req.plan?.name || req.plan || 'Free';
      const date = req.createdAt ? req.createdAt.split('T')[0] : '';

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !bName.toLowerCase().includes(searchLower) &&
          !owner.toLowerCase().includes(searchLower) &&
          !email.toLowerCase().includes(searchLower) &&
          !domain.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      
      if (typeFilter !== 'all' && bType.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (statusFilter !== 'all' && status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (planFilter !== 'all' && plan.toLowerCase() !== planFilter.toLowerCase()) return false;
      if (dateFilter && date !== dateFilter) return false;
      
      return true;
    });

    // Sort: Pending first, then Approved, then Rejected
    return filtered.sort((a, b) => {
      const statusA = a.suspended ? 'Rejected' : a.active ? 'Approved' : 'Pending';
      const statusB = b.suspended ? 'Rejected' : b.active ? 'Approved' : 'Pending';
      
      const order: Record<string, number> = { 'Pending': 0, 'Approved': 1, 'Rejected': 2 };
      return order[statusA] - order[statusB];
    });
  }, [requests, searchTerm, typeFilter, statusFilter, planFilter, dateFilter]);

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

  const handleStatusChange = async (id: number, newStatus: 'Approved' | 'Rejected') => {
    try {
      setProcessingId(id);
      if (newStatus === 'Approved') {
        await superAdminAPI.approveTenant(id);
        toast.success('Store Approved');
        toast.info('Email sent successfully with login details.');
      } else {
        await superAdminAPI.rejectTenant(id, 'Rejected by super admin');
        toast.success('Store Rejected');
        toast.info('Rejection email sent to the user.');
      }
      // Update local state instead of reloading everything to prevent table flash
      setRequests(prev => prev.map(req => {
        if (req.id === id) {
          return {
            ...req,
            active: newStatus === 'Approved',
            suspended: newStatus === 'Rejected'
          };
        }
        return req;
      }));
      
      if (newStatus === 'Approved') {
        // Option to redirect to store management or just let it disappear from the pending list
        // router.push('/admin/stores'); 
      }
    } catch (err) {
      toast.error(`Failed to ${newStatus.toLowerCase()} store`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="font-sans flex flex-col h-full bg-[#F4F7F6] dark:bg-slate-900 p-6 overflow-hidden">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-amber-600" />
            Approvals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Review and approve new store registrations.</p>
        </div>
      </div>

      {/* ──────────────── SEARCH BAR & FILTERS ──────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-80 flex-shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search by business, owner or domain..."
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
            {(typeFilter !== 'all' || statusFilter !== 'all' || planFilter !== 'all' || dateFilter !== '') && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600"></span>}
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
        title="Filter Approvals"
        onClose={() => setIsFilterOpen(false)}
        onClear={() => {
          setTypeFilter('all');
          setStatusFilter('all');
          setPlanFilter('all');
          setDateFilter('');
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
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
              label="Select Status"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Business Type</label>
            <CustomSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'cosmetics', label: 'Cosmetics' },
                { value: 'grocery', label: 'Grocery' },
                { value: 'clothing', label: 'Clothing' },
                { value: 'other', label: 'Other' }
              ]}
              label="Select Type"
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
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
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
                  <th className="px-5 py-4 font-bold text-slate-500">Business Details</th>
                  <th className="px-5 py-4 font-bold text-slate-500">Owner Contact</th>
                  <th className="px-5 py-4 font-bold text-slate-500">Requested Domain</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-center">Plan</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
                        <p className="font-medium text-sm">Loading requests...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.map((req) => {
                  const bName = req.businessName || req.name || 'Unknown';
                  const bType = req.businessType || req.category || 'Unknown';
                  const owner = req.owner?.name || req.ownerName || 'Unknown';
                  const email = req.email || req.owner?.email || '';
                  const phone = req.phone || req.owner?.phone || '';
                  const domain = req.subdomain || req.requestedDomain || req.domain || '';
                  const status = req.suspended ? 'Rejected' : req.active ? 'Approved' : 'Pending';
                  const plan = req.subscription?.plan || req.plan?.name || req.plan || 'Free';
                  const date = req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A';
                  
                  return (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                          {bName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{bName}</p>
                          <p className="text-xs font-medium text-slate-500">{bType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{owner}</p>
                      <div className="flex items-center gap-2 mt-1 group/item">
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {email}</span>
                        {email && <button onClick={() => handleCopy(email)} className="text-slate-400 hover:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity" title="Copy Email"><Copy className="w-3 h-3" /></button>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 group/item">
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {phone}</span>
                        {phone && <button onClick={() => handleCopy(phone)} className="text-slate-400 hover:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity" title="Copy Phone"><Copy className="w-3 h-3" /></button>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {domain}.cmart.lk
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium">
                        Requested: {date}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`}>
                        {plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {processingId === req.id ? (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-4 py-1.5 rounded-xl">
                            <div className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
                            <span className="text-xs font-bold">Processing...</span>
                          </div>
                        ) : status === 'Pending' ? (
                          <>
                            <button onClick={() => handleStatusChange(req.id, 'Approved')} disabled={processingId !== null} className={`flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-xl transition-all text-xs font-bold ${processingId !== null ? 'opacity-50 cursor-not-allowed' : ''}`} title="Approve">
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button onClick={() => handleStatusChange(req.id, 'Rejected')} disabled={processingId !== null} className={`flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl transition-all text-xs font-bold ${processingId !== null ? 'opacity-50 cursor-not-allowed' : ''}`} title="Reject">
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${status === 'Approved' || status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                            {status === 'Approved' || status === 'Active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{status}</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
                {!loading && filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-bold text-lg text-slate-900 dark:text-white">No requests found</p>
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
                <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
                <p className="font-medium text-sm">Loading requests...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRequests.map((req) => {
                  const bName = req.businessName || req.name || 'Unknown';
                  const bType = req.businessType || req.category || 'Unknown';
                  const owner = req.owner?.name || req.ownerName || 'Unknown';
                  const email = req.email || req.owner?.email || '';
                  const phone = req.phone || req.owner?.phone || '';
                  const domain = req.subdomain || req.requestedDomain || req.domain || '';
                  const status = req.suspended ? 'Rejected' : req.active ? 'Approved' : 'Pending';
                  const plan = req.subscription?.plan || req.plan?.name || req.plan || 'Free';
                  
                  return (
                  <div key={req.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
                        {bName.charAt(0)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {status !== 'Pending' && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${status === 'Approved' || status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                            {status}
                          </span>
                        )}
                        <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {plan}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{bName}</h3>
                    <div className="text-sm font-medium text-slate-500 mt-0.5 mb-3">{bType}</div>
                    
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-4 truncate bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl">
                      {domain}.cmart.lk
                    </div>
                    
                    <div className="space-y-3 mb-5 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Owner</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{owner}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-2 group/item">
                          <Mail className="w-3.5 h-3.5" /> {email}
                          {email && <button onClick={() => handleCopy(email)} className="text-slate-400 hover:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity" title="Copy Email"><Copy className="w-3.5 h-3.5" /></button>}
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-2 group/item">
                          <Phone className="w-3.5 h-3.5" /> {phone}
                          {phone && <button onClick={() => handleCopy(phone)} className="text-slate-400 hover:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity" title="Copy Phone"><Copy className="w-3.5 h-3.5" /></button>}
                        </span>
                      </div>
                    </div>
                    
                    {processingId === req.id ? (
                      <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50 justify-center">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 py-2.5">
                          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
                          <span className="text-xs font-bold">Processing...</span>
                        </div>
                      </div>
                    ) : status === 'Pending' && (
                      <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <button onClick={() => handleStatusChange(req.id, 'Approved')} disabled={processingId !== null} className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors ${processingId !== null ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleStatusChange(req.id, 'Rejected')} disabled={processingId !== null} className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors ${processingId !== null ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )})}
              </div>
            )}
            {!loading && filteredRequests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <CheckCircle className="w-16 h-16 mb-4 text-slate-300" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">No requests found</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 text-center max-w-md">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
