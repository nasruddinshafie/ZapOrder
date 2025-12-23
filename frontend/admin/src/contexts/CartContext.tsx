import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { MenuItem } from '../types';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  tableId: number | null;
  addItem: (menuItem: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  updateNotes: (menuItemId: number, notes: string) => void;
  clearCart: () => void;
  setTable: (tableId: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zaporder_cart';
const TABLE_STORAGE_KEY = 'zaporder_table';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = sessionStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [tableId, setTableId] = useState<number | null>(() => {
    const stored = sessionStorage.getItem(TABLE_STORAGE_KEY);
    return stored ? Number(stored) : null;
  });

  // Persist cart to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Persist table ID to sessionStorage
  useEffect(() => {
    if (tableId !== null) {
      sessionStorage.setItem(TABLE_STORAGE_KEY, tableId.toString());
    }
  }, [tableId]);

  const addItem = (menuItem: MenuItem, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.menuItem.id === menuItem.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { menuItem, quantity, notes: '' }];
    });
  };

  const removeItem = (menuItemId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const updateNotes = (menuItemId: number, notes: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, notes } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    sessionStorage.removeItem(CART_STORAGE_KEY);
  };

  const setTable = (id: number) => {
    setTableId(id);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        tableId,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        setTable,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
