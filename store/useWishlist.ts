import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string; // Typically the product ID converted to string
  name: string;
  price: number;
  image: string;
  category?: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          if (state.items.find((i) => i.id === item.id)) {
            return state; // Already in wishlist
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      clearWishlist: () => {
        set({ items: [] });
      },
      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id);
      },
    }),
    {
      name: 'cmart-wishlist',
    }
  )
);
