"use client";

import { useI18n } from "@/lib/i18n";

export function VillageStory() {
  const { t } = useI18n();
  const story = t.home.villageStory;

  return (
    <section className="bg-bark px-5 py-14 text-ivory md:px-10 md:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
        <div className="grid grid-cols-[0.75fr_1fr] gap-5">
          <img
            alt={story.imageAlt1}
            className="h-[340px] w-full rounded-lg object-cover"
            src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=85"
          />
          <img
            alt={story.imageAlt2}
            className="mt-10 h-[340px] w-full rounded-lg object-cover"
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=85"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase text-clay">{story.eyebrow}</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">{story.title}</h2>
          <p className="mt-5 text-base leading-8 text-sand">{story.description}</p>
          <blockquote className="mt-8 border-l border-clay pl-5 font-serif text-2xl font-medium italic leading-snug tracking-wide text-linen md:text-3xl">
            {story.quote}
          </blockquote>
        </div>
      </div>
    </section>
  );
}
