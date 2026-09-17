"use client";

import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { ApiCategory, ApiProduct, ApiReview, formatVnd, getCategories, getProducts, getReviews } from "@/lib/api";

const fallbackCategories = [
  { id: 0, name: "Tất cả", slug: "all", description: "", imageUrl: "", status: "ACTIVE" },
  { id: 1, name: "Lược sừng", slug: "luoc-sung", description: "", imageUrl: "", status: "ACTIVE" },
  { id: 2, name: "Trâm cài", slug: "tram-cai", description: "", imageUrl: "", status: "ACTIVE" },
  { id: 3, name: "Trang sức", slug: "trang-suc", description: "", imageUrl: "", status: "ACTIVE" },
  { id: 4, name: "Quà tặng", slug: "qua-tang", description: "", imageUrl: "", status: "ACTIVE" },
];

const fallbackProducts = [
  {
    id: 1,
    sku: "VM-LS-001",
    name: "Lược sừng tự nhiên VM01",
    slug: "luoc-sung-tu-nhien-vm01",
    categoryName: "Lược sừng",
    categorySlug: "luoc-sung",
    price: 350000,
    stockQuantity: 18,
    status: "AVAILABLE",
    personalizable: true,
    imageUrl: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    sku: "VM-TC-001",
    name: "Trâm cài vân sừng",
    slug: "tram-cai-van-sung",
    categoryName: "Trâm cài",
    categorySlug: "tram-cai",
    price: 420000,
    stockQuantity: 9,
    status: "AVAILABLE",
    personalizable: true,
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    sku: "VM-QT-001",
    name: "Bộ quà tặng Vân Mộc",
    slug: "bo-qua-tang-van-moc",
    categoryName: "Quà tặng",
    categorySlug: "qua-tang",
    price: 690000,
    stockQuantity: 4,
    status: "AVAILABLE",
    personalizable: true,
    imageUrl: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85",
  },
];

const fallbackReviews = [
  {
    id: 1,
    customerName: "Nguyễn An",
    rating: 5,
    title: "Vân đẹp và cầm chắc tay",
    content: "Lược cầm rất thích, phần khắc tên sắc nét và hộp quà chỉn chu.",
    productName: "Lược sừng tự nhiên VM01",
  },
  {
    id: 2,
    customerName: "Linh",
    rating: 5,
    title: "Trâm nhẹ và sang",
    content: "Dáng trâm mảnh, màu vân ngoài đời ấm hơn ảnh.",
    productName: "Trâm cài vân sừng",
  },
];

function ProductCard({ product }: { product: ApiProduct }) {
  const { addItem } = useCart();
  const productHref = `/products/${product.slug}`;

  return (
    <article className="group">
      <Link className="block overflow-hidden rounded-lg bg-sand" href={productHref}>
        <img
          alt={product.name}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
          src={product.imageUrl}
        />
      </Link>
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-horn">
          {product.personalizable ? "Có thể khắc tên" : "Sản phẩm thủ công"}
        </p>
        <h3 className="mt-2 min-h-10 text-base font-semibold text-bark">
          <Link className="transition hover:text-wood" href={productHref}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-3 text-sm font-semibold text-wood">{formatVnd(product.price)}</p>
        <p className="mt-1 text-xs text-horn">{product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sản phẩm` : "Hết hàng"}</p>
        <div className="mt-3 flex items-center gap-2">
          <button
            aria-label="Thêm vào giỏ hàng"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-clay/60 text-bark transition hover:border-wood hover:bg-sand"
            onClick={() =>
              addItem({
                slug: product.slug,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                sku: product.sku,
              })
            }
            type="button"
          >
            <ShoppingCart className="size-4" />
          </button>
          <Link
            className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-wood px-4 text-xs font-semibold uppercase tracking-wide text-ivory transition hover:bg-bark"
            href="/checkout"
          >
            Mua hàng
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<ApiCategory[]>(fallbackCategories);
  const [products, setProducts] = useState<ApiProduct[]>(fallbackProducts);
  const [reviews, setReviews] = useState<ApiReview[]>(fallbackReviews);

  useEffect(() => {
    Promise.all([getCategories(), getProducts(), getReviews()])
      .then(([categoryItems, productItems, reviewItems]) => {
        setCategories([fallbackCategories[0], ...categoryItems]);
        setProducts(productItems);
        setReviews(reviewItems);
      })
      .catch(() => {
        setCategories(fallbackCategories);
        setProducts(fallbackProducts);
        setReviews(fallbackReviews);
      });
  }, []);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products;
    }

    return products.filter((product) => product.categorySlug === activeCategory);
  }, [activeCategory, products]);

  const bestSeller = products[0] ?? fallbackProducts[0];
  const newArrivals = [...products].reverse();

  return (
    <main className="bg-ivory">
      <section className="bg-linen px-5 py-12 md:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[0.8fr_1fr_0.8fr]">
          <button className="mx-auto hidden size-16 items-center justify-center rounded-full bg-wood/70 text-ivory transition hover:bg-wood md:flex" type="button">
            <ChevronLeft className="size-7" />
          </button>

          <div className="rounded-lg bg-[#b7aa9e] px-8 py-12 text-center shadow-[0_20px_55px_rgba(45,33,24,0.14)]">
            <p className="font-sans text-2xl font-extrabold uppercase text-bark">Bán chạy</p>
            <div className="mx-auto mt-9 max-w-sm">
              <Link className="text-base font-semibold text-bark transition hover:text-wood" href={`/products/${bestSeller.slug}`}>
                {bestSeller.name}
              </Link>
              <div className="mt-2 flex justify-center gap-1 text-wood">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star className="size-4 fill-current" key={index} />
                ))}
              </div>
              <p className="mt-2 font-bold text-bark">{formatVnd(bestSeller.price)}</p>
              <p className="mt-1 text-xs text-bark/65">Dữ liệu từ backend</p>
              <Link className="mt-5 inline-flex rounded-full bg-wood px-8 py-2.5 text-xs font-semibold uppercase text-ivory transition hover:bg-bark" href="/checkout">
                Mua hàng
              </Link>
            </div>
          </div>

          <button className="mx-auto hidden size-16 items-center justify-center rounded-full bg-wood/70 text-ivory transition hover:bg-wood md:flex" type="button">
            <ChevronRight className="size-7" />
          </button>
        </div>
      </section>

      <section className="border-y border-sand bg-[#f4ead8] px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3">
          {categories.map((category) => (
            <button
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                activeCategory === category.slug ? "bg-wood text-ivory" : "bg-ivory text-horn hover:text-wood"
              }`}
              key={category.slug}
              onClick={() => setActiveCategory(category.slug)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 py-14 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-sans text-3xl font-extrabold text-bark">Tất cả sản phẩm</h2>
          <div className="mt-9 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-sans text-3xl font-extrabold uppercase text-bark">Hàng mới về</h2>
          <div className="mt-9 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={`new-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-pearl px-5 py-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto w-fit border-b-4 border-wood px-8 pb-2 text-center font-sans text-3xl font-extrabold uppercase text-bark">
            Đánh giá từ khách hàng
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <article className="grid overflow-hidden rounded-lg bg-ivory shadow-[0_14px_35px_rgba(45,33,24,0.12)] sm:grid-cols-[160px_1fr]" key={review.id}>
                <div className="min-h-36 bg-clay/65" />
                <div className="relative p-6">
                  <p className="font-semibold text-bark">{review.customerName}</p>
                  <div className="mt-2 flex gap-1 text-wood">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star className="size-3.5 fill-current" key={starIndex} />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-horn">{review.content}</p>
                  <span className="pointer-events-none absolute bottom-0 right-5 font-serif text-8xl leading-none text-sand/55">"</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
