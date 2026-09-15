import type { Product } from "@/types/product";

export type OrderItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  code: string;
  items: OrderItem[];
  status: "pending" | "paid" | "shipping" | "completed" | "cancelled";
  total: number;
};
