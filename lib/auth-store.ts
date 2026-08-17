import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { setCookie, clearAuthCookies } from './api';
import { userAPI } from './api';

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
    subscription?: {
      plan: string;
      status: string;
      startDate: string;
      trialEndDate?: string;
      nextBillingDate?: string;
      endDate?: string;
    };
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
  updatePlan: (plan: string) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessName: string;
  subdomain: string;
  phone?: string;
  businessType?: string;
  plan?: string;
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

          // Refresh user data from server to get latest tenant/subscription info
          try {
            const { data } = await api.get('/auth/me');
            const me = data.data || data;
            set({ user: { ...me, type: me.adminRole ? 'super_admin' : 'user' } });
          } catch {
            // ignore me fetch failure, use payload data
          }

          // Check if tenant is pending
          if (payload.user.role === 'STORE_OWNER' && payload.user.tenant && payload.user.tenant.active === false) {
            return { redirectTo: '/pending' };
          }

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

          // Redirect to pending for new store registrations (assuming they start as inactive)
          if (payload.user.role === 'STORE_OWNER' && payload.user.tenant && payload.user.tenant.active === false) {
            return { redirectTo: '/pending' };
          }

          // Force pending for demo if backend doesn't handle it yet
          if (payload.user.role === 'STORE_OWNER' && payload.user.tenant === undefined) {
             return { redirectTo: '/pending' };
          }

          return { redirectTo: payload.redirectTo || '/pending' };
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

      updatePlan: async (plan: string) => {
        try {
          await userAPI.updatePlan(plan);
        } catch (err) {
          console.error('Failed to update plan on server:', err);
        }
        // Refresh user data from server to get latest tenant/subscription info
        try {
          const { data } = await api.get('/auth/me');
          const me = data.data || data;
          set({ user: { ...me, type: me.adminRole ? 'super_admin' : 'user' } });
        } catch {
          // fallback to local update if /me fails
          set((state) => {
            if (!state.user) return state;
            
            const updatedTenant = state.user.tenant 
              ? { ...state.user.tenant, plan } 
              : { id: 0, businessName: 'My Store', subdomain: 'store', plan, active: true };

            return {
              user: {
                ...state.user,
                tenant: updatedTenant
              }
            };
          });
        }
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
