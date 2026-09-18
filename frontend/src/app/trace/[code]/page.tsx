"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Loader2, MapPin, QrCode, Search, ShieldCheck } from "lucide-react";
import { ApiTraceProduct, getTraceProduct } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

function formatDate(value?: string) {
  if (!value) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export default function TracePage() {
  const params = useParams<{ code?: string | string[] }>();
  const router = useRouter();
  const { t } = useI18n();
  const trace = t.tracePage;
  const code = Array.isArray(params.code) ? params.code[0] : params.code ?? "";
  const [query, setQuery] = useState(code);
  const [record, setRecord] = useState<ApiTraceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTrace() {
      setLoading(true);
      setError("");
      try {
        const data = await getTraceProduct(code);
        if (active) {
          setRecord(data);
          setQuery(data.traceCode);
        }
      } catch {
        if (active) {
          setRecord(null);
          setError("Không tìm thấy mã truy xuất này.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (code) loadTrace();

    return () => {
      active = false;
    };
  }, [code]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextCode = query.trim();
    if (nextCode) router.push(`/trace/${encodeURIComponent(nextCode)}`);
  };

  return (
    <main className="bg-ivory text-bark">
      <section className="border-b border-sand bg-[#f4ead8] px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-horn">
          <Link className="transition hover:text-wood" href="/">{trace.breadcrumbHome}</Link>
          <ChevronRight className="size-4" />
          <span className="font-medium text-wood">{trace.breadcrumbCurrent}</span>
        </div>
      </section>

      <section className="px-5 py-14 md:px-10 md:py-18">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-horn">{trace.eyebrow}</p>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.05] text-bark md:text-7xl">{trace.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-horn">{trace.description}</p>

            <form className="mt-8 flex max-w-xl overflow-hidden rounded-full border border-clay/55 bg-pearl shadow-inner" onSubmit={handleSearch}>
              <input aria-label={trace.inputLabel} className="min-w-0 flex-1 bg-transparent px-6 py-4 text-sm text-bark outline-none placeholder:text-horn" onChange={(event) => setQuery(event.target.value)} placeholder={trace.inputPlaceholder} type="search" value={query} />
              <button className="inline-flex items-center gap-2 bg-wood px-6 text-sm font-semibold text-ivory transition hover:bg-bark" type="submit">
                <Search className="size-4" />
                {trace.search}
              </button>
            </form>
          </div>

          <div className="rounded-lg bg-wood p-7 text-ivory shadow-[0_22px_60px_rgba(45,33,24,0.16)] md:p-9">
            {loading ? (
              <div className="flex min-h-56 items-center justify-center gap-2 text-sm font-semibold text-sand"><Loader2 className="size-4 animate-spin" />Đang tải passport...</div>
            ) : error || !record ? (
              <div className="min-h-56 py-10 text-center">
                <QrCode className="mx-auto size-12 text-clay" />
                <p className="mt-5 font-semibold text-ivory">{error}</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay">{trace.traceCode}</p>
                    <h2 className="mt-3 font-serif text-4xl font-semibold">{record.traceCode}</h2>
                  </div>
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-[#f4ead8] text-wood"><QrCode className="size-10" /></div>
                </div>

                <div className="mt-8 grid gap-4 border-t border-clay/30 pt-7 sm:grid-cols-2">
                  <div><p className="text-xs font-semibold uppercase text-clay">{trace.product}</p><p className="mt-2 font-medium text-ivory">{record.productName}</p></div>
                  <div><p className="text-xs font-semibold uppercase text-clay">{trace.batch}</p><p className="mt-2 font-medium text-ivory">{record.batchCode || "Chưa cập nhật"}</p></div>
                  <div><p className="text-xs font-semibold uppercase text-clay">{trace.artisan}</p><p className="mt-2 font-medium text-ivory">{record.artisanName || "Vân Mộc"}</p></div>
                  <div><p className="text-xs font-semibold uppercase text-clay">{trace.status}</p><p className="mt-2 font-medium text-ivory">{formatDate(record.productionDate)}</p></div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {record ? (
        <>
          <section className="bg-[#f4ead8] px-5 py-14 md:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="rounded-lg border border-clay/25 bg-ivory p-6"><MapPin className="size-5 text-clay" /><h3 className="mt-4 font-serif text-2xl font-semibold text-bark">{trace.origin}</h3><p className="mt-3 text-sm leading-7 text-horn">{record.origin || record.workshop || trace.originText}</p></div>
                <div className="rounded-lg border border-clay/25 bg-ivory p-6"><CalendarDays className="size-5 text-clay" /><h3 className="mt-4 font-serif text-2xl font-semibold text-bark">{trace.completionDate}</h3><p className="mt-3 text-sm leading-7 text-horn">{formatDate(record.productionDate)}</p></div>
                <div className="rounded-lg border border-clay/25 bg-ivory p-6"><ShieldCheck className="size-5 text-clay" /><h3 className="mt-4 font-serif text-2xl font-semibold text-bark">{trace.inspection}</h3><p className="mt-3 text-sm leading-7 text-horn">{record.material || trace.inspectionText}</p></div>
              </div>
            </div>
          </section>

          <section className="px-5 py-16 md:px-10">
            <div className="mx-auto max-w-5xl">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-horn">{trace.journey}</p>
                <h2 className="mt-4 font-serif text-4xl font-semibold text-bark md:text-5xl">{trace.journeyTitle}</h2>
              </div>

              <div className="mt-12 border-l border-clay/35">
                {record.events.map((event, index) => (
                  <article className="relative pl-8 pb-10 last:pb-0" key={`${event.title}-${index}`}>
                    <span className="absolute -left-[9px] top-1 size-4 rounded-full border-4 border-ivory bg-wood" />
                    <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                      <div><p className="font-serif text-3xl font-semibold text-clay">{String(index + 1).padStart(2, "0")}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-horn">{formatDate(event.eventDate)}</p></div>
                      <div className="overflow-hidden rounded-lg border border-sand bg-pearl">
                        {event.imageUrl ? <img alt={event.title} className="aspect-[16/7] w-full object-cover" src={event.imageUrl} /> : null}
                        <div className="p-6"><h3 className="font-serif text-2xl font-semibold text-bark">{event.title}</h3><p className="mt-3 text-sm leading-7 text-horn">{event.description}</p></div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
