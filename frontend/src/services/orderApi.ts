import { api } from "@/lib/api";
import type { Order } from "@/types/order";

export async function getOrderByCode(code: string) {
  const { data } = await api.get<Order>(`/orders/${code}`);
  return data;
}

export async function createOrder(payload: unknown) {
  const { data } = await api.post<Order>("/orders", payload);
  return data;
}
