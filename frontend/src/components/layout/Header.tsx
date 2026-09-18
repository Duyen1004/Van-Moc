"use client";

import { Check, ChevronDown, CircleUserRound, Globe2, Menu, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ApiCategory, getCategories } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { Locale, useI18n } from "@/lib/i18n";

const AUTH_STORAGE_KEY = "vanmoc-authenticated";
const AUTH_USER_KEY = "vanmoc-auth-user";
const AUTH_TOKEN_KEY = "vanmoc-auth-token";

type NavItem = {
  href: string;
  labelKey: "home" | "products" | "village" | "trace" | "orders" | "personalize";
  match: readonly string[];
};

const navItems: NavItem[] = [
  { href: "/", labelKey: "home", match: ["/"] },
  { href: "/products", labelKey: "products", match: ["/products", "/categories"] },
  { href: "/lang-nghe-thuy-ung", labelKey: "village", match: ["/lang-nghe-thuy-ung"] },
  { href: "/trace/VM000123", labelKey: "trace", match: ["/trace"] },
  { href: "/order", labelKey: "orders", match: ["/order", "/checkout", "/cart"] },
  { href: "/personalize/demo", labelKey: "personalize", match: ["/personalize"] },
];

const languageOptions: Array<{ locale: Locale; label: string; shortLabel: string }> = [
  { locale: "vi", label: "Tiếng Việt", shortLabel: "VI" },
  { locale: "en", label: "English", shortLabel: "EN" },
];

type HeaderUser = {
  fullName: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
};

function isActivePath(pathname: string, matches: readonly string[]) {
  return matches.some((match) => (match === "/" ? pathname === "/" : pathname.startsWith(match)));
}

function normalizeRole(value?: string) {
  return String(value ?? "").trim().toUpperCase().replace(/^ROLE_/, "");
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t, setLocale } = useI18n();
  const { items } = useCart();
  const cartProductCount = items.length;
  const profileRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const productsNavRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(window.localStorage.getItem(AUTH_STORAGE_KEY) === "true");

      const userJson = window.localStorage.getItem(AUTH_USER_KEY);
      if (!userJson) {
        setUser(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(userJson) as HeaderUser;
        const normalizedRole = normalizeRole(parsedUser.role) as HeaderUser["role"];
        setUser({ ...parsedUser, role: normalizedRole });
      } catch {
        window.localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
      }
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("vanmoc-auth-changed", syncAuthState);
    window.addEventListener("vanmoc-order-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("vanmoc-auth-changed", syncAuthState);
      window.removeEventListener("vanmoc-order-changed", syncAuthState);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }

      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
      }

      if (productsNavRef.current && !productsNavRef.current.contains(event.target as Node)) {
        setProductsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    getCategories()
      .then((items) => setCategories(items))
      .catch(() => setCategories([]));
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.dispatchEvent(new Event("vanmoc-auth-changed"));
    setUser(null);
    setIsAuthenticated(false);
    setProfileOpen(false);
    router.push("/");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) {
      router.push("/products");
      return;
    }

    if (/^VM\d{3,}$/i.test(query)) {
      router.push(`/trace/${encodeURIComponent(query.toUpperCase())}`);
      return;
    }

    router.push(`/products?q=${encodeURIComponent(query)}`);
  };

  const currentLanguage = languageOptions.find((option) => option.locale === locale) ?? languageOptions[0];
  const productNavLabel = locale === "vi" ? "SẢN PHẨM" : "PRODUCTS";
  const userRole = normalizeRole(user?.role);

  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-[#f4ead8] text-bark shadow-[0_8px_24px_rgba(45,33,24,0.06)]">
      <div className="grid h-20 w-full grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[minmax(220px,300px)_minmax(320px,560px)_auto] md:gap-8 md:px-8 xl:px-14">
        <Link href="/" className="flex h-20 items-center justify-start" aria-label="Van Moc home">
          <Image
            alt="Van Moc"
            className="h-20 w-full max-w-[300px] object-contain"
            height={96}
            priority
            src="/images/van-moc-logo-horizontal-original.png"
            width={380}
          />
        </Link>

        <form
          className="hidden h-11 w-full items-center justify-self-center rounded-full border border-clay/70 bg-ivory/85 px-5 shadow-inner md:flex"
          onSubmit={handleSearch}
        >
          <input
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-sm text-wood outline-none placeholder:text-horn"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t.common.search}
            type="search"
            value={searchQuery}
          />
          <button aria-label="Search" className="inline-flex size-8 items-center justify-center text-wood" type="submit">
            <Search className="size-5" />
          </button>
        </form>

        <div className="flex items-center justify-end gap-2.5 md:gap-3">
          <Link
            className="relative inline-flex size-11 items-center justify-center rounded-full border border-clay/20 bg-ivory/85 text-bark shadow-[0_8px_20px_rgba(45,33,24,0.08)] transition hover:-translate-y-0.5 hover:border-clay/60 hover:bg-pearl"
            href="/cart"
            aria-label={t.common.cart}
          >
            <ShoppingCart className="size-5" />
            {cartProductCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-wood px-1.5 py-0.5 text-[11px] font-bold leading-none text-ivory ring-2 ring-[#f4ead8]">
                {cartProductCount > 99 ? "99+" : cartProductCount}
              </span>
            ) : null}
          </Link>

          <NotificationBell />

          <div className="relative z-50" data-i18n-skip="true" ref={languageRef}>
            <button
              aria-expanded={languageOpen}
              aria-label="Change language"
              className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-clay/20 bg-ivory/85 px-3.5 text-sm font-semibold text-bark shadow-[0_8px_20px_rgba(45,33,24,0.08)] transition hover:-translate-y-0.5 hover:border-clay/60 hover:bg-pearl"
              onClick={() => setLanguageOpen((open) => !open)}
              type="button"
            >
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-sand/80 text-wood">
                <Globe2 className="size-3.5" />
              </span>
              <span>{currentLanguage.shortLabel}</span>
              <span className="hidden text-horn lg:inline">{currentLanguage.label}</span>
              <ChevronDown className={`size-4 text-wood transition ${languageOpen ? "rotate-180" : ""}`} />
            </button>

            {languageOpen ? (
              <div className="absolute right-0 top-[3.25rem] z-50 w-52 overflow-hidden rounded-lg border border-clay/20 bg-ivory p-1.5 text-sm text-bark shadow-[0_18px_50px_rgba(45,33,24,0.16)]">
                {languageOptions.map((option) => {
                  const active = option.locale === locale;

                  return (
                    <button
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left font-semibold transition ${
                        active ? "bg-wood text-ivory" : "text-bark hover:bg-sand"
                      }`}
                      key={option.locale}
                      onClick={() => {
                        setLocale(option.locale);
                        setLanguageOpen(false);
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold ${active ? "text-ivory/85" : "text-wood"}`}>{option.shortLabel}</span>
                        {option.label}
                      </span>
                      {active ? <Check className="size-4" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-2 rounded-full border border-clay/25 bg-ivory/75 p-2.5 text-sm text-bark transition hover:border-clay md:px-3 md:py-2"
                type="button"
                aria-expanded={profileOpen}
                aria-label={t.common.account}
                onClick={() => setProfileOpen((open) => !open)}
              >
                <CircleUserRound className="size-5 md:size-4" />
                <span className="hidden max-w-24 truncate font-medium md:block">{user?.fullName ?? t.common.account}</span>
                <ChevronDown className="hidden size-4 md:block" />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-lg border border-clay/20 bg-ivory text-bark shadow-[0_18px_50px_rgba(45,33,24,0.16)]">
                  <div className="border-b border-sand px-4 py-3">
                    <p className="truncate font-semibold text-bark">{user?.fullName ?? t.common.account}</p>
                    <p className="truncate text-xs text-horn">{user?.email}</p>
                  </div>
                  <div className="grid p-2 text-sm font-semibold text-wood">
                    <Link className="rounded-md px-3 py-2 hover:bg-sand" href="/profile" onClick={() => setProfileOpen(false)}>
                      {t.common.profile}
                    </Link>
                    <Link className="rounded-md px-3 py-2 hover:bg-sand" href="/favorites" onClick={() => setProfileOpen(false)}>
                      Sản phẩm yêu thích
                    </Link>
                    {userRole === "ADMIN" ? (
                      <Link className="rounded-md px-3 py-2 hover:bg-sand" href="/admin" onClick={() => setProfileOpen(false)}>
                        {t.common.admin}
                      </Link>
                    ) : null}
                    {userRole === "STAFF" ? (
                      <Link className="rounded-md px-3 py-2 hover:bg-sand" href="/staff" onClick={() => setProfileOpen(false)}>
                        {t.common.staff}
                      </Link>
                    ) : null}
                    <Link className="rounded-md px-3 py-2 hover:bg-sand" href="/order" onClick={() => setProfileOpen(false)}>
                      {t.common.myOrders}
                    </Link>
                    <button className="rounded-md px-3 py-2 text-left text-red-700 hover:bg-red-50" type="button" onClick={handleLogout}>
                      {t.common.logout}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                className="inline-flex h-11 items-center whitespace-nowrap rounded-full border border-clay/30 bg-ivory/75 px-5 text-sm font-bold text-bark transition hover:border-clay hover:bg-pearl"
                href="/login"
              >
                {t.common.login}
              </Link>
              <Link
                className="inline-flex h-11 items-center whitespace-nowrap rounded-full bg-wood px-5 text-sm font-bold text-ivory transition hover:bg-bark"
                href="/register"
              >
                {t.common.register}
              </Link>
            </div>
          )}

          <button className="rounded-full border border-clay/25 bg-ivory/75 p-2.5 text-bark md:hidden" type="button" aria-label="Menu">
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <nav className="hidden bg-[#56351f] md:block">
        <div className="flex w-full items-center justify-center gap-10 px-10">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.match);
            const href = item.href;
            const label = item.labelKey === "products" ? productNavLabel : t.nav[item.labelKey];

            if (item.labelKey === "products") {
              return (
                <div
                  className="relative"
                  key={item.href}
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                  ref={productsNavRef}
                >
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex items-center gap-1 px-2 py-3.5 text-center font-serif text-[16px] font-bold uppercase tracking-wide transition ${
                      active ? "text-[#f4ead8]" : "text-[#f4ead8]/82 hover:text-[#f4ead8]"
                    }`}
                    href="/products"
                    onClick={() => setProductsOpen(false)}
                  >
                    {label}
                    <ChevronDown className={`size-4 transition ${productsOpen ? "rotate-180" : ""}`} />
                    <span
                      className={`absolute inset-x-2 bottom-2 h-px origin-left bg-[#f4ead8]/80 transition-transform duration-300 ease-out ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>

                  {productsOpen ? (
                    <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 overflow-hidden rounded-lg border border-clay/20 bg-ivory p-2 text-sm text-bark shadow-[0_18px_50px_rgba(45,33,24,0.22)]">
                      <Link
                        className="block rounded-md px-4 py-3 font-semibold text-wood transition hover:bg-sand"
                        href="/products"
                        onClick={() => setProductsOpen(false)}
                      >
                        Tất cả sản phẩm
                      </Link>
                      {categories.map((category) => (
                        <Link
                          className="block rounded-md px-4 py-3 font-semibold text-bark transition hover:bg-sand hover:text-wood"
                          href={`/products?category=${encodeURIComponent(category.slug)}`}
                          key={category.slug}
                          onClick={() => setProductsOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`relative px-2 py-3.5 text-center font-serif text-[16px] font-bold uppercase tracking-wide transition ${
                  active ? "text-[#f4ead8]" : "text-[#f4ead8]/82 hover:text-[#f4ead8]"
                }`}
                href={href}
                key={item.href}
              >
                {label}
                <span
                  className={`absolute inset-x-2 bottom-2 h-px origin-left bg-[#f4ead8]/80 transition-transform duration-300 ease-out ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
