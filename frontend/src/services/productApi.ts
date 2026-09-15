import { api } from "@/lib/api";
import type { Product } from "@/types/product";

export async function getProducts() {
  const { data } = await api.get<Product[]>("/products");
  return data;
}

export async function getProductBySlug(slug: string) {
  const { data } = await api.get<Product>(`/products/${slug}`);
  return data;
}
