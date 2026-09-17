"use client";

import { useI18n } from "@/lib/i18n";

export function PersonalizationSection() {
  const { t } = useI18n();
  const personalization = t.home.personalization;

  return (
    <section className="bg-ivory px-5 py-20 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
        <div className="rounded-lg border border-sand bg-pearl p-8 md:p-10">
          <h2 className="font-serif text-4xl text-bark">{personalization.title}</h2>
          <p className="mt-5 leading-8 text-horn">{personalization.description}</p>
          <div className="mt-8 rounded-lg bg-sand p-6">
            <p className="text-xs font-semibold uppercase text-horn">{personalization.preview}</p>
            <div className="mt-5 rounded-lg bg-wood px-6 py-10 text-center font-serif text-3xl text-linen">
              NGUYỄN AN
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-wood p-8 text-ivory md:p-10">
          <h2 className="font-serif text-4xl">{personalization.traceTitle}</h2>
          <p className="mt-5 leading-8 text-sand">{personalization.traceDescription}</p>
          <div className="mt-10 grid gap-3 text-sm">
            {personalization.traceItems.map((item) => (
              <div className="rounded-full border border-clay/50 px-5 py-3" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
