"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Heart, Minus, Plus, QrCode, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

const gallery = [
  "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1100&q=88",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
];

const relatedImages = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
];

const relatedPrices = ["420.000đ", "280.000đ", "690.000đ", "310.000đ"];

export default function ProductDetailPage() {
  const { t } = useI18n();
  const { addItem } = useCart();
  const copy = t.productDetailPage;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const selectedImage = gallery[selectedImageIndex];

  const handleAddToCart = () => {
    addItem(
      {
        slug: "luoc-sung-tu-nhien-vm01",
        name: copy.productName,
        price: 350000,
        imageUrl: selectedImage,
        sku: "VM-LS-001",
      },
      quantity,
    );
  };

  return (
    <main className="bg-ivory text-bark">
      <section className="border-b border-sand bg-[#f4ead8] px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-horn">
          <Link className="transition hover:text-wood" href="/">
            {copy.breadcrumbHome}
          </Link>
          <ChevronRight className="size-4" />
          <Link className="transition hover:text-wood" href="/products">
            {copy.breadcrumbProducts}
          </Link>
          <ChevronRight className="size-4" />
          <span className="font-medium text-wood">{copy.productName}</span>
        </div>
      </section>

      <section className="px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="overflow-hidden rounded-lg bg-sand">
              <img alt={copy.imageAlt} className="aspect-[5/4] w-full object-cover" src={selectedImage} />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {gallery.map((image, index) => (
                <button
                  className={`overflow-hidden rounded-lg border bg-sand ${
                    selectedImageIndex === index ? "border-wood ring-2 ring-wood/25" : "border-transparent hover:border-clay"
                  }`}
                  aria-current={selectedImageIndex === index}
                  key={image}
                  onClick={() => setSelectedImageIndex(index)}
                  type="button"
                >
                  <img alt={`${copy.galleryAlt} ${index + 1}`} className="aspect-square w-full object-cover" src={image} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-horn">{copy.brand}</p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-bark md:text-6xl">
              {copy.productName}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 text-wood">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star className="size-4 fill-current" key={index} />
                ))}
              </div>
              <span className="text-sm text-horn">{copy.reviews}</span>
              <span className="h-1 w-1 rounded-full bg-clay" />
              <span className="text-sm text-horn">{copy.stock}</span>
            </div>

            <p className="mt-7 text-3xl font-semibold text-wood">350.000đ</p>
            <p className="mt-5 max-w-xl text-base leading-8 text-horn">{copy.description}</p>

            <div className="mt-8 grid gap-4 border-y border-sand py-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-horn">{copy.material}</p>
                  <p className="mt-1 font-medium text-bark">{copy.materialValue}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-horn">{copy.origin}</p>
                  <p className="mt-1 font-medium text-bark">{copy.originValue}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-horn">{copy.sku}</p>
                  <p className="mt-1 font-medium text-bark">VM-LS-001</p>
                </div>
              </div>
            </div>

            <div className="mt-7">
              <p className="text-sm font-semibold text-bark">{copy.quantity}</p>
              <div className="mt-3 inline-flex items-center rounded-full border border-clay/50">
                <button
                  className="inline-flex size-10 items-center justify-center text-wood disabled:opacity-40"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))}
                  type="button"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  className="inline-flex size-10 items-center justify-center text-wood"
                  onClick={() => setQuantity((currentQuantity) => currentQuantity + 1)}
                  type="button"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-wood px-6 font-semibold text-wood transition hover:bg-sand"
                onClick={handleAddToCart}
                type="button"
              >
                <ShoppingCart className="size-5" />
                {copy.addToCart}
              </button>
              <Link className="inline-flex h-12 items-center justify-center rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark" href="/checkout">
                {copy.buyNow}
              </Link>
              <button className="inline-flex size-12 items-center justify-center rounded-full border border-clay/50 text-wood transition hover:bg-sand" type="button">
                <Heart className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-sand bg-pearl p-7">
            <h2 className="font-serif text-3xl font-semibold text-bark">{copy.personalizationTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-horn">{copy.personalizationText}</p>
            <div className="mt-6 rounded-lg bg-sand p-5">
              <p className="text-xs font-semibold uppercase text-horn">{copy.sampleEngraving}</p>
              <div className="mt-4 rounded-lg bg-wood px-5 py-8 text-center font-serif text-3xl text-linen">
                NGUYỄN AN
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-wood p-7 text-ivory">
            <div className="flex items-center gap-3">
              <QrCode className="size-6 text-clay" />
              <h2 className="font-serif text-3xl font-semibold">{copy.qrTitle}</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-sand">{copy.qrText}</p>
            <div className="mt-6 grid gap-3 text-sm">
              {copy.qrItems.map((item) => (
                <div className="rounded-full border border-clay/45 px-5 py-3" key={item}>
                  {item}
                </div>
              ))}
            </div>
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
              <p>{copy.productInfoText}</p>
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
            {copy.relatedProducts.map((name, index) => (
              <article className="group" key={name}>
                <div className="overflow-hidden rounded-lg bg-sand">
                  <img
                    alt={name}
                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                    src={relatedImages[index]}
                  />
                </div>
                <h3 className="mt-4 min-h-10 text-base font-semibold text-bark">{name}</h3>
                <p className="mt-2 text-sm font-semibold text-wood">{relatedPrices[index]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
