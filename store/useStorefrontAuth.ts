import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearStorefrontAuthCookies } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface StorefrontAuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const useStorefrontAuth = create<StorefrontAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => {
        clearStorefrontAuthCookies();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'cmart-storefront-auth',
    }
  )
);
