"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CartProvider } from "@/lib/cart";
import { I18nProvider } from "@/lib/i18n";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isManagementRoute = pathname.startsWith("/admin") || pathname.startsWith("/staff");

  if (isManagementRoute) {
    return (
      <I18nProvider>
        <CartProvider>{children}</CartProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <CartProvider>
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </CartProvider>
    </I18nProvider>
  );
}
