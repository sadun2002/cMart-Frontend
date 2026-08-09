'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBranchStore, Branch } from '@/lib/branch-store';
import { toast } from 'sonner';

export default function BranchesPage() {
  const { branches, addBranch, updateBranch, deleteBranch } = useBranchStore();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    contact: ''
  });

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingBranch(null);
    setFormData({ name: '', location: '', manager: '', contact: '' });
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
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will affect inventory data.`)) {
      deleteBranch(id);
      toast.success('Branch deleted');
    }
  };

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Branch Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your store locations and branches</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 shadow-sm">
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add Branch</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search branches..." 
              className="pl-11 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map(branch => (
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
            ))}
            
            {filteredBranches.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No branches found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h2>
              <button onClick={() => setIsDialogOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Branch Name *</label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                  placeholder="e.g. Colombo Main" 
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location / Address *</label>
                <Input 
                  value={formData.location} 
                  onChange={e => setFormData(p => ({...p, location: e.target.value}))}
                  placeholder="e.g. 123 Galle Rd" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Manager Name</label>
                  <Input 
                    value={formData.manager} 
                    onChange={e => setFormData(p => ({...p, manager: e.target.value}))}
                    placeholder="Optional" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Contact No</label>
                  <Input 
                    value={formData.contact} 
                    onChange={e => setFormData(p => ({...p, contact: e.target.value}))}
                    placeholder="Optional" 
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
