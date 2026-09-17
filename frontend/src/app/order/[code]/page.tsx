"use client";

import { ArrowLeft, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiOrder, formatVnd, getOrder } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function OrderDetailPage() {
  const params = useParams<{ code: string }>();
  const { locale, t } = useI18n();
  const copy = t.ordersPage;
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadOrder() {
      try {
        const data = await getOrder(params.code);
        if (isActive) {
          setOrder(data);
        }
      } catch {
        if (isActive) {
          setError(copy.orderNotFoundMessage);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isActive = false;
    };
  }, [copy.orderNotFoundMessage, params.code]);

  return (
    <main className="bg-ivory px-5 py-10 text-bark md:px-10">
      <section className="mx-auto max-w-5xl">
        <Link className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-wood hover:text-bark" href="/order">
          <ArrowLeft className="size-4" />
          {copy.detailBack}
        </Link>

        {isLoading ? (
          <div className="mt-8 rounded-lg border border-sand bg-pearl p-8 text-center font-semibold text-horn">{copy.loading}</div>
        ) : error || !order ? (
          <div className="mt-8 rounded-lg border border-sand bg-pearl p-8 text-center">
            <h1 className="font-sans text-2xl font-extrabold text-bark">{copy.orderNotFound}</h1>
            <p className="mt-2 text-sm text-horn">{error}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            <div className="rounded-lg border border-sand bg-pearl p-6 shadow-[0_12px_35px_rgba(45,33,24,0.06)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-wood">{copy.detailTitle}</p>
                  <h1 className="mt-2 font-sans text-3xl font-extrabold text-bark">{order.orderCode}</h1>
                  <p className="mt-2 text-sm text-horn">{formatDate(order.createdAt, locale)}</p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm font-bold text-wood">
                  <PackageCheck className="size-4" />
                  {copy.statuses[order.orderStatus as keyof typeof copy.statuses] ?? order.orderStatus}
                </span>
              </div>

              <div className="mt-7 grid gap-4 border-t border-sand pt-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-bold text-bark">{copy.recipient}</p>
                  <p className="mt-1 text-sm leading-6 text-horn">
                    {order.customerName}
                    <br />
                    {order.phone}
                    <br />
                    {order.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-bark">{copy.shippingAddress}</p>
                  <p className="mt-1 text-sm leading-6 text-horn">
                    {order.address}, {order.province}
                  </p>
                  {order.note ? <p className="mt-2 text-sm leading-6 text-horn">{copy.note} {order.note}</p> : null}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-sand bg-pearl p-6 shadow-[0_12px_35px_rgba(45,33,24,0.06)]">
              <h2 className="font-sans text-2xl font-extrabold text-bark">{copy.purchasedProducts}</h2>
              <div className="mt-5 divide-y divide-sand">
                {order.items.map((item) => (
                  <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between" key={item.id}>
                    <div>
                      <p className="font-semibold text-bark">{item.productName}</p>
                      <p className="mt-1 text-sm text-horn">
                        SKU {item.productSku} · {copy.quantity} {item.quantity}
                      </p>
                      {item.engravingContent ? <p className="mt-1 text-sm text-horn">{copy.engraving} {item.engravingContent}</p> : null}
                    </div>
                    <p className="font-semibold text-wood">{formatVnd(item.subtotal + (item.engravingPrice ?? 0))}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 border-t border-sand pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-horn">{copy.subtotal}</span>
                  <span className="font-semibold text-bark">{formatVnd(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-horn">{copy.engravingFee}</span>
                  <span className="font-semibold text-bark">{formatVnd(order.personalizationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-horn">{copy.shipping}</span>
                  <span className="font-semibold text-bark">{formatVnd(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold text-bark">
                  <span>{copy.total}</span>
                  <span>{formatVnd(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
