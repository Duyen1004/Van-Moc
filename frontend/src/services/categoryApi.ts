import { api } from "@/lib/api";
import type { Category } from "@/types/product";

export async function getCategories() {
  const { data } = await api.get<Category[]>("/categories");
  return data;
}

export async function getCategoryBySlug(slug: string) {
  const { data } = await api.get<Category>(`/categories/${slug}`);
  return data;
}
