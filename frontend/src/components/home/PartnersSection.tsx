"use client";

import { useI18n } from "@/lib/i18n";

const partners = [
  { name: "Wirecutter", className: "font-serif text-2xl font-bold", color: "#5a3824" },
  { name: "Good Housekeeping", className: "font-sans text-sm font-bold uppercase leading-tight", color: "#8b6f59" },
  { name: "AD", className: "font-serif text-xl font-semibold", color: "#6b4329" },
  { name: "Apartment Therapy", className: "font-sans text-xs font-semibold", color: "#a0734e" },
  { name: "Food Network", className: "font-sans text-[11px] font-bold uppercase", color: "#7b3f2a" },
  { name: "Today", className: "font-sans text-sm font-bold uppercase", color: "#b08a67" },
  { name: "GQ", className: "font-sans text-xl font-extrabold", color: "#4d392c" },
  { name: "Vogue", className: "font-serif text-2xl font-semibold uppercase", color: "#56351f" },
];

function PartnerLogos() {
  return (
    <div className="flex min-w-max shrink-0 items-center gap-14 pr-14">
      {partners.map((partner) => (
        <div
          className={`${partner.className} min-w-max opacity-70 transition hover:opacity-100`}
          key={partner.name}
          style={{ color: partner.color }}
        >
          {partner.name}
        </div>
      ))}
    </div>
  );
}

export function PartnersSection() {
  const { t } = useI18n();

  return (
    <section className="overflow-hidden border-y border-clay/15 bg-[#f4ead8] px-5 py-12 md:px-10">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="font-sans text-2xl font-extrabold uppercase tracking-wide text-bark md:text-3xl">
          {t.home.partners.title}
        </h2>
      </div>

      <div className="relative mt-8 overflow-hidden py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#f4ead8] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-[#f4ead8] to-transparent" />

        <div className="vanmoc-partners-marquee flex w-max">
          <PartnerLogos />
          <PartnerLogos />
        </div>
      </div>
    </section>
  );
}
