"use client";

import { ChevronRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

const charms = [
  {
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=640&q=80",
  },
  {
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=640&q=80",
  },
  {
    image:
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=640&q=80",
  },
  {
    image:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=640&q=80",
  },
];

const suggestions = [
  {
    price: "350.000đ",
    image:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
  },
  {
    price: "420.000đ",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
  },
  {
    price: "390.000đ",
    image:
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=900&q=80",
  },
  {
    price: "690.000đ",
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=80",
  },
];

export default function PersonalizePage() {
  const { t } = useI18n();
  const copy = t.personalizePage;
  const [engraving, setEngraving] = useState("");
  const [selectedCharm, setSelectedCharm] = useState(0);

  const previewText = useMemo(() => {
    const value = engraving.trim();
    return value || copy.emptyPreview;
  }, [copy.emptyPreview, engraving]);

  return (
    <main className="bg-ivory text-bark">
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:py-20">
        <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-clay/20 bg-[#eadcc7] shadow-[0_22px_70px_rgba(86,53,31,0.12)] md:min-h-[420px]">
          <Image
            src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80"
            alt={copy.productAlt}
            fill
            sizes="(min-width: 1024px) 720px, 100vw"
            className="object-cover opacity-35"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(244,234,216,0.58),rgba(86,53,31,0.14))]" />
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-lg border border-white/50 bg-ivory/58 px-6 py-10 text-center backdrop-blur-sm">
            <p className="font-serif text-3xl font-semibold text-wood md:text-5xl">
              {previewText}
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-clay">
              {copy.previewLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <label className="sr-only" htmlFor="engraving">
            {copy.engravingLabel}
          </label>
          <input
            id="engraving"
            value={engraving}
            maxLength={18}
            onChange={(event) => setEngraving(event.target.value)}
            placeholder={copy.engravingLabel}
            className="h-16 rounded-full border border-wood/45 bg-white px-7 text-center font-serif text-2xl text-bark outline-none transition focus:border-wood focus:ring-4 focus:ring-clay/15"
          />
          <button
            type="button"
            className="h-16 rounded-2xl bg-wood px-7 font-serif text-2xl font-semibold text-ivory transition hover:bg-bark"
          >
            {copy.demo}
          </button>
          <p className="text-center text-sm leading-6 text-clay">
            {copy.helper}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {charms.map((charm, index) => (
            <button
              key={copy.charms[index]}
              type="button"
              onClick={() => setSelectedCharm(index)}
              className={`group text-left transition ${
                selectedCharm === index ? "text-wood" : "text-bark"
              }`}
            >
              <span className="relative block aspect-square overflow-hidden rounded-md bg-sand">
                <Image
                  src={charm.image}
                  alt={copy.charms[index]}
                  fill
                  sizes="(min-width: 1024px) 260px, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span
                  className={`absolute inset-0 border-2 ${
                    selectedCharm === index
                      ? "border-wood"
                      : "border-transparent"
                  }`}
                />
              </span>
              <span className="mt-4 block text-center font-serif text-2xl font-semibold">
                {copy.charms[index]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden pb-20">
        <h1 className="text-center font-serif text-4xl font-bold uppercase text-bark md:text-5xl">
          {copy.recommendations}
        </h1>
        <div className="relative mx-auto mt-10 max-w-7xl px-5 md:px-8">
          <div className="flex gap-6 overflow-x-auto pb-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {suggestions.map((product) => (
              <Link
                key={product.image}
                href="/products/luoc-sung-tu-nhien-vm01"
                className="group relative min-w-[78%] overflow-hidden rounded-lg bg-sand shadow-[0_18px_55px_rgba(86,53,31,0.12)] sm:min-w-[44%] lg:min-w-[28%]"
              >
                <span className="relative block aspect-[4/5]">
                  <Image
                    src={product.image}
                    alt={copy.products[suggestions.indexOf(product)]}
                    fill
                    sizes="(min-width: 1024px) 360px, 80vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-wood/92 px-6 py-5 text-center">
                  <span className="block font-serif text-3xl font-bold text-ivory">
                    {copy.products[suggestions.indexOf(product)]}
                  </span>
                  <span className="mt-1 flex items-center justify-center gap-2 text-sm font-semibold text-sand">
                    {product.price}
                    <ShoppingCart className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <button
            type="button"
            aria-label={copy.moreRecommendations}
            className="absolute right-4 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-bark text-ivory shadow-lg transition hover:bg-wood md:flex"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
          <div className="mt-1 flex justify-center gap-3">
            {[0, 1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`h-1.5 rounded-full ${
                  dot === 0 ? "w-12 bg-wood" : "w-10 bg-clay/45"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
