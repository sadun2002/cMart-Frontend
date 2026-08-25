import Database from '@tauri-apps/plugin-sql';

let dbInstance: Database | null = null;

export async function getDb() {
  if (typeof window === 'undefined') {
    throw new Error('Database can only be accessed in the browser/Tauri environment.');
  }

  // Check if Tauri is available. If not, return a mock database or throw a handled error
  // @ts-ignore
  if (!window.__TAURI_INTERNALS__ && !window.__TAURI__) {
    console.warn('Tauri environment not detected. Database operations will be mocked or ignored.');
    return {
      execute: async () => [],
      select: async () => [],
    } as any;
  }
  
  if (!dbInstance) {
    dbInstance = await Database.load('sqlite:cmart.db');
    
    // Initialize tables automatically on first load
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        category TEXT,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        total REAL NOT NULL,
        created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS store_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );
    `);
  }
  return dbInstance;
}

export async function initDb() {
  await getDb(); // getDb now handles initialization
}

import { encryptData, decryptData } from './local-db';

// Helper functions for settings
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const db = await getDb();
    const result = await db.select('SELECT value FROM store_settings WHERE key = ?', [key]) as {value: string}[];
    if (result && result.length > 0) {
      const decrypted = await decryptData(result[0].value);
      return decrypted !== null ? decrypted : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error('Error getting setting:', error);
    return defaultValue;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    const db = await getDb();
    const encrypted = await encryptData(value);
    await db.execute(
      'INSERT INTO store_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
      [key, encrypted, encrypted]
    );
  } catch (error) {
    console.error('Error setting setting:', error);
  }
}
