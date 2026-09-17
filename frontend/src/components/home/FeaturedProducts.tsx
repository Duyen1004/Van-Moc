"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiProduct, formatVnd, getProducts } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const fallbackProducts = [
  {
    name: "Lược sừng tự nhiên VM01",
    price: "350.000đ",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85",
    href: "/products/luoc-sung-tu-nhien-vm01",
    personalizable: true,
  },
  {
    name: "Trâm cài vân sừng",
    price: "420.000đ",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
    href: "/products/tram-cai-van-sung",
    personalizable: true,
  },
  {
    name: "Bộ quà tặng Vân Mộc",
    price: "690.000đ",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85",
    href: "/products/bo-qua-tang-van-moc",
    personalizable: true,
  },
  {
    name: "Lược bỏ túi thủ công",
    price: "280.000đ",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
    href: "/products/luoc-bo-tui-thu-cong",
    personalizable: true,
  },
];

export function FeaturedProducts() {
  const { t } = useI18n();
  const featured = t.home.featured;
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    getProducts()
      .then((items) => setApiProducts(items.slice(0, 8)))
      .catch(() => setApiProducts([]));
  }, []);

  const products =
    apiProducts.length > 0
      ? apiProducts.map((product) => ({
          name: product.name,
          price: formatVnd(product.price),
          image: product.imageUrl,
          href: `/products/${product.slug}`,
          personalizable: product.personalizable,
        }))
      : fallbackProducts;

  return (
    <section className="bg-pearl px-5 py-14 md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase text-horn">{featured.eyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl text-bark md:text-4xl">{featured.title}</h2>
        </div>

        <div className="mt-9 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article className="group" key={product.name}>
              <Link className="block overflow-hidden rounded-lg bg-sand" href={product.href}>
                <img
                  alt={product.name}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                  src={product.image}
                />
              </Link>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase text-horn">
                  {product.personalizable ? featured.personalizable : featured.handcrafted}
                </p>
                <h3 className="mt-2 min-h-10 text-base font-semibold text-bark">
                  <Link className="transition hover:text-wood" href={product.href}>
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-3 text-sm font-semibold text-wood">{product.price}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    aria-label={featured.addToCart}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-clay/60 text-bark transition hover:border-wood hover:bg-sand"
                    title={featured.addToCart}
                    type="button"
                  >
                    <ShoppingCart className="size-4" />
                  </button>
                  <Link
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-wood px-4 text-xs font-semibold uppercase tracking-wide text-ivory transition hover:bg-bark"
                    href="/checkout"
                  >
                    {featured.buy}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
