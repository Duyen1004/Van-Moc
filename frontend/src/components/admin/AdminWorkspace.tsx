"use client";

import {
  BarChart3,
  Boxes,
  CircleUserRound,
  ClipboardList,
  Edit3,
  FilePenLine,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  PackagePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  QrCode,
  Save,
  SearchCheck,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tags,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AdminOrder,
  AdminBanner,
  AdminCategory,
  AdminContent,
  AdminPersonalization,
  AdminProduct,
  AdminReview,
  AdminTraceProduct,
  ProductMutationPayload,
  createAdminBanner,
  createAdminCategory,
  createAdminContent,
  archiveAdminProduct,
  createAdminTraceProduct,
  createAdminProduct,
  formatVnd,
  getAdminOrders,
  getAdminBanners,
  getAdminCategories,
  getAdminContents,
  getAdminPersonalizations,
  getAdminProducts,
  getAdminReviews,
  getAdminTraceProducts,
  getAdminTraceProduct,
  getCategories,
  deleteAdminBanner,
  deleteAdminCategory,
  deleteAdminContent,
  updateAdminBanner,
  updateAdminCategory,
  updateAdminContent,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminReviewStatus,
  updateAdminTraceStatus,
  updateAdminTraceProduct,
} from "@/lib/api";

type Role = "staff" | "admin";
type PageKey =
  | "dashboard"
  | "products"
  | "product-create"
  | "product-edit"
  | "inventory"
  | "orders"
  | "personalization"
  | "traceability"
  | "trace-create"
  | "reviews"
  | "staff"
  | "customers"
  | "categories"
  | "banners"
  | "contents"
  | "seo"
  | "settings"
  | "roles";

type AdminWorkspaceProps = {
  role: Role;
  page: PageKey;
  productSlug?: string;
};

type WorkspaceUser = {
  fullName?: string;
  email?: string;
  role?: "CUSTOMER" | "STAFF" | "ADMIN";
};

const AUTH_STORAGE_KEY = "vanmoc-authenticated";
const AUTH_USER_KEY = "vanmoc-auth-user";
const AUTH_TOKEN_KEY = "vanmoc-auth-token";

const staffNav = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/products", label: "Sáº£n pháº©m", icon: Boxes },
  { href: "/staff/products/create", label: "ThÃªm sáº£n pháº©m", icon: PackagePlus },
  { href: "/staff/products/inventory", label: "Quáº£n lÃ½ tá»“n kho", icon: BarChart3 },
  { href: "/staff/orders", label: "ÄÆ¡n hÃ ng", icon: ClipboardList },
  { href: "/staff/personalization", label: "CÃ¡ nhÃ¢n hÃ³a", icon: Sparkles },
  { href: "/staff/traceability", label: "QR / Traceability", icon: QrCode },
  { href: "/staff/reviews", label: "Review", icon: Star },
];

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sáº£n pháº©m", icon: Boxes },
  { href: "/admin/products/create", label: "ThÃªm sáº£n pháº©m", icon: PackagePlus },
  { href: "/admin/products/inventory", label: "Quáº£n lÃ½ tá»“n kho", icon: BarChart3 },
  { href: "/admin/orders", label: "ÄÆ¡n hÃ ng", icon: ClipboardList },
  { href: "/admin/personalization", label: "CÃ¡ nhÃ¢n hÃ³a", icon: Sparkles },
  { href: "/admin/traceability", label: "QR / Traceability", icon: QrCode },
  { href: "/admin/traceability/create", label: "Táº¡o mÃ£ QR", icon: QrCode },
  { href: "/admin/reviews", label: "Review", icon: Star },
  { href: "/admin/staff", label: "Quáº£n lÃ½ Staff", icon: ShieldCheck },
  { href: "/admin/customers", label: "Quáº£n lÃ½ Customer", icon: Users },
  { href: "/admin/categories", label: "Danh má»¥c", icon: Tags },
  { href: "/admin/banners", label: "Banner", icon: Megaphone },
  { href: "/admin/contents", label: "Ná»™i dung", icon: FilePenLine },
  { href: "/admin/seo", label: "SEO", icon: SearchCheck },
  { href: "/admin/settings", label: "Cáº¥u hÃ¬nh", icon: Settings },
  { href: "/admin/roles", label: "PhÃ¢n quyá»n", icon: KeyRound },
];

const pageContent: Record<
  PageKey,
  {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction?: string;
    stats: Array<{ label: string; value: string; note: string }>;
    rows: Array<{ title: string; meta: string; status: string }>;
  }
> = {
  dashboard: {
    eyebrow: "Tá»•ng quan váº­n hÃ nh",
    title: "Dashboard",
    description: "Theo dÃµi nhanh doanh thu, Ä‘Æ¡n hÃ ng, sáº£n pháº©m cáº§n xá»­ lÃ½ vÃ  mÃ£ QR má»›i táº¡o.",
    stats: [
      { label: "ÄÆ¡n hÃ´m nay", value: "18", note: "+6 Ä‘Æ¡n má»›i" },
      { label: "Doanh thu", value: "12.8tr", note: "MVP demo" },
      { label: "Chá» kháº¯c", value: "7", note: "Cáº§n duyá»‡t ná»™i dung" },
      { label: "QR Ä‘Ã£ táº¡o", value: "42", note: "Trong thÃ¡ng nÃ y" },
    ],
    rows: [
      { title: "VM20260915001", meta: "LÆ°á»£c sá»«ng tá»± nhiÃªn VM01", status: "Chá» xÃ¡c nháº­n" },
      { title: "VM20260915002", meta: "Kháº¯c tÃªn: NGUYá»„N AN", status: "Äang hoÃ n thiá»‡n" },
      { title: "VM-BATCH-2026-09", meta: "LÃ´ sáº£n xuáº¥t má»›i", status: "ÄÃ£ cÃ³ QR" },
    ],
  },
  products: {
    eyebrow: "Quáº£n lÃ½ bÃ¡n hÃ ng",
    title: "Sáº£n pháº©m",
    description: "ThÃªm, sá»­a, áº©n hiá»‡n sáº£n pháº©m vÃ  kiá»ƒm tra tráº¡ng thÃ¡i bÃ¡n trÃªn website.",
    primaryAction: "ThÃªm sáº£n pháº©m",
    stats: [
      { label: "Äang bÃ¡n", value: "24", note: "Hiá»ƒn thá»‹ trÃªn web" },
      { label: "Sáº¯p háº¿t", value: "5", note: "Cáº§n nháº­p thÃªm" },
      { label: "áº¨n", value: "3", note: "ChÆ°a cÃ´ng bá»‘" },
      { label: "BÃ¡n cháº¡y", value: "8", note: "Äang ghim" },
    ],
    rows: [
      { title: "LÆ°á»£c sá»«ng tá»± nhiÃªn VM01", meta: "350.000Ä‘ Â· 18 tá»“n", status: "Äang bÃ¡n" },
      { title: "TrÃ¢m cÃ i vÃ¢n sá»«ng", meta: "420.000Ä‘ Â· 9 tá»“n", status: "BÃ¡n cháº¡y" },
      { title: "Set quÃ  thá»§ cÃ´ng", meta: "690.000Ä‘ Â· 4 tá»“n", status: "Sáº¯p háº¿t" },
    ],
  },
  "product-create": {
    eyebrow: "Sáº£n pháº©m",
    title: "ThÃªm sáº£n pháº©m",
    description: "Nháº­p thÃ´ng tin cÆ¡ báº£n, áº£nh, giÃ¡, danh má»¥c vÃ  tÃ¹y chá»n cÃ¡ nhÃ¢n hÃ³a.",
    primaryAction: "LÆ°u sáº£n pháº©m",
    stats: [
      { label: "TÃªn", value: "01", note: "Báº¯t buá»™c" },
      { label: "áº¢nh", value: "04", note: "NÃªn cÃ³" },
      { label: "GiÃ¡", value: "VNÄ", note: "Theo sáº£n pháº©m" },
      { label: "Kháº¯c tÃªn", value: "CÃ³", note: "TÃ¹y chá»n" },
    ],
    rows: [
      { title: "ThÃ´ng tin chung", meta: "TÃªn, mÃ´ táº£, cháº¥t liá»‡u, cÃ¢u chuyá»‡n sáº£n pháº©m", status: "Biá»ƒu máº«u" },
      { title: "HÃ¬nh áº£nh", meta: "áº¢nh Ä‘áº¡i diá»‡n vÃ  áº£nh chi tiáº¿t", status: "Táº£i lÃªn" },
      { title: "CÃ¡ nhÃ¢n hÃ³a", meta: "Cho phÃ©p kháº¯c tÃªn, charm, font chá»¯", status: "TÃ¹y chá»n" },
    ],
  },
  "product-edit": {
    eyebrow: "Sáº£n pháº©m",
    title: "Sá»­a sáº£n pháº©m",
    description: "Cáº­p nháº­t thÃ´ng tin sáº£n pháº©m, tráº¡ng thÃ¡i bÃ¡n, tá»“n kho vÃ  áº£nh Ä‘áº¡i diá»‡n.",
    primaryAction: "LÆ°u thay Ä‘á»•i",
    stats: [
      { label: "TÃªn", value: "01", note: "Báº¯t buá»™c" },
      { label: "áº¢nh", value: "01", note: "Äáº¡i diá»‡n" },
      { label: "GiÃ¡", value: "VNÄ", note: "Theo sáº£n pháº©m" },
      { label: "XÃ³a", value: "Má»m", note: "Chuyá»ƒn tráº¡ng thÃ¡i áº©n" },
    ],
    rows: [
      { title: "ThÃ´ng tin chung", meta: "TÃªn, mÃ´ táº£, cháº¥t liá»‡u, cÃ¢u chuyá»‡n sáº£n pháº©m", status: "Biá»ƒu máº«u" },
      { title: "BÃ¡n hÃ ng", meta: "GiÃ¡, tá»“n kho, tráº¡ng thÃ¡i hiá»ƒn thá»‹", status: "Cáº­p nháº­t" },
      { title: "áº¢nh Ä‘áº¡i diá»‡n", meta: "URL áº£nh chÃ­nh hiá»ƒn thá»‹ trÃªn website", status: "Cáº­p nháº­t" },
    ],
  },
  inventory: {
    eyebrow: "Kho hÃ ng",
    title: "Quáº£n lÃ½ tá»“n kho",
    description: "Theo dÃµi sá»‘ lÆ°á»£ng cÃ²n láº¡i, cáº£nh bÃ¡o sáº¯p háº¿t vÃ  lÃ´ sáº£n xuáº¥t liÃªn quan.",
    stats: [
      { label: "Tá»•ng tá»“n", value: "186", note: "Táº¥t cáº£ sáº£n pháº©m" },
      { label: "Sáº¯p háº¿t", value: "5", note: "DÆ°á»›i 5 mÃ³n" },
      { label: "Äang giá»¯", value: "12", note: "Trong giá»/Ä‘Æ¡n" },
      { label: "LÃ´ má»›i", value: "3", note: "Chá» nháº­p kho" },
    ],
    rows: [
      { title: "LÆ°á»£c sá»«ng VM01", meta: "18 tá»“n Â· VM-BATCH-2026-09", status: "á»”n Ä‘á»‹nh" },
      { title: "Set quÃ  thá»§ cÃ´ng", meta: "4 tá»“n Â· VM-BATCH-2026-08", status: "Sáº¯p háº¿t" },
      { title: "Charm Ã¡nh vÃ ng", meta: "32 tá»“n Â· VM-BATCH-2026-09", status: "á»”n Ä‘á»‹nh" },
    ],
  },
  orders: {
    eyebrow: "Váº­n hÃ nh",
    title: "ÄÆ¡n hÃ ng",
    description: "Xem Ä‘Æ¡n, cáº­p nháº­t tráº¡ng thÃ¡i thanh toÃ¡n, xá»­ lÃ½ kháº¯c tÃªn vÃ  giao hÃ ng.",
    primaryAction: "Cáº­p nháº­t tráº¡ng thÃ¡i",
    stats: [
      { label: "Chá» xÃ¡c nháº­n", value: "6", note: "Cáº§n gá»i láº¡i" },
      { label: "Äang lÃ m", value: "9", note: "XÆ°á»Ÿng xá»­ lÃ½" },
      { label: "Äang giao", value: "4", note: "ÄÆ¡n váº­n chuyá»ƒn" },
      { label: "HoÃ n thÃ nh", value: "128", note: "ThÃ¡ng nÃ y" },
    ],
    rows: [
      { title: "VM20260915001", meta: "Nguyá»…n An Â· 1 sáº£n pháº©m", status: "Chá» xÃ¡c nháº­n" },
      { title: "VM20260915002", meta: "LÃª Minh Â· CÃ³ kháº¯c tÃªn", status: "Äang hoÃ n thiá»‡n" },
      { title: "VM20260915003", meta: "Thu HÃ  Â· Set quÃ  táº·ng", status: "Äang giao" },
    ],
  },
  personalization: {
    eyebrow: "CÃ¡ nhÃ¢n hÃ³a",
    title: "Ná»™i dung kháº¯c",
    description: "Kiá»ƒm tra chá»¯ kháº¯c, font, vá»‹ trÃ­ vÃ  ghi chÃº riÃªng trÆ°á»›c khi chuyá»ƒn xÆ°á»Ÿng.",
    stats: [
      { label: "Chá» duyá»‡t", value: "7", note: "Ná»™i dung má»›i" },
      { label: "Äang kháº¯c", value: "5", note: "Táº¡i xÆ°á»Ÿng" },
      { label: "Cáº§n há»i láº¡i", value: "2", note: "Chá»¯ quÃ¡ dÃ i" },
      { label: "HoÃ n táº¥t", value: "31", note: "Tuáº§n nÃ y" },
    ],
    rows: [
      { title: "NGUYá»„N AN", meta: "LÆ°á»£c sá»«ng VM01 Â· Font serif", status: "Chá» duyá»‡t" },
      { title: "Má»˜C NHIÃŠN", meta: "TrÃ¢m cÃ i Â· Vá»‹ trÃ­ cáº¡nh pháº£i", status: "Äang kháº¯c" },
      { title: "HÃ€ 2026", meta: "Set quÃ  Â· KÃ¨m QR", status: "HoÃ n táº¥t" },
    ],
  },
  traceability: {
    eyebrow: "QR / Traceability",
    title: "Quáº£n lÃ½ mÃ£ truy xuáº¥t",
    description: "Táº¡o mÃ£, quáº£n lÃ½ mÃ£ vÃ  cáº­p nháº­t hÃ nh trÃ¬nh cháº¥t liá»‡u, lÃ´ sáº£n xuáº¥t, nghá»‡ nhÃ¢n.",
    primaryAction: "Táº¡o mÃ£ QR",
    stats: [
      { label: "ÄÃ£ táº¡o", value: "42", note: "ThÃ¡ng nÃ y" },
      { label: "Chá» gáº¯n", value: "8", note: "Sau hoÃ n thiá»‡n" },
      { label: "ÄÃ£ quÃ©t", value: "326", note: "Tá»•ng lÆ°á»£t" },
      { label: "LÃ´ sáº£n xuáº¥t", value: "12", note: "Äang quáº£n lÃ½" },
    ],
    rows: [
      { title: "VM000123", meta: "LÆ°á»£c sá»«ng VM01 Â· VM-BATCH-2026-09", status: "Äang hoáº¡t Ä‘á»™ng" },
      { title: "VM000124", meta: "TrÃ¢m cÃ i Â· Nghá»‡ nhÃ¢n Thá»¥y á»¨ng", status: "Chá» gáº¯n" },
      { title: "VM000125", meta: "Set quÃ  Â· ÄÃ£ cáº­p nháº­t báº£o quáº£n", status: "Äang hoáº¡t Ä‘á»™ng" },
    ],
  },
  "trace-create": {
    eyebrow: "QR / Traceability",
    title: "Táº¡o mÃ£ QR",
    description: "Gáº¯n mÃ£ Ä‘á»‹nh danh vá»›i sáº£n pháº©m hoáº·c lÃ´ sáº£n xuáº¥t Ä‘á»ƒ khÃ¡ch hÃ ng truy xuáº¥t.",
    primaryAction: "Táº¡o mÃ£",
    stats: [
      { label: "MÃ£ má»›i", value: "VM", note: "Tá»± sinh" },
      { label: "Sáº£n pháº©m", value: "01", note: "Báº¯t buá»™c" },
      { label: "LÃ´", value: "01", note: "CÃ³ thá»ƒ chá»n" },
      { label: "Tráº¡ng thÃ¡i", value: "NhÃ¡p", note: "TrÆ°á»›c khi cÃ´ng bá»‘" },
    ],
    rows: [
      { title: "ThÃ´ng tin sáº£n pháº©m", meta: "Chá»n sáº£n pháº©m hoáº·c lÃ´ sáº£n xuáº¥t", status: "Báº¯t buá»™c" },
      { title: "HÃ nh trÃ¬nh", meta: "Cháº¥t liá»‡u, nghá»‡ nhÃ¢n, cÃ´ng Ä‘oáº¡n", status: "Báº¯t buá»™c" },
      { title: "HÆ°á»›ng dáº«n báº£o quáº£n", meta: "Ná»™i dung hiá»ƒn thá»‹ cho khÃ¡ch", status: "TÃ¹y chá»n" },
    ],
  },
  reviews: {
    eyebrow: "KhÃ¡ch hÃ ng",
    title: "Review",
    description: "Duyá»‡t Ä‘Ã¡nh giÃ¡, pháº£n há»“i khÃ¡ch hÃ ng vÃ  chá»n review ná»•i báº­t.",
    stats: [
      { label: "Chá» duyá»‡t", value: "9", note: "Review má»›i" },
      { label: "5 sao", value: "86%", note: "Tá»•ng Ä‘Ã¡nh giÃ¡" },
      { label: "ÄÃ£ pháº£n há»“i", value: "34", note: "ThÃ¡ng nÃ y" },
      { label: "Ghim", value: "4", note: "Trang chá»§" },
    ],
    rows: [
      { title: "Linda", meta: "LÆ°á»£c sá»«ng tá»± nhiÃªn Â· 5 sao", status: "Chá» duyá»‡t" },
      { title: "Peter", meta: "TrÃ¢m cÃ i vÃ¢n sá»«ng Â· 5 sao", status: "ÄÃ£ hiá»ƒn thá»‹" },
      { title: "Andy", meta: "Set quÃ  thá»§ cÃ´ng Â· 4 sao", status: "ÄÃ£ pháº£n há»“i" },
    ],
  },
  staff: {
    eyebrow: "Admin",
    title: "Quáº£n lÃ½ Staff",
    description: "ThÃªm nhÃ¢n sá»± váº­n hÃ nh, khÃ³a tÃ i khoáº£n vÃ  phÃ¢n ca xá»­ lÃ½ Ä‘Æ¡n hÃ ng.",
    primaryAction: "ThÃªm staff",
    stats: [
      { label: "Staff", value: "6", note: "Äang hoáº¡t Ä‘á»™ng" },
      { label: "Online", value: "3", note: "HÃ´m nay" },
      { label: "Táº¡m khÃ³a", value: "1", note: "Chá» kiá»ƒm tra" },
      { label: "Vai trÃ²", value: "4", note: "NhÃ³m quyá»n" },
    ],
    rows: [
      { title: "Mai Anh", meta: "Quáº£n lÃ½ Ä‘Æ¡n hÃ ng", status: "Hoáº¡t Ä‘á»™ng" },
      { title: "Thu UyÃªn", meta: "Cáº­p nháº­t sáº£n pháº©m", status: "Hoáº¡t Ä‘á»™ng" },
      { title: "Minh Khang", meta: "QR / Traceability", status: "Táº¡m khÃ³a" },
    ],
  },
  customers: {
    eyebrow: "Admin",
    title: "Quáº£n lÃ½ Customer",
    description: "Xem khÃ¡ch hÃ ng, lá»‹ch sá»­ mua, tráº¡ng thÃ¡i tÃ i khoáº£n vÃ  ghi chÃº chÄƒm sÃ³c.",
    stats: [
      { label: "KhÃ¡ch hÃ ng", value: "1.248", note: "Tá»•ng tÃ i khoáº£n" },
      { label: "Má»›i", value: "38", note: "Tuáº§n nÃ y" },
      { label: "Quay láº¡i", value: "24%", note: "Tá»‰ lá»‡ mua láº¡i" },
      { label: "VIP", value: "16", note: "KhÃ¡ch thÃ¢n thiáº¿t" },
    ],
    rows: [
      { title: "Nguyá»…n An", meta: "3 Ä‘Æ¡n Â· 1 sáº£n pháº©m cÃ¡ nhÃ¢n hÃ³a", status: "ThÃ¢n thiáº¿t" },
      { title: "LÃª Minh", meta: "1 Ä‘Æ¡n Â· CÃ³ QR", status: "Má»›i" },
      { title: "Thu HÃ ", meta: "5 Ä‘Æ¡n Â· Set quÃ ", status: "VIP" },
    ],
  },
  categories: {
    eyebrow: "Admin",
    title: "Quáº£n lÃ½ danh má»¥c",
    description: "Sáº¯p xáº¿p nhÃ³m sáº£n pháº©m, tÃªn danh má»¥c vÃ  tráº¡ng thÃ¡i hiá»ƒn thá»‹.",
    primaryAction: "ThÃªm danh má»¥c",
    stats: [
      { label: "Danh má»¥c", value: "5", note: "Äang dÃ¹ng" },
      { label: "áº¨n", value: "1", note: "ChÆ°a bÃ¡n" },
      { label: "Ná»•i báº­t", value: "3", note: "TrÃªn menu" },
      { label: "Sáº£n pháº©m", value: "24", note: "ÄÃ£ gáº¯n" },
    ],
    rows: [
      { title: "LÆ°á»£c sá»«ng", meta: "8 sáº£n pháº©m", status: "Hiá»ƒn thá»‹" },
      { title: "TrÃ¢m cÃ i", meta: "5 sáº£n pháº©m", status: "Hiá»ƒn thá»‹" },
      { title: "QuÃ  táº·ng", meta: "4 sáº£n pháº©m", status: "Ná»•i báº­t" },
    ],
  },
  banners: {
    eyebrow: "Admin",
    title: "Quáº£n lÃ½ banner",
    description: "Cáº­p nháº­t banner trang chá»§, danh má»¥c, thÃ´ng Ä‘iá»‡p vÃ  nÃºt Ä‘iá»u hÆ°á»›ng.",
    primaryAction: "ThÃªm banner",
    stats: [
      { label: "Banner", value: "4", note: "Äang cháº¡y" },
      { label: "Mobile", value: "4", note: "ÄÃ£ tá»‘i Æ°u" },
      { label: "CTR", value: "8.2%", note: "Demo" },
      { label: "Lá»‹ch", value: "2", note: "Äáº·t trÆ°á»›c" },
    ],
    rows: [
      { title: "Sáº£n pháº©m má»›i tá»« sá»«ng tá»± nhiÃªn", meta: "Trang chá»§", status: "Äang cháº¡y" },
      { title: "BÃ¡n cháº¡y mÃ¹a nÃ y", meta: "Danh má»¥c", status: "Äang cháº¡y" },
      { title: "QuÃ  táº·ng cÃ¡ nhÃ¢n hÃ³a", meta: "Chiáº¿n dá»‹ch", status: "Äáº·t lá»‹ch" },
    ],
  },
  contents: {
    eyebrow: "Admin",
    title: "Quáº£n lÃ½ ná»™i dung",
    description: "Sá»­a ná»™i dung trang lÃ ng nghá», footer, chÃ­nh sÃ¡ch vÃ  bÃ i viáº¿t giá»›i thiá»‡u.",
    stats: [
      { label: "Trang", value: "8", note: "Ná»™i dung tÄ©nh" },
      { label: "BÃ i viáº¿t", value: "6", note: "LÃ ng nghá»" },
      { label: "NhÃ¡p", value: "3", note: "ChÆ°a cÃ´ng bá»‘" },
      { label: "ÄÃ£ sá»­a", value: "12", note: "ThÃ¡ng nÃ y" },
    ],
    rows: [
      { title: "LÃ ng nghá» Thá»¥y á»¨ng", meta: "Trang giá»›i thiá»‡u", status: "ÄÃ£ cÃ´ng bá»‘" },
      { title: "ChÃ­nh sÃ¡ch giao hÃ ng", meta: "Footer", status: "Cáº§n rÃ  soÃ¡t" },
      { title: "CÃ¢u chuyá»‡n cháº¥t liá»‡u", meta: "Trang chá»§", status: "ÄÃ£ cÃ´ng bá»‘" },
    ],
  },
  seo: {
    eyebrow: "Admin",
    title: "Quáº£n lÃ½ SEO",
    description: "Tá»‘i Æ°u tiÃªu Ä‘á», mÃ´ táº£, slug, áº£nh chia sáº» vÃ  tráº¡ng thÃ¡i index.",
    stats: [
      { label: "Trang thiáº¿u mÃ´ táº£", value: "4", note: "Cáº§n bá»• sung" },
      { label: "Slug tá»‘t", value: "92%", note: "Äáº¡t chuáº©n" },
      { label: "áº¢nh OG", value: "7", note: "ÄÃ£ cÃ³" },
      { label: "Index", value: "18", note: "Trang cÃ´ng khai" },
    ],
    rows: [
      { title: "/products", meta: "Danh má»¥c sáº£n pháº©m", status: "Tá»‘t" },
      { title: "/lang-nghe-thuy-ung", meta: "Thiáº¿u mÃ´ táº£ SEO", status: "Cáº§n sá»­a" },
      { title: "/trace/VM000123", meta: "KhÃ´ng index", status: "ÄÃºng cáº¥u hÃ¬nh" },
    ],
  },
  settings: {
    eyebrow: "Admin",
    title: "Cáº¥u hÃ¬nh website",
    description: "Quáº£n lÃ½ thÃ´ng tin liÃªn há»‡, mÃ u thÆ°Æ¡ng hiá»‡u, váº­n chuyá»ƒn vÃ  thanh toÃ¡n.",
    stats: [
      { label: "Thanh toÃ¡n", value: "2", note: "PhÆ°Æ¡ng thá»©c" },
      { label: "Váº­n chuyá»ƒn", value: "3", note: "Khu vá»±c" },
      { label: "Email", value: "OK", note: "ThÃ´ng bÃ¡o Ä‘Æ¡n" },
      { label: "Theme", value: "VÃ¢n Má»™c", note: "Äang dÃ¹ng" },
    ],
    rows: [
      { title: "ThÃ´ng tin cá»­a hÃ ng", meta: "Email, hotline, Ä‘á»‹a chá»‰", status: "ÄÃ£ lÆ°u" },
      { title: "PhÃ­ váº­n chuyá»ƒn", meta: "Ná»™i thÃ nh, ngoáº¡i thÃ nh", status: "Cáº§n cáº­p nháº­t" },
      { title: "MÃ u thÆ°Æ¡ng hiá»‡u", meta: "NÃ¢u sá»«ng vÃ  kem logo", status: "Äang dÃ¹ng" },
    ],
  },
  roles: {
    eyebrow: "Admin",
    title: "PhÃ¢n quyá»n",
    description: "Cáº¥u hÃ¬nh quyá»n truy cáº­p cho Admin, Staff vÃ  cÃ¡c nhÃ³m váº­n hÃ nh.",
    primaryAction: "Táº¡o nhÃ³m quyá»n",
    stats: [
      { label: "NhÃ³m quyá»n", value: "4", note: "Äang dÃ¹ng" },
      { label: "Admin", value: "2", note: "ToÃ n quyá»n" },
      { label: "Staff", value: "6", note: "Giá»›i háº¡n" },
      { label: "Log", value: "128", note: "Thao tÃ¡c" },
    ],
    rows: [
      { title: "Admin", meta: "ToÃ n quyá»n há»‡ thá»‘ng", status: "Full access" },
      { title: "Staff Ä‘Æ¡n hÃ ng", meta: "Xem vÃ  cáº­p nháº­t Ä‘Æ¡n", status: "Giá»›i háº¡n" },
      { title: "Staff ná»™i dung", meta: "Sáº£n pháº©m, banner, bÃ i viáº¿t", status: "Giá»›i háº¡n" },
    ],
  },
};

const emptyProductForm: ProductMutationPayload = {
  categorySlug: "luoc-sung",
  sku: "",
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  material: "",
  origin: "LÃ ng nghá» Thá»¥y á»¨ng, HÃ  Ná»™i",
  price: 0,
  stockQuantity: 0,
  status: "AVAILABLE",
  personalizable: true,
  imageUrl: "",
  imageUrls: [],
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ä‘/g, "d")
    .replace(/Ä/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function activeHrefForPage(role: Role, page: PageKey) {
  const prefix = role === "admin" ? "/admin" : "/staff";
  const routes: Record<PageKey, string> = {
    dashboard: role === "admin" ? "/admin/dashboard" : "/staff",
    products: `${prefix}/products`,
    "product-create": `${prefix}/products/create`,
    "product-edit": `${prefix}/products`,
    inventory: `${prefix}/products/inventory`,
    orders: `${prefix}/orders`,
    personalization: `${prefix}/personalization`,
    traceability: `${prefix}/traceability`,
    "trace-create": `${prefix}/traceability/create`,
    reviews: `${prefix}/reviews`,
    staff: "/admin/staff",
    customers: "/admin/customers",
    categories: "/admin/categories",
    banners: "/admin/banners",
    contents: "/admin/contents",
    seo: "/admin/seo",
    settings: "/admin/settings",
    roles: "/admin/roles",
  };

  return routes[page];
}

function productToForm(product: AdminProduct): ProductMutationPayload {
  return {
    categorySlug: product.categorySlug || "luoc-sung",
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    material: product.material ?? "",
    origin: product.origin ?? "",
    price: product.price,
    stockQuantity: product.stockQuantity,
    status: product.status,
    personalizable: Boolean(product.personalizable),
    imageUrl: product.imageUrl ?? "",
    imageUrls: product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [],
  };
}

function ProductManager({ role, mode = "manage", editSlug }: { role: Role; mode?: "manage" | "create" | "edit"; editSlug?: string }) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
  const [form, setForm] = useState<ProductMutationPayload>(emptyProductForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const [productItems, categoryItems] = await Promise.all([getAdminProducts(), getCategories()]);
      setProducts(productItems);
      setCategories(categoryItems.map((category) => ({ slug: category.slug, name: category.name })));
      if (mode === "edit" && editSlug) {
        const editingProduct = productItems.find((product) => product.slug === editSlug || String(product.id) === editSlug);

        if (editingProduct) {
          setEditingSlug(editingProduct.slug);
          setForm(productToForm(editingProduct));
        } else {
          setError("KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m cáº§n sá»­a.");
        }
      }
    } catch {
      setError("ChÆ°a táº£i Ä‘Æ°á»£c danh sÃ¡ch sáº£n pháº©m. Kiá»ƒm tra backend vÃ  quyá»n Ä‘Äƒng nháº­p staff/admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  const setField = <K extends keyof ProductMutationPayload>(field: K, value: ProductMutationPayload[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setProductImages = (imageUrls: string[]) => {
    const cleanImageUrls = imageUrls.map((imageUrl) => imageUrl.trim()).filter(Boolean);
    setForm((current) => ({
      ...current,
      imageUrl: cleanImageUrls[0] ?? "",
      imageUrls: cleanImageUrls,
    }));
  };

  const handleImageUrlChange = (value: string) => {
    setForm((current) => {
      const imageUrls = current.imageUrls.length ? [...current.imageUrls] : [];

      if (value.trim()) {
        imageUrls[0] = value.trim();
      } else {
        imageUrls.shift();
      }

      return {
        ...current,
        imageUrl: value,
        imageUrls,
      };
    });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError("ChÆ°a cáº¥u hÃ¬nh Cloudinary. ThÃªm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME vÃ  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET vÃ o .env.local.");
      return;
    }

    setUploadingImages(true);
    setError("");

    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", uploadPreset);
          data.append("folder", "van-moc/products");

          const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: data,
          });

          if (!response.ok) {
            throw new Error("Cannot upload image");
          }

          const result = (await response.json()) as { secure_url?: string };

          if (!result.secure_url) {
            throw new Error("Cloudinary response missing secure_url");
          }

          return result.secure_url;
        }),
      );

      setProductImages([...form.imageUrls, ...uploadedUrls]);
    } catch {
      setError("ChÆ°a upload Ä‘Æ°á»£c áº£nh lÃªn Cloudinary.");
    } finally {
      setUploadingImages(false);
    }
  };

  const startCreate = () => {
    if (mode === "manage") {
      router.push(`/${role}/products/create`);
      return;
    }

    if (mode === "edit") {
      router.push(`/${role}/products`);
      return;
    }

    setEditingSlug(null);
    setForm(emptyProductForm);
  };

  const startEdit = (product: AdminProduct) => {
    setEditingSlug(product.slug);
    setForm(productToForm(product));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        sku: form.sku.trim(),
        name: form.name.trim(),
      };

      if (editingSlug) {
        await updateAdminProduct(editingSlug, payload);
      } else {
        await createAdminProduct(payload);
      }

      setEditingSlug(null);
      setForm(emptyProductForm);
      await loadProducts();
      if (mode === "create" || mode === "edit") {
        router.push(`/${role}/products`);
      }
    } catch {
      setError("ChÆ°a lÆ°u Ä‘Æ°á»£c sáº£n pháº©m. Kiá»ƒm tra SKU/slug cÃ³ bá»‹ trÃ¹ng hoáº·c thiáº¿u danh má»¥c khÃ´ng.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (product: AdminProduct) => {
    const confirmed = window.confirm(`XÃ³a má»m sáº£n pháº©m "${product.name}"? Sáº£n pháº©m sáº½ chuyá»ƒn sang tráº¡ng thÃ¡i áº©n.`);

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await archiveAdminProduct(product.slug);
      await loadProducts();
    } catch {
      setError("ChÆ°a xÃ³a má»m Ä‘Æ°á»£c sáº£n pháº©m.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (product: AdminProduct, status: string) => {
    if (status === product.status) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateAdminProduct(product.slug, { ...productToForm(product), status });
      await loadProducts();
    } catch {
      setError("ChÆ°a cáº­p nháº­t Ä‘Æ°á»£c tráº¡ng thÃ¡i sáº£n pháº©m.");
    } finally {
      setSaving(false);
    }
  };

  const activeProducts = products.filter((product) => product.status !== "INACTIVE");
  const hiddenProducts = products.filter((product) => product.status === "INACTIVE");
  const lowStockProducts = activeProducts.filter((product) => product.stockQuantity <= 5);
  const showEditor = mode === "create" || mode === "edit" || Boolean(editingSlug);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(pageStart, pageStart + pageSize);

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Quáº£n lÃ½ bÃ¡n hÃ ng</p>
            <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quáº£n lÃ½ sáº£n pháº©m</h2>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-serif text-lg font-bold text-ivory transition hover:bg-bark"
            onClick={startCreate}
            type="button"
          >
            <Plus className="size-4" />
            ThÃªm sáº£n pháº©m
          </button>
        </div>
      </div>

      {mode === "manage" ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Äang bÃ¡n", value: String(activeProducts.length), note: "Hiá»ƒn thá»‹ hoáº·c cÃ³ thá»ƒ bÃ¡n" },
          { label: "Sáº¯p háº¿t", value: String(lowStockProducts.length), note: "Tá»“n kho tá»« 5 trá»Ÿ xuá»‘ng" },
          { label: "ÄÃ£ áº©n", value: String(hiddenProducts.length), note: "XÃ³a má»m / khÃ´ng bÃ¡n" },
          { label: "Tá»•ng sáº£n pháº©m", value: String(products.length), note: "Bao gá»“m sáº£n pháº©m áº©n" },
        ].map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div> : null}

      <div className={`grid gap-6 ${mode === "create" ? "max-w-6xl" : "xl:grid-cols-1"}`}>
        {showEditor ? <section className="h-fit rounded-lg border border-clay/15 bg-pearl p-5 md:p-7">
          <div className="flex items-center justify-between border-b border-clay/15 pb-4">
            <h3 className="font-serif text-3xl font-bold text-bark">{editingSlug ? "Sá»­a sáº£n pháº©m" : "ThÃªm sáº£n pháº©m"}</h3>
            {editingSlug ? (
              <button className="inline-flex size-9 items-center justify-center rounded-full border border-clay/25 text-wood" onClick={startCreate} type="button">
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-bark">
              TÃªn sáº£n pháº©m
              <input
                className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood"
                onBlur={() => !form.slug && setField("slug", slugify(form.name))}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="VÃ­ dá»¥: LÆ°á»£c sá»«ng tá»± nhiÃªn VM01"
                value={form.name}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                SKU
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("sku", event.target.value)} placeholder="VÃ­ dá»¥: VM-LS-001" value={form.sku} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Slug
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("slug", slugify(event.target.value))} placeholder="luoc-sung-tu-nhien-vm01" value={form.slug} />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-semibold text-bark">
              Danh má»¥c
              <select className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("categorySlug", event.target.value)} value={form.categorySlug}>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                GiÃ¡
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" min={0} onChange={(event) => setField("price", Number(event.target.value))} placeholder="350000" type="number" value={form.price} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Tá»“n kho
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" min={0} onChange={(event) => setField("stockQuantity", Number(event.target.value))} placeholder="18" type="number" value={form.stockQuantity} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Tráº¡ng thÃ¡i
                <select className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("status", event.target.value)} value={form.status}>
                  <option value="AVAILABLE">Äang bÃ¡n</option>
                  <option value="DRAFT">NhÃ¡p</option>
                  <option value="OUT_OF_STOCK">Háº¿t hÃ ng</option>
                  <option value="INACTIVE">áº¨n</option>
                </select>
              </label>
              <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-bark">
                <input checked={form.personalizable} onChange={(event) => setField("personalizable", event.target.checked)} type="checkbox" />
                Cho phÃ©p cÃ¡ nhÃ¢n hÃ³a
              </label>
            </div>
            <div className="grid gap-3 rounded-2xl border border-clay/15 bg-ivory/70 p-4 md:col-span-2">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <label className="grid flex-1 gap-1.5 text-sm font-semibold text-bark">
                  áº¢nh Ä‘áº¡i diá»‡n URL
                  <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => handleImageUrlChange(event.target.value)} placeholder="https://.../anh-san-pham.jpg" value={form.imageUrl} />
                </label>
                <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand">
                  {uploadingImages ? "Äang táº£i áº£nh..." : "Táº£i áº£nh Cloudinary"}
                  <input
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingImages}
                    multiple
                    onChange={(event) => handleImageUpload(event.target.files)}
                    type="file"
                  />
                </label>
              </div>
              <p className="text-xs font-medium text-horn">CÃ³ thá»ƒ chá»n nhiá»u áº£nh. áº¢nh Ä‘áº§u tiÃªn sáº½ lÃ  áº£nh Ä‘áº¡i diá»‡n cá»§a sáº£n pháº©m.</p>
              {form.imageUrls.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {form.imageUrls.map((imageUrl, index) => (
                    <div className="relative overflow-hidden rounded-lg border border-clay/15 bg-pearl" key={`${imageUrl}-${index}`}>
                      <img alt={`áº¢nh sáº£n pháº©m ${index + 1}`} className="aspect-square w-full object-cover" src={imageUrl} />
                      <div className="absolute left-2 top-2 rounded-full bg-wood px-2 py-1 text-[10px] font-bold uppercase text-ivory">
                        {index === 0 ? "ChÃ­nh" : `áº¢nh ${index + 1}`}
                      </div>
                      <button
                        aria-label={`XÃ³a áº£nh ${index + 1}`}
                        className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-ivory/95 text-red-700 shadow-sm transition hover:bg-red-50"
                        onClick={() => setProductImages(form.imageUrls.filter((_, imageIndex) => imageIndex !== index))}
                        type="button"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Cháº¥t liá»‡u
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("material", event.target.value)} placeholder="VÃ­ dá»¥: Sá»«ng tá»± nhiÃªn" value={form.material} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Xuáº¥t xá»©
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("origin", event.target.value)} placeholder="VÃ­ dá»¥: LÃ ng nghá» Thá»¥y á»¨ng, HÃ  Ná»™i" value={form.origin} />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
              MÃ´ táº£ ngáº¯n
              <textarea
                className="min-h-24 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood"
                onChange={(event) => setField("shortDescription", event.target.value)}
                placeholder="Nháº­p mÃ´ táº£ ngáº¯n hiá»ƒn thá»‹ á»Ÿ danh sÃ¡ch sáº£n pháº©m..."
                value={form.shortDescription}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
              MÃ´ táº£
              <textarea className="min-h-32 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood" onChange={(event) => setField("description", event.target.value)} placeholder="Nháº­p mÃ´ táº£ chi tiáº¿t vá» cháº¥t liá»‡u, quy trÃ¬nh cháº¿ tÃ¡c vÃ  cÃ¡ch sá»­ dá»¥ng..." value={form.description} />
            </label>
            {error ? <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-60 md:w-fit"
              disabled={saving || !form.name || !form.sku}
              onClick={handleSave}
              type="button"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {editingSlug ? "LÆ°u thay Ä‘á»•i" : "Táº¡o sáº£n pháº©m"}
            </button>
          </div>
        </section> : null}

        {mode === "manage" ? <section className="rounded-lg border border-clay/15 bg-pearl p-5">
          <div className="flex items-center justify-between border-b border-clay/15 pb-4">
            <h3 className="font-serif text-3xl font-bold text-bark">Danh sÃ¡ch sáº£n pháº©m</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn">
              <Loader2 className="size-4 animate-spin" />
              Äang táº£i sáº£n pháº©m...
            </div>
          ) : (
            <div className="divide-y divide-clay/15">
              {paginatedProducts.map((product) => (
                <article className="grid gap-4 py-4 xl:grid-cols-[88px_1fr_auto] xl:items-center" key={product.id}>
                  <img alt={product.name} className="size-20 rounded-md bg-sand object-cover" src={product.imageUrl} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-bark">{product.name}</h4>
                    </div>
                    <p className="mt-1 text-sm text-horn">
                      {product.sku} Â· {product.categoryName} Â· {formatVnd(product.price)} Â· {product.stockQuantity} tá»“n
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-horn">{product.shortDescription || product.description}</p>
                  </div>
                  <div className="flex gap-2 xl:justify-end">
                    <select
                      aria-label={`Tráº¡ng thÃ¡i ${product.name}`}
                      className="h-9 rounded-full border border-clay/30 bg-ivory px-3 text-xs font-semibold text-wood outline-none transition hover:bg-sand focus:border-wood disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={saving}
                      onChange={(event) => handleStatusChange(product, event.target.value)}
                      value={product.status}
                    >
                      <option value="AVAILABLE">Äang bÃ¡n</option>
                      <option value="DRAFT">NhÃ¡p</option>
                      <option value="OUT_OF_STOCK">Háº¿t hÃ ng</option>
                      <option value="INACTIVE">áº¨n</option>
                    </select>
                    <Link aria-label={`Sá»­a ${product.name}`} className="inline-flex size-9 items-center justify-center rounded-full border border-clay/30 text-wood transition hover:bg-sand" href={`/${role}/products/${product.slug}`} title="Sá»­a">
                      <Edit3 className="size-4" />
                    </Link>
                    <button aria-label={`XÃ³a má»m ${product.name}`} className="inline-flex size-9 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => handleArchive(product)} title="XÃ³a má»m" type="button">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              ))}
              <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-horn">
                  Hiá»ƒn thá»‹ {products.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageSize, products.length)} / {products.length} sáº£n pháº©m
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="h-9 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    type="button"
                  >
                    TrÆ°á»›c
                  </button>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        className={`size-9 rounded-full text-sm font-bold transition ${currentPage === page ? "bg-wood text-ivory" : "border border-clay/25 text-wood hover:bg-sand"
                          }`}
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        type="button"
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    className="h-9 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    type="button"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </section> : null}
      </div>
    </div>
  );
}

type InventoryTab = "all" | "low" | "out" | "hidden";

function InventoryManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [stockDrafts, setStockDrafts] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<InventoryTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState("");
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const productItems = await getAdminProducts();
      setProducts(productItems);
      setStockDrafts(
        Object.fromEntries(productItems.map((product) => [product.id, product.stockQuantity])),
      );
    } catch {
      setError("ChÆ°a táº£i Ä‘Æ°á»£c dá»¯ liá»‡u tá»“n kho. Kiá»ƒm tra backend vÃ  quyá»n Ä‘Äƒng nháº­p staff/admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, products.length]);

  const activeProducts = products.filter((product) => product.status !== "INACTIVE");
  const lowStockProducts = activeProducts.filter((product) => product.stockQuantity > 0 && product.stockQuantity <= 5);
  const outStockProducts = activeProducts.filter((product) => product.stockQuantity <= 0 || product.status === "OUT_OF_STOCK");
  const hiddenProducts = products.filter((product) => product.status === "INACTIVE");
  const totalStock = activeProducts.reduce((total, product) => total + product.stockQuantity, 0);

  const filteredProducts = products.filter((product) => {
    if (activeTab === "low") {
      return product.status !== "INACTIVE" && product.stockQuantity > 0 && product.stockQuantity <= 5;
    }

    if (activeTab === "out") {
      return product.status !== "INACTIVE" && (product.stockQuantity <= 0 || product.status === "OUT_OF_STOCK");
    }

    if (activeTab === "hidden") {
      return product.status === "INACTIVE";
    }

    return true;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(pageStart, pageStart + pageSize);

  const updateInventory = async (product: AdminProduct, nextStock = stockDrafts[product.id] ?? product.stockQuantity, nextStatus = product.status) => {
    setSavingSlug(product.slug);
    setError("");

    try {
      const status = nextStock <= 0 && nextStatus === "AVAILABLE" ? "OUT_OF_STOCK" : nextStatus;
      await updateAdminProduct(product.slug, { ...productToForm(product), stockQuantity: Math.max(0, nextStock), status });
      await loadProducts();
    } catch {
      setError("ChÆ°a cáº­p nháº­t Ä‘Æ°á»£c tá»“n kho sáº£n pháº©m.");
    } finally {
      setSavingSlug("");
    }
  };

  const tabs: Array<{ id: InventoryTab; label: string; count: number }> = [
    { id: "all", label: "Táº¥t cáº£", count: products.length },
    { id: "low", label: "Sáº¯p háº¿t", count: lowStockProducts.length },
    { id: "out", label: "Háº¿t hÃ ng", count: outStockProducts.length },
    { id: "hidden", label: "ÄÃ£ áº©n", count: hiddenProducts.length },
  ];

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Kho hÃ ng</p>
            <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quáº£n lÃ½ tá»“n kho</h2>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-full border border-clay/25 px-5 text-sm font-semibold text-wood transition hover:bg-sand"
            onClick={loadProducts}
            type="button"
          >
            LÃ m má»›i tá»“n kho
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tá»•ng tá»“n", value: String(totalStock), note: "Sáº£n pháº©m Ä‘ang hoáº¡t Ä‘á»™ng" },
          { label: "Sáº¯p háº¿t", value: String(lowStockProducts.length), note: "Tá»“n kho tá»« 1 Ä‘áº¿n 5" },
          { label: "Háº¿t hÃ ng", value: String(outStockProducts.length), note: "Cáº§n nháº­p thÃªm" },
          { label: "ÄÃ£ áº©n", value: String(hiddenProducts.length), note: "KhÃ´ng hiá»ƒn thá»‹ bÃ¡n" },
        ].map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <div className="flex flex-col gap-4 border-b border-clay/15 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="font-serif text-3xl font-bold text-bark">Danh sÃ¡ch tá»“n kho</h3>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                className={`h-9 rounded-full border px-4 text-sm font-semibold transition ${activeTab === tab.id ? "border-wood bg-wood text-ivory" : "border-clay/25 text-wood hover:bg-sand"}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn">
            <Loader2 className="size-4 animate-spin" />
            Äang táº£i tá»“n kho...
          </div>
        ) : (
          <div className="divide-y divide-clay/15">
            {paginatedProducts.map((product) => {
              const draftStock = stockDrafts[product.id] ?? product.stockQuantity;
              const changed = draftStock !== product.stockQuantity;

              return (
                <article className="grid gap-4 py-4 xl:grid-cols-[72px_1fr_160px_170px_auto] xl:items-center" key={product.id}>
                  <img alt={product.name} className="size-16 rounded-md bg-sand object-cover" src={product.imageUrl} />
                  <div>
                    <h4 className="text-base font-bold text-bark">{product.name}</h4>
                    <p className="mt-1 text-sm text-horn">
                      {product.sku} Â· {product.categoryName} Â· {formatVnd(product.price)}
                    </p>
                  </div>
                  <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-clay">
                    Sá»‘ tá»“n
                    <input
                      className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold normal-case tracking-normal text-bark outline-none focus:border-wood"
                      min={0}
                      onChange={(event) => setStockDrafts((current) => ({ ...current, [product.id]: Number(event.target.value) }))}
                      type="number"
                      value={draftStock}
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-clay">
                    Tráº¡ng thÃ¡i
                    <select
                      className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold normal-case tracking-normal text-wood outline-none focus:border-wood"
                      onChange={(event) => updateInventory(product, draftStock, event.target.value)}
                      value={product.status}
                    >
                      <option value="AVAILABLE">Äang bÃ¡n</option>
                      <option value="DRAFT">NhÃ¡p</option>
                      <option value="OUT_OF_STOCK">Háº¿t hÃ ng</option>
                      <option value="INACTIVE">áº¨n</option>
                    </select>
                  </label>
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-wood px-4 text-sm font-semibold text-ivory transition hover:bg-bark disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={!changed || savingSlug === product.slug}
                    onClick={() => updateInventory(product)}
                    type="button"
                  >
                    {savingSlug === product.slug ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    LÆ°u
                  </button>
                </article>
              );
            })}

            {filteredProducts.length === 0 ? (
              <p className="py-10 text-center text-sm font-semibold text-horn">KhÃ´ng cÃ³ sáº£n pháº©m trong nhÃ³m nÃ y.</p>
            ) : null}

            <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-horn">
                Hiá»ƒn thá»‹ {filteredProducts.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageSize, filteredProducts.length)} / {filteredProducts.length} sáº£n pháº©m
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="h-9 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  TrÆ°á»›c
                </button>
                <span className="rounded-full bg-sand px-4 py-2 text-sm font-bold text-wood">
                  {currentPage}/{totalPages}
                </span>
                <button
                  className="h-9 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  type="button"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function OrdersManager() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      setOrders(await getAdminOrders());
    } catch {
      setError("ChÆ°a táº£i Ä‘Æ°á»£c danh sÃ¡ch Ä‘Æ¡n hÃ ng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (order: AdminOrder, payload: { orderStatus?: string; paymentStatus?: string }) => {
    setSavingCode(order.orderCode);
    setError("");

    try {
      await updateAdminOrderStatus(order.orderCode, payload);
      await loadOrders();
    } catch {
      setError("ChÆ°a cáº­p nháº­t Ä‘Æ°á»£c tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng.");
    } finally {
      setSavingCode("");
    }
  };

  const filteredOrders = filter === "ALL" ? orders : orders.filter((order) => order.orderStatus === filter);
  const pendingOrders = orders.filter((order) => order.orderStatus === "PENDING");
  const processingOrders = orders.filter((order) => ["CONFIRMED", "PROCESSING", "SHIPPING"].includes(order.orderStatus));
  const completedOrders = orders.filter((order) => order.orderStatus === "COMPLETED");
  const revenue = orders.filter((order) => order.orderStatus !== "CANCELLED").reduce((total, order) => total + order.totalAmount, 0);

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Váº­n hÃ nh</p>
            <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quáº£n lÃ½ Ä‘Æ¡n hÃ ng</h2>
          </div>
          <button className="h-11 rounded-full border border-clay/25 px-5 text-sm font-semibold text-wood transition hover:bg-sand" onClick={loadOrders} type="button">
            LÃ m má»›i Ä‘Æ¡n
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tá»•ng Ä‘Æ¡n", value: String(orders.length), note: "Táº¥t cáº£ Ä‘Æ¡n hÃ ng" },
          { label: "Chá» xá»­ lÃ½", value: String(pendingOrders.length), note: "Cáº§n xÃ¡c nháº­n" },
          { label: "Äang xá»­ lÃ½", value: String(processingOrders.length), note: "Äang chuáº©n bá»‹/giao" },
          { label: "Doanh thu", value: formatVnd(revenue), note: "KhÃ´ng tÃ­nh Ä‘Æ¡n há»§y" },
        ].map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <div className="flex flex-col gap-4 border-b border-clay/15 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="font-serif text-3xl font-bold text-bark">Danh sÃ¡ch Ä‘Æ¡n hÃ ng</h3>
          <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => setFilter(event.target.value)} value={filter}>
            <option value="ALL">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
            <option value="PENDING">Chá» xÃ¡c nháº­n</option>
            <option value="CONFIRMED">ÄÃ£ xÃ¡c nháº­n</option>
            <option value="PROCESSING">Äang xá»­ lÃ½</option>
            <option value="SHIPPING">Äang giao</option>
            <option value="COMPLETED">HoÃ n táº¥t</option>
            <option value="CANCELLED">ÄÃ£ há»§y</option>
          </select>
        </div>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Äang táº£i Ä‘Æ¡n hÃ ng...</div>
        ) : (
          <div className="divide-y divide-clay/15">
            {filteredOrders.map((order) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_150px_160px_160px] xl:items-center" key={order.orderCode}>
                <div>
                  <h4 className="text-base font-bold text-bark">{order.orderCode}</h4>
                  <p className="mt-1 text-sm text-horn">{order.customerName} Â· {order.phone} Â· {formatDateTime(order.createdAt)}</p>
                  <p className="mt-1 text-sm font-semibold text-wood">{formatVnd(order.totalAmount)} Â· {order.paymentMethod}</p>
                </div>
                <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none disabled:opacity-50" disabled={savingCode === order.orderCode} onChange={(event) => updateStatus(order, { orderStatus: event.target.value })} value={order.orderStatus}>
                  <option value="PENDING">Chá» xÃ¡c nháº­n</option>
                  <option value="CONFIRMED">ÄÃ£ xÃ¡c nháº­n</option>
                  <option value="PROCESSING">Äang xá»­ lÃ½</option>
                  <option value="SHIPPING">Äang giao</option>
                  <option value="COMPLETED">HoÃ n táº¥t</option>
                  <option value="CANCELLED">ÄÃ£ há»§y</option>
                </select>
                <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none disabled:opacity-50" disabled={savingCode === order.orderCode} onChange={(event) => updateStatus(order, { paymentStatus: event.target.value })} value={order.paymentStatus}>
                  <option value="UNPAID">ChÆ°a thanh toÃ¡n</option>
                  <option value="PAID">ÄÃ£ thanh toÃ¡n</option>
                  <option value="FAILED">Lá»—i</option>
                  <option value="REFUNDED">HoÃ n tiá»n</option>
                </select>
                <Link className="inline-flex h-10 items-center justify-center rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand" href={`/order/${order.orderCode}`}>
                  Xem chi tiáº¿t
                </Link>
              </article>
            ))}
            {!filteredOrders.length ? <p className="py-10 text-center text-sm font-semibold text-horn">KhÃ´ng cÃ³ Ä‘Æ¡n hÃ ng phÃ¹ há»£p.</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}

function PersonalizationManager() {
  const [items, setItems] = useState<AdminPersonalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminPersonalizations()
      .then(setItems)
      .catch(() => setError("ChÆ°a táº£i Ä‘Æ°á»£c danh sÃ¡ch cÃ¡ nhÃ¢n hÃ³a."))
      .finally(() => setLoading(false));
  }, []);

  const pendingItems = items.filter((item) => ["PENDING", "CONFIRMED", "PROCESSING"].includes(item.orderStatus));
  const totalFee = items.reduce((total, item) => total + item.engravingPrice, 0);

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">XÆ°á»Ÿng kháº¯c</p>
        <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quáº£n lÃ½ cÃ¡ nhÃ¢n hÃ³a</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Tá»•ng yÃªu cáº§u", value: String(items.length), note: "CÃ³ ná»™i dung kháº¯c" },
          { label: "Cáº§n xá»­ lÃ½", value: String(pendingItems.length), note: "Theo Ä‘Æ¡n chÆ°a hoÃ n táº¥t" },
          { label: "PhÃ­ kháº¯c", value: formatVnd(totalFee), note: "Tá»•ng giÃ¡ trá»‹" },
        ].map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div>
      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <h3 className="border-b border-clay/15 pb-4 font-serif text-3xl font-bold text-bark">Danh sÃ¡ch ná»™i dung kháº¯c</h3>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Äang táº£i ná»™i dung...</div> : (
          <div className="grid gap-4 pt-4 lg:grid-cols-2">
            {items.map((item) => (
              <article className="rounded-lg border border-clay/15 bg-ivory p-5" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-bark">{item.productName}</h4>
                    <p className="mt-1 text-sm text-horn">{item.orderCode} Â· {item.customerName}</p>
                  </div>
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-wood">{item.orderStatus}</span>
                </div>
                <div className="mt-4 rounded-lg bg-wood px-5 py-7 text-center font-serif text-3xl text-ivory">{item.content}</div>
                <p className="mt-4 text-sm text-horn">Font: {item.font || "Máº·c Ä‘á»‹nh"} Â· Vá»‹ trÃ­: {item.position || "ChÆ°a chá»n"} Â· {formatVnd(item.engravingPrice)}</p>
              </article>
            ))}
            {!items.length ? <p className="py-10 text-center text-sm font-semibold text-horn lg:col-span-2">ChÆ°a cÃ³ yÃªu cáº§u cÃ¡ nhÃ¢n hÃ³a.</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}

function TraceabilityManager() {
  const [items, setItems] = useState<AdminTraceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState("");
  const [error, setError] = useState("");

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await getAdminTraceProducts());
    } catch {
      setError("ChÆ°a táº£i Ä‘Æ°á»£c danh sÃ¡ch mÃ£ truy xuáº¥t.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const updateStatus = async (item: AdminTraceProduct, status: string) => {
    setSavingCode(item.traceCode);
    setError("");
    try {
      await updateAdminTraceStatus(item.traceCode, status);
      await loadItems();
    } catch {
      setError("ChÆ°a cáº­p nháº­t Ä‘Æ°á»£c tráº¡ng thÃ¡i mÃ£ QR.");
    } finally {
      setSavingCode("");
    }
  };

  const activeItems = items.filter((item) => item.status === "ACTIVE");
  const incompleteItems = items.filter((item) => item.eventCount < 3);

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Truy xuáº¥t nguá»“n gá»‘c</p>
        <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quáº£n lÃ½ QR / Traceability</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Tá»•ng mÃ£", value: String(items.length), note: "ÄÃ£ táº¡o" },
          { label: "Äang hoáº¡t Ä‘á»™ng", value: String(activeItems.length), note: "KhÃ¡ch cÃ³ thá»ƒ tra cá»©u" },
          { label: "Thiáº¿u bÆ°á»›c", value: String(incompleteItems.length), note: "DÆ°á»›i 3 má»‘c hÃ nh trÃ¬nh" },
        ].map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div>
      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <h3 className="border-b border-clay/15 pb-4 font-serif text-3xl font-bold text-bark">Danh sÃ¡ch mÃ£ truy xuáº¥t</h3>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Äang táº£i mÃ£ QR...</div> : (
          <div className="divide-y divide-clay/15">
            {items.map((item) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_220px_150px_130px] xl:items-center" key={item.id}>
                <div>
                  <h4 className="text-base font-bold text-bark">{item.traceCode}</h4>
                  <p className="mt-1 text-sm text-horn">{item.productName} Â· {item.batchCode || "ChÆ°a gáº¯n lÃ´"} Â· {item.eventCount} bÆ°á»›c</p>
                </div>
                <div className="flex gap-2">
                  <Link className="inline-flex h-10 items-center justify-center rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand" href={`/trace/${item.traceCode}`}>Xem QR</Link>
                  <Link className="inline-flex h-10 items-center justify-center rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand" href={`/admin/traceability/create?code=${encodeURIComponent(item.traceCode)}`}>Sá»­a</Link>
                </div>
                <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none disabled:opacity-50" disabled={savingCode === item.traceCode} onChange={(event) => updateStatus(item, event.target.value)} value={item.status}>
                  <option value="ACTIVE">Hoáº¡t Ä‘á»™ng</option>
                  <option value="INACTIVE">Táº¡m áº©n</option>
                  <option value="ARCHIVED">LÆ°u trá»¯</option>
                </select>
                <span className="rounded-full bg-sand px-3 py-2 text-center text-xs font-bold text-wood">{item.status}</span>
              </article>
            ))}
            {!items.length ? <p className="py-10 text-center text-sm font-semibold text-horn">ChÆ°a cÃ³ mÃ£ truy xuáº¥t.</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}

function TraceProductEditor() {
  const searchParams = useSearchParams();
  const editingCode = searchParams.get("code")?.trim() ?? "";
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [traceCode, setTraceCode] = useState(`VM${Date.now().toString().slice(-6)}`);
  const [productSlug, setProductSlug] = useState("");
  const [batchCode, setBatchCode] = useState("VM-BATCH-2026-09");
  const [qrUrl, setQrUrl] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [events, setEvents] = useState([
    { eventType: "MATERIAL", title: "Chá»n cháº¥t liá»‡u", description: "", eventDate: "", imageUrl: "", videoUrl: "" },
    { eventType: "CRAFT", title: "Cháº¿ tÃ¡c thá»§ cÃ´ng", description: "", eventDate: "", imageUrl: "", videoUrl: "" },
    { eventType: "FINISHING", title: "HoÃ n thiá»‡n", description: "", eventDate: "", imageUrl: "", videoUrl: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [loadingTrace, setLoadingTrace] = useState(Boolean(editingCode));
  const [message, setMessage] = useState("");

  useEffect(() => {
    getAdminProducts().then((items) => {
      setProducts(items);
      setProductSlug((current) => current || items[0]?.slug || "");
    });
  }, []);

  useEffect(() => {
    if (!editingCode) {
      setLoadingTrace(false);
      return;
    }

    let active = true;
    setLoadingTrace(true);
    getAdminTraceProduct(editingCode)
      .then((trace) => {
        if (!active) return;
        setTraceCode(trace.traceCode);
        setProductSlug(trace.productSlug);
        setBatchCode(trace.batchCode ?? "");
        setQrUrl(trace.qrUrl ?? "");
        setStatus(trace.status ?? "ACTIVE");
        setEvents(
          trace.events?.length
            ? trace.events.map((event) => ({
                eventType: event.eventType ?? "STEP",
                title: event.title ?? "",
                description: event.description ?? "",
                eventDate: event.eventDate ?? "",
                imageUrl: event.imageUrl ?? "",
                videoUrl: event.videoUrl ?? "",
              }))
            : [],
        );
      })
      .catch(() => {
        if (active) setMessage("ChÆ°a táº£i Ä‘Æ°á»£c mÃ£ QR cáº§n sá»­a.");
      })
      .finally(() => {
        if (active) setLoadingTrace(false);
      });

    return () => {
      active = false;
    };
  }, [editingCode]);

  const updateEvent = (index: number, field: keyof (typeof events)[number], value: string) => {
    setEvents((current) => current.map((event, eventIndex) => eventIndex === index ? { ...event, [field]: value } : event));
  };

  const addEvent = () => {
    setEvents((current) => [...current, { eventType: "STEP", title: "", description: "", eventDate: "", imageUrl: "", videoUrl: "" }]);
  };

  const saveTrace = async () => {
    if (!traceCode.trim() || !productSlug) {
      setMessage("Vui lÃ²ng nháº­p mÃ£ QR vÃ  chá»n sáº£n pháº©m.");
      return;
    }

    setSaving(true);
    setMessage("");
    const payload = {
      traceCode: traceCode.trim(),
      productSlug,
      batchCode: batchCode.trim() || undefined,
      qrUrl: qrUrl.trim() || `/trace/${traceCode.trim()}`,
      status,
      events: events.filter((event) => event.title.trim()).map((event) => ({
        ...event,
        title: event.title.trim(),
        description: event.description.trim(),
        imageUrl: event.imageUrl.trim(),
        videoUrl: event.videoUrl.trim(),
      })),
    };

    try {
      if (editingCode) {
        await updateAdminTraceProduct(editingCode, payload);
        setMessage(`Ðã c?p nh?t mã ${traceCode}.`);
      } else {
        await createAdminTraceProduct(payload);
        setMessage(`Ðã t?o mã ${traceCode}.`);
      }
    } catch {
      setMessage("ChÆ°a lÆ°u Ä‘Æ°á»£c mÃ£ QR. Kiá»ƒm tra mÃ£ cÃ³ bá»‹ trÃ¹ng hoáº·c backend Ä‘ang cháº¡y chÆ°a.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">QR / Product Passport</p>
        <h2 className="mt-3 font-serif text-5xl font-bold text-bark">{editingCode ? "Sá»­a mÃ£ truy xuáº¥t" : "Táº¡o mÃ£ truy xuáº¥t"}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-horn">Gáº¯n mÃ£ Ä‘á»‹nh danh vá»›i sáº£n pháº©m vÃ  lÆ°u hÃ nh trÃ¬nh cháº¿ tÃ¡c Ä‘á»ƒ khÃ¡ch quÃ©t QR xem Ä‘Æ°á»£c thÃ´ng tin tháº­t.</p>
      </div>

      <section className="rounded-lg border border-clay/15 bg-pearl p-5 md:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold text-bark">
            MÃ£ QR / Trace code
            <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setTraceCode(event.target.value)} value={traceCode} />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-bark">
            Sáº£n pháº©m
            <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setProductSlug(event.target.value)} value={productSlug}>
              {products.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-bark">
            LÃ´ sáº£n xuáº¥t
            <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setBatchCode(event.target.value)} value={batchCode} />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-bark">
            Tráº¡ng thÃ¡i
            <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="ACTIVE">Hoáº¡t Ä‘á»™ng</option>
              <option value="INACTIVE">Táº¡m áº©n</option>
              <option value="ARCHIVED">LÆ°u trá»¯</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
            QR URL
            <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setQrUrl(event.target.value)} placeholder={`/trace/${traceCode}`} value={qrUrl} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-clay/15 bg-pearl p-5 md:p-7">
        <div className="flex items-center justify-between border-b border-clay/15 pb-4">
          <h3 className="font-serif text-3xl font-bold text-bark">HÃ nh trÃ¬nh cháº¿ tÃ¡c</h3>
          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand" onClick={addEvent} type="button"><Plus className="size-4" />ThÃªm bÆ°á»›c</button>
        </div>
        <div className="mt-5 grid gap-5">
          {events.map((event, index) => (
            <article className="grid gap-3 rounded-lg border border-clay/15 bg-ivory p-4 md:grid-cols-2" key={index}>
              <input className="h-10 rounded-full border border-clay/20 bg-pearl px-4 text-sm outline-none focus:border-wood" onChange={(input) => updateEvent(index, "title", input.target.value)} placeholder="TÃªn bÆ°á»›c" value={event.title} />
              <input className="h-10 rounded-full border border-clay/20 bg-pearl px-4 text-sm outline-none focus:border-wood" onChange={(input) => updateEvent(index, "eventDate", input.target.value)} placeholder="YYYY-MM-DD" value={event.eventDate} />
              <input className="h-10 rounded-full border border-clay/20 bg-pearl px-4 text-sm outline-none focus:border-wood" onChange={(input) => updateEvent(index, "imageUrl", input.target.value)} placeholder="áº¢nh cÃ´ng Ä‘oáº¡n URL" value={event.imageUrl} />
              <input className="h-10 rounded-full border border-clay/20 bg-pearl px-4 text-sm outline-none focus:border-wood" onChange={(input) => updateEvent(index, "eventType", input.target.value)} placeholder="Loáº¡i bÆ°á»›c" value={event.eventType} />
              <textarea className="min-h-24 rounded-2xl border border-clay/20 bg-pearl px-4 py-3 text-sm outline-none focus:border-wood md:col-span-2" onChange={(input) => updateEvent(index, "description", input.target.value)} placeholder="MÃ´ táº£ cÃ´ng Ä‘oáº¡n" value={event.description} />
            </article>
          ))}
        </div>
        {message ? <p className="mt-5 rounded-lg bg-sand px-4 py-3 text-sm font-semibold text-wood">{message}</p> : null}
        <button className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50" disabled={saving} onClick={saveTrace} type="button">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          LÆ°u mÃ£ QR
        </button>
      </section>
    </div>
  );
}

function ReviewsManager() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      setReviews(await getAdminReviews());
    } catch {
      setError("ChÆ°a táº£i Ä‘Æ°á»£c danh sÃ¡ch review.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const updateStatus = async (review: AdminReview, status: string) => {
    setSavingId(review.id);
    setError("");
    try {
      await updateAdminReviewStatus(review.id, status);
      await loadReviews();
    } catch {
      setError("ChÆ°a cáº­p nháº­t Ä‘Æ°á»£c tráº¡ng thÃ¡i review.");
    } finally {
      setSavingId(null);
    }
  };

  const pendingReviews = reviews.filter((review) => review.status === "PENDING");
  const approvedReviews = reviews.filter((review) => review.status === "APPROVED");
  const averageRating = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">KhÃ¡ch hÃ ng</p>
        <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quáº£n lÃ½ review</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Tá»•ng review", value: String(reviews.length), note: "Táº¥t cáº£ Ä‘Ã¡nh giÃ¡" },
          { label: "Chá» duyá»‡t", value: String(pendingReviews.length), note: "Cáº§n kiá»ƒm tra" },
          { label: "Äiá»ƒm TB", value: averageRating.toFixed(1), note: `${approvedReviews.length} review Ä‘Ã£ duyá»‡t` },
        ].map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div>
      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <h3 className="border-b border-clay/15 pb-4 font-serif text-3xl font-bold text-bark">Danh sÃ¡ch review</h3>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Äang táº£i review...</div> : (
          <div className="divide-y divide-clay/15">
            {reviews.map((review) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_150px_180px] xl:items-center" key={review.id}>
                <div>
                  <div className="flex items-center gap-2 text-wood">
                    {Array.from({ length: review.rating }).map((_, index) => <Star className="size-4 fill-current" key={index} />)}
                  </div>
                  <h4 className="mt-2 text-base font-bold text-bark">{review.title || review.productName}</h4>
                  <p className="mt-1 text-sm text-horn">{review.customerName} Â· {review.productName} Â· {formatDateTime(review.createdAt)}</p>
                  <p className="mt-2 text-sm leading-6 text-bark">{review.content}</p>
                </div>
                <span className="w-fit rounded-full bg-sand px-3 py-2 text-xs font-bold text-wood">{review.status}</span>
                <div className="flex gap-2 xl:justify-end">
                  <button className="h-10 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand disabled:opacity-45" disabled={savingId === review.id || review.status === "APPROVED"} onClick={() => updateStatus(review, "APPROVED")} type="button">Duyá»‡t</button>
                  <button className="h-10 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-45" disabled={savingId === review.id || review.status === "REJECTED"} onClick={() => updateStatus(review, "REJECTED")} type="button">Tá»« chá»‘i</button>
                </div>
              </article>
            ))}
            {!reviews.length ? <p className="py-10 text-center text-sm font-semibold text-horn">ChÆ°a cÃ³ review.</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}

function AdminDataCrudManager({ page }: { page: "categories" | "banners" | "contents" }) {
  const content = pageContent[page];
  const [items, setItems] = useState<Array<AdminCategory | AdminBanner | AdminContent>>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [meta, setMeta] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [type, setType] = useState(page === "contents" ? "PAGE" : "HOME");
  const [status, setStatus] = useState(page === "contents" ? "DRAFT" : "ACTIVE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadItems = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (page === "categories") setItems(await getAdminCategories());
      if (page === "banners") setItems(await getAdminBanners());
      if (page === "contents") setItems(await getAdminContents());
    } catch {
      setMessage("ChÆ°a táº£i Ä‘Æ°á»£c dá»¯ liá»‡u quáº£n trá»‹.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [page]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setMeta("");
    setBody("");
    setImageUrl("");
    setLinkUrl("");
    setType(page === "contents" ? "PAGE" : "HOME");
    setStatus(page === "contents" ? "DRAFT" : "ACTIVE");
  };

  const editItem = (item: AdminCategory | AdminBanner | AdminContent) => {
    setEditingId(item.id);
    setTitle("title" in item ? item.title : item.name);
    setSlug("slug" in item ? item.slug : "");
    setMeta(("description" in item ? item.description : "subtitle" in item ? item.subtitle : "summary" in item ? item.summary : "") ?? "");
    setBody("body" in item ? item.body ?? "" : "");
    setImageUrl(("imageUrl" in item ? item.imageUrl : "coverImageUrl" in item ? item.coverImageUrl : "") ?? "");
    setLinkUrl("linkUrl" in item ? item.linkUrl ?? "" : "");
    setType(("type" in item ? item.type : "position" in item ? item.position : "HOME") ?? "HOME");
    setStatus(item.status ?? "ACTIVE");
  };

  const saveItem = async () => {
    if (!title.trim()) {
      setMessage("Vui lÃ²ng nháº­p tiÃªu Ä‘á»/tÃªn.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      if (page === "categories") {
        const payload = {
          name: title.trim(),
          slug: slug.trim() || slugify(title),
          description: meta.trim(),
          imageUrl: imageUrl.trim(),
          status,
        };
        if (editingId) await updateAdminCategory(editingId, payload);
        else await createAdminCategory(payload);
      }

      if (page === "banners") {
        const payload = {
          title: title.trim(),
          subtitle: meta.trim(),
          imageUrl: imageUrl.trim(),
          linkUrl: linkUrl.trim(),
          position: type,
          status,
          sortOrder: 0,
        };
        if (editingId) await updateAdminBanner(editingId, payload);
        else await createAdminBanner(payload);
      }

      if (page === "contents") {
        const payload = {
          title: title.trim(),
          slug: slug.trim() || slugify(title),
          type,
          summary: meta.trim(),
          body: body.trim(),
          coverImageUrl: imageUrl.trim(),
          status,
        };
        if (editingId) await updateAdminContent(editingId, payload);
        else await createAdminContent(payload);
      }

      setMessage(editingId ? "ÄÃ£ cáº­p nháº­t." : "ÄÃ£ táº¡o má»›i.");
      resetForm();
      await loadItems();
    } catch {
      setMessage("ChÆ°a lÆ°u Ä‘Æ°á»£c dá»¯ liá»‡u. Kiá»ƒm tra slug trÃ¹ng hoáº·c backend.");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: number) => {
    setSaving(true);
    setMessage("");
    try {
      if (page === "categories") await deleteAdminCategory(id);
      if (page === "banners") await deleteAdminBanner(id);
      if (page === "contents") await deleteAdminContent(id);
      await loadItems();
    } catch {
      setMessage("ChÆ°a xÃ³a/áº©n Ä‘Æ°á»£c má»¥c nÃ y.");
    } finally {
      setSaving(false);
    }
  };

  const listTitle = page === "categories" ? "Danh sÃ¡ch danh má»¥c" : page === "banners" ? "Danh sÃ¡ch banner" : "Danh sÃ¡ch ná»™i dung";
  const itemTitle = (item: AdminCategory | AdminBanner | AdminContent): string => String("title" in item ? item.title : item.name);
  const itemMeta = (item: AdminCategory | AdminBanner | AdminContent): string => {
    if ("slug" in item) return String(item.slug ?? "");
    if ("linkUrl" in item) return String(item.linkUrl || item.subtitle || "");
    return String("summary" in item ? item.summary || "" : "");
  };

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">{content.eyebrow}</p>
        <h2 className="mt-3 font-serif text-5xl font-bold text-bark">{content.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-horn">{content.description}</p>
      </div>

      <section className="rounded-lg border border-clay/15 bg-pearl p-5 md:p-7">
        <div className="flex items-center justify-between border-b border-clay/15 pb-4">
          <h3 className="font-serif text-3xl font-bold text-bark">{editingId ? "Sá»­a má»¥c" : content.primaryAction}</h3>
          {editingId ? <button className="rounded-full border border-clay/25 px-4 py-2 text-sm font-semibold text-wood" onClick={resetForm} type="button">Há»§y sá»­a</button> : null}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => { setTitle(event.target.value); if (!editingId && page !== "banners") setSlug(slugify(event.target.value)); }} placeholder={page === "categories" ? "TÃªn danh má»¥c" : "TiÃªu Ä‘á»"} value={title} />
          {page !== "banners" ? <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setSlug(event.target.value)} placeholder="slug-url" value={slug} /> : null}
          <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setImageUrl(event.target.value)} placeholder={page === "contents" ? "áº¢nh bÃ¬a URL" : "áº¢nh URL"} value={imageUrl} />
          {page === "banners" ? <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setLinkUrl(event.target.value)} placeholder="/products" value={linkUrl} /> : null}
          <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setType(event.target.value)} value={type}>
            {page === "contents" ? (
              <>
                <option value="PAGE">PAGE</option>
                <option value="BLOG">BLOG</option>
                <option value="STORY">STORY</option>
                <option value="POLICY">POLICY</option>
              </>
            ) : (
              <>
                <option value="HOME">HOME</option>
                <option value="CATEGORY">CATEGORY</option>
                <option value="PRODUCT">PRODUCT</option>
                <option value="CAMPAIGN">CAMPAIGN</option>
              </>
            )}
          </select>
          <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setStatus(event.target.value)} value={status}>
            {page === "contents" ? <><option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="ARCHIVED">ARCHIVED</option></> : <><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></>}
          </select>
          <textarea className="min-h-24 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood md:col-span-2" onChange={(event) => setMeta(event.target.value)} placeholder="MÃ´ táº£ ngáº¯n / subtitle / summary" value={meta} />
          {page === "contents" ? <textarea className="min-h-44 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood md:col-span-2" onChange={(event) => setBody(event.target.value)} placeholder="Ná»™i dung chi tiáº¿t" value={body} /> : null}
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50 md:w-fit" disabled={saving} onClick={saveItem} type="button">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            LÆ°u
          </button>
        </div>
        {message ? <p className="mt-4 rounded-lg bg-sand px-4 py-3 text-sm font-semibold text-wood">{message}</p> : null}
      </section>

      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <div className="flex items-center justify-between border-b border-clay/15 pb-4">
          <h3 className="font-serif text-3xl font-bold text-bark">{listTitle}</h3>
          <span className="rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">{items.length} má»¥c</span>
        </div>
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Äang táº£i...</div> : (
          <div className="divide-y divide-clay/15">
            {items.map((item) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_130px_auto] xl:items-center" key={item.id}>
                <div>
                  <h4 className="text-base font-bold text-bark">{itemTitle(item)}</h4>
                  <p className="mt-1 text-sm text-horn">{itemMeta(item)}</p>
                </div>
                <span className="w-fit rounded-full bg-sand px-3 py-2 text-xs font-bold text-wood">{item.status}</span>
                <div className="flex gap-2 xl:justify-end">
                  <button className="inline-flex size-10 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" onClick={() => editItem(item)} title="Sá»­a" type="button"><Edit3 className="size-4" /></button>
                  <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => deleteItem(item.id)} title="XÃ³a/áº©n" type="button"><Trash2 className="size-4" /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AdminOperationsManager({ page }: { page: Extract<PageKey, "staff" | "customers" | "categories" | "banners" | "contents" | "seo" | "settings" | "roles"> }) {
  const content = pageContent[page];
  const [rows, setRows] = useState(content.rows);
  const [selectedStatus, setSelectedStatus] = useState(content.rows[0]?.status ?? "Hoáº¡t Ä‘á»™ng");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMeta, setDraftMeta] = useState("");
  const [draftImageUrl, setDraftImageUrl] = useState("");
  const [draftLinkUrl, setDraftLinkUrl] = useState("");
  const [draftPosition, setDraftPosition] = useState("HOME");
  const [showEntryForm, setShowEntryForm] = useState(false);

  const labels: Record<typeof page, { listTitle: string; formTitle: string; titlePlaceholder: string; metaPlaceholder: string; button: string }> = {
    staff: {
      listTitle: "Danh sÃ¡ch nhÃ¢n sá»±",
      formTitle: "ThÃªm / cáº­p nháº­t staff",
      titlePlaceholder: "TÃªn nhÃ¢n sá»±",
      metaPlaceholder: "Vai trÃ², ca trá»±c hoáº·c ghi chÃº",
      button: "LÆ°u staff",
    },
    customers: {
      listTitle: "Danh sÃ¡ch khÃ¡ch hÃ ng",
      formTitle: "Ghi chÃº chÄƒm sÃ³c khÃ¡ch",
      titlePlaceholder: "TÃªn khÃ¡ch hÃ ng",
      metaPlaceholder: "Ghi chÃº, háº¡ng khÃ¡ch hoáº·c lá»‹ch sá»­ mua",
      button: "LÆ°u ghi chÃº",
    },
    categories: {
      listTitle: "Danh sÃ¡ch danh má»¥c",
      formTitle: "ThÃªm / cáº­p nháº­t danh má»¥c",
      titlePlaceholder: "TÃªn danh má»¥c",
      metaPlaceholder: "MÃ´ táº£ ngáº¯n hoáº·c sá»‘ sáº£n pháº©m",
      button: "LÆ°u danh má»¥c",
    },
    banners: {
      listTitle: "Danh sÃ¡ch banner",
      formTitle: "ThÃªm / cáº­p nháº­t banner",
      titlePlaceholder: "TiÃªu Ä‘á» banner",
      metaPlaceholder: "Vá»‹ trÃ­, link Ä‘iá»u hÆ°á»›ng hoáº·c lá»‹ch cháº¡y",
      button: "LÆ°u banner",
    },
    contents: {
      listTitle: "Danh sÃ¡ch ná»™i dung",
      formTitle: "Soáº¡n ná»™i dung",
      titlePlaceholder: "TiÃªu Ä‘á» trang/bÃ i viáº¿t",
      metaPlaceholder: "Vá»‹ trÃ­ hiá»ƒn thá»‹ hoáº·c mÃ´ táº£ SEO",
      button: "LÆ°u ná»™i dung",
    },
    seo: {
      listTitle: "Checklist SEO",
      formTitle: "Cáº­p nháº­t SEO",
      titlePlaceholder: "ÄÆ°á»ng dáº«n trang",
      metaPlaceholder: "Meta title, description hoáº·c tráº¡ng thÃ¡i index",
      button: "LÆ°u SEO",
    },
    settings: {
      listTitle: "NhÃ³m cáº¥u hÃ¬nh",
      formTitle: "Cáº­p nháº­t cáº¥u hÃ¬nh",
      titlePlaceholder: "TÃªn cáº¥u hÃ¬nh",
      metaPlaceholder: "GiÃ¡ trá»‹ hoáº·c mÃ´ táº£ cáº¥u hÃ¬nh",
      button: "LÆ°u cáº¥u hÃ¬nh",
    },
    roles: {
      listTitle: "NhÃ³m quyá»n",
      formTitle: "Cáº­p nháº­t quyá»n",
      titlePlaceholder: "TÃªn nhÃ³m quyá»n",
      metaPlaceholder: "Quyá»n truy cáº­p hoáº·c pháº¡m vi thao tÃ¡c",
      button: "LÆ°u quyá»n",
    },
  };

  const copy = labels[page];

  const updateRowStatus = (index: number, status: string) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, status } : row)));
  };

  const removeRow = (index: number) => {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const saveEntryRow = () => {
    if (!draftTitle.trim()) {
      return;
    }

    setRows((current) => [
      { title: draftTitle.trim(), meta: draftMeta.trim() || "ChÆ°a cÃ³ mÃ´ táº£", status: selectedStatus },
      ...current,
    ]);
    setDraftTitle("");
    setDraftMeta("");
    setDraftImageUrl("");
    setDraftLinkUrl("");
    setDraftPosition("HOME");
    setShowEntryForm(false);
  };

  if (page === "banners") {
    const bannerImages = [
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85",
    ];

    return (
      <div className="flex min-h-0 flex-col gap-6">
        <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">{content.eyebrow}</p>
              <h2 className="mt-3 font-serif text-5xl font-bold text-bark">{content.title}</h2>
            </div>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-serif text-lg font-bold text-ivory transition hover:bg-bark" onClick={() => setShowEntryForm(true)} type="button">
              <Plus className="size-4" />
              ThÃªm banner
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {content.stats.map((stat) => (
            <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
              <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
              <p className="mt-1 text-sm text-horn">{stat.note}</p>
            </article>
          ))}
        </div>

        {showEntryForm ? (
          <section className="rounded-lg border border-clay/15 bg-pearl p-5 md:p-7">
            <div className="flex items-center justify-between border-b border-clay/15 pb-4">
              <h3 className="font-serif text-3xl font-bold text-bark">ThÃªm banner</h3>
              <button className="inline-flex size-9 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" onClick={() => setShowEntryForm(false)} type="button">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                TiÃªu Ä‘á» banner
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftTitle(event.target.value)} placeholder="VÃ­ dá»¥: QuÃ  táº·ng cÃ¡ nhÃ¢n hÃ³a" value={draftTitle} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Vá»‹ trÃ­ hiá»ƒn thá»‹
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setDraftPosition(event.target.value)} value={draftPosition}>
                  <option value="HOME">Trang chá»§</option>
                  <option value="CATEGORY">Danh má»¥c</option>
                  <option value="PRODUCT">Chi tiáº¿t sáº£n pháº©m</option>
                  <option value="CAMPAIGN">Chiáº¿n dá»‹ch</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                áº¢nh banner URL
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftImageUrl(event.target.value)} placeholder="https://.../banner.jpg" value={draftImageUrl} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Link Ä‘iá»u hÆ°á»›ng
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftLinkUrl(event.target.value)} placeholder="/products hoáº·c /categories/..." value={draftLinkUrl} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Tráº¡ng thÃ¡i
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>
                  <option value="Äang cháº¡y">Äang cháº¡y</option>
                  <option value="Äáº·t lá»‹ch">Äáº·t lá»‹ch</option>
                  <option value="Táº¡m áº©n">Táº¡m áº©n</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
                MÃ´ táº£ / ghi chÃº
                <textarea className="min-h-24 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood" onChange={(event) => setDraftMeta(event.target.value)} placeholder="ThÃ´ng Ä‘iá»‡p phá»¥, lá»‹ch cháº¡y hoáº·c ghi chÃº chiáº¿n dá»‹ch..." value={draftMeta} />
              </label>
              {draftImageUrl ? (
                <div className="overflow-hidden rounded-lg border border-clay/15 bg-sand md:col-span-2">
                  <img alt="Xem trÆ°á»›c banner" className="aspect-[21/7] w-full object-cover" src={draftImageUrl} />
                </div>
              ) : null}
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50 md:w-fit" disabled={!draftTitle.trim()} onClick={saveEntryRow} type="button">
                <Save className="size-4" />
                LÆ°u banner
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-clay/15 bg-pearl p-5">
            <div className="flex flex-col gap-4 border-b border-clay/15 pb-4 md:flex-row md:items-center md:justify-between">
              <h3 className="font-serif text-3xl font-bold text-bark">Danh sÃ¡ch banner</h3>
              <span className="w-fit rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">{rows.length} banner</span>
            </div>
            <div className="grid gap-4 pt-5 lg:grid-cols-2">
              {rows.map((row, index) => (
                <article className="overflow-hidden rounded-lg border border-clay/15 bg-ivory" key={`${row.title}-${index}`}>
                  <img alt={row.title} className="aspect-[21/8] w-full bg-sand object-cover" src={bannerImages[index % bannerImages.length]} />
                  <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <h4 className="text-base font-bold text-bark">{row.title}</h4>
                      <p className="mt-1 text-sm text-horn">{row.meta}</p>
                    </div>
                    <div className="flex items-center gap-2 md:justify-end">
                      <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => updateRowStatus(index, event.target.value)} value={row.status}>
                        <option value="Äang cháº¡y">Äang cháº¡y</option>
                        <option value="Äáº·t lá»‹ch">Äáº·t lá»‹ch</option>
                        <option value="Táº¡m áº©n">Táº¡m áº©n</option>
                      </select>
                      <button className="inline-flex size-10 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" title="Sá»­a" type="button">
                        <Edit3 className="size-4" />
                      </button>
                      <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => removeRow(index)} title="XÃ³a" type="button">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  if (page === "contents") {
    return (
      <div className="flex min-h-0 flex-col gap-6">
        <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">{content.eyebrow}</p>
              <h2 className="mt-3 font-serif text-5xl font-bold text-bark">{content.title}</h2>
            </div>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-serif text-lg font-bold text-ivory transition hover:bg-bark" onClick={() => setShowEntryForm(true)} type="button">
              <Plus className="size-4" />
              ThÃªm ná»™i dung
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {content.stats.map((stat) => (
            <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
              <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
              <p className="mt-1 text-sm text-horn">{stat.note}</p>
            </article>
          ))}
        </div>

        {showEntryForm ? (
          <section className="rounded-lg border border-clay/15 bg-pearl p-5 md:p-7">
            <div className="flex items-center justify-between border-b border-clay/15 pb-4">
              <h3 className="font-serif text-3xl font-bold text-bark">ThÃªm ná»™i dung</h3>
              <button className="inline-flex size-9 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" onClick={() => setShowEntryForm(false)} type="button">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                TiÃªu Ä‘á»
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftTitle(event.target.value)} placeholder="VÃ­ dá»¥: CÃ¢u chuyá»‡n cháº¥t liá»‡u" value={draftTitle} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Loáº¡i ná»™i dung
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setDraftPosition(event.target.value)} value={draftPosition}>
                  <option value="PAGE">Trang</option>
                  <option value="BLOG">BÃ i viáº¿t</option>
                  <option value="STORY">CÃ¢u chuyá»‡n</option>
                  <option value="POLICY">ChÃ­nh sÃ¡ch</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Slug
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftLinkUrl(slugify(event.target.value))} placeholder="cau-chuyen-chat-lieu" value={draftLinkUrl} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Tráº¡ng thÃ¡i
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>
                  <option value="ÄÃ£ cÃ´ng bá»‘">ÄÃ£ cÃ´ng bá»‘</option>
                  <option value="NhÃ¡p">NhÃ¡p</option>
                  <option value="Cáº§n rÃ  soÃ¡t">Cáº§n rÃ  soÃ¡t</option>
                  <option value="LÆ°u trá»¯">LÆ°u trá»¯</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
                MÃ´ táº£ ngáº¯n
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftMeta(event.target.value)} placeholder="MÃ´ táº£ ngáº¯n hiá»ƒn thá»‹ trong danh sÃ¡ch..." value={draftMeta} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
                Ná»™i dung
                <textarea className="min-h-56 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood" placeholder="Nháº­p ná»™i dung chi tiáº¿t..." />
              </label>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50 md:w-fit" disabled={!draftTitle.trim()} onClick={saveEntryRow} type="button">
                <Save className="size-4" />
                LÆ°u ná»™i dung
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-clay/15 bg-pearl p-5">
            <div className="flex flex-col gap-4 border-b border-clay/15 pb-4 md:flex-row md:items-center md:justify-between">
              <h3 className="font-serif text-3xl font-bold text-bark">Danh sÃ¡ch ná»™i dung</h3>
              <span className="w-fit rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">{rows.length} má»¥c</span>
            </div>
            <div className="divide-y divide-clay/15">
              {rows.map((row, index) => (
                <article className="grid gap-4 py-4 xl:grid-cols-[1fr_170px_auto] xl:items-center" key={`${row.title}-${index}`}>
                  <div>
                    <h4 className="text-base font-bold text-bark">{row.title}</h4>
                    <p className="mt-1 text-sm text-horn">{row.meta}</p>
                  </div>
                  <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => updateRowStatus(index, event.target.value)} value={row.status}>
                    <option value="ÄÃ£ cÃ´ng bá»‘">ÄÃ£ cÃ´ng bá»‘</option>
                    <option value="NhÃ¡p">NhÃ¡p</option>
                    <option value="Cáº§n rÃ  soÃ¡t">Cáº§n rÃ  soÃ¡t</option>
                    <option value="LÆ°u trá»¯">LÆ°u trá»¯</option>
                  </select>
                  <div className="flex gap-2 xl:justify-end">
                    <button className="inline-flex size-10 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" title="Sá»­a" type="button">
                      <Edit3 className="size-4" />
                    </button>
                    <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => removeRow(index)} title="XÃ³a" type="button">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  if (page === "staff" || page === "customers" || page === "categories" || page === "seo" || page === "settings" || page === "roles") {
    const listTitle = copy.listTitle;
    const addLabel = content.primaryAction ?? copy.button;
    const titlePlaceholder = copy.titlePlaceholder;
    const metaPlaceholder = copy.metaPlaceholder;

    return (
      <div className="flex min-h-0 flex-col gap-6">
        <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">{content.eyebrow}</p>
              <h2 className="mt-3 font-serif text-5xl font-bold text-bark">{content.title}</h2>
            </div>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-serif text-lg font-bold text-ivory transition hover:bg-bark" onClick={() => setShowEntryForm(true)} type="button">
              <Plus className="size-4" />
              {addLabel}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {content.stats.map((stat) => (
            <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
              <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
              <p className="mt-1 text-sm text-horn">{stat.note}</p>
            </article>
          ))}
        </div>

        {showEntryForm ? (
          <section className="rounded-lg border border-clay/15 bg-pearl p-5 md:p-7">
            <div className="flex items-center justify-between border-b border-clay/15 pb-4">
              <h3 className="font-serif text-3xl font-bold text-bark">{addLabel}</h3>
              <button className="inline-flex size-9 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" onClick={() => setShowEntryForm(false)} type="button">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Há» tÃªn
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftTitle(event.target.value)} placeholder={titlePlaceholder} value={draftTitle} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Tráº¡ng thÃ¡i
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>
                  {Array.from(new Set(content.rows.map((item) => item.status).concat(["Hoáº¡t Ä‘á»™ng", "Táº¡m khÃ³a", "ThÃ¢n thiáº¿t", "VIP", "Má»›i"]))).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
                ThÃ´ng tin
                <textarea className="min-h-28 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood" onChange={(event) => setDraftMeta(event.target.value)} placeholder={metaPlaceholder} value={draftMeta} />
              </label>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50 md:w-fit" disabled={!draftTitle.trim()} onClick={saveEntryRow} type="button">
                <Save className="size-4" />
                LÆ°u
              </button>
            </div>
          </section>
        ) : null}

        {!showEntryForm ? <section className="rounded-lg border border-clay/15 bg-pearl p-5">
          <div className="flex flex-col gap-4 border-b border-clay/15 pb-4 md:flex-row md:items-center md:justify-between">
            <h3 className="font-serif text-3xl font-bold text-bark">{listTitle}</h3>
            <span className="w-fit rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">
              {rows.length} má»¥c
            </span>
          </div>
          <div className="divide-y divide-clay/15">
            {rows.map((row, index) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_170px_auto] xl:items-center" key={`${row.title}-${index}`}>
                <div>
                  <h4 className="text-base font-bold text-bark">{row.title}</h4>
                  <p className="mt-1 text-sm text-horn">{row.meta}</p>
                </div>
                <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => updateRowStatus(index, event.target.value)} value={row.status}>
                  {Array.from(new Set(content.rows.map((item) => item.status).concat([row.status, "Hoáº¡t Ä‘á»™ng", "Táº¡m khÃ³a", "ThÃ¢n thiáº¿t", "VIP", "Má»›i"]))).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="flex gap-2 xl:justify-end">
                  <button className="inline-flex size-10 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" title="Sá»­a" type="button">
                    <Edit3 className="size-4" />
                  </button>
                  <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => removeRow(index)} title="XÃ³a" type="button">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section> : null}
      </div>
    );
  }

  const handleAddRow = () => {
    if (!draftTitle.trim()) {
      return;
    }

    setRows((current) => [
      { title: draftTitle.trim(), meta: draftMeta.trim() || "ChÆ°a cÃ³ mÃ´ táº£", status: selectedStatus },
      ...current,
    ]);
    setDraftTitle("");
    setDraftMeta("");
  };

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">{content.eyebrow}</p>
            <h2 className="mt-3 font-serif text-5xl font-bold text-bark">{content.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-horn">{content.description}</p>
          </div>
          {content.primaryAction ? (
            <button className="h-11 rounded-full bg-wood px-6 font-serif text-lg font-bold text-ivory transition hover:bg-bark" onClick={handleAddRow} type="button">
              {content.primaryAction}
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {content.stats.map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="h-fit rounded-lg border border-clay/15 bg-pearl p-5">
          <h3 className="border-b border-clay/15 pb-4 font-serif text-3xl font-bold text-bark">{copy.formTitle}</h3>
          <div className="mt-5 grid gap-4">
            <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftTitle(event.target.value)} placeholder={copy.titlePlaceholder} value={draftTitle} />
            <textarea className="min-h-28 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood" onChange={(event) => setDraftMeta(event.target.value)} placeholder={copy.metaPlaceholder} value={draftMeta} />
            <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>
              {Array.from(new Set(content.rows.map((row) => row.status).concat(["Hoáº¡t Ä‘á»™ng", "Táº¡m khÃ³a", "NhÃ¡p", "ÄÃ£ lÆ°u"]))).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50" disabled={!draftTitle.trim()} onClick={handleAddRow} type="button">
              <Save className="size-4" />
              {copy.button}
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-clay/15 bg-pearl p-5">
          <div className="flex items-center justify-between border-b border-clay/15 pb-4">
            <h3 className="font-serif text-3xl font-bold text-bark">{copy.listTitle}</h3>
            <span className="rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">{rows.length} má»¥c</span>
          </div>
          <div className="divide-y divide-clay/15">
            {rows.map((row, index) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_160px_auto] xl:items-center" key={`${row.title}-${index}`}>
                <div>
                  <h4 className="text-base font-bold text-bark">{row.title}</h4>
                  <p className="mt-1 text-sm text-horn">{row.meta}</p>
                </div>
                <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => updateRowStatus(index, event.target.value)} value={row.status}>
                  {Array.from(new Set(content.rows.map((item) => item.status).concat([row.status, "Hoáº¡t Ä‘á»™ng", "Táº¡m khÃ³a", "NhÃ¡p", "ÄÃ£ lÆ°u"]))).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => removeRow(index)} type="button" title="XÃ³a khá»i danh sÃ¡ch">
                  <Trash2 className="size-4" />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function AdminWorkspace({ role, page, productSlug }: AdminWorkspaceProps) {
  const router = useRouter();
  const [accessState, setAccessState] = useState<"checking" | "allowed" | "denied">("checking");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<WorkspaceUser | null>(null);
  const nav = (role === "admin" ? adminNav : staffNav)
    .filter((item) => !item.href.includes("/products/create"))
    .map((item) => (item.href.endsWith("/products") ? { ...item, label: "Quáº£n lÃ½ sáº£n pháº©m" } : item));
  const content = pageContent[page];
  const roleLabel = role === "admin" ? "ADMIN" : "STAFF";

  useEffect(() => {
    const isAuthenticated = window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
    const userJson = window.localStorage.getItem(AUTH_USER_KEY);

    if (!isAuthenticated || !userJson) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userJson) as WorkspaceUser;
      const allowed = role === "admin" ? user.role === "ADMIN" : user.role === "STAFF" || user.role === "ADMIN";
      setCurrentUser(user);
      setAccessState(allowed ? "allowed" : "denied");
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_USER_KEY);
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      router.replace("/login");
    }
  }, [role, router]);

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.dispatchEvent(new Event("vanmoc-auth-changed"));
    router.replace("/login");
  };

  if (accessState === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7efe4] px-5 text-bark">
        <div className="rounded-lg border border-clay/20 bg-pearl p-8 text-center shadow-[0_18px_60px_rgba(86,53,31,0.08)]">
          <p className="font-serif text-3xl font-bold">Äang kiá»ƒm tra quyá»n...</p>
        </div>
      </main>
    );
  }

  if (accessState === "denied") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7efe4] px-5 text-bark">
        <div className="max-w-lg rounded-lg border border-clay/20 bg-pearl p-8 text-center shadow-[0_18px_60px_rgba(86,53,31,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay">KhÃ´ng cÃ³ quyá»n</p>
          <h1 className="mt-3 font-serif text-4xl font-bold">TÃ i khoáº£n nÃ y khÃ´ng Ä‘Æ°á»£c vÃ o khu vá»±c {roleLabel}.</h1>
          <Link className="mt-6 inline-flex rounded-full bg-wood px-6 py-3 font-semibold text-ivory" href="/">
            Vá» trang bÃ¡n hÃ ng
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7efe4] text-bark">
      <section className={`grid min-h-screen transition-[grid-template-columns] duration-300 ${sidebarCollapsed ? "lg:grid-cols-[84px_1fr]" : "lg:grid-cols-[292px_1fr]"}`}>
        <aside className={`sticky top-0 z-40 flex flex-col bg-[#56351f] p-4 text-[#f4ead8] shadow-[18px_0_55px_rgba(45,33,24,0.12)] transition-all duration-300 lg:static lg:min-h-screen ${sidebarCollapsed ? "lg:p-3" : "lg:p-5"}`}>
          <div className="flex items-center justify-between lg:hidden">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f4ead8]/70">{roleLabel}</p>
              <h1 className="mt-1 font-serif text-2xl font-bold">VÃ¢n Má»™c</h1>
            </div>
            <button
              aria-label={mobileMenuOpen ? "ÄÃ³ng menu" : "Má»Ÿ menu"}
              className="inline-flex size-10 items-center justify-center rounded-full border border-[#f4ead8]/20 text-[#f4ead8] transition hover:bg-[#f4ead8]/10"
              onClick={() => setMobileMenuOpen((current) => !current)}
              title={mobileMenuOpen ? "ÄÃ³ng menu" : "Má»Ÿ menu"}
              type="button"
            >
              {mobileMenuOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </button>
          </div>
          <button
            aria-label={sidebarCollapsed ? "Má»Ÿ sidebar" : "Thu sidebar"}
            className={`mb-4 hidden size-10 shrink-0 items-center justify-center rounded-full border border-[#f4ead8]/20 text-[#f4ead8] transition hover:bg-[#f4ead8]/10 lg:inline-flex ${sidebarCollapsed ? "self-center" : "self-end"}`}
            onClick={() => setSidebarCollapsed((current) => !current)}
            title={sidebarCollapsed ? "Má»Ÿ sidebar" : "Thu sidebar"}
            type="button"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
          <div className={`hidden border-b border-[#f4ead8]/20 pb-5 lg:block ${sidebarCollapsed ? "lg:hidden" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f4ead8]/70">{roleLabel}</p>
            <h1 className="mt-2 font-serif text-3xl font-bold">VÃ¢n Má»™c</h1>
            <p className="mt-1 text-sm text-[#f4ead8]/75">Khu quáº£n trá»‹ website</p>
          </div>
          <nav className={`${mobileMenuOpen ? "mt-4 block" : "hidden"} flex-1 space-y-1 overflow-y-auto border-t border-[#f4ead8]/15 pt-4 lg:mt-5 lg:block lg:border-t-0 lg:pt-0 ${sidebarCollapsed ? "" : "lg:pr-1"}`}>
            {nav.map((item) => {
              const Icon = item.icon;
              const active = item.href === activeHrefForPage(role, page);

              return (
                <Link
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${sidebarCollapsed ? "lg:justify-center lg:gap-0 lg:px-0 lg:py-3" : "lg:gap-3 lg:px-3 lg:py-2.5"} ${active ? "bg-[#f4ead8] text-[#56351f]" : "text-[#f4ead8]/78 hover:bg-[#f4ead8]/10 hover:text-[#f4ead8]"
                    }`}
                  href={item.href}
                  key={item.href}
                  onClick={(event) => {
                    if (active) {
                      event.preventDefault();
                      return;
                    }
                    setMobileMenuOpen(false);
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-h-screen flex-col gap-6 px-5 pb-0 pt-5 md:px-8 lg:px-10">
          <header className="flex flex-col gap-3 rounded-lg border border-clay/15 bg-ivory/95 px-4 py-3 shadow-[0_12px_35px_rgba(86,53,31,0.07)] md:flex-row md:items-center md:justify-between md:px-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clay">{roleLabel}</p>
              <p className="mt-1 text-sm font-semibold text-bark">
                {currentUser?.fullName || (role === "admin" ? "Admin VÃ¢n Má»™c" : "Staff VÃ¢n Má»™c")}
              </p>
              {currentUser?.email ? <p className="mt-0.5 text-xs text-horn">{currentUser.email}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-full border border-clay/20 bg-pearl px-4 text-sm font-semibold text-wood transition hover:border-clay/50 hover:bg-sand"
                onClick={() => setProfilePanelOpen((current) => !current)}
                type="button"
              >
                <CircleUserRound className="size-4" />
                Xem profile
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-full bg-wood px-4 text-sm font-semibold text-ivory transition hover:bg-bark"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="size-4" />
                ÄÄƒng xuáº¥t
              </button>
            </div>
          </header>

          {profilePanelOpen ? (
            <section className="rounded-lg border border-clay/15 bg-pearl p-5 shadow-[0_12px_35px_rgba(86,53,31,0.07)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-wood text-ivory">
                    <CircleUserRound className="size-6" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Profile {roleLabel}</p>
                    <h2 className="mt-2 font-serif text-3xl font-bold text-bark">
                      {currentUser?.fullName || (role === "admin" ? "Admin VÃ¢n Má»™c" : "Staff VÃ¢n Má»™c")}
                    </h2>
                    <p className="mt-1 text-sm text-horn">{currentUser?.email || "ChÆ°a cÃ³ email"}</p>
                  </div>
                </div>
                <button
                  className="inline-flex size-9 items-center justify-center rounded-full border border-clay/20 text-wood transition hover:bg-sand"
                  onClick={() => setProfilePanelOpen(false)}
                  type="button"
                  aria-label="ÄÃ³ng profile"
                  title="ÄÃ³ng profile"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <article className="rounded-md border border-clay/15 bg-ivory p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Vai trÃ²</p>
                  <p className="mt-2 font-semibold text-bark">{roleLabel}</p>
                </article>
                <article className="rounded-md border border-clay/15 bg-ivory p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Tráº¡ng thÃ¡i</p>
                  <p className="mt-2 font-semibold text-bark">Äang hoáº¡t Ä‘á»™ng</p>
                </article>
                <article className="rounded-md border border-clay/15 bg-ivory p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Khu vá»±c</p>
                  <p className="mt-2 font-semibold text-bark">{role === "admin" ? "Quáº£n trá»‹ há»‡ thá»‘ng" : "Váº­n hÃ nh website"}</p>
                </article>
              </div>
            </section>
          ) : null}

          {page === "products" || page === "product-create" || page === "product-edit" ? (
            <ProductManager
              editSlug={productSlug}
              role={role}
              mode={page === "product-create" ? "create" : page === "product-edit" ? "edit" : "manage"}
            />
          ) : page === "inventory" ? (
            <InventoryManager />
          ) : page === "orders" ? (
            <OrdersManager />
          ) : page === "personalization" ? (
            <PersonalizationManager />
          ) : page === "traceability" ? (
            <TraceabilityManager />
          ) : page === "trace-create" ? (
            <TraceProductEditor />
          ) : page === "reviews" ? (
            <ReviewsManager />
          ) : ["categories", "banners", "contents"].includes(page) ? (
            <AdminDataCrudManager page={page as "categories" | "banners" | "contents"} />
          ) : ["staff", "customers", "seo", "settings", "roles"].includes(page) ? (
            <AdminOperationsManager page={page as Extract<PageKey, "staff" | "customers" | "categories" | "banners" | "contents" | "seo" | "settings" | "roles">} />
          ) : (
            <>
              <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">{content.eyebrow}</p>
                    <h2 className="mt-3 font-serif text-5xl font-bold text-bark">{content.title}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-horn">{content.description}</p>
                  </div>
                  {content.primaryAction && (
                    <button className="h-11 rounded-full bg-wood px-6 font-serif text-lg font-bold text-ivory transition hover:bg-bark">
                      {content.primaryAction}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.stats.map((stat) => (
                  <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
                    <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
                    <p className="mt-1 text-sm text-horn">{stat.note}</p>
                  </article>
                ))}
              </div>

              <div className="rounded-lg border border-clay/15 bg-pearl p-5">
                <div className="flex items-center justify-between border-b border-clay/15 pb-4">
                  <h3 className="font-serif text-3xl font-bold text-bark">Danh sÃ¡ch xá»­ lÃ½</h3>
                  <span className="rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">
                    MVP
                  </span>
                </div>
                <div className="divide-y divide-clay/15">
                  {content.rows.map((row) => (
                    <article className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center" key={row.title}>
                      <div>
                        <h4 className="text-base font-bold text-bark">{row.title}</h4>
                        <p className="mt-1 text-sm text-horn">{row.meta}</p>
                      </div>
                      <span className="w-fit rounded-full border border-clay/25 px-4 py-1.5 text-sm font-semibold text-wood">
                        {row.status}
                      </span>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}

          <footer className="mt-auto -mx-5 bg-[#56351f] px-6 py-5 text-[#f4ead8] md:-mx-8 md:px-10 lg:-mx-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-serif text-2xl font-bold">VÃ¢n Má»™c</p>
                <p className="mt-1 text-sm text-[#f4ead8]/75">
                  Khu quáº£n trá»‹ dÃ nh cho {role === "admin" ? "Admin toÃ n quyá»n" : "Staff váº­n hÃ nh"}.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#f4ead8]/80">
                <Link href="/" className="transition hover:text-[#f4ead8]">
                  Trang bÃ¡n hÃ ng
                </Link>
                <span className="text-[#f4ead8]/35">/</span>
                <Link href="/admin/settings" className="transition hover:text-[#f4ead8]">
                  Cáº¥u hÃ¬nh
                </Link>
                <span className="text-[#f4ead8]/35">/</span>
                <Link href="/contact" className="transition hover:text-[#f4ead8]">
                  LiÃªn há»‡
                </Link>
              </div>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}

