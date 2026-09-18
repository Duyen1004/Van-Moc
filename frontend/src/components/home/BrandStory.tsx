"use client";

import { useI18n } from "@/lib/i18n";

const values = [
  {
    number: "01",
    key: "material",
  },
  {
    number: "02",
    key: "village",
  },
  {
    number: "03",
    key: "signature",
  },
] as const;

export function BrandStory() {
  const { t } = useI18n();
  const story = t.home.brandStory;

  return (
    <section className="bg-[#f4ead8] px-5 py-12 md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-horn">{story.eyebrow}</p>
          <h2 className="mt-4 font-sans text-4xl font-bold leading-tight text-bark md:text-5xl">
            {story.headline1}
            <br />
            {story.headline2}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-horn">{story.description}</p>
        </div>

        <div className="mt-8 border-y border-clay/30">
          <div className="grid divide-y divide-clay/25 md:grid-cols-3 md:divide-x md:divide-y-0">
            {values.map((item) => (
              <div className="px-0 py-5 md:px-6" key={item.number}>
                <div className="flex items-center justify-between gap-5">
                  <p className="font-sans text-2xl font-bold text-clay/80">{item.number}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-horn">{story.values[item.key].label}</p>
                </div>
                <h3 className="mt-4 font-sans text-2xl font-bold text-bark">{story.values[item.key].title}</h3>
                <p className="mt-3 text-sm leading-6 text-horn">{story.values[item.key].text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
