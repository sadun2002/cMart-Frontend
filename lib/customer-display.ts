'use client';

// Types and protocol for Cmart Customer-Facing Display (CFD)

export interface CustomerDisplayItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  discount?: number;
  image?: string;
  unit?: string;
  category?: string;
}

export interface CustomerDisplayCart {
  items: CustomerDisplayItem[];
  subtotal: number;
  discount?: number;
  discountAmount?: number;
  tax?: number;
  taxAmount?: number;
  total: number;
  totalItems: number;
  currency?: string;
  customer?: {
    name?: string;
    phone?: string;
    loyaltyPoints?: number;
  } | null;
  [key: string]: any;
}

export interface CustomerDisplayPayment {
  method: 'CASH' | 'CARD' | 'PAYHERE_QR' | string;
  total: number;
  tenderedAmount?: number;
  tendered?: number;
  change: number;
  currency?: string;
  qrCodeData?: string;
  [key: string]: any;
}

export interface CustomerDisplaySuccess {
  invoiceNo: string;
  total?: number;
  totalPaid?: number;
  tenderedAmount?: number;
  tendered?: number;
  change: number;
  paymentMethod?: string;
  itemsCount: number;
  dateStr?: string;
  currency?: string;
  customerName?: string;
  [key: string]: any;
}

export interface CustomerDisplayMedia {
  id: string;
  title: string;
  type: 'video' | 'image';
  url: string;
  duration?: number;
  active: boolean;
}

export interface CustomerDisplayConfig {
  enabled: boolean;
  autoLaunch: boolean;
  selectedMonitor: number; // 0 = auto/secondary, 1 = monitor 1, etc.
  fullscreen: boolean;
  idleTimeoutSeconds: number;
  enableAds: boolean;
  mediaPlaylist: CustomerDisplayMedia[];
  activeMediaId?: string;
  muteVideo: boolean;
  videoVolume: number;
  showItemPrices: boolean;
  showDiscounts: boolean;
  showChange: boolean;
  storeName: string;
  storeTagline: string;
  storeLogo?: string;
  theme: 'dark' | 'light' | 'match';
}

export type CustomerDisplayEvent =
  | { type: 'CART_UPDATE'; payload: CustomerDisplayCart }
  | { type: 'PAYMENT_STATE'; payload: CustomerDisplayPayment }
  | { type: 'PAYMENT_SUCCESS'; payload: CustomerDisplaySuccess }
  | { type: 'TRANSACTION_HOLD'; payload?: { orderName?: string; message?: string; currency?: string; [key: string]: any } }
  | { type: 'TRANSACTION_CANCEL'; payload?: { reason?: string; [key: string]: any } }
  | { type: 'RESET_IDLE'; payload?: any }
  | { type: 'CONFIG_UPDATE'; payload: CustomerDisplayConfig }
  | { type: 'FORCE_CLOSE'; payload?: any }
  | { type: 'PING'; payload?: any }
  | { type: 'PONG'; payload?: { ready: boolean; timestamp: number; [key: string]: any } };

export interface DisplayInfo {
  id: number;
  name?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  scale_factor: number;
  is_primary: boolean;
}

const CHANNEL_NAME = 'cmart_customer_display_v1';
const CONFIG_STORAGE_KEY = 'cmart_cfd_config_v1';
const STATE_STORAGE_KEY = 'cmart_cfd_state_v1';

export const DEFAULT_CFD_CONFIG: CustomerDisplayConfig = {
  enabled: true,
  autoLaunch: true,
  selectedMonitor: 0,
  fullscreen: true,
  idleTimeoutSeconds: 5,
  enableAds: true,
  mediaPlaylist: [
    {
      id: 'default-promo-1',
      title: 'Store Fresh Promotions & Special Deals',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: 15,
      active: true,
    }
  ],
  activeMediaId: 'default-promo-1',
  muteVideo: true,
  videoVolume: 0,
  showItemPrices: true,
  showDiscounts: true,
  showChange: true,
  storeName: 'cMart Supermarket',
  storeTagline: 'Fresh Quality • Best Prices Everyday',
  theme: 'dark',
};

// Singleton BroadcastChannel
let channelInstance: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channelInstance) {
    try {
      channelInstance = new BroadcastChannel(CHANNEL_NAME);
    } catch (err) {
      console.warn('BroadcastChannel not supported in this environment', err);
    }
  }
  return channelInstance;
}

/**
 * Broadcast an event to Customer Display
 */
export function sendCustomerDisplayEvent(event: CustomerDisplayEvent) {
  if (typeof window === 'undefined') return;

  // 1. Broadcast via HTML5 BroadcastChannel
  const ch = getChannel();
  if (ch) {
    try {
      ch.postMessage(event);
    } catch (e) {
      console.error('Failed to post to BroadcastChannel', e);
    }
  }

  // 2. Persist state snapshot to localStorage for reliable initial hydration
  try {
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify({
      event,
      timestamp: Date.now()
    }));
  } catch (e) {}

  // 3. Trigger storage event for cross-tab fallback
  try {
    window.dispatchEvent(new CustomEvent('cmart_cfd_local_event', { detail: event }));
  } catch (e) {}
}

/**
 * Subscribe to Customer Display events
 */
export function subscribeCustomerDisplayEvents(callback: (event: CustomerDisplayEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const ch = getChannel();
  const handleMessage = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      callback(e.data as CustomerDisplayEvent);
    }
  };

  if (ch) {
    ch.addEventListener('message', handleMessage);
  }

  // Listen for storage event as fallback
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STATE_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.event) callback(parsed.event);
      } catch (err) {}
    }
  };
  window.addEventListener('storage', handleStorage);

  // Listen for local custom event
  const handleCustom = (e: any) => {
    if (e.detail) callback(e.detail);
  };
  window.addEventListener('cmart_cfd_local_event', handleCustom);

  return () => {
    if (ch) {
      ch.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('cmart_cfd_local_event', handleCustom);
  };
}

/**
 * Get latest persisted state snapshot
 */
export function getLatestCustomerDisplayState(): CustomerDisplayEvent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.event || null;
  } catch (e) {
    return null;
  }
}

/**
 * Get Customer Display configuration
 */
export function getCustomerDisplayConfig(): CustomerDisplayConfig {
  if (typeof window === 'undefined') return DEFAULT_CFD_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_CFD_CONFIG;
    return { ...DEFAULT_CFD_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_CFD_CONFIG;
  }
}

/**
 * Save Customer Display configuration
 */
export function saveCustomerDisplayConfig(config: Partial<CustomerDisplayConfig>): CustomerDisplayConfig {
  if (typeof window === 'undefined') return DEFAULT_CFD_CONFIG;
  try {
    const current = getCustomerDisplayConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
    sendCustomerDisplayEvent({ type: 'CONFIG_UPDATE', payload: updated });
    return updated;
  } catch (e) {
    return DEFAULT_CFD_CONFIG;
  }
}

/**
 * Tauri desktop helpers
 */
export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).__TAURI_INTERNALS__ || (window as any).__TAURI__);
}

/**
 * Query available displays (Tauri native or browser mock)
 */
export async function getAvailableDisplays(): Promise<DisplayInfo[]> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const displays = await invoke<DisplayInfo[]>('get_available_displays');
      if (displays && displays.length > 0) return displays;
    } catch (e) {
      console.warn('Failed to invoke get_available_displays in Tauri', e);
    }
  }

  // Browser environment fallback
  return [
    {
      id: 0,
      name: 'Primary Screen (Cashier Display)',
      x: 0,
      y: 0,
      width: typeof window !== 'undefined' ? window.screen.width : 1920,
      height: typeof window !== 'undefined' ? window.screen.height : 1080,
      scale_factor: 1,
      is_primary: true,
    }
  ];
}

// IndexedDB for persistent large video/image media storage across windows
const IDB_NAME = 'cmart_cfd_db';
const IDB_STORE = 'media_blobs';

function openCFDDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function storeMediaBlob(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openCFDDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to store media blob in IndexedDB', err);
  }
}

export async function getMediaBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openCFDDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get media blob from IndexedDB', err);
    return null;
  }
}

export async function deleteMediaBlob(key: string): Promise<void> {
  try {
    const db = await openCFDDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete media blob from IndexedDB', err);
  }
}

// Active browser popup window instance
let browserPopupInstance: Window | null = null;

/**
 * Launch Customer Display window
 */
export async function launchCustomerDisplayWindow(monitorIndex?: number, fullscreen?: boolean): Promise<boolean> {
  const config = getCustomerDisplayConfig();
  const targetFullscreen = fullscreen !== undefined ? fullscreen : config.fullscreen;
  const targetIndex = monitorIndex !== undefined ? monitorIndex : config.selectedMonitor;
  const targetUrl = typeof window !== 'undefined' ? `${window.location.origin}/customer-display` : undefined;

  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const success = await invoke<boolean>('launch_customer_display', {
        url: targetUrl,
        monitorIndex: targetIndex,
        fullscreen: targetFullscreen,
      });
      if (success) return true;
    } catch (e) {
      console.warn('Tauri launch_customer_display failed, falling back to window.open', e);
    }
  }

  // Web / Browser pop-up fallback
  if (typeof window !== 'undefined') {
    const w = 1100;
    const h = 720;
    const left = (window.screen.width - w) / 2;
    const top = (window.screen.height - h) / 2;
    const pop = window.open(
      '/customer-display',
      'CmartCustomerDisplay',
      `width=${w},height=${h},left=${left},top=${top},menubar=no,status=no,toolbar=no,resizable=yes`
    );
    browserPopupInstance = pop;
    return !!pop;
  }

  return false;
}

/**
 * Close Customer Display window
 */
export async function closeCustomerDisplayWindow(): Promise<boolean> {
  let closed = false;

  // 1. Broadcast force close event across tabs / windows
  sendCustomerDisplayEvent({ type: 'FORCE_CLOSE' });

  // 2. Close Tauri desktop window if running in Tauri
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<boolean>('close_customer_display');
      if (res) closed = true;
    } catch (e) {
      console.warn('Failed to invoke close_customer_display', e);
    }

    try {
      const { Window } = await import('@tauri-apps/api/window');
      const win = await Window.getByLabel('customer-display');
      if (win) {
        await win.destroy();
        closed = true;
      }
    } catch (e) {}
  }

  // 3. Close browser popup window if opened
  if (browserPopupInstance && !browserPopupInstance.closed) {
    try {
      browserPopupInstance.close();
      closed = true;
    } catch (e) {
      console.warn('Failed to close popup instance', e);
    }
    browserPopupInstance = null;
  }

  return closed;
}

/**
 * Check if Customer Display window is currently open
 */
export async function checkCustomerDisplayActive(): Promise<boolean> {
  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const isOpen = await invoke<boolean>('is_customer_display_open');
      if (isOpen) return true;
    } catch (e) {}
  }

  if (browserPopupInstance && !browserPopupInstance.closed) {
    return true;
  }

  return false;
}
