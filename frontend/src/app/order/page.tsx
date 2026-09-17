"use client";

import { ClipboardList, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ApiOrder, formatVnd, getOrder } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const ORDER_CODES_KEY = "vanmoc-order-codes";
const LAST_ORDER_KEY = "vanmoc-last-order-code";

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function readSavedOrderCodes() {
  const orderCodes = JSON.parse(window.localStorage.getItem(ORDER_CODES_KEY) ?? "[]") as string[];
  const lastOrderCode = window.localStorage.getItem(LAST_ORDER_KEY);
  return [...new Set([lastOrderCode, ...orderCodes].filter(Boolean) as string[])];
}

export default function OrdersPage() {
  const { locale, t } = useI18n();
  const copy = t.ordersPage;
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [lookupCode, setLookupCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadOrders() {
      const orderCodes = readSavedOrderCodes();
      if (orderCodes.length === 0) {
        setIsLoading(false);
        return;
      }

      const results = await Promise.allSettled(orderCodes.map((code) => getOrder(code)));
      if (!isActive) {
        return;
      }

      setOrders(results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : [])));
      setIsLoading(false);
    }

    loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = lookupCode.trim();
    if (!code) {
      return;
    }

    setMessage("");
    try {
      const order = await getOrder(code);
      const nextOrders = [order, ...orders.filter((item) => item.orderCode !== order.orderCode)];
      setOrders(nextOrders);
      window.localStorage.setItem(ORDER_CODES_KEY, JSON.stringify(nextOrders.map((item) => item.orderCode)));
      window.localStorage.setItem(LAST_ORDER_KEY, order.orderCode);
      window.localStorage.setItem("vanmoc-has-order", "true");
      window.dispatchEvent(new Event("vanmoc-order-changed"));
      setLookupCode("");
    } catch {
      setMessage(copy.notFoundMessage);
    }
  };

  return (
    <main className="bg-ivory text-bark">
      <section className="px-5 py-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 border-b border-sand pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-wood">{copy.eyebrow}</p>
              <h1 className="mt-2 font-sans text-3xl font-extrabold text-bark md:text-4xl">{copy.title}</h1>
            </div>

            <form className="flex w-full max-w-md gap-2" onSubmit={handleLookup}>
              <input
                className="h-11 min-w-0 flex-1 rounded-full border border-clay/25 bg-pearl px-5 text-sm font-semibold text-bark outline-none transition placeholder:text-horn focus:border-clay"
                onChange={(event) => setLookupCode(event.target.value)}
                placeholder={copy.lookupPlaceholder}
                value={lookupCode}
              />
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-5 text-sm font-semibold text-ivory transition hover:bg-bark" type="submit">
                <Search className="size-4" />
                {copy.lookup}
              </button>
            </form>
          </div>

          {message ? <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</p> : null}

          {isLoading ? (
            <div className="mt-10 rounded-lg border border-sand bg-pearl p-8 text-center font-semibold text-horn">{copy.loading}</div>
          ) : orders.length > 0 ? (
            <div className="mt-8 grid gap-4">
              {orders.map((order) => (
                <Link
                  className="grid gap-5 rounded-lg border border-sand bg-pearl p-5 shadow-[0_12px_35px_rgba(45,33,24,0.06)] transition hover:-translate-y-0.5 hover:border-clay/50 md:grid-cols-[1fr_auto]"
                  href={`/order/${order.orderCode}`}
                  key={order.orderCode}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-sans text-xl font-extrabold text-bark">{order.orderCode}</span>
                      <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold uppercase text-wood">
                        {copy.statuses[order.orderStatus as keyof typeof copy.statuses] ?? order.orderStatus}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-horn">{formatDate(order.createdAt, locale)}</p>
                    <p className="mt-3 text-sm font-semibold text-bark">
                      {order.items.map((item) => `${item.productName} x${item.quantity}`).join(", ")}
                    </p>
                    <p className="mt-1 text-sm text-horn">
                      {copy.deliverTo} {order.address}, {order.province}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:block md:text-right">
                    <span className="text-sm font-semibold text-horn">{copy.totalAmount}</span>
                    <p className="font-sans text-2xl font-extrabold text-wood">{formatVnd(order.totalAmount)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-lg border border-sand bg-pearl p-10 text-center">
              <ClipboardList className="mx-auto size-10 text-wood" />
              <h2 className="mt-4 font-sans text-2xl font-extrabold text-bark">{copy.emptyTitle}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-horn">{copy.emptyText}</p>
              <Link className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 text-sm font-semibold text-ivory transition hover:bg-bark" href="/products">
                <ShoppingBag className="size-4" />
                {copy.shopNow}
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
