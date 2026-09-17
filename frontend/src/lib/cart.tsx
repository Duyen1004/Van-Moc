"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "vanmoc-cart";

export type CartProduct = {
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  sku?: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is CartItem => {
      return (
        item &&
        typeof item === "object" &&
        typeof (item as CartItem).slug === "string" &&
        typeof (item as CartItem).name === "string" &&
        typeof (item as CartItem).price === "number" &&
        typeof (item as CartItem).imageUrl === "string" &&
        typeof (item as CartItem).quantity === "number"
      );
    })
    .map((item) => ({ ...item, quantity: Math.max(1, Math.floor(item.quantity)) }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      setItems(normalizeItems(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]")));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("vanmoc-cart-changed"));
  }, [items]);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.slug === product.slug);

      if (!existingItem) {
        return [...currentItems, { ...product, quantity: safeQuantity }];
      }

      return currentItems.map((item) =>
        item.slug === product.slug ? { ...item, quantity: item.quantity + safeQuantity } : item,
      );
    });
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));

    setItems((currentItems) =>
      currentItems.map((item) => (item.slug === slug ? { ...item, quantity: safeQuantity } : item)),
    );
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.slug !== slug));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      totalItems,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [addItem, clearCart, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
