"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Heart, Loader2, Minus, Plus, QrCode, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import { ApiProduct, formatVnd, getProduct, getProducts } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

const FAVORITE_PRODUCTS_KEY = "vanmoc-favorite-products";
const fallbackImage = "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1100&q=88";
const fonts = ["Cormorant Garamond", "Inter", "Serif thanh mảnh"];
const positions = [
  { value: "front", label: "Mặt trước" },
  { value: "back", label: "Mặt sau" },
  { value: "side", label: "Cạnh/cán" },
];

type FavoriteProduct = {
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  sku: string;
  likedAt: string;
};

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

export default function ProductDetailPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const { t } = useI18n();
  const { addItem } = useCart();
  const copy = t.productDetailPage;
  const productSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? "";
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [engravingContent, setEngravingContent] = useState("");
  const [engravingFont, setEngravingFont] = useState(fonts[0]);
  const [engravingPosition, setEngravingPosition] = useState(positions[0].value);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");
      try {
        const [productDetail, productItems] = await Promise.all([getProduct(productSlug), getProducts()]);
        if (!active) return;
        setProduct(productDetail);
        setRelatedProducts(productItems.filter((item) => item.slug !== productSlug).slice(0, 4));
        setEngravingFont(productDetail.defaultFont || fonts[0]);
      } catch {
        if (active) setError("Chưa tải được sản phẩm.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (productSlug) {
      loadProduct();
      setIsFavorite(getStoredFavorites().some((item) => item.slug === productSlug));
    }

    return () => {
      active = false;
    };
  }, [productSlug]);

  const gallery = useMemo(() => {
    const images = product?.images?.filter(Boolean) ?? [];
    if (product?.imageUrl) images.unshift(product.imageUrl);
    return Array.from(new Set(images.length ? images : [fallbackImage]));
  }, [product]);

  const selectedImage = gallery[Math.min(selectedImageIndex, gallery.length - 1)] ?? fallbackImage;
  const maxCharacters = product?.maxCharacters && product.maxCharacters > 0 ? product.maxCharacters : 15;
  const engravingPrice = product?.engravingPrice ?? 0;
  const canPersonalize = Boolean(product?.personalizable);
  const engraving = engravingContent.trim();

  const handleAddToCart = () => {
    if (!product) return;

    addItem(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: selectedImage,
        sku: product.sku,
        personalization:
          canPersonalize && engraving
            ? {
                content: engraving,
                font: engravingFont,
                position: engravingPosition,
                engravingPrice,
              }
            : undefined,
      },
      quantity,
    );
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    const favorites = getStoredFavorites();
    const existingFavorite = favorites.some((item) => item.slug === product.slug);
    const nextFavorites = existingFavorite
      ? favorites.filter((item) => item.slug !== product.slug)
      : [...favorites, { slug: product.slug, name: product.name, price: product.price, imageUrl: selectedImage, sku: product.sku, likedAt: new Date().toISOString() }];

    window.localStorage.setItem(FAVORITE_PRODUCTS_KEY, JSON.stringify(nextFavorites));
    setIsFavorite(!existingFavorite);
    window.dispatchEvent(new Event("vanmoc-favorites-changed"));
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-ivory text-sm font-semibold text-horn">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Đang tải sản phẩm...
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="bg-ivory px-5 py-20 text-center text-bark">
        <h1 className="font-sans text-3xl font-bold">Không tìm thấy sản phẩm</h1>
        <Link className="mt-6 inline-flex rounded-full bg-wood px-6 py-3 text-sm font-semibold text-ivory" href="/products">
          Quay lại sản phẩm
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-ivory text-bark">
      <section className="border-b border-sand bg-[#f4ead8] px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-horn">
          <Link className="transition hover:text-wood" href="/">{copy.breadcrumbHome}</Link>
          <ChevronRight className="size-4" />
          <Link className="transition hover:text-wood" href="/products">{copy.breadcrumbProducts}</Link>
          <ChevronRight className="size-4" />
          <span className="font-medium text-wood">{product.name}</span>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="overflow-hidden rounded-lg bg-sand">
              <img alt={product.name} className="aspect-[5/4] w-full object-cover" src={selectedImage} />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {gallery.map((image, index) => (
                <button
                  aria-current={selectedImageIndex === index}
                  className={`overflow-hidden rounded-lg border bg-sand ${selectedImageIndex === index ? "border-wood ring-2 ring-wood/25" : "border-transparent hover:border-clay"}`}
                  key={image}
                  onClick={() => setSelectedImageIndex(index)}
                  type="button"
                >
                  <img alt={`${product.name} ${index + 1}`} className="aspect-square w-full object-cover" src={image} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-horn">{product.categoryName || copy.brand}</p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-bark md:text-6xl">{product.name}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 text-wood">{Array.from({ length: 5 }).map((_, index) => <Star className="size-4 fill-current" key={index} />)}</div>
              <span className="text-sm text-horn">{product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sản phẩm` : "Hết hàng"}</span>
            </div>

            <p className="mt-7 text-3xl font-semibold text-wood">{formatVnd(product.price)}</p>
            <p className="mt-5 max-w-xl text-base leading-8 text-horn">{product.shortDescription || product.description}</p>

            <div className="mt-8 grid gap-4 border-y border-sand py-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div><p className="text-xs font-semibold uppercase text-horn">{copy.material}</p><p className="mt-1 font-medium text-bark">{product.material || copy.materialValue}</p></div>
                <div><p className="text-xs font-semibold uppercase text-horn">{copy.origin}</p><p className="mt-1 font-medium text-bark">{product.origin || copy.originValue}</p></div>
                <div><p className="text-xs font-semibold uppercase text-horn">{copy.sku}</p><p className="mt-1 font-medium text-bark">{product.sku}</p></div>
              </div>
            </div>

            {canPersonalize ? (
              <div className="mt-7 rounded-lg border border-clay/20 bg-pearl p-5">
                <p className="text-sm font-bold text-bark">Cá nhân hóa khắc laser</p>
                <div className="mt-4 grid gap-3">
                  <input className="h-11 rounded-full border border-clay/25 bg-ivory px-4 text-sm outline-none focus:border-wood" maxLength={maxCharacters} onChange={(event) => setEngravingContent(event.target.value)} placeholder={`Nhập nội dung tối đa ${maxCharacters} ký tự`} value={engravingContent} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select className="h-11 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => setEngravingFont(event.target.value)} value={engravingFont}>{fonts.map((font) => <option key={font} value={font}>{font}</option>)}</select>
                    <select className="h-11 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => setEngravingPosition(event.target.value)} value={engravingPosition}>{positions.map((position) => <option key={position.value} value={position.value}>{position.label}</option>)}</select>
                  </div>
                  <div className="rounded-lg bg-wood px-5 py-7 text-center text-ivory">
                    <p className="font-serif text-3xl font-semibold">{engraving || "NGUYEN AN"}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-sand">{engravingPrice > 0 ? `Phí khắc ${formatVnd(engravingPrice)}` : "Miễn phí khắc"}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-7">
              <p className="text-sm font-semibold text-bark">{copy.quantity}</p>
              <div className="mt-3 inline-flex items-center rounded-full border border-clay/50">
                <button className="inline-flex size-10 items-center justify-center text-wood disabled:opacity-40" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} type="button"><Minus className="size-4" /></button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button className="inline-flex size-10 items-center justify-center text-wood" onClick={() => setQuantity((current) => current + 1)} type="button"><Plus className="size-4" /></button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-wood px-6 font-semibold text-wood transition hover:bg-sand" onClick={handleAddToCart} type="button">
                <ShoppingCart className="size-5" />
                {copy.addToCart}
              </button>
              <Link className="inline-flex h-12 items-center justify-center rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark" href="/checkout" onClick={handleAddToCart}>{copy.buyNow}</Link>
              <button aria-label={isFavorite ? "Bỏ thích sản phẩm" : "Thích sản phẩm"} aria-pressed={isFavorite} className={`inline-flex size-12 items-center justify-center rounded-full border transition ${isFavorite ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" : "border-clay/50 text-wood hover:bg-sand"}`} onClick={handleToggleFavorite} type="button"><Heart className={`size-5 ${isFavorite ? "fill-current" : ""}`} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-sand bg-pearl p-7">
            <h2 className="font-serif text-3xl font-semibold text-bark">{copy.personalizationTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-horn">{copy.personalizationText}</p>
          </div>
          <div className="rounded-lg bg-wood p-7 text-ivory">
            <div className="flex items-center gap-3">
              <QrCode className="size-6 text-clay" />
              <h2 className="font-serif text-3xl font-semibold">{copy.qrTitle}</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-sand">{copy.qrText}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f4ead8] px-5 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-horn">{copy.details}</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold text-bark">{copy.productInfo}</h2>
            </div>
            <div className="grid gap-4 text-sm leading-7 text-horn">
              <p>{product.description || copy.productInfoText}</p>
              <p className="rounded-lg border border-clay/20 bg-ivory px-5 py-4 text-bark">Màu sắc, đường vân và sắc độ có thể khác nhau giữa từng sản phẩm do đặc tính tự nhiên của vật liệu.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {copy.care.map((item) => (
                  <div className="flex items-center gap-2 rounded-full border border-clay/35 px-4 py-3 text-bark" key={item}>
                    <ShieldCheck className="size-4 text-clay" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-4xl font-semibold text-bark">{copy.related}</h2>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <article className="group" key={related.slug}>
                <Link className="block overflow-hidden rounded-lg bg-sand" href={`/products/${related.slug}`}>
                  <img alt={related.name} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" src={related.imageUrl || related.images?.[0] || fallbackImage} />
                </Link>
                <h3 className="mt-4 min-h-10 text-base font-semibold text-bark">{related.name}</h3>
                <p className="mt-2 text-sm font-semibold text-wood">{formatVnd(related.price)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
