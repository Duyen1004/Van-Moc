import Image from "next/image";
import Link from "next/link";
import { ChevronDown, CircleUserRound, Globe2, Menu, Search, ShoppingCart } from "lucide-react";

const navItems = [
  { href: "/", label: "TRANG CHỦ" },
  { href: "/products", label: "DANH MỤC" },
  { href: "/lang-nghe-thuy-ung", label: "LÀNG NGHỀ THỤY ỨNG" },
  { href: "/trace/VM000123", label: "TRUY XUẤT QR" },
  { href: "/order/VM20260915001", label: "ĐƠN HÀNG" },
  { href: "/personalize/demo", label: "CÁ NHÂN HÓA" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-[#f4ead8] text-bark shadow-[0_8px_24px_rgba(45,33,24,0.06)]">
      <div className="grid h-32 w-full grid-cols-[1fr_auto] items-center gap-6 px-5 md:grid-cols-3 md:px-10">
        <Link href="/" className="flex h-32 items-center justify-center" aria-label="Vân Mộc trang chủ">
          <Image
            alt="Vân Mộc"
            className="h-32 w-full max-w-[460px] object-contain"
            height={128}
            priority
            src="/images/van-moc-logo-horizontal-original.png"
            width={460}
          />
        </Link>

        <form className="hidden h-11 w-full max-w-[420px] items-center justify-self-center rounded-full border border-clay/70 bg-ivory/85 px-5 shadow-inner md:flex">
          <input
            aria-label="Tìm kiếm"
            className="min-w-0 flex-1 bg-transparent text-sm text-wood outline-none placeholder:text-horn"
            placeholder="Tìm sản phẩm, chất liệu, mã QR..."
            type="search"
          />
          <Search className="size-5 text-wood" />
        </form>

        <div className="flex items-center justify-end gap-4 md:justify-center md:gap-6">
          <button className="rounded-full border border-clay/25 bg-ivory/75 p-2.5 text-bark transition hover:border-clay" type="button" aria-label="Giỏ hàng">
            <ShoppingCart className="size-5" />
          </button>
          <button className="hidden items-center gap-1 rounded-full border border-clay/25 bg-ivory/75 px-3 py-2 text-sm text-bark transition hover:border-clay md:flex" type="button" aria-label="Ngôn ngữ">
            <Globe2 className="size-4" />
            <span className="font-medium">VI</span>
            <ChevronDown className="size-4" />
          </button>
          <button className="hidden items-center gap-1 rounded-full border border-clay/25 bg-ivory/75 px-3 py-2 text-sm text-bark transition hover:border-clay md:flex" type="button" aria-label="Tài khoản">
            <CircleUserRound className="size-4" />
            <ChevronDown className="size-4" />
          </button>
          <button className="rounded-full border border-clay/25 bg-ivory/75 p-2.5 text-bark md:hidden" type="button" aria-label="Menu">
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <nav className="hidden bg-[#56351f] md:block">
        <div className="flex w-full items-center justify-center gap-10 px-10">
          {navItems.map((item, index) => (
            <Link
              className="relative px-2 py-3.5 text-center font-serif text-[16px] font-bold uppercase tracking-wide text-[#f4ead8]/90 transition hover:text-[#f4ead8]"
              href={item.href}
              key={item.href}
            >
              {item.label}
              {index === 0 ? <span className="absolute inset-x-2 bottom-2 h-px bg-[#f4ead8]/70" /> : null}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
