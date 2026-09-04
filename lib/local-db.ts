import Database from '@tauri-apps/plugin-sql';
import { getHardwareFingerprint } from './hardware-fingerprint';

const DB_NAME = 'sqlite:cmart_local.db';

export async function initLocalDb() {
  const db = await Database.load(DB_NAME);
  // Create table for config if not exists
  await db.execute(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  return db;
}

// ─────────────────────────────────────────────────────────
// ENCRYPTION LAYER
// ─────────────────────────────────────────────────────────
const SALT = 'cMart_Offline_Security_Salt_2026';

async function getEncryptionKey(): Promise<CryptoKey> {
  // Use the hardware fingerprint as the base material. If unavailable, use a fallback string.
  let fingerprint = 'fallback_hardware_id';
  try {
    fingerprint = await getHardwareFingerprint();
  } catch (e) {
    console.warn('Using fallback hardware ID for encryption.');
  }

  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(fingerprint + SALT),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(text: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(text)
  );

  const cipherBytes = new Uint8Array(cipherBuffer);
  // Combine IV and Ciphertext
  const combined = new Uint8Array(iv.length + cipherBytes.length);
  combined.set(iv, 0);
  combined.set(cipherBytes, iv.length);
  
  // Base64 encode
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(encryptedBase64: string): Promise<string | null> {
  try {
    const key = await getEncryptionKey();
    const binaryStr = atob(encryptedBase64);
    const combined = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      combined[i] = binaryStr.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const cipherBytes = combined.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error('Decryption failed, data might be tampered or hardware changed.', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// SECURE CONFIG STORAGE
// ─────────────────────────────────────────────────────────
export async function getSecureConfig(key: string): Promise<string | null> {
  try {
    const db = await Database.load(DB_NAME);
    const result = await db.select<{ key: string; value: string }[]>('SELECT value FROM config WHERE key = $1', [key]);
    if (result && result.length > 0) {
      return await decryptData(result[0].value);
    }
  } catch (e) {
    console.error(`Failed to read secure config ${key}:`, e);
  }
  return null;
}

export async function setSecureConfig(key: string, value: string) {
  try {
    const db = await Database.load(DB_NAME);
    const encrypted = await encryptData(value);
    await db.execute(`
      INSERT INTO config (key, value) VALUES ($1, $2)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `, [key, encrypted]);
  } catch (e) {
    console.error(`Failed to set secure config ${key}:`, e);
  }
}

// ─────────────────────────────────────────────────────────
// LEGACY / HELPERS
// ─────────────────────────────────────────────────────────
export async function getLastSyncDate(): Promise<Date | null> {
  const val = await getSecureConfig('lastSyncDate');
  if (val) return new Date(val);
  return null;
}

export async function setLastSyncDate(date: Date) {
  await setSecureConfig('lastSyncDate', date.toISOString());
}

export async function getSubscriptionEndDate(): Promise<Date | null> {
  const val = await getSecureConfig('subscriptionEndDate');
  if (val) return new Date(val);
  return null;
}

export async function setSubscriptionEndDate(date: Date) {
  await setSecureConfig('subscriptionEndDate', date.toISOString());
}

export async function getLastSeenTimestamp(): Promise<number | null> {
  const val = await getSecureConfig('lastSeenTimestamp');
  if (val) return parseInt(val, 10);
  return null;
}

export async function setLastSeenTimestamp(ts: number) {
  await setSecureConfig('lastSeenTimestamp', ts.toString());
}

// Fallbacks for testing in browser where plugin-sql isn't available
export function isTauriEnv() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// ─────────────────────────────────────────────────────────
// OFFLINE AUTHENTICATION
// ─────────────────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const OFFLINE_USERS_KEY = 'offline_users_v1';

export async function saveOfflineUser(email: string, passwordPlain: string, userData: any, tokens: { accessToken: string; refreshToken: string }) {
  if (!isTauriEnv()) return;
  try {
    const passwordHash = await hashPassword(passwordPlain);
    let offlineUsers: Record<string, any> = {};
    const existing = await getSecureConfig(OFFLINE_USERS_KEY);
    if (existing) {
      try {
        offlineUsers = JSON.parse(existing);
      } catch (e) {}
    }
    offlineUsers[email.toLowerCase()] = {
      passwordHash,
      userData,
      tokens,
    };
    await setSecureConfig(OFFLINE_USERS_KEY, JSON.stringify(offlineUsers));
    console.log(`[Offline Auth] Saved secure credentials for ${email}`);
  } catch (err) {
    console.error('[Offline Auth] Failed to save offline user', err);
  }
}

export async function authenticateOfflineUser(email: string, passwordPlain: string): Promise<{ user: any; tokens: { accessToken: string; refreshToken: string } } | null> {
  if (!isTauriEnv()) return null;
  try {
    const existing = await getSecureConfig(OFFLINE_USERS_KEY);
    if (!existing) return null;

    const offlineUsers = JSON.parse(existing);
    const normalizedEmail = email.toLowerCase();
    const record = offlineUsers[normalizedEmail];
    
    if (!record) {
      console.warn(`[Offline Auth] No offline record found for ${email}`);
      return null;
    }

    const hash = await hashPassword(passwordPlain);
    if (record.passwordHash === hash) {
      console.log(`[Offline Auth] Successful offline login for ${email}`);
      return { user: record.userData, tokens: record.tokens };
    } else {
      console.warn(`[Offline Auth] Invalid password for ${email}`);
    }
  } catch (err) {
    console.error('[Offline Auth] Failed to authenticate offline user', err);
  }
  return null;
}
