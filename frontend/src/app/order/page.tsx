"use client";

import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  MapPin,
  PackageCheck,
  ReceiptText,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiOrder, formatVnd, getOrder } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const ORDER_CODES_KEY = "vanmoc-order-codes";
const LAST_ORDER_KEY = "vanmoc-last-order-code";

const orderStatusFilters = ["ALL", "PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"] as const;
type OrderStatusFilter = (typeof orderStatusFilters)[number];
const ORDERS_PER_PAGE = 5;

const statusTabs: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

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

function statusClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "SHIPPING":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "CONFIRMED":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 ring-red-200";
    default:
      return "bg-sand text-wood ring-clay/20";
  }
}

function statusDotClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500";
    case "SHIPPING":
      return "bg-blue-500";
    case "CONFIRMED":
      return "bg-amber-500";
    case "CANCELLED":
      return "bg-red-500";
    default:
      return "bg-[#b08a67]";
  }
}

export default function OrdersPage() {
  const { locale, t } = useI18n();
  const copy = t.ordersPage;
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [lookupCode, setLookupCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeStatus, setActiveStatus] = useState<OrderStatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalSpent = orders.reduce((total, order) => total + order.totalAmount, 0);
  const pendingOrders = orders.filter((order) => order.orderStatus === "PENDING" || order.orderStatus === "CONFIRMED").length;
  const statusCounts = useMemo(() => {
    return orderStatusFilters.reduce<Record<OrderStatusFilter, number>>(
      (counts, status) => {
        counts[status] = status === "ALL" ? orders.length : orders.filter((order) => order.orderStatus === status).length;
        return counts;
      },
      {
        ALL: 0,
        PENDING: 0,
        CONFIRMED: 0,
        SHIPPING: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      },
    );
  }, [orders]);
  const filteredOrders = activeStatus === "ALL" ? orders : orders.filter((order) => order.orderStatus === activeStatus);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(pageStart, pageStart + ORDERS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, orders.length]);

  return (
    <main className="min-h-screen bg-[#fbf7ef] text-bark">
      <section className="px-5 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg border border-sand bg-pearl p-5 shadow-[0_14px_40px_rgba(45,33,24,0.06)] md:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-wood">{copy.eyebrow}</p>
                <h1 className="mt-2 font-sans text-3xl font-extrabold leading-tight text-bark md:text-4xl">{copy.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-horn">
                  Nhập mã đơn để tra cứu trạng thái, hoặc xem lại các đơn đã lưu trên thiết bị này.
                </p>
              </div>

              <form className="rounded-lg border border-sand bg-ivory p-3" onSubmit={handleLookup}>
                <label className="text-xs font-bold uppercase tracking-wide text-horn" htmlFor="order-lookup">
                  Mã đơn hàng
                </label>
                <div className="mt-3 flex gap-2">
                  <input
                    className="h-11 min-w-0 flex-1 rounded-md border border-clay/25 bg-white px-4 text-sm font-semibold text-bark outline-none transition placeholder:text-horn focus:border-clay focus:ring-4 focus:ring-clay/15"
                    id="order-lookup"
                    onChange={(event) => setLookupCode(event.target.value)}
                    placeholder={copy.lookupPlaceholder}
                    value={lookupCode}
                  />
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-wood px-4 text-sm font-semibold text-ivory transition hover:bg-bark" type="submit">
                    <Search className="size-4" />
                    {copy.lookup}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {message ? (
            <div className="mt-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertCircle className="size-4 shrink-0" />
              {message}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-lg border border-sand bg-pearl p-4">
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-sand text-wood">
                <ReceiptText className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-horn">Tổng đơn đã lưu</p>
                <p className="mt-0.5 font-sans text-2xl font-extrabold text-bark">{orders.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-sand bg-pearl p-4">
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-sand text-wood">
                <PackageCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-horn">Đang xử lý</p>
                <p className="mt-0.5 font-sans text-2xl font-extrabold text-bark">{pendingOrders}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-sand bg-pearl p-4">
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-sand text-wood">
                <ShoppingBag className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-horn">Tổng chi tiêu</p>
                <p className="mt-0.5 font-sans text-2xl font-extrabold text-bark">{formatVnd(totalSpent)}</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-sand bg-pearl p-10 text-sm font-semibold text-horn">
              <Loader2 className="size-5 animate-spin text-wood" />
              {copy.loading}
            </div>
          ) : orders.length > 0 ? (
            <div className="mt-6">
              <div className="overflow-x-auto rounded-lg border border-sand bg-pearl">
                <div className="flex min-w-max">
                  {statusTabs.map(({ value, label: fallbackLabel }) => {
                    const active = activeStatus === value;
                    const label = value === "ALL" ? fallbackLabel : copy.statuses[value as keyof typeof copy.statuses] ?? fallbackLabel;

                    return (
                      <button
                        className={`inline-flex h-12 items-center gap-2 border-b-2 px-4 text-sm font-bold transition ${
                          active ? "border-wood text-wood" : "border-transparent text-horn hover:bg-ivory hover:text-wood"
                        }`}
                        key={value}
                        onClick={() => setActiveStatus(value)}
                        type="button"
                      >
                        {label}
                        <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-sand text-wood" : "bg-ivory text-horn"}`}>
                          {statusCounts[value]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {filteredOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <Link
                      className="grid gap-5 rounded-lg border border-sand bg-pearl p-5 shadow-[0_12px_30px_rgba(45,33,24,0.05)] transition hover:-translate-y-0.5 hover:border-clay/40 hover:shadow-[0_18px_40px_rgba(45,33,24,0.08)] lg:grid-cols-[1.1fr_1fr_170px] lg:items-center"
                      href={`/order/${order.orderCode}`}
                      key={order.orderCode}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`size-2.5 rounded-full ${statusDotClass(order.orderStatus)}`} />
                          <span className="font-sans text-lg font-extrabold text-bark">{order.orderCode}</span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ring-1 ${statusClass(order.orderStatus)}`}>
                            {copy.statuses[order.orderStatus as keyof typeof copy.statuses] ?? order.orderStatus}
                          </span>
                        </div>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-horn">
                          <CalendarDays className="size-4" />
                          {formatDate(order.createdAt, locale)}
                        </p>
                        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-bark/90">
                          {order.items.map((item) => `${item.productName} x${item.quantity}`).join(", ")}
                        </p>
                      </div>

                      <p className="flex gap-2 rounded-md bg-ivory px-3 py-2 text-sm leading-6 text-horn lg:bg-transparent lg:p-0">
                        <MapPin className="mt-1 size-4 shrink-0 text-wood/80" />
                        <span>
                          {order.address}, {order.province}
                        </span>
                      </p>

                      <div className="flex items-center justify-between gap-4 border-t border-sand pt-4 lg:block lg:border-0 lg:pt-0 lg:text-right">
                        <span className="text-sm font-semibold text-horn lg:block">{copy.totalAmount}</span>
                        <p className="mt-1 font-sans text-2xl font-extrabold text-wood">{formatVnd(order.totalAmount)}</p>
                        <span className="mt-3 hidden text-sm font-bold text-wood lg:inline-flex">Xem chi tiết</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-lg border border-sand bg-pearl p-10 text-center">
                    <ClipboardList className="mx-auto size-10 text-wood" />
                    <h2 className="mt-4 font-sans text-2xl font-extrabold text-bark">Không có đơn ở trạng thái này</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-horn">Chọn trạng thái khác để xem các đơn hàng đã lưu trên thiết bị.</p>
                  </div>
                )}
              </div>

              {filteredOrders.length > ORDERS_PER_PAGE ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sand bg-pearl px-5 py-4">
                  <p className="text-sm font-semibold text-horn">
                    Hiển thị {pageStart + 1}-{Math.min(pageStart + ORDERS_PER_PAGE, filteredOrders.length)} / {filteredOrders.length} đơn
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Trang trước"
                      className="inline-flex size-9 items-center justify-center rounded-md border border-clay/30 text-wood transition hover:border-wood disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={safePage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      type="button"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;
                      const active = page === safePage;

                      return (
                        <button
                          className={`inline-flex size-9 items-center justify-center rounded-md text-sm font-bold transition ${
                            active ? "bg-wood text-ivory" : "border border-clay/30 text-wood hover:border-wood hover:bg-sand"
                          }`}
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          type="button"
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      aria-label="Trang sau"
                      className="inline-flex size-9 items-center justify-center rounded-md border border-clay/30 text-wood transition hover:border-wood disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={safePage === totalPages}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      type="button"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-sand bg-pearl p-10 text-center shadow-[0_18px_45px_rgba(45,33,24,0.08)]">
              <ClipboardList className="mx-auto size-12 text-wood" />
              <h2 className="mt-5 font-sans text-2xl font-extrabold text-bark">{copy.emptyTitle}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-horn">{copy.emptyText}</p>
              <Link className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-wood px-6 text-sm font-semibold text-ivory transition hover:bg-bark" href="/products">
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
