"use client";

import { CheckCircle2, Home, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("order") ?? "";

  return (
    <main className="min-h-screen bg-ivory px-5 py-14 text-bark md:px-10 md:py-20">
      <section className="mx-auto max-w-2xl rounded-lg border border-sand bg-pearl px-6 py-12 text-center shadow-[0_18px_45px_rgba(45,33,24,0.08)] md:px-12">
        <div className="mx-auto inline-flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-8 ring-emerald-50/60">
          <CheckCircle2 className="size-11" />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-wood">Đặt hàng thành công</p>
        <h1 className="mt-3 font-sans text-3xl font-extrabold text-bark md:text-4xl">Cảm ơn bạn đã mua hàng</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-horn">
          Vân Mộc đã ghi nhận đơn hàng của bạn. Chúng tôi sẽ xác nhận và xử lý đơn trong thời gian sớm nhất.
        </p>

        {orderCode ? (
          <div className="mx-auto mt-7 max-w-sm rounded-lg border border-clay/20 bg-ivory px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-horn">Mã đơn hàng</p>
            <p className="mt-2 font-sans text-2xl font-extrabold text-wood">{orderCode}</p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-wood px-6 text-sm font-semibold text-ivory transition hover:bg-bark"
            href="/"
          >
            <Home className="size-4" />
            Về trang chủ
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-clay/40 px-6 text-sm font-semibold text-wood transition hover:bg-sand"
            href={orderCode ? `/order/${orderCode}` : "/order"}
          >
            <ReceiptText className="size-4" />
            Xem đơn hàng
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-ivory" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
