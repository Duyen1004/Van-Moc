"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Locale, messages } from "@/i18n/messages";

export type { Locale };

const LANGUAGE_STORAGE_KEY = "vanmoc-language";

type Dictionary = (typeof messages)[Locale];

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "vi" || value === "en";
}

function pathLocale() {
  if (typeof window === "undefined") {
    return null;
  }

  const firstSegment = window.location.pathname.split("/")[1];
  return isLocale(firstSegment) ? firstSegment : null;
}

function cookieLocale() {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(/(?:^|; )vanmoc-language=(vi|en)(?:;|$)/);
  return isLocale(match?.[1] ?? null) ? match?.[1] : null;
}

function writeLocaleUrl(nextLocale: Locale) {
  const currentPathname = window.location.pathname;
  const pathParts = currentPathname.split("/");
  const hasLocalePrefix = isLocale(pathParts[1] ?? null);
  const pathnameWithoutLocale = hasLocalePrefix ? `/${pathParts.slice(2).join("/")}` : currentPathname;
  const nextPathname = `/${nextLocale}${pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale}`;
  window.history.pushState(null, "", `${nextPathname}${window.location.search}${window.location.hash}`);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    const detectedLocale = pathLocale() ?? cookieLocale() ?? window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLocale(detectedLocale)) {
      setLocaleState(detectedLocale);
      document.documentElement.lang = detectedLocale;
    }
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
    document.cookie = `${LANGUAGE_STORAGE_KEY}=${nextLocale}; path=/; max-age=31536000`;
    document.documentElement.lang = nextLocale;
    writeLocaleUrl(nextLocale);
  };

  const value = useMemo(
    () => ({
      locale,
      t: messages[locale],
      setLocale,
      toggleLocale: () => setLocale(locale === "vi" ? "en" : "vi"),
    }),
    [locale],
  );

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages[locale]}>
      <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    </NextIntlClientProvider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
