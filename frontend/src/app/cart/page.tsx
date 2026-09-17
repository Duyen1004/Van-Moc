"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

const cartCopy = {
  vi: {
    title: "Giỏ hàng",
    subtitle: "Danh sách sản phẩm bạn đã thêm vào giỏ.",
    emptyTitle: "Giỏ hàng đang trống",
    emptyText: "Bạn chưa thêm sản phẩm nào vào giỏ hàng.",
    continueShopping: "Tiếp tục mua hàng",
    product: "Sản phẩm",
    quantity: "Số lượng",
    subtotal: "Tạm tính",
    orderSummary: "Tổng đơn hàng",
    checkout: "Thanh toán",
    remove: "Xóa",
  },
  en: {
    title: "Cart",
    subtitle: "Products you have added to your cart.",
    emptyTitle: "Your cart is empty",
    emptyText: "You have not added any products yet.",
    continueShopping: "Continue shopping",
    product: "Product",
    quantity: "Quantity",
    subtotal: "Subtotal",
    orderSummary: "Order summary",
    checkout: "Checkout",
    remove: "Remove",
  },
} as const;

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function CartPage() {
  const { locale } = useI18n();
  const { items, subtotal, totalItems, updateQuantity, removeItem } = useCart();
  const copy = cartCopy[locale];

  return (
    <main className="bg-ivory px-5 py-12 text-bark md:px-10 md:py-16">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-sand pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-horn">Van Moc</p>
            <h1 className="mt-3 font-serif text-5xl font-semibold text-bark">{copy.title}</h1>
            <p className="mt-3 text-horn">{copy.subtitle}</p>
          </div>
          <Link
            className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-clay/50 px-5 text-sm font-semibold text-wood transition hover:bg-sand"
            href="/products"
          >
            {copy.continueShopping}
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-lg border border-sand bg-pearl px-6 py-14 text-center">
            <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-sand text-wood">
              <ShoppingBag className="size-7" />
            </div>
            <h2 className="mt-5 font-serif text-3xl font-semibold text-bark">{copy.emptyTitle}</h2>
            <p className="mt-2 text-sm text-horn">{copy.emptyText}</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="overflow-hidden rounded-lg border border-sand bg-pearl">
              <div className="hidden grid-cols-[1fr_160px_130px] border-b border-sand px-5 py-4 text-xs font-bold uppercase tracking-wide text-horn md:grid">
                <span>{copy.product}</span>
                <span className="text-center">{copy.quantity}</span>
                <span className="text-right">{copy.subtotal}</span>
              </div>

              <div className="divide-y divide-sand">
                {items.map((item) => (
                  <article className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_160px_130px] md:items-center" key={item.slug}>
                    <div className="flex gap-4">
                      <img
                        alt={item.name}
                        className="size-24 shrink-0 rounded-lg bg-sand object-cover"
                        src={item.imageUrl}
                      />
                      <div>
                        <h2 className="font-semibold text-bark">{item.name}</h2>
                        {item.sku ? <p className="mt-1 text-xs text-horn">{item.sku}</p> : null}
                        <p className="mt-2 text-sm font-semibold text-wood">{formatVnd(item.price)}</p>
                        <button
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-horn transition hover:text-wood"
                          onClick={() => removeItem(item.slug)}
                          type="button"
                        >
                          <Trash2 className="size-3.5" />
                          {copy.remove}
                        </button>
                      </div>
                    </div>

                    <div className="inline-flex w-fit items-center rounded-full border border-clay/50 md:mx-auto">
                      <button
                        className="inline-flex size-9 items-center justify-center text-wood disabled:opacity-40"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                        type="button"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-11 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        className="inline-flex size-9 items-center justify-center text-wood"
                        onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                        type="button"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>

                    <p className="text-right font-semibold text-bark">{formatVnd(item.price * item.quantity)}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-lg bg-wood p-6 text-ivory">
              <h2 className="font-serif text-3xl font-semibold">{copy.orderSummary}</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-clay/35 pb-4">
                  <span>{copy.quantity}</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span>{copy.subtotal}</span>
                  <span className="font-semibold">{formatVnd(subtotal)}</span>
                </div>
              </div>
              <Link
                className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-ivory px-6 font-semibold text-wood transition hover:bg-sand"
                href="/checkout"
              >
                {copy.checkout}
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
