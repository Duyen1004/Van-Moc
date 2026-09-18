"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const shopHrefs = ["/products", "/products", "/products", "/personalize/demo"];
const exploreHrefs = ["/lang-nghe-thuy-ung", "/trace/VM000123", "/policies/shipping", "/contact"];
const facebookUrl = "https://web.facebook.com/share/1HCaZYmsMT/?mibextid=wwXIfr&_rdc=1&_rdr";
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "mocvan2026@gmail.com";

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.03 3.66 9.2 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.77l-.44 2.91h-2.33V22C18.34 21.26 22 17.09 22 12.06z" />
    </svg>
  );
}

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
          <div className="mt-8 flex gap-3 text-[#f4ead8]">
            <a
              aria-label="Facebook Van Moc"
              className="inline-flex size-10 items-center justify-center rounded-full bg-[#1877f2] text-white shadow-[0_10px_24px_rgba(24,119,242,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f65d8]"
              href={facebookUrl}
              rel="noreferrer"
              target="_blank"
            >
              <FacebookIcon />
            </a>
            <a
              aria-label="Email Van Moc"
              className="inline-flex size-10 items-center justify-center rounded-full shadow-[0_10px_24px_rgba(244,234,216,0.18)] transition hover:-translate-y-0.5"
              href={`mailto:${supportEmail}`}
            >
              <Image alt="" className="size-10" height={40} src="/icons/email.svg" width={40} />
            </a>
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
            0349820511
          </address>
        </div>
      </div>
    </footer>
  );
}
