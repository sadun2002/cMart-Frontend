import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './constants';

// ============================================================
// cMart — Axios API Client
// Handles: auth headers, token refresh, error normalization
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Helper to fallback to localStorage if cookie is missing (Tauri WebView2 fix)
const getLocalToken = (key: 'accessToken' | 'refreshToken' | 'storefrontAccessToken' | 'storefrontRefreshToken') => {
  let token = getCookie(key);
  if (!token && typeof window !== 'undefined') {
    try {
      const stateStr = localStorage.getItem('cmart-auth');
      if (stateStr) {
        const state = JSON.parse(stateStr).state;
        if (state && state[key]) {
          token = state[key];
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }
  return token;
};

// ─── Request Interceptor — attach token ───────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookie or localStorage (fallback for Tauri)
    if (typeof window !== 'undefined') {
      const token = getLocalToken('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        hasToken: !!token,
        tokenPrefix: token ? token.substring(0, 10) + '...' : 'none',
        isFormData: config.data instanceof FormData
      });
      
      // Let Axios set the correct Content-Type with boundary for FormData
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — handle 401 token refresh ─────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response) {
      if (error.response.status === 401) {
        console.warn(`[API Auth] 401 on ${originalRequest?.url} - attempting refresh or redirect`);
      } else {
        console.error(`[API Error] ${error.response.status} on ${originalRequest?.url}`, error.response.data);
      }
    } else {
      console.error(`[API Network/Unknown Error] Request failed for ${originalRequest?.url}:`, error.message);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getLocalToken('refreshToken');
      if (!refreshToken) {
        clearAuthCookies();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data || data;

        setCookie('accessToken', accessToken, 15 / (24 * 60)); // 15 min
        setCookie('refreshToken', newRefreshToken, 7);           // 7 days

        // Sync with local storage for Tauri
        if (typeof window !== 'undefined') {
          try {
            const stateStr = localStorage.getItem('cmart-auth');
            if (stateStr) {
              const parsed = JSON.parse(stateStr);
              parsed.state.accessToken = accessToken;
              parsed.state.refreshToken = newRefreshToken;
              localStorage.setItem('cmart-auth', JSON.stringify(parsed));
              window.dispatchEvent(new Event('storage')); // trigger cross-tab sync just in case
            }
          } catch (e) {}
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthCookies();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Storefront Isolated API Instance ──────────────────────
export const storefrontApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

storefrontApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = getCookie('storefrontAccessToken');
      console.log('[Storefront Request] Using Token:', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// To prevent infinite refresh loops
let isStorefrontRefreshing = false;
let storefrontFailedQueue: any[] = [];

const processStorefrontQueue = (error: any, token: string | null = null) => {
  storefrontFailedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  storefrontFailedQueue = [];
};

storefrontApi.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    console.warn('[Storefront Response] Status:', error.response?.status, 'URL:', originalRequest.url);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isStorefrontRefreshing) {
        return new Promise((resolve, reject) => {
          storefrontFailedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return storefrontApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isStorefrontRefreshing = true;

      const refreshToken = getCookie('storefrontRefreshToken');
      if (!refreshToken) {
        deleteCookie('storefrontAccessToken');
        deleteCookie('storefrontRefreshToken');
        // Let the UI handle redirect
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data || data;

        setCookie('storefrontAccessToken', accessToken, 15 / (24 * 60));
        setCookie('storefrontRefreshToken', newRefreshToken, 7);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processStorefrontQueue(null, accessToken);
        return storefrontApi(originalRequest);
      } catch (refreshError) {
        processStorefrontQueue(refreshError, null);
        deleteCookie('storefrontAccessToken');
        deleteCookie('storefrontRefreshToken');
        return Promise.reject(refreshError);
      } finally {
        isStorefrontRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Cookie helpers ─────────────────────────────────────────
export function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function clearAuthCookies() {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  deleteCookie('userRole');
  deleteCookie('userType');
}

export function clearStorefrontAuthCookies() {
  deleteCookie('storefrontAccessToken');
  deleteCookie('storefrontRefreshToken');
}

// ─── API Endpoints (Phase 3) ───────────────────────────────

export const storeOwnerAPI = {
  // Online Orders & Customers
  getOnlineOrders: () => api.get('/storefront/admin/orders'),
  getOnlineCustomers: () => api.get('/storefront/admin/customers'),
  updateOnlineOrder: (id: number, data: { status?: string; paymentStatus?: string }) => api.patch(`/storefront/admin/orders/${id}`, data),
  deleteOnlineOrder: (id: number) => api.delete(`/storefront/admin/orders/${id}`),

  // Branches
  getBranches: () => api.get('/branches'),
  createBranch: (data: any) => api.post('/branches', data),
  updateBranch: (id: number, data: any) => api.patch(`/branches/${id}`, data),
  deleteBranch: (id: number) => api.delete(`/branches/${id}`),

  // Inventory
  getBranchInventory: (branchId: number) => api.get(`/inventory/branch/${branchId}`),
  stockAdjustment: (branchId: number, data: any) => api.post(`/inventory/branch/${branchId}/adjust`, data),

  // Categories
  getCategories: () => api.get('/categories'),
  getFlatCategories: () => api.get('/categories/flat'),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: number, data: any) => api.patch(`/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/categories/${id}`),

  // Brands
  getBrands: () => api.get('/brands'),
  createBrand: (data: any) => api.post('/brands', data),
  updateBrand: (id: number, data: any) => api.patch(`/brands/${id}`, data),
  deleteBrand: (id: number) => api.delete(`/brands/${id}`),

  // Products
  getProducts: () => api.get('/products'),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: number, data: any) => api.patch(`/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/products/${id}`),

  // Customers
  getCustomers: (search?: string) => api.get(search ? `/customers?search=${search}` : '/customers'),
  createCustomer: (data: any) => api.post('/customers', data),
  updateCustomer: (id: number, data: any) => api.patch(`/customers/${id}`, data),
  deleteCustomer: (id: number) => api.delete(`/customers/${id}`),

  // Sales (POS)
  createSale: (data: any) => api.post('/sales', data),
  getRecentSales: () => api.get('/sales'),

  // Employees
  getEmployees: () => api.get('/employees'),
  createEmployee: (data: any) => api.post('/employees', data),

  // Suppliers
  getSuppliers: (search?: string) => api.get(search ? `/suppliers?search=${search}` : '/suppliers'),
  createSupplier: (data: any) => api.post('/suppliers', data),
  updateSupplier: (id: number, data: any) => api.patch(`/suppliers/${id}`, data),
  deleteSupplier: (id: number) => api.delete(`/suppliers/${id}`),
};

export const employeeAPI = {
  // Attendance
  checkIn: () => api.post('/attendance/checkin'),
  checkOut: () => api.post('/attendance/checkout'),
  getMyAttendance: () => api.get('/attendance/me'),

  // POS / Sales (Reuses endpoints but as an employee)
  getProducts: () => api.get('/products'),
  createSale: (data: any) => api.post('/sales', data),
  getMySales: () => api.get('/sales/me'), 
};

// ─── Super Admin (Company) Endpoints ────────────────────────
export const userAPI = {
  updatePlan: (plan: string) => api.patch('/auth/plan', { plan }),
  getBillingHistory: () => api.get('/auth/billing-history'),
};

export const superAdminAPI = {
  // Tenants (Stores)
  getTenants: () => api.get('/admin/stores'),
  suspendTenant: (id: number, reason?: string) => api.patch(`/admin/stores/${id}/status`, { suspend: true, reason }),
  activateTenant: (id: number) => api.patch(`/admin/stores/${id}/status`, { suspend: false }),
  approveTenant: (id: number) => api.patch(`/admin/stores/${id}/status`, { suspend: false }),
  rejectTenant: (id: number, reason?: string) => api.patch(`/admin/stores/${id}/status`, { suspend: true, reason }),

  // Themes
  getThemes: () => api.get('/themes/all'),
  createTheme: (data: any) => api.post('/themes', data),
  toggleThemeStatus: (id: number | string, isActive: boolean) => api.patch(`/themes/${id}/status`, { isActive }),
  
  // Platform Metrics
  getDashboardMetrics: () => api.get('/admin/metrics'),
};

export const storefrontAuthAPI = {
  login: (data: any) => storefrontApi.post('/auth/login', data),
  registerCustomer: (data: any) => storefrontApi.post('/auth/register-customer', data),
};

export const storefrontAPI = {
  getProfile: () => storefrontApi.get('/storefront/profile'),
  getOrders: () => storefrontApi.get('/storefront/orders'),
  createOrder: (data: any) => storefrontApi.post('/storefront/orders', data),
  cancelOrder: (id: number) => storefrontApi.patch(`/storefront/orders/${id}/cancel`),
  returnOrder: (id: number) => storefrontApi.patch(`/storefront/orders/${id}/return`),
  getAddresses: () => storefrontApi.get('/storefront/addresses'),
  addAddress: (data: any) => storefrontApi.post('/storefront/addresses', data),
  deleteAddress: (id: number) => storefrontApi.delete(`/storefront/addresses/${id}`),
  getCards: () => storefrontApi.get('/storefront/cards'),
  addCard: (data: any) => storefrontApi.post('/storefront/cards', data),
  deleteCard: (id: number) => storefrontApi.delete(`/storefront/cards/${id}`),
};

export default api;
