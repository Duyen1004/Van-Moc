import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://vanmoc.vn"),
  title: {
    default: "Vân Mộc",
    template: "%s | Vân Mộc",
  },
  description: "Sản phẩm mỹ nghệ thủ công từ sừng tự nhiên, cá nhân hóa khắc laser và truy xuất nguồn gốc bằng QR.",
  openGraph: {
    title: "Vân Mộc",
    description: "Mỹ nghệ thủ công từ sừng tự nhiên, làng nghề Thụy Ứng.",
    siteName: "Vân Mộc",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
