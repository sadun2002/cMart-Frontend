import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Branch {
  id: string;
  name: string;
  location: string;
  contact?: string;
  manager?: string;
}

interface BranchState {
  branches: Branch[];
  activeBranchId: string | null;
  setBranches: (branches: Branch[]) => void;
  setActiveBranch: (id: string) => void;
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, branch: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  getActiveBranch: () => Branch | undefined;
}

// Initial mock branches
const defaultBranches: Branch[] = [
  { id: 'b1', name: 'Colombo Main', location: '123 Galle Rd, Colombo', manager: 'Admin' },
  { id: 'b2', name: 'Kandy Branch', location: '45 Peradeniya Rd, Kandy', manager: 'Kamal Perera' },
  { id: 'b3', name: 'Galle Branch', location: '78 Fort, Galle', manager: 'Nimal Silva' },
];

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      branches: defaultBranches,
      activeBranchId: 'b1', // Default to Colombo

      setBranches: (branches) => set({ branches }),
      setActiveBranch: (id) => set({ activeBranchId: id }),
      
      addBranch: (branch) => set((state) => ({ 
        branches: [...state.branches, branch] 
      })),

      updateBranch: (id, updatedFields) => set((state) => ({
        branches: state.branches.map(b => b.id === id ? { ...b, ...updatedFields } : b)
      })),

      deleteBranch: (id) => set((state) => {
        const newBranches = state.branches.filter(b => b.id !== id);
        return {
          branches: newBranches,
          // If deleted branch was active, switch to first available
          activeBranchId: state.activeBranchId === id 
            ? (newBranches[0]?.id || null) 
            : state.activeBranchId
        };
      }),

      getActiveBranch: () => {
        const state = get();
        return state.branches.find(b => b.id === state.activeBranchId);
      }
    }),
    {
      name: 'cMart-branch-storage',
    }
  )
);
