'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Building2, User, Users, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBranchStore, Branch } from '@/lib/branch-store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { MainRightPanel } from '@/components/ui/right-panel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableEmptyState } from '@/components/ui/table-empty-state';

export default function BranchesPage() {
  const { branches, addBranch, updateBranch, deleteBranch } = useBranchStore();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

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

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

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
    if (confirm(`Are you sure you want to delete ${name}? This will affect inventory data.`)) {
      deleteBranch(id);
      toast.success('Branch deleted');
    }
  };

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden">
      {/* ──────────────── HEADER ──────────────── */}
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Add Branch
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-6">
          {/* ──────────────── SEARCH BAR ──────────────── */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative w-full sm:w-80 flex-shrink-0 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search branches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[380px]">
                <TableEmptyState
                  icon={Building2}
                  title="No branches found"
                  description="You haven't added any branch locations yet, or none match your search. Click below to add your first branch."
                  actionLabel="Create First Branch"
                  onAction={openAdd}
                />
              </div>
            ) : (
              filteredBranches.map(branch => (
                <div key={branch.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{branch.name}</h3>
                        <p className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">ID: {branch.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(branch)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      {branches.length > 1 && (
                        <button onClick={() => handleDelete(branch.id, branch.name)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="text-sm">{branch.location}</span>
                    </div>
                    {(branch.manager || branch.contact) && (
                      <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <User className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="text-sm">
                          {branch.manager && <div className="font-medium text-slate-900 dark:text-slate-300">{branch.manager}</div>}
                          {branch.contact && <div className="text-slate-500">{branch.contact}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
        className="!max-w-md"
      >
        <form id="branchForm" onSubmit={handleSubmit} className="space-y-4">
                  {/* Section 1: Branch Details */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("details")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.details ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        Branch Details
                      </span>
                      {openSections.details ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.details && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Branch Name *</label>
                              <input 
                                type="text"
                                value={formData.name} 
                                onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                                placeholder="e.g. Colombo Main" 
                                autoFocus
                                required
                                className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Location / Address *</label>
                              <input 
                                type="text"
                                value={formData.location} 
                                onChange={e => setFormData(p => ({...p, location: e.target.value}))}
                                placeholder="e.g. 123 Galle Rd" 
                                required
                                className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Section 2: Contact & Management */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => toggleSection("management")}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.management ? "rounded-t-xl" : "rounded-xl"}`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-blue-600" />
                        Contact & Management
                      </span>
                      {openSections.management ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <AnimatePresence>
                      {openSections.management && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        >
                          <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Manager Name</label>
                                <input 
                                  type="text"
                                  value={formData.manager} 
                                  onChange={e => setFormData(p => ({...p, manager: e.target.value}))}
                                  placeholder="Optional" 
                                  className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Contact No</label>
                                <input 
                                  type="text"
                                  value={formData.contact} 
                                  onChange={e => setFormData(p => ({...p, contact: e.target.value}))}
                                  placeholder="Optional" 
                                  className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
        </form>
      </MainRightPanel>

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard Changes?"
        message="Are you sure you want to discard your changes? All unsaved branch inputs will be cleared."
        confirmText="Discard"
        cancelText="Keep Editing"
        type="warning"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          setIsDialogOpen(false);
        }}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </div>
  );
}
