"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const storyImages = [
  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85",
];

export default function VillagePage() {
  const { t } = useI18n();
  const content = t.villagePage;
  const [activeStory, setActiveStory] = useState(0);
  const story = content.stories[activeStory];

  function goToPrevious() {
    setActiveStory((current) => (current - 1 + content.stories.length) % content.stories.length);
  }

  function goToNext() {
    setActiveStory((current) => (current + 1) % content.stories.length);
  }

  return (
    <main className="bg-ivory text-bark">
      <section className="px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_0.95fr]">
          <div className="overflow-hidden rounded-lg bg-sand">
            <img
              alt={content.heroAlt}
              className="h-[520px] w-full object-cover md:h-[640px]"
              src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=88"
            />
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-horn">{content.eyebrow}</p>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.08] text-bark md:text-7xl">
              {content.title}
            </h1>
            <p className="mt-7 text-base leading-8 text-horn">{content.description}</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-sans text-3xl font-extrabold text-bark md:text-4xl">
            {content.moreTitle}
          </h2>

          <div className="relative mt-12">
            <button
              aria-label={content.previous}
              className="absolute left-0 top-1/2 z-10 hidden size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-wood text-ivory shadow-lg transition hover:bg-bark md:flex"
              onClick={goToPrevious}
              type="button"
            >
              <ChevronLeft className="size-5" />
            </button>

            <article className="grid overflow-hidden rounded-lg bg-[#d9d3ca] shadow-[0_18px_45px_rgba(45,33,24,0.12)] md:grid-cols-[0.42fr_0.58fr]">
              <div className="relative min-h-[300px] md:min-h-[380px]">
                <img
                  alt={story.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={storyImages[activeStory]}
                />
              </div>
              <div className="flex min-h-[300px] flex-col justify-center px-8 py-10 text-center md:min-h-[380px] md:px-14 md:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-horn">
                  {content.storyLabel} {String(activeStory + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 font-serif text-4xl font-semibold leading-tight text-bark md:text-5xl">
                  {story.title}
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-7 text-horn">{story.text}</p>
              </div>
            </article>

            <button
              aria-label={content.next}
              className="absolute right-0 top-1/2 z-10 hidden size-12 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-wood text-ivory shadow-lg transition hover:bg-bark md:flex"
              onClick={goToNext}
              type="button"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {content.stories.map((item, index) => (
              <button
                aria-label={`${content.chooseStory} ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  activeStory === index ? "w-8 bg-wood" : "w-2 bg-clay/45 hover:bg-clay"
                }`}
                key={item.title}
                onClick={() => setActiveStory(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
