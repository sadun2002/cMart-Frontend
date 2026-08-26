import { getDb } from './db';
import axios from 'axios';
import { API_BASE_URL } from './constants';
import { useAuthStore } from './auth-store';

export async function performBulkSync(): Promise<boolean> {
  try {
    const db = await getDb();
    
    // 1. Fetch unsynced data
    const categories = await db.select('SELECT * FROM categories WHERE synced = 0') as any[];
    const products = await db.select('SELECT * FROM products WHERE synced = 0') as any[];
    const sales = await db.select('SELECT * FROM sales WHERE synced = 0') as any[];
    const sale_items = await db.select('SELECT * FROM sale_items WHERE synced = 0') as any[];
    const expenses = await db.select('SELECT * FROM expenses WHERE synced = 0') as any[];
    const settings = await db.select('SELECT * FROM store_settings') as any[];

    if (categories.length === 0 && products.length === 0 && sales.length === 0 && expenses.length === 0) {
      console.log('No data to sync.');
      return true; // Nothing to sync
    }

    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      throw new Error('Authentication required for cloud sync');
    }

    const payload = {
      categories,
      products,
      sales,
      sale_items,
      expenses,
      settings
    };

    // 2. Send to backend
    const response = await axios.post(`${API_BASE_URL}/sync/bulk`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (response.data?.success) {
      // 3. Mark as synced locally
      // For SQLite we need to update each table
      if (categories.length > 0) {
        await db.execute(`UPDATE categories SET synced = 1 WHERE synced = 0`);
      }
      if (products.length > 0) {
        await db.execute(`UPDATE products SET synced = 1 WHERE synced = 0`);
      }
      if (sales.length > 0) {
        await db.execute(`UPDATE sales SET synced = 1 WHERE synced = 0`);
      }
      if (sale_items.length > 0) {
        await db.execute(`UPDATE sale_items SET synced = 1 WHERE synced = 0`);
      }
      if (expenses.length > 0) {
        await db.execute(`UPDATE expenses SET synced = 1 WHERE synced = 0`);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Bulk sync failed:', error);
    throw error;
  }
}
