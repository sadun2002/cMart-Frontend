import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { setCookie, clearAuthCookies } from './api';

// ============================================================
// cMart — Auth Zustand Store
// ============================================================

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;           // STORE_OWNER | EMPLOYEE | super_admin
  adminRole?: string;     // SUPER_ADMIN | ADMIN | SUPPORT
  type: 'super_admin' | 'user';
  tenantId?: number;
  avatar?: string;
  tenant?: {
    id: number;
    businessName: string;
    subdomain: string;
    plan: string;
    active: boolean;
  };
  permissions?: Record<string, boolean>;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<{ redirectTo: string }>;
  register: (data: RegisterData) => Promise<{ redirectTo: string }>;
  logout: () => void;
  loadMe: () => Promise<void>;
  setTokens: (access: string, refresh: string) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessName: string;
  subdomain: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const payload = data.data || data;

          // Persist tokens in cookies (for middleware)
          setCookie('accessToken', payload.accessToken, 15 / (24 * 60));
          setCookie('refreshToken', payload.refreshToken, 7);
          setCookie('userRole', payload.user.role, 7);
          setCookie('userType', payload.user.type || (payload.user.adminRole ? 'super_admin' : 'user'), 7);

          set({
            user: { ...payload.user, type: payload.user.adminRole ? 'super_admin' : 'user' },
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            isLoading: false,
          });

          return { redirectTo: payload.redirectTo };
        } catch (err: any) {
          set({ isLoading: false });
          const message = err.response?.data?.message || 'Login failed';
          throw new Error(message);
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { data: res } = await api.post('/auth/register', data);
          const payload = res.data || res;

          setCookie('accessToken', payload.accessToken, 15 / (24 * 60));
          setCookie('refreshToken', payload.refreshToken, 7);
          setCookie('userRole', payload.user.role, 7);
          setCookie('userType', 'user', 7);

          set({
            user: { ...payload.user, type: 'user' },
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            isLoading: false,
          });

          return { redirectTo: payload.redirectTo };
        } catch (err: any) {
          set({ isLoading: false });
          const message = err.response?.data?.message || 'Registration failed';
          throw new Error(message);
        }
      },

      logout: () => {
        clearAuthCookies();
        set({ user: null, accessToken: null, refreshToken: null });
      },

      loadMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get('/auth/me');
          const user = data.data || data;
          set({ user: { ...user, type: user.adminRole ? 'super_admin' : 'user' }, isLoading: false });
        } catch {
          get().logout();
          set({ isLoading: false });
        }
      },

      setTokens: (access, refresh) => {
        setCookie('accessToken', access, 15 / (24 * 60));
        setCookie('refreshToken', refresh, 7);
        set({ accessToken: access, refreshToken: refresh });
      },
    }),
    {
      name: 'cmart-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
