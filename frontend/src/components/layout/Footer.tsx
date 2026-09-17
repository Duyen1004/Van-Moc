"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, CircleUserRound, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const shopHrefs = ["/products", "/products", "/products", "/personalize/demo"];
const exploreHrefs = ["/lang-nghe-thuy-ung", "/trace/VM000123", "/policies/shipping", "/contact"];

export function Footer() {
  const { t } = useI18n();
  const footer = t.home.footer;

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
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#d4aa82]">{footer.products}</h3>
            <ul className="space-y-3 text-sm text-[#f4ead8]/86">
              {footer.shopLinks.map((label, index) => (
                <li key={label}>
                  <Link className="transition hover:text-white" href={shopHrefs[index]}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#d4aa82]">{footer.explore}</h3>
            <ul className="space-y-3 text-sm text-[#f4ead8]/86">
              {footer.exploreLinks.map((label, index) => (
                <li key={label}>
                  <Link className="transition hover:text-white" href={exploreHrefs[index]}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#d4aa82]">{footer.subscribe}</h3>
          <form className="mt-5 flex overflow-hidden rounded-full bg-[#f4ead8]">
            <input
              className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-[#56351f] outline-none placeholder:text-[#8b6f59]"
              placeholder={footer.emailPlaceholder}
              type="email"
            />
            <button className="bg-[#b08a67] px-6 text-sm font-semibold text-[#56351f]" type="button">
              {footer.submit}
            </button>
          </form>
          <address className="mt-7 not-italic leading-7 text-[#f4ead8]/86">
            {footer.address}
            <br />
            mocvan2026@gmail.com
            <br />
            0938 988 774
          </address>
        </div>
      </div>
    </footer>
  );
}
