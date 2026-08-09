'use client';

import { useState, useMemo } from 'react';
import { 
  Shield, ShieldCheck, UserPlus, Search, Edit2, Trash2, 
  Check, X, AlertCircle, Save, PlusCircle, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { 
  Role, PermissionAction, MODULES, DEFAULT_ROLES 
} from '@/lib/roles';

export default function RolesAndPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [search, setSearch] = useState('');
  
  // Selection
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0].id);
  
  // Editing Permissions State (draft)
  const [draftPermissions, setDraftPermissions] = useState<Record<string, PermissionAction[]>>(roles[0].permissions);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  // Sync draft permissions when selected role changes
  const selectedRole = useMemo(() => roles.find(r => r.id === selectedRoleId) || roles[0], [roles, selectedRoleId]);

  const handleSelectRole = (id: string) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved permission changes. Discard them?")) return;
    }
    setSelectedRoleId(id);
    const role = roles.find(r => r.id === id);
    if (role) {
      setDraftPermissions(JSON.parse(JSON.stringify(role.permissions)));
      setHasUnsavedChanges(false);
    }
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) || 
      r.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);

  const togglePermission = (moduleId: string, action: PermissionAction) => {
    if (selectedRole.isSystem && selectedRole.id === 'role-1') {
      toast.error("System Administrator permissions cannot be modified.");
      return;
    }

    setDraftPermissions(prev => {
      const currentModulePerms = prev[moduleId] || [];
      const newModulePerms = currentModulePerms.includes(action)
        ? currentModulePerms.filter(a => a !== action)
        : [...currentModulePerms, action];
      
      return { ...prev, [moduleId]: newModulePerms };
    });
    setHasUnsavedChanges(true);
  };

  const savePermissions = () => {
    setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, permissions: draftPermissions } : r));
    setHasUnsavedChanges(false);
    toast.success(`Permissions updated for ${selectedRole.name}`);
  };

  const openAddRole = () => {
    setEditingRole(null);
    setRoleFormData({ name: '', description: '' });
    setIsRoleModalOpen(true);
  };

  const openEditRole = (e: React.MouseEvent, role: Role) => {
    e.stopPropagation();
    if (role.isSystem) {
      toast.error("System roles cannot be renamed.");
      return;
    }
    setEditingRole(role);
    setRoleFormData({ name: role.name, description: role.description });
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = (e: React.MouseEvent, roleId: string) => {
    e.stopPropagation();
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast.error("System roles cannot be deleted.");
      return;
    }
    setRoleToDelete(roleId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRole = () => {
    if (!roleToDelete) return;
    setRoles(prev => prev.filter(r => r.id !== roleToDelete));
    if (selectedRoleId === roleToDelete) {
      handleSelectRole(roles[0].id);
    }
    toast.success("Role deleted successfully.");
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const saveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name.trim() || !roleFormData.description.trim()) {
      toast.error("Role name and description are required.");
      return;
    }

    if (editingRole) {
      setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, name: roleFormData.name, description: roleFormData.description } : r));
      toast.success("Role updated successfully.");
    } else {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleFormData.name,
        description: roleFormData.description,
        permissions: {},
        isSystem: false
      };
      setRoles(prev => [...prev, newRole]);
      toast.success("Role created successfully.");
      setSelectedRoleId(newRole.id);
      setDraftPermissions({});
      setHasUnsavedChanges(false);
    }
    setIsRoleModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full p-4 sm:p-8">
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Roles & Permissions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Manage employee access levels and system capabilities.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={openAddRole}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="w-5 h-5" />
            Add Custom Role
          </button>
        </div>
      </div>

      {/* ──────────────── MAIN SPLIT VIEW ──────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 gap-6 min-h-[600px]">
        
        {/* LEFT PANEL: ROLES LIST */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-[600px] lg:h-auto">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-10 h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl text-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400 outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
            {filteredRoles.map(role => {
              const isSelected = role.id === selectedRoleId;
              return (
                <div 
                  key={role.id}
                  onClick={() => handleSelectRole(role.id)}
                  className={`relative flex flex-col p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' 
                      : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                      {role.name}
                    </h3>
                    {!role.isSystem && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: isSelected ? 1 : undefined }}>
                        <button onClick={(e) => openEditRole(e, role)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => handleDeleteRole(e, role.id)} className="p-1.5 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {role.isSystem && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">System</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pr-8">{role.description}</p>
                </div>
              );
            })}
            {filteredRoles.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-sm font-medium">No roles found.</div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: PERMISSIONS MATRIX */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-[600px] lg:h-auto relative">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                {selectedRole?.name}
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Configure Module Access</p>
            </div>
            
            <button
              onClick={savePermissions}
              disabled={!hasUnsavedChanges}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                hasUnsavedChanges 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 hover:-translate-y-0.5' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {hasUnsavedChanges ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </button>
          </div>

          {/* Matrix */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            {selectedRole?.isSystem && selectedRole.id === 'role-1' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex gap-3 text-blue-800 dark:text-blue-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">System Administrator has unrestricted access to all modules. These permissions cannot be modified.</p>
              </div>
            )}

            <div className="font-sans space-y-6">
              {MODULES.map(module => {
                const activeActions = draftPermissions[module.id] || [];
                return (
                  <div key={module.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50/80 dark:bg-slate-800/40 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{module.name}</h3>
                    </div>
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white dark:bg-slate-900">
                      {['view', 'create', 'edit', 'delete'].map(action => {
                        const isAvailable = module.actions.includes(action as PermissionAction);
                        const isGranted = activeActions.includes(action as PermissionAction);
                        
                        if (!isAvailable) {
                          return (
                            <div key={action} className="flex items-center gap-3 opacity-40 select-none grayscale">
                              <div className="w-9 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center shrink-0">
                                <div className="w-3.5 h-3.5 rounded-full bg-white translate-x-0.5 shadow-none" />
                              </div>
                              <span className="text-sm font-medium text-slate-400 capitalize">{action}</span>
                            </div>
                          );
                        }

                        return (
                          <label key={action} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input 
                                type="checkbox"
                                checked={isGranted}
                                onChange={() => togglePermission(module.id, action as PermissionAction)}
                                className="peer sr-only"
                              />
                              <div className={`w-9 h-5 rounded-full transition-colors flex items-center shrink-0 border ${
                                isGranted 
                                  ? 'bg-blue-600 border-blue-600' 
                                  : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                              }`}>
                                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                  isGranted ? 'translate-x-4' : 'translate-x-0.5'
                                }`} />
                              </div>
                            </div>
                            <span className={`text-sm font-bold capitalize transition-colors ${
                              isGranted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {action}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── ADD/EDIT ROLE MODAL ──────────────── */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsRoleModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {editingRole ? 'Edit Role' : 'Create Custom Role'}
                </h2>
                <button onClick={() => setIsRoleModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={saveRole} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      required
                      autoFocus
                      value={roleFormData.name}
                      onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                      placeholder="e.g. Weekend Supervisor"
                      className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-sm text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      rows={3}
                      value={roleFormData.description}
                      onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                      placeholder="Briefly describe the responsibilities..."
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm text-slate-900 dark:text-white transition-all resize-none"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!roleFormData.name.trim()}
                    className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete Role"
        message="Are you sure you want to delete this custom role? This action cannot be undone."
        confirmText="Delete Role"
        onConfirm={confirmDeleteRole}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
      />
    </div>
  );
}
