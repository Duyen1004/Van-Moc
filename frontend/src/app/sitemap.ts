import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vanmoc.vn";

type SitemapProduct = {
  slug: string;
};

type SitemapCategory = {
  slug: string;
};

async function fetchJson<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api${path}`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    return (await response.json()) as T[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    fetchJson<SitemapProduct>("/products"),
    fetchJson<SitemapCategory>("/categories"),
  ]);

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/lang-nghe-thuy-ung",
    "/contact",
    "/policies/shipping",
    "/policies/return",
    "/policies/privacy",
    "/policies/terms",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
