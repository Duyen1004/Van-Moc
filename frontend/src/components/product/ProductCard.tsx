import type { Product } from "@/types/product";

type ProductCardProps = {
  product?: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return <article className="border p-4">{product?.name ?? "Product"}</article>;
}
