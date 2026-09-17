"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85",
  },
  {
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  },
  {
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85",
  },
  {
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85",
  },
];

export function Hero() {
  const { t } = useI18n();
  const hero = t.home.hero;
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previousIndex = (activeIndex - 1 + slides.length) % slides.length;
  const nextIndex = (activeIndex + 1) % slides.length;
  const activeSlide = slides[activeIndex];

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  function handlePointerEnd(clientX: number) {
    if (dragStart === null) {
      return;
    }

    const distance = clientX - dragStart;

    if (Math.abs(distance) > 45) {
      if (distance < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setDragStart(null);
    setIsDragging(false);
  }

  return (
    <section className="overflow-hidden bg-linen px-5 py-14 md:px-10 md:py-16">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 md:grid-cols-[1.35fr_0.65fr]">
        <div
          aria-label={hero.bannerLabel}
          className={`relative mx-auto h-[320px] w-full max-w-[860px] select-none md:h-[380px] ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onPointerCancel={() => {
            setDragStart(null);
            setIsDragging(false);
          }}
          onPointerDown={(event) => {
            setDragStart(event.clientX);
            setIsDragging(true);
          }}
          onPointerLeave={(event) => handlePointerEnd(event.clientX)}
          onPointerUp={(event) => handlePointerEnd(event.clientX)}
          role="group"
        >
          <article className="absolute left-0 top-[72px] h-44 w-[43%] overflow-hidden rounded-lg bg-sand opacity-70 shadow-sm transition-all duration-500 md:h-56">
            <img
              alt={hero.slides[previousIndex]}
              className="pointer-events-none h-full w-full object-cover"
              src={slides[previousIndex].image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bark/55 to-transparent" />
          </article>

          <article className="absolute right-0 top-[72px] h-44 w-[43%] overflow-hidden rounded-lg bg-sand opacity-70 shadow-sm transition-all duration-500 md:h-56">
            <img
              alt={hero.slides[nextIndex]}
              className="pointer-events-none h-full w-full object-cover"
              src={slides[nextIndex].image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bark/55 to-transparent" />
          </article>

          <article className="absolute left-1/2 top-0 h-[270px] w-[60%] -translate-x-1/2 overflow-hidden rounded-lg bg-sand shadow-[0_18px_45px_rgba(45,33,24,0.18)] transition-all duration-500 md:h-[330px]">
            <img
              alt={hero.slides[activeIndex]}
              className="pointer-events-none h-full w-full object-cover"
              src={activeSlide.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bark/60 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-serif text-xl font-semibold text-ivory">
              {hero.slides[activeIndex]}
            </p>
          </article>

          <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-3">
            {slides.map((slide, index) => (
              <button
                aria-label={`${hero.chooseBanner} ${index + 1}`}
                className={`h-1 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-wood" : "w-7 bg-clay/50 hover:bg-clay"
                }`}
                key={slide.image}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="text-sm font-semibold uppercase text-horn">{hero.eyebrow}</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-bark md:text-5xl">
            {hero.headline1}
            <br />
            {hero.headline2}
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-horn md:mx-0">
            {hero.description}
          </p>
          <a className="mt-7 inline-flex rounded-lg bg-wood px-9 py-3 text-xs font-semibold uppercase tracking-wide text-ivory" href="/products">
            {hero.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
