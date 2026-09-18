"use client";

import { ChevronRight, Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiProduct, formatVnd, getProduct, getProducts } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

const fallbackImage = "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80";
const fonts = ["Cormorant Garamond", "Inter", "Serif thanh mảnh"];
const positions = [
  { value: "front", label: "Mặt trước" },
  { value: "back", label: "Mặt sau" },
  { value: "side", label: "Cạnh/cán" },
];

export default function PersonalizePage() {
  const params = useParams<{ productId?: string | string[] }>();
  const router = useRouter();
  const { t } = useI18n();
  const { addItem } = useCart();
  const copy = t.personalizePage;
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId ?? "";
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [suggestions, setSuggestions] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [engraving, setEngraving] = useState("");
  const [font, setFont] = useState(fonts[0]);
  const [position, setPosition] = useState(positions[0].value);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      try {
        const productItems = await getProducts();
        const productDetail = productId && productId !== "demo"
          ? await getProduct(productId).catch(() => productItems.find((item) => item.slug === productId) ?? productItems[0])
          : productItems[0];

        if (!active) return;
        setProduct(productDetail ?? null);
        setSuggestions(productItems.filter((item) => item.slug !== productDetail?.slug).slice(0, 4));
        setFont(productDetail?.defaultFont || fonts[0]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [productId]);

  const maxCharacters = product?.maxCharacters && product.maxCharacters > 0 ? product.maxCharacters : 15;
  const engravingPrice = product?.engravingPrice ?? 0;
  const imageUrl = product?.imageUrl || product?.images?.[0] || fallbackImage;
  const previewText = useMemo(() => engraving.trim() || copy.emptyPreview, [copy.emptyPreview, engraving]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl,
      sku: product.sku,
      personalization: engraving.trim()
        ? {
            content: engraving.trim(),
            font,
            position,
            engravingPrice,
          }
        : undefined,
    });
    router.push("/cart");
  };

  if (loading) {
    return <main className="flex min-h-[60vh] items-center justify-center bg-ivory text-sm font-semibold text-horn"><Loader2 className="mr-2 size-4 animate-spin" />Đang tải cá nhân hóa...</main>;
  }

  if (!product) {
    return <main className="bg-ivory px-5 py-20 text-center text-bark"><h1 className="font-sans text-3xl font-bold">Chưa có sản phẩm để cá nhân hóa</h1></main>;
  }

  return (
    <main className="bg-ivory text-bark">
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:py-20">
        <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-clay/20 bg-[#eadcc7] shadow-[0_22px_70px_rgba(86,53,31,0.12)] md:min-h-[420px]">
          <Image src={imageUrl} alt={product.name} fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover opacity-45" priority />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(244,234,216,0.58),rgba(86,53,31,0.14))]" />
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-lg border border-white/50 bg-ivory/64 px-6 py-10 text-center backdrop-blur-sm">
            <p className="font-serif text-3xl font-semibold text-wood md:text-5xl">{previewText}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-clay">{product.name}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-horn">Khắc laser</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-bark">{product.name}</h1>
            <p className="mt-2 text-sm font-semibold text-wood">{formatVnd(product.price)} {engravingPrice > 0 ? `+ ${formatVnd(engravingPrice)} phí khắc` : ""}</p>
          </div>
          <input id="engraving" value={engraving} maxLength={maxCharacters} onChange={(event) => setEngraving(event.target.value)} placeholder={`Nhập nội dung tối đa ${maxCharacters} ký tự`} className="h-14 rounded-full border border-wood/45 bg-white px-7 text-center text-xl text-bark outline-none transition focus:border-wood focus:ring-4 focus:ring-clay/15" />
          <select className="h-12 rounded-full border border-clay/30 bg-white px-5 text-sm font-semibold text-wood outline-none" onChange={(event) => setFont(event.target.value)} value={font}>{fonts.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select className="h-12 rounded-full border border-clay/30 bg-white px-5 text-sm font-semibold text-wood outline-none" onChange={(event) => setPosition(event.target.value)} value={position}>{positions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <button type="button" onClick={handleAddToCart} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-wood px-7 text-lg font-semibold text-ivory transition hover:bg-bark">
            <ShoppingCart className="size-5" />
            Thêm vào giỏ
          </button>
          <p className="text-center text-sm leading-6 text-clay">{copy.helper}</p>
        </div>
      </section>

      <section className="overflow-hidden pb-20">
        <h2 className="text-center font-serif text-4xl font-bold uppercase text-bark md:text-5xl">{copy.recommendations}</h2>
        <div className="relative mx-auto mt-10 max-w-7xl px-5 md:px-8">
          <div className="flex gap-6 overflow-x-auto pb-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {suggestions.map((item) => (
              <Link key={item.slug} href={`/personalize/${item.slug}`} className="group relative min-w-[78%] overflow-hidden rounded-lg bg-sand shadow-[0_18px_55px_rgba(86,53,31,0.12)] sm:min-w-[44%] lg:min-w-[28%]">
                <span className="relative block aspect-[4/5]">
                  <Image src={item.imageUrl || item.images?.[0] || fallbackImage} alt={item.name} fill sizes="(min-width: 1024px) 360px, 80vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-wood/92 px-6 py-5 text-center">
                  <span className="block font-serif text-3xl font-bold text-ivory">{item.name}</span>
                  <span className="mt-1 flex items-center justify-center gap-2 text-sm font-semibold text-sand">{formatVnd(item.price)}<ShoppingCart className="h-4 w-4" /></span>
                </span>
              </Link>
            ))}
          </div>
          <button type="button" aria-label={copy.moreRecommendations} className="absolute right-4 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-bark text-ivory shadow-lg transition hover:bg-wood md:flex"><ChevronRight className="h-7 w-7" /></button>
        </div>
      </section>
    </main>
  );
}
