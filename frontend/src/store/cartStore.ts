import type { OrderItem } from "@/types/order";
import type { Product } from "@/types/product";

export type CartState = {
  items: OrderItem[];
};

export const initialCartState: CartState = {
  items: [],
};

export function addCartItem(state: CartState, product: Product, quantity = 1): CartState {
  return {
    ...state,
    items: [...state.items, { product, quantity }],
  };
}
