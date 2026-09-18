"use client";

import { Check, MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

const quickMessages = [
  "Tôi muốn được tư vấn sản phẩm gỗ",
  "Tôi cần hỗ trợ đơn hàng",
  "Tôi muốn đặt khắc tên theo yêu cầu",
];

const messengerUrl = process.env.NEXT_PUBLIC_MESSENGER_URL || "https://m.me/vanmoc";
const messengerPageName = process.env.NEXT_PUBLIC_MESSENGER_PAGE_NAME || "Van Moc";

export function CustomerChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(quickMessages[0]);
  const [hasCopied, setHasCopied] = useState(false);

  const handleOpenMessenger = async () => {
    const trimmedMessage = message.trim();

    if (trimmedMessage && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(trimmedMessage);
        setHasCopied(true);
      } catch {
        setHasCopied(false);
      }
    }

    window.open(messengerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section
          aria-label="Chat chăm sóc khách hàng"
          className="w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-lg border border-clay/25 bg-pearl text-bark shadow-[0_24px_70px_rgba(45,33,24,0.22)]"
        >
          <div className="flex items-start justify-between gap-3 bg-[#56351f] px-4 py-3 text-ivory">
            <div>
              <p className="text-sm font-bold">Chăm sóc khách hàng</p>
              <p className="mt-0.5 text-xs text-ivory/78">Nhắn tin với {messengerPageName} qua Messenger</p>
            </div>
            <button
              aria-label="Đóng chat"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-ivory transition hover:bg-ivory/12"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3 px-4 py-4">
            <div className="rounded-lg bg-linen px-3 py-2.5 text-sm leading-6 text-wood">
              Xin chào, Vạn Mộc có thể hỗ trợ bạn chọn sản phẩm, kiểm tra đơn hàng hoặc tư vấn khắc tên.
            </div>

            <div className="flex flex-wrap gap-2">
              {quickMessages.map((item) => (
                <button
                  className={`rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition ${
                    message === item
                      ? "border-wood bg-wood text-ivory"
                      : "border-clay/25 bg-ivory text-wood hover:border-clay/60"
                  }`}
                  key={item}
                  onClick={() => setMessage(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="sr-only">Nội dung tin nhắn</span>
              <textarea
                className="min-h-24 w-full resize-none rounded-lg border border-clay/25 bg-ivory px-3 py-2.5 text-sm leading-6 text-bark outline-none transition placeholder:text-horn focus:border-wood focus:ring-2 focus:ring-wood/15"
                onChange={(event) => {
                  setMessage(event.target.value);
                  setHasCopied(false);
                }}
                placeholder="Nhập nội dung bạn muốn gửi..."
                value={message}
              />
            </label>

            {hasCopied ? (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#0a7cff]">
                <Check className="size-3.5" />
                Nội dung đã được copy, dán vào Messenger để gửi cho Page.
              </p>
            ) : null}

            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0a7cff] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(10,124,255,0.22)] transition hover:bg-[#006fe6]"
              onClick={handleOpenMessenger}
              type="button"
            >
              <Send className="size-4" />
              Mở Messenger Page
            </button>
          </div>
        </section>
      ) : null}

      <button
        aria-label={isOpen ? "Đóng chat chăm sóc khách hàng" : "Mở chat chăm sóc khách hàng"}
        aria-expanded={isOpen}
        className="inline-flex size-14 items-center justify-center rounded-full bg-[#0a7cff] text-white shadow-[0_16px_36px_rgba(10,124,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#006fe6] focus:outline-none focus:ring-4 focus:ring-[#0a7cff]/25"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
