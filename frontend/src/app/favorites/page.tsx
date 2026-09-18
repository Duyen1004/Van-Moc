"use client";

import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const FAVORITE_PRODUCTS_KEY = "vanmoc-favorite-products";

type FavoriteProduct = {
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  sku: string;
  likedAt: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    style: "currency",
  }).format(value);
}

function getStoredFavorites() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITE_PRODUCTS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    return Array.from(
      new Map(
        (parsed as FavoriteProduct[])
          .filter((item) => item && typeof item.slug === "string" && item.slug.trim())
          .map((item) => [item.slug, item]),
      ).values(),
    );
  } catch {
    return [];
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

  useEffect(() => {
    const storedFavorites = getStoredFavorites();
    setFavorites(storedFavorites);
    window.localStorage.setItem(FAVORITE_PRODUCTS_KEY, JSON.stringify(storedFavorites));
  }, []);

  const removeFavorite = (slug: string) => {
    const nextFavorites = favorites.filter((item) => item.slug !== slug);
    setFavorites(nextFavorites);
    window.localStorage.setItem(FAVORITE_PRODUCTS_KEY, JSON.stringify(nextFavorites));
    window.dispatchEvent(new Event("vanmoc-favorites-changed"));
  };

  return (
    <main className="bg-ivory px-5 py-16 text-bark md:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-sand pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay">Yêu thích</p>
            <h1 className="mt-3 font-serif text-5xl font-bold text-bark">Sản phẩm đã thích</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-horn">
              Những sản phẩm bạn bấm trái tim sẽ được lưu lại tại đây để xem nhanh và mua sau.
            </p>
          </div>
          <Link className="inline-flex h-11 items-center justify-center rounded-full border border-clay/35 px-5 text-sm font-bold text-wood transition hover:bg-sand" href="/products">
            Tiếp tục mua hàng
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl rounded-lg border border-clay/20 bg-pearl p-8 text-center shadow-[0_20px_70px_rgba(86,53,31,0.08)]">
            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Heart className="size-7" />
            </span>
            <h2 className="mt-5 font-serif text-3xl font-semibold text-bark">Chưa có sản phẩm yêu thích</h2>
            <p className="mt-3 text-sm leading-7 text-horn">Hãy mở chi tiết sản phẩm và bấm biểu tượng trái tim để lưu lại.</p>
            <Link className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-wood px-6 text-sm font-bold text-ivory transition hover:bg-bark" href="/products">
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((item) => (
              <article className="overflow-hidden rounded-lg border border-clay/20 bg-pearl shadow-[0_16px_40px_rgba(86,53,31,0.08)]" key={item.slug}>
                <Link className="block overflow-hidden bg-sand" href={`/products/${item.slug}`}>
                  <img alt={item.name} className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105" src={item.imageUrl} />
                </Link>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase text-horn">{item.sku}</p>
                  <Link className="mt-2 block font-serif text-2xl font-semibold text-bark transition hover:text-wood" href={`/products/${item.slug}`}>
                    {item.name}
                  </Link>
                  <p className="mt-3 text-lg font-bold text-wood">{formatCurrency(item.price)}</p>
                  <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                    <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-wood px-4 text-sm font-bold text-ivory transition hover:bg-bark" href={`/products/${item.slug}`}>
                      <ShoppingBag className="size-4" />
                      Xem chi tiết
                    </Link>
                    <button
                      aria-label={`Xóa ${item.name} khỏi yêu thích`}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50"
                      onClick={() => removeFavorite(item.slug)}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
