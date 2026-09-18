"use client";

import { Bell, CheckCheck, PackageCheck, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const READ_NOTIFICATIONS_KEY = "vanmoc-read-notifications";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  time: string;
  tone: "order" | "promo" | "system";
};

const notifications: NotificationItem[] = [
  {
    id: "order-tracking",
    title: "Theo dõi đơn hàng",
    description: "Bạn có thể tra cứu trạng thái đơn hàng bằng mã VM trong mục Đơn hàng.",
    href: "/order",
    time: "Hôm nay",
    tone: "order",
  },
  {
    id: "engraving-service",
    title: "Dịch vụ khắc tên",
    description: "Vạn Mộc nhận khắc tên và lời nhắn ngắn trên sản phẩm theo yêu cầu.",
    href: "/personalize/demo",
    time: "Mới",
    tone: "promo",
  },
  {
    id: "traceability-ready",
    title: "Truy xuất nguồn gốc",
    description: "Quét hoặc nhập mã QR để xem hành trình chế tác của sản phẩm.",
    href: "/trace/VM000123",
    time: "Hệ thống",
    tone: "system",
  },
];

const toneStyles = {
  order: "bg-emerald-100 text-emerald-700",
  promo: "bg-amber-100 text-amber-700",
  system: "bg-sky-100 text-sky-700",
};

function readStoredIds() {
  try {
    const value = window.localStorage.getItem(READ_NOTIFICATIONS_KEY);
    const parsed = JSON.parse(value ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function NotificationBell() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    setReadIds(readStoredIds());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => !readIds.includes(item.id)).length, [readIds]);

  const persistReadIds = (nextReadIds: string[]) => {
    setReadIds(nextReadIds);
    window.localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(nextReadIds));
  };

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      persistReadIds([...readIds, id]);
    }
  };

  const markAllAsRead = () => {
    persistReadIds(notifications.map((item) => item.id));
  };

  return (
    <div className="relative z-50" ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Thông báo"
        className="relative inline-flex size-11 items-center justify-center rounded-full border border-clay/20 bg-ivory/85 text-bark shadow-[0_8px_20px_rgba(45,33,24,0.08)] transition hover:-translate-y-0.5 hover:border-clay/60 hover:bg-pearl"
        onClick={() => setIsOpen((open) => !open)}
        title="Thông báo"
        type="button"
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white ring-2 ring-[#f4ead8]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <section className="absolute right-0 top-[3.25rem] w-[min(calc(100vw-2rem),360px)] overflow-hidden rounded-lg border border-clay/20 bg-ivory text-bark shadow-[0_18px_50px_rgba(45,33,24,0.18)]">
          <div className="flex items-start justify-between gap-3 border-b border-sand px-4 py-3">
            <div>
              <p className="text-sm font-bold text-bark">Thông báo</p>
              <p className="mt-0.5 text-xs text-horn">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Bạn đã đọc tất cả thông báo"}
              </p>
            </div>
            <button
              aria-label="Đóng thông báo"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-wood transition hover:bg-sand"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2">
            {notifications.map((item) => {
              const isUnread = !readIds.includes(item.id);

              return (
                <Link
                  className={`block rounded-md px-3 py-3 transition hover:bg-sand ${isUnread ? "bg-pearl" : ""}`}
                  href={item.href}
                  key={item.id}
                  onClick={() => {
                    markAsRead(item.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full ${toneStyles[item.tone]}`}>
                      {item.tone === "order" ? <PackageCheck className="size-4" /> : <Sparkles className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-bold text-bark">{item.title}</span>
                        <span className="shrink-0 text-[11px] font-semibold text-horn">{item.time}</span>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-wood">{item.description}</span>
                    </span>
                    {isUnread ? <span className="mt-2 size-2 shrink-0 rounded-full bg-red-600" /> : null}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-sand p-2">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-bold text-wood transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-45"
              disabled={unreadCount === 0}
              onClick={markAllAsRead}
              type="button"
            >
              <CheckCheck className="size-4" />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
