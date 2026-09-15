import Image from "next/image";
import Link from "next/link";
import { Camera, CircleUserRound, MessageCircle } from "lucide-react";

const shopLinks = [
  { href: "/products", label: "Lược sừng" },
  { href: "/products", label: "Trâm cài" },
  { href: "/products", label: "Quà tặng" },
  { href: "/personalize/demo", label: "Khắc tên" },
];

const exploreLinks = [
  { href: "/lang-nghe-thuy-ung", label: "Làng nghề" },
  { href: "/trace/VM000123", label: "Truy xuất QR" },
  { href: "/policies/shipping", label: "Giao hàng" },
  { href: "/contact", label: "Liên hệ" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#f4ead8]/15 bg-[#56351f] px-5 py-14 text-[#f4ead8] md:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_1fr_1.2fr]">
        <div>
          <Image
            alt="Vân Mộc"
            className="h-auto w-80 max-w-full object-contain"
            height={106}
            src="/images/van-moc-logo-horizontal-original.png"
            width={320}
          />
          <div className="mt-8 flex gap-4 text-[#f4ead8]">
            <Camera className="size-5" />
            <CircleUserRound className="size-5" />
            <MessageCircle className="size-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#d4aa82]">Sản phẩm</h3>
            <ul className="space-y-3 text-sm text-[#f4ead8]/86">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link className="transition hover:text-white" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#d4aa82]">Khám phá</h3>
            <ul className="space-y-3 text-sm text-[#f4ead8]/86">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <Link className="transition hover:text-white" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#d4aa82]">Nhận tin từ Vân Mộc</h3>
          <form className="mt-5 flex overflow-hidden rounded-full bg-[#f4ead8]">
            <input
              className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-[#56351f] outline-none placeholder:text-[#8b6f59]"
              placeholder="Email của bạn"
              type="email"
            />
            <button className="bg-[#b08a67] px-6 text-sm font-semibold text-[#56351f]" type="button">
              Đăng ký
            </button>
          </form>
          <address className="mt-7 not-italic leading-7 text-[#f4ead8]/86">
            Làng nghề Thụy Ứng, Hà Nội, Việt Nam
            <br />
            hello@vanmoc.vn
            <br />
            0938 988 774
          </address>
        </div>
      </div>
    </footer>
  );
}
