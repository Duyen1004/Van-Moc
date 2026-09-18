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
  { href: "/staff/products", label: "Sản phẩm", icon: Boxes },
  { href: "/staff/products/create", label: "Thêm sản phẩm", icon: PackagePlus },
  { href: "/staff/products/inventory", label: "Quản lý tồn kho", icon: BarChart3 },
  { href: "/staff/orders", label: "Đơn hàng", icon: ClipboardList },
  { href: "/staff/personalization", label: "Cá nhân hóa", icon: Sparkles },
  { href: "/staff/traceability", label: "QR / Traceability", icon: QrCode },
  { href: "/staff/reviews", label: "Review", icon: Star },
];

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Boxes },
  { href: "/admin/products/create", label: "Thêm sản phẩm", icon: PackagePlus },
  { href: "/admin/products/inventory", label: "Quản lý tồn kho", icon: BarChart3 },
  { href: "/admin/orders", label: "Đơn hàng", icon: ClipboardList },
  { href: "/admin/personalization", label: "Cá nhân hóa", icon: Sparkles },
  { href: "/admin/traceability", label: "QR / Traceability", icon: QrCode },
  { href: "/admin/traceability/create", label: "Tạo mã QR", icon: QrCode },
  { href: "/admin/reviews", label: "Review", icon: Star },
  { href: "/admin/staff", label: "Quản lý Staff", icon: ShieldCheck },
  { href: "/admin/customers", label: "Quản lý Customer", icon: Users },
  { href: "/admin/categories", label: "Danh mục", icon: Tags },
  { href: "/admin/banners", label: "Banner", icon: Megaphone },
  { href: "/admin/contents", label: "Nội dung", icon: FilePenLine },
  { href: "/admin/seo", label: "SEO", icon: SearchCheck },
  { href: "/admin/settings", label: "Cấu hình", icon: Settings },
  { href: "/admin/roles", label: "Phân quyền", icon: KeyRound },
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
    eyebrow: "Tổng quan vận hành",
    title: "Dashboard",
    description: "Theo dõi nhanh doanh thu, đơn hàng, sản phẩm cần xử lý và mã QR mới tạo.",
    stats: [
      { label: "Đơn hôm nay", value: "18", note: "+6 đơn mới" },
      { label: "Doanh thu", value: "12.8tr", note: "MVP demo" },
      { label: "Chờ khắc", value: "7", note: "Cần duyệt nội dung" },
      { label: "QR đã tạo", value: "42", note: "Trong tháng này" },
    ],
    rows: [
      { title: "VM20260915001", meta: "Lược sừng tự nhiên VM01", status: "Chờ xác nhận" },
      { title: "VM20260915002", meta: "Khắc tên: NGUYỄN AN", status: "Đang hoàn thiện" },
      { title: "VM-BATCH-2026-09", meta: "Lô sản xuất mới", status: "Đã có QR" },
    ],
  },
  products: {
    eyebrow: "Quản lý bán hàng",
    title: "Sản phẩm",
    description: "Thêm, sửa, ẩn hiện sản phẩm và kiểm tra trạng thái bán trên website.",
    primaryAction: "Thêm sản phẩm",
    stats: [
      { label: "Đang bán", value: "24", note: "Hiển thị trên web" },
      { label: "Sắp hết", value: "5", note: "Cần nhập thêm" },
      { label: "Ẩn", value: "3", note: "Chưa công bố" },
      { label: "Bán chạy", value: "8", note: "Đang ghim" },
    ],
    rows: [
      { title: "Lược sừng tự nhiên VM01", meta: "350.000đ · 18 tồn", status: "Đang bán" },
      { title: "Trâm cài vân sừng", meta: "420.000đ · 9 tồn", status: "Bán chạy" },
      { title: "Set quà thủ công", meta: "690.000đ · 4 tồn", status: "Sắp hết" },
    ],
  },
  "product-create": {
    eyebrow: "Sản phẩm",
    title: "Thêm sản phẩm",
    description: "Nhập thông tin cơ bản, ảnh, giá, danh mục và tùy chọn cá nhân hóa.",
    primaryAction: "Lưu sản phẩm",
    stats: [
      { label: "Tên", value: "01", note: "Bắt buộc" },
      { label: "Ảnh", value: "04", note: "Nên có" },
      { label: "Giá", value: "VNĐ", note: "Theo sản phẩm" },
      { label: "Khắc tên", value: "Có", note: "Tùy chọn" },
    ],
    rows: [
      { title: "Thông tin chung", meta: "Tên, mô tả, chất liệu, câu chuyện sản phẩm", status: "Biểu mẫu" },
      { title: "Hình ảnh", meta: "Ảnh đại diện và ảnh chi tiết", status: "Tải lên" },
      { title: "Cá nhân hóa", meta: "Cho phép khắc tên, charm, font chữ", status: "Tùy chọn" },
    ],
  },
  "product-edit": {
    eyebrow: "Sản phẩm",
    title: "Sửa sản phẩm",
    description: "Cập nhật thông tin sản phẩm, trạng thái bán, tồn kho và ảnh đại diện.",
    primaryAction: "Lưu thay đổi",
    stats: [
      { label: "Tên", value: "01", note: "Bắt buộc" },
      { label: "Ảnh", value: "01", note: "Đại diện" },
      { label: "Giá", value: "VNĐ", note: "Theo sản phẩm" },
      { label: "Xóa", value: "Mềm", note: "Chuyển trạng thái ẩn" },
    ],
    rows: [
      { title: "Thông tin chung", meta: "Tên, mô tả, chất liệu, câu chuyện sản phẩm", status: "Biểu mẫu" },
      { title: "Bán hàng", meta: "Giá, tồn kho, trạng thái hiển thị", status: "Cập nhật" },
      { title: "Ảnh đại diện", meta: "URL ảnh chính hiển thị trên website", status: "Cập nhật" },
    ],
  },
  inventory: {
    eyebrow: "Kho hàng",
    title: "Quản lý tồn kho",
    description: "Theo dõi số lượng còn lại, cảnh báo sắp hết và lô sản xuất liên quan.",
    stats: [
      { label: "Tổng tồn", value: "186", note: "Tất cả sản phẩm" },
      { label: "Sắp hết", value: "5", note: "Dưới 5 món" },
      { label: "Đang giữ", value: "12", note: "Trong giỏ/đơn" },
      { label: "Lô mới", value: "3", note: "Chờ nhập kho" },
    ],
    rows: [
      { title: "Lược sừng VM01", meta: "18 tồn · VM-BATCH-2026-09", status: "Ổn định" },
      { title: "Set quà thủ công", meta: "4 tồn · VM-BATCH-2026-08", status: "Sắp hết" },
      { title: "Charm ánh vàng", meta: "32 tồn · VM-BATCH-2026-09", status: "Ổn định" },
    ],
  },
  orders: {
    eyebrow: "Vận hành",
    title: "Đơn hàng",
    description: "Xem đơn, cập nhật trạng thái thanh toán, xử lý khắc tên và giao hàng.",
    primaryAction: "Cập nhật trạng thái",
    stats: [
      { label: "Chờ xác nhận", value: "6", note: "Cần gọi lại" },
      { label: "Đang làm", value: "9", note: "Xưởng xử lý" },
      { label: "Đang giao", value: "4", note: "Đơn vận chuyển" },
      { label: "Hoàn thành", value: "128", note: "Tháng này" },
    ],
    rows: [
      { title: "VM20260915001", meta: "Nguyễn An · 1 sản phẩm", status: "Chờ xác nhận" },
      { title: "VM20260915002", meta: "Lê Minh · Có khắc tên", status: "Đang hoàn thiện" },
      { title: "VM20260915003", meta: "Thu Hà · Set quà tặng", status: "Đang giao" },
    ],
  },
  personalization: {
    eyebrow: "Cá nhân hóa",
    title: "Nội dung khắc",
    description: "Kiểm tra chữ khắc, font, vị trí và ghi chú riêng trước khi chuyển xưởng.",
    stats: [
      { label: "Chờ duyệt", value: "7", note: "Nội dung mới" },
      { label: "Đang khắc", value: "5", note: "Tại xưởng" },
      { label: "Cần hỏi lại", value: "2", note: "Chữ quá dài" },
      { label: "Hoàn tất", value: "31", note: "Tuần này" },
    ],
    rows: [
      { title: "NGUYỄN AN", meta: "Lược sừng VM01 · Font serif", status: "Chờ duyệt" },
      { title: "MỘC NHIÊN", meta: "Trâm cài · Vị trí cạnh phải", status: "Đang khắc" },
      { title: "HÀ 2026", meta: "Set quà · Kèm QR", status: "Hoàn tất" },
    ],
  },
  traceability: {
    eyebrow: "QR / Traceability",
    title: "Quản lý mã truy xuất",
    description: "Tạo mã, quản lý mã và cập nhật hành trình chất liệu, lô sản xuất, nghệ nhân.",
    primaryAction: "Tạo mã QR",
    stats: [
      { label: "Đã tạo", value: "42", note: "Tháng này" },
      { label: "Chờ gắn", value: "8", note: "Sau hoàn thiện" },
      { label: "Đã quét", value: "326", note: "Tổng lượt" },
      { label: "Lô sản xuất", value: "12", note: "Đang quản lý" },
    ],
    rows: [
      { title: "VM000123", meta: "Lược sừng VM01 · VM-BATCH-2026-09", status: "Đang hoạt động" },
      { title: "VM000124", meta: "Trâm cài · Nghệ nhân Thụy Ứng", status: "Chờ gắn" },
      { title: "VM000125", meta: "Set quà · Đã cập nhật bảo quản", status: "Đang hoạt động" },
    ],
  },
  "trace-create": {
    eyebrow: "QR / Traceability",
    title: "Tạo mã QR",
    description: "Gắn mã định danh với sản phẩm hoặc lô sản xuất để khách hàng truy xuất.",
    primaryAction: "Tạo mã",
    stats: [
      { label: "Mã mới", value: "VM", note: "Tự sinh" },
      { label: "Sản phẩm", value: "01", note: "Bắt buộc" },
      { label: "Lô", value: "01", note: "Có thể chọn" },
      { label: "Trạng thái", value: "Nháp", note: "Trước khi công bố" },
    ],
    rows: [
      { title: "Thông tin sản phẩm", meta: "Chọn sản phẩm hoặc lô sản xuất", status: "Bắt buộc" },
      { title: "Hành trình", meta: "Chất liệu, nghệ nhân, công đoạn", status: "Bắt buộc" },
      { title: "Hướng dẫn bảo quản", meta: "Nội dung hiển thị cho khách", status: "Tùy chọn" },
    ],
  },
  reviews: {
    eyebrow: "Khách hàng",
    title: "Review",
    description: "Duyệt đánh giá, phản hồi khách hàng và chọn review nổi bật.",
    stats: [
      { label: "Chờ duyệt", value: "9", note: "Review mới" },
      { label: "5 sao", value: "86%", note: "Tổng đánh giá" },
      { label: "Đã phản hồi", value: "34", note: "Tháng này" },
      { label: "Ghim", value: "4", note: "Trang chủ" },
    ],
    rows: [
      { title: "Linda", meta: "Lược sừng tự nhiên · 5 sao", status: "Chờ duyệt" },
      { title: "Peter", meta: "Trâm cài vân sừng · 5 sao", status: "Đã hiển thị" },
      { title: "Andy", meta: "Set quà thủ công · 4 sao", status: "Đã phản hồi" },
    ],
  },
  staff: {
    eyebrow: "Admin",
    title: "Quản lý Staff",
    description: "Thêm nhân sự vận hành, khóa tài khoản và phân ca xử lý đơn hàng.",
    primaryAction: "Thêm staff",
    stats: [
      { label: "Staff", value: "6", note: "Đang hoạt động" },
      { label: "Online", value: "3", note: "Hôm nay" },
      { label: "Tạm khóa", value: "1", note: "Chờ kiểm tra" },
      { label: "Vai trò", value: "4", note: "Nhóm quyền" },
    ],
    rows: [
      { title: "Mai Anh", meta: "Quản lý đơn hàng", status: "Hoạt động" },
      { title: "Thu Uyên", meta: "Cập nhật sản phẩm", status: "Hoạt động" },
      { title: "Minh Khang", meta: "QR / Traceability", status: "Tạm khóa" },
    ],
  },
  customers: {
    eyebrow: "Admin",
    title: "Quản lý Customer",
    description: "Xem khách hàng, lịch sử mua, trạng thái tài khoản và ghi chú chăm sóc.",
    stats: [
      { label: "Khách hàng", value: "1.248", note: "Tổng tài khoản" },
      { label: "Mới", value: "38", note: "Tuần này" },
      { label: "Quay lại", value: "24%", note: "Tỉ lệ mua lại" },
      { label: "VIP", value: "16", note: "Khách thân thiết" },
    ],
    rows: [
      { title: "Nguyễn An", meta: "3 đơn · 1 sản phẩm cá nhân hóa", status: "Thân thiết" },
      { title: "Lê Minh", meta: "1 đơn · Có QR", status: "Mới" },
      { title: "Thu Hà", meta: "5 đơn · Set quà", status: "VIP" },
    ],
  },
  categories: {
    eyebrow: "Admin",
    title: "Quản lý danh mục",
    description: "Sắp xếp nhóm sản phẩm, tên danh mục và trạng thái hiển thị.",
    primaryAction: "Thêm danh mục",
    stats: [
      { label: "Danh mục", value: "5", note: "Đang dùng" },
      { label: "Ẩn", value: "1", note: "Chưa bán" },
      { label: "Nổi bật", value: "3", note: "Trên menu" },
      { label: "Sản phẩm", value: "24", note: "Đã gắn" },
    ],
    rows: [
      { title: "Lược sừng", meta: "8 sản phẩm", status: "Hiển thị" },
      { title: "Trâm cài", meta: "5 sản phẩm", status: "Hiển thị" },
      { title: "Quà tặng", meta: "4 sản phẩm", status: "Nổi bật" },
    ],
  },
  banners: {
    eyebrow: "Admin",
    title: "Quản lý banner",
    description: "Cập nhật banner trang chủ, danh mục, thông điệp và nút điều hướng.",
    primaryAction: "Thêm banner",
    stats: [
      { label: "Banner", value: "4", note: "Đang chạy" },
      { label: "Mobile", value: "4", note: "Đã tối ưu" },
      { label: "CTR", value: "8.2%", note: "Demo" },
      { label: "Lịch", value: "2", note: "Đặt trước" },
    ],
    rows: [
      { title: "Sản phẩm mới từ sừng tự nhiên", meta: "Trang chủ", status: "Đang chạy" },
      { title: "Bán chạy mùa này", meta: "Danh mục", status: "Đang chạy" },
      { title: "Quà tặng cá nhân hóa", meta: "Chiến dịch", status: "Đặt lịch" },
    ],
  },
  contents: {
    eyebrow: "Admin",
    title: "Quản lý nội dung",
    description: "Sửa nội dung trang làng nghề, footer, chính sách và bài viết giới thiệu.",
    stats: [
      { label: "Trang", value: "8", note: "Nội dung tĩnh" },
      { label: "Bài viết", value: "6", note: "Làng nghề" },
      { label: "Nháp", value: "3", note: "Chưa công bố" },
      { label: "Đã sửa", value: "12", note: "Tháng này" },
    ],
    rows: [
      { title: "Làng nghề Thụy Ứng", meta: "Trang giới thiệu", status: "Đã công bố" },
      { title: "Chính sách giao hàng", meta: "Footer", status: "Cần rà soát" },
      { title: "Câu chuyện chất liệu", meta: "Trang chủ", status: "Đã công bố" },
    ],
  },
  seo: {
    eyebrow: "Admin",
    title: "Quản lý SEO",
    description: "Tối ưu tiêu đề, mô tả, slug, ảnh chia sẻ và trạng thái index.",
    stats: [
      { label: "Trang thiếu mô tả", value: "4", note: "Cần bổ sung" },
      { label: "Slug tốt", value: "92%", note: "Đạt chuẩn" },
      { label: "Ảnh OG", value: "7", note: "Đã có" },
      { label: "Index", value: "18", note: "Trang công khai" },
    ],
    rows: [
      { title: "/products", meta: "Danh mục sản phẩm", status: "Tốt" },
      { title: "/lang-nghe-thuy-ung", meta: "Thiếu mô tả SEO", status: "Cần sửa" },
      { title: "/trace/VM000123", meta: "Không index", status: "Đúng cấu hình" },
    ],
  },
  settings: {
    eyebrow: "Admin",
    title: "Cấu hình website",
    description: "Quản lý thông tin liên hệ, màu thương hiệu, vận chuyển và thanh toán.",
    stats: [
      { label: "Thanh toán", value: "2", note: "Phương thức" },
      { label: "Vận chuyển", value: "3", note: "Khu vực" },
      { label: "Email", value: "OK", note: "Thông báo đơn" },
      { label: "Theme", value: "Vân Mộc", note: "Đang dùng" },
    ],
    rows: [
      { title: "Thông tin cửa hàng", meta: "Email, hotline, địa chỉ", status: "Đã lưu" },
      { title: "Phí vận chuyển", meta: "Nội thành, ngoại thành", status: "Cần cập nhật" },
      { title: "Màu thương hiệu", meta: "Nâu sừng và kem logo", status: "Đang dùng" },
    ],
  },
  roles: {
    eyebrow: "Admin",
    title: "Phân quyền",
    description: "Cấu hình quyền truy cập cho Admin, Staff và các nhóm vận hành.",
    primaryAction: "Tạo nhóm quyền",
    stats: [
      { label: "Nhóm quyền", value: "4", note: "Đang dùng" },
      { label: "Admin", value: "2", note: "Toàn quyền" },
      { label: "Staff", value: "6", note: "Giới hạn" },
      { label: "Log", value: "128", note: "Thao tác" },
    ],
    rows: [
      { title: "Admin", meta: "Toàn quyền hệ thống", status: "Full access" },
      { title: "Staff đơn hàng", meta: "Xem và cập nhật đơn", status: "Giới hạn" },
      { title: "Staff nội dung", meta: "Sản phẩm, banner, bài viết", status: "Giới hạn" },
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
  origin: "Làng nghề Thụy Ứng, Hà Nội",
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
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
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
          setError("Không tìm thấy sản phẩm cần sửa.");
        }
      }
    } catch {
      setError("Chưa tải được danh sách sản phẩm. Kiểm tra backend và quyền đăng nhập staff/admin.");
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
      setError("Chưa cấu hình Cloudinary. Thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET vào .env.local.");
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
      setError("Chưa upload được ảnh lên Cloudinary.");
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
      setError("Chưa lưu được sản phẩm. Kiểm tra SKU/slug có bị trùng hoặc thiếu danh mục không.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (product: AdminProduct) => {
    const confirmed = window.confirm(`Xóa mềm sản phẩm "${product.name}"? Sản phẩm sẽ chuyển sang trạng thái ẩn.`);

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await archiveAdminProduct(product.slug);
      await loadProducts();
    } catch {
      setError("Chưa xóa mềm được sản phẩm.");
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
      setError("Chưa cập nhật được trạng thái sản phẩm.");
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
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Quản lý bán hàng</p>
            <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quản lý sản phẩm</h2>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-serif text-lg font-bold text-ivory transition hover:bg-bark"
            onClick={startCreate}
            type="button"
          >
            <Plus className="size-4" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {mode === "manage" ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Đang bán", value: String(activeProducts.length), note: "Hiển thị hoặc có thể bán" },
          { label: "Sắp hết", value: String(lowStockProducts.length), note: "Tồn kho từ 5 trở xuống" },
          { label: "Đã ẩn", value: String(hiddenProducts.length), note: "Xóa mềm / không bán" },
          { label: "Tổng sản phẩm", value: String(products.length), note: "Bao gồm sản phẩm ẩn" },
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
            <h3 className="font-serif text-3xl font-bold text-bark">{editingSlug ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
            {editingSlug ? (
              <button className="inline-flex size-9 items-center justify-center rounded-full border border-clay/25 text-wood" onClick={startCreate} type="button">
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-bark">
              Tên sản phẩm
              <input
                className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood"
                onBlur={() => !form.slug && setField("slug", slugify(form.name))}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Ví dụ: Lược sừng tự nhiên VM01"
                value={form.name}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                SKU
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("sku", event.target.value)} placeholder="Ví dụ: VM-LS-001" value={form.sku} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Slug
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("slug", slugify(event.target.value))} placeholder="luoc-sung-tu-nhien-vm01" value={form.slug} />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-semibold text-bark">
              Danh mục
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
                Giá
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" min={0} onChange={(event) => setField("price", Number(event.target.value))} placeholder="350000" type="number" value={form.price} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Tồn kho
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" min={0} onChange={(event) => setField("stockQuantity", Number(event.target.value))} placeholder="18" type="number" value={form.stockQuantity} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Trạng thái
                <select className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("status", event.target.value)} value={form.status}>
                  <option value="AVAILABLE">Đang bán</option>
                  <option value="DRAFT">Nháp</option>
                  <option value="OUT_OF_STOCK">Hết hàng</option>
                  <option value="INACTIVE">Ẩn</option>
                </select>
              </label>
              <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-bark">
                <input checked={form.personalizable} onChange={(event) => setField("personalizable", event.target.checked)} type="checkbox" />
                Cho phép cá nhân hóa
              </label>
            </div>
            <div className="grid gap-3 rounded-2xl border border-clay/15 bg-ivory/70 p-4 md:col-span-2">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <label className="grid flex-1 gap-1.5 text-sm font-semibold text-bark">
                  Ảnh đại diện URL
                  <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => handleImageUrlChange(event.target.value)} placeholder="https://.../anh-san-pham.jpg" value={form.imageUrl} />
                </label>
                <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand">
                  {uploadingImages ? "Đang tải ảnh..." : "Tải ảnh Cloudinary"}
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
              <p className="text-xs font-medium text-horn">Có thể chọn nhiều ảnh. Ảnh đầu tiên sẽ là ảnh đại diện của sản phẩm.</p>
              {form.imageUrls.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {form.imageUrls.map((imageUrl, index) => (
                    <div className="relative overflow-hidden rounded-lg border border-clay/15 bg-pearl" key={`${imageUrl}-${index}`}>
                      <img alt={`Ảnh sản phẩm ${index + 1}`} className="aspect-square w-full object-cover" src={imageUrl} />
                      <div className="absolute left-2 top-2 rounded-full bg-wood px-2 py-1 text-[10px] font-bold uppercase text-ivory">
                        {index === 0 ? "Chính" : `Ảnh ${index + 1}`}
                      </div>
                      <button
                        aria-label={`Xóa ảnh ${index + 1}`}
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
                Chất liệu
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("material", event.target.value)} placeholder="Ví dụ: Sừng tự nhiên" value={form.material} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Xuất xứ
                <input className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setField("origin", event.target.value)} placeholder="Ví dụ: Làng nghề Thụy Ứng, Hà Nội" value={form.origin} />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
              Mô tả ngắn
              <textarea
                className="min-h-24 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood"
                onChange={(event) => setField("shortDescription", event.target.value)}
                placeholder="Nhập mô tả ngắn hiển thị ở danh sách sản phẩm..."
                value={form.shortDescription}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
              Mô tả
              <textarea className="min-h-32 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood" onChange={(event) => setField("description", event.target.value)} placeholder="Nhập mô tả chi tiết về chất liệu, quy trình chế tác và cách sử dụng..." value={form.description} />
            </label>
            {error ? <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-60 md:w-fit"
              disabled={saving || !form.name || !form.sku}
              onClick={handleSave}
              type="button"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {editingSlug ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </button>
          </div>
        </section> : null}

        {mode === "manage" ? <section className="rounded-lg border border-clay/15 bg-pearl p-5">
          <div className="flex items-center justify-between border-b border-clay/15 pb-4">
            <h3 className="font-serif text-3xl font-bold text-bark">Danh sách sản phẩm</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn">
              <Loader2 className="size-4 animate-spin" />
              Đang tải sản phẩm...
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
                      {product.sku} · {product.categoryName} · {formatVnd(product.price)} · {product.stockQuantity} tồn
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-horn">{product.shortDescription || product.description}</p>
                  </div>
                  <div className="flex gap-2 xl:justify-end">
                    <select
                      aria-label={`Trạng thái ${product.name}`}
                      className="h-9 rounded-full border border-clay/30 bg-ivory px-3 text-xs font-semibold text-wood outline-none transition hover:bg-sand focus:border-wood disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={saving}
                      onChange={(event) => handleStatusChange(product, event.target.value)}
                      value={product.status}
                    >
                      <option value="AVAILABLE">Đang bán</option>
                      <option value="DRAFT">Nháp</option>
                      <option value="OUT_OF_STOCK">Hết hàng</option>
                      <option value="INACTIVE">Ẩn</option>
                    </select>
                    <Link aria-label={`Sửa ${product.name}`} className="inline-flex size-9 items-center justify-center rounded-full border border-clay/30 text-wood transition hover:bg-sand" href={`/${role}/products/${product.slug}`} title="Sửa">
                      <Edit3 className="size-4" />
                    </Link>
                    <button aria-label={`Xóa mềm ${product.name}`} className="inline-flex size-9 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => handleArchive(product)} title="Xóa mềm" type="button">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              ))}
              <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-horn">
                  Hiển thị {products.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageSize, products.length)} / {products.length} sản phẩm
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="h-9 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    type="button"
                  >
                    Trước
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
      setError("Chưa tải được dữ liệu tồn kho. Kiểm tra backend và quyền đăng nhập staff/admin.");
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
      setError("Chưa cập nhật được tồn kho sản phẩm.");
    } finally {
      setSavingSlug("");
    }
  };

  const tabs: Array<{ id: InventoryTab; label: string; count: number }> = [
    { id: "all", label: "Tất cả", count: products.length },
    { id: "low", label: "Sắp hết", count: lowStockProducts.length },
    { id: "out", label: "Hết hàng", count: outStockProducts.length },
    { id: "hidden", label: "Đã ẩn", count: hiddenProducts.length },
  ];

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Kho hàng</p>
            <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quản lý tồn kho</h2>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-full border border-clay/25 px-5 text-sm font-semibold text-wood transition hover:bg-sand"
            onClick={loadProducts}
            type="button"
          >
            Làm mới tồn kho
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tổng tồn", value: String(totalStock), note: "Sản phẩm đang hoạt động" },
          { label: "Sắp hết", value: String(lowStockProducts.length), note: "Tồn kho từ 1 đến 5" },
          { label: "Hết hàng", value: String(outStockProducts.length), note: "Cần nhập thêm" },
          { label: "Đã ẩn", value: String(hiddenProducts.length), note: "Không hiển thị bán" },
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
          <h3 className="font-serif text-3xl font-bold text-bark">Danh sách tồn kho</h3>
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
            Đang tải tồn kho...
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
                      {product.sku} · {product.categoryName} · {formatVnd(product.price)}
                    </p>
                  </div>
                  <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-clay">
                    Số tồn
                    <input
                      className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold normal-case tracking-normal text-bark outline-none focus:border-wood"
                      min={0}
                      onChange={(event) => setStockDrafts((current) => ({ ...current, [product.id]: Number(event.target.value) }))}
                      type="number"
                      value={draftStock}
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-clay">
                    Trạng thái
                    <select
                      className="h-10 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold normal-case tracking-normal text-wood outline-none focus:border-wood"
                      onChange={(event) => updateInventory(product, draftStock, event.target.value)}
                      value={product.status}
                    >
                      <option value="AVAILABLE">Đang bán</option>
                      <option value="DRAFT">Nháp</option>
                      <option value="OUT_OF_STOCK">Hết hàng</option>
                      <option value="INACTIVE">Ẩn</option>
                    </select>
                  </label>
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-wood px-4 text-sm font-semibold text-ivory transition hover:bg-bark disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={!changed || savingSlug === product.slug}
                    onClick={() => updateInventory(product)}
                    type="button"
                  >
                    {savingSlug === product.slug ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Lưu
                  </button>
                </article>
              );
            })}

            {filteredProducts.length === 0 ? (
              <p className="py-10 text-center text-sm font-semibold text-horn">Không có sản phẩm trong nhóm này.</p>
            ) : null}

            <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-horn">
                Hiển thị {filteredProducts.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageSize, filteredProducts.length)} / {filteredProducts.length} sản phẩm
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="h-9 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  Trước
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
      setError("Chưa tải được danh sách đơn hàng.");
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
      setError("Chưa cập nhật được trạng thái đơn hàng.");
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
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Vận hành</p>
            <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quản lý đơn hàng</h2>
          </div>
          <button className="h-11 rounded-full border border-clay/25 px-5 text-sm font-semibold text-wood transition hover:bg-sand" onClick={loadOrders} type="button">
            Làm mới đơn
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tổng đơn", value: String(orders.length), note: "Tất cả đơn hàng" },
          { label: "Chờ xử lý", value: String(pendingOrders.length), note: "Cần xác nhận" },
          { label: "Đang xử lý", value: String(processingOrders.length), note: "Đang chuẩn bị/giao" },
          { label: "Doanh thu", value: formatVnd(revenue), note: "Không tính đơn hủy" },
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
          <h3 className="font-serif text-3xl font-bold text-bark">Danh sách đơn hàng</h3>
          <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => setFilter(event.target.value)} value={filter}>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="COMPLETED">Hoàn tất</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Đang tải đơn hàng...</div>
        ) : (
          <div className="divide-y divide-clay/15">
            {filteredOrders.map((order) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_150px_160px_160px] xl:items-center" key={order.orderCode}>
                <div>
                  <h4 className="text-base font-bold text-bark">{order.orderCode}</h4>
                  <p className="mt-1 text-sm text-horn">{order.customerName} · {order.phone} · {formatDateTime(order.createdAt)}</p>
                  <p className="mt-1 text-sm font-semibold text-wood">{formatVnd(order.totalAmount)} · {order.paymentMethod}</p>
                </div>
                <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none disabled:opacity-50" disabled={savingCode === order.orderCode} onChange={(event) => updateStatus(order, { orderStatus: event.target.value })} value={order.orderStatus}>
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="PROCESSING">Đang xử lý</option>
                  <option value="SHIPPING">Đang giao</option>
                  <option value="COMPLETED">Hoàn tất</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
                <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none disabled:opacity-50" disabled={savingCode === order.orderCode} onChange={(event) => updateStatus(order, { paymentStatus: event.target.value })} value={order.paymentStatus}>
                  <option value="UNPAID">Chưa thanh toán</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="FAILED">Lỗi</option>
                  <option value="REFUNDED">Hoàn tiền</option>
                </select>
                <Link className="inline-flex h-10 items-center justify-center rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand" href={`/order/${order.orderCode}`}>
                  Xem chi tiết
                </Link>
              </article>
            ))}
            {!filteredOrders.length ? <p className="py-10 text-center text-sm font-semibold text-horn">Không có đơn hàng phù hợp.</p> : null}
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
      .catch(() => setError("Chưa tải được danh sách cá nhân hóa."))
      .finally(() => setLoading(false));
  }, []);

  const pendingItems = items.filter((item) => ["PENDING", "CONFIRMED", "PROCESSING"].includes(item.orderStatus));
  const totalFee = items.reduce((total, item) => total + item.engravingPrice, 0);

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Xưởng khắc</p>
        <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quản lý cá nhân hóa</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Tổng yêu cầu", value: String(items.length), note: "Có nội dung khắc" },
          { label: "Cần xử lý", value: String(pendingItems.length), note: "Theo đơn chưa hoàn tất" },
          { label: "Phí khắc", value: formatVnd(totalFee), note: "Tổng giá trị" },
        ].map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div>
      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <h3 className="border-b border-clay/15 pb-4 font-serif text-3xl font-bold text-bark">Danh sách nội dung khắc</h3>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Đang tải nội dung...</div> : (
          <div className="grid gap-4 pt-4 lg:grid-cols-2">
            {items.map((item) => (
              <article className="rounded-lg border border-clay/15 bg-ivory p-5" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-bark">{item.productName}</h4>
                    <p className="mt-1 text-sm text-horn">{item.orderCode} · {item.customerName}</p>
                  </div>
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-wood">{item.orderStatus}</span>
                </div>
                <div className="mt-4 rounded-lg bg-wood px-5 py-7 text-center font-serif text-3xl text-ivory">{item.content}</div>
                <p className="mt-4 text-sm text-horn">Font: {item.font || "Mặc định"} · Vị trí: {item.position || "Chưa chọn"} · {formatVnd(item.engravingPrice)}</p>
              </article>
            ))}
            {!items.length ? <p className="py-10 text-center text-sm font-semibold text-horn lg:col-span-2">Chưa có yêu cầu cá nhân hóa.</p> : null}
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
      setError("Chưa tải được danh sách mã truy xuất.");
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
      setError("Chưa cập nhật được trạng thái mã QR.");
    } finally {
      setSavingCode("");
    }
  };

  const activeItems = items.filter((item) => item.status === "ACTIVE");
  const incompleteItems = items.filter((item) => item.eventCount < 3);

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Truy xuất nguồn gốc</p>
        <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quản lý QR / Traceability</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Tổng mã", value: String(items.length), note: "Đã tạo" },
          { label: "Đang hoạt động", value: String(activeItems.length), note: "Khách có thể tra cứu" },
          { label: "Thiếu bước", value: String(incompleteItems.length), note: "Dưới 3 mốc hành trình" },
        ].map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div>
      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <h3 className="border-b border-clay/15 pb-4 font-serif text-3xl font-bold text-bark">Danh sách mã truy xuất</h3>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Đang tải mã QR...</div> : (
          <div className="divide-y divide-clay/15">
            {items.map((item) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_220px_150px_130px] xl:items-center" key={item.id}>
                <div>
                  <h4 className="text-base font-bold text-bark">{item.traceCode}</h4>
                  <p className="mt-1 text-sm text-horn">{item.productName} · {item.batchCode || "Chưa gắn lô"} · {item.eventCount} bước</p>
                </div>
                <div className="flex gap-2">
                  <Link className="inline-flex h-10 items-center justify-center rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand" href={`/trace/${item.traceCode}`}>Xem QR</Link>
                  <Link className="inline-flex h-10 items-center justify-center rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand" href={`/admin/traceability/create?code=${encodeURIComponent(item.traceCode)}`}>Sửa</Link>
                </div>
                <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none disabled:opacity-50" disabled={savingCode === item.traceCode} onChange={(event) => updateStatus(item, event.target.value)} value={item.status}>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                  <option value="ARCHIVED">Lưu trữ</option>
                </select>
                <span className="rounded-full bg-sand px-3 py-2 text-center text-xs font-bold text-wood">{item.status}</span>
              </article>
            ))}
            {!items.length ? <p className="py-10 text-center text-sm font-semibold text-horn">Chưa có mã truy xuất.</p> : null}
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
    { eventType: "MATERIAL", title: "Chọn chất liệu", description: "", eventDate: "", imageUrl: "", videoUrl: "" },
    { eventType: "CRAFT", title: "Chế tác thủ công", description: "", eventDate: "", imageUrl: "", videoUrl: "" },
    { eventType: "FINISHING", title: "Hoàn thiện", description: "", eventDate: "", imageUrl: "", videoUrl: "" },
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
        if (active) setMessage("Chưa tải được mã QR cần sửa.");
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
      setMessage("Vui lòng nhập mã QR và chọn sản phẩm.");
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
      setMessage("Chưa lưu được mã QR. Kiểm tra mã có bị trùng hoặc backend đang chạy chưa.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-ivory p-6 shadow-[0_18px_60px_rgba(86,53,31,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">QR / Product Passport</p>
        <h2 className="mt-3 font-serif text-5xl font-bold text-bark">{editingCode ? "Sửa mã truy xuất" : "Tạo mã truy xuất"}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-horn">Gắn mã định danh với sản phẩm và lưu hành trình chế tác để khách quét QR xem được thông tin thật.</p>
      </div>

      <section className="rounded-lg border border-clay/15 bg-pearl p-5 md:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold text-bark">
            Mã QR / Trace code
            <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setTraceCode(event.target.value)} value={traceCode} />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-bark">
            Sản phẩm
            <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setProductSlug(event.target.value)} value={productSlug}>
              {products.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-bark">
            Lô sản xuất
            <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setBatchCode(event.target.value)} value={batchCode} />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-bark">
            Trạng thái
            <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm ẩn</option>
              <option value="ARCHIVED">Lưu trữ</option>
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
          <h3 className="font-serif text-3xl font-bold text-bark">Hành trình chế tác</h3>
          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand" onClick={addEvent} type="button"><Plus className="size-4" />Thêm bước</button>
        </div>
        <div className="mt-5 grid gap-5">
          {events.map((event, index) => (
            <article className="grid gap-3 rounded-lg border border-clay/15 bg-ivory p-4 md:grid-cols-2" key={index}>
              <input className="h-10 rounded-full border border-clay/20 bg-pearl px-4 text-sm outline-none focus:border-wood" onChange={(input) => updateEvent(index, "title", input.target.value)} placeholder="Tên bước" value={event.title} />
              <input className="h-10 rounded-full border border-clay/20 bg-pearl px-4 text-sm outline-none focus:border-wood" onChange={(input) => updateEvent(index, "eventDate", input.target.value)} placeholder="YYYY-MM-DD" value={event.eventDate} />
              <input className="h-10 rounded-full border border-clay/20 bg-pearl px-4 text-sm outline-none focus:border-wood" onChange={(input) => updateEvent(index, "imageUrl", input.target.value)} placeholder="Ảnh công đoạn URL" value={event.imageUrl} />
              <input className="h-10 rounded-full border border-clay/20 bg-pearl px-4 text-sm outline-none focus:border-wood" onChange={(input) => updateEvent(index, "eventType", input.target.value)} placeholder="Loại bước" value={event.eventType} />
              <textarea className="min-h-24 rounded-2xl border border-clay/20 bg-pearl px-4 py-3 text-sm outline-none focus:border-wood md:col-span-2" onChange={(input) => updateEvent(index, "description", input.target.value)} placeholder="Mô tả công đoạn" value={event.description} />
            </article>
          ))}
        </div>
        {message ? <p className="mt-5 rounded-lg bg-sand px-4 py-3 text-sm font-semibold text-wood">{message}</p> : null}
        <button className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50" disabled={saving} onClick={saveTrace} type="button">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Lưu mã QR
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
      setError("Chưa tải được danh sách review.");
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
      setError("Chưa cập nhật được trạng thái review.");
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
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Khách hàng</p>
        <h2 className="mt-3 font-serif text-5xl font-bold text-bark">Quản lý review</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Tổng review", value: String(reviews.length), note: "Tất cả đánh giá" },
          { label: "Chờ duyệt", value: String(pendingReviews.length), note: "Cần kiểm tra" },
          { label: "Điểm TB", value: averageRating.toFixed(1), note: `${approvedReviews.length} review đã duyệt` },
        ].map((stat) => (
          <article className="rounded-lg border border-clay/15 bg-pearl p-5" key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{stat.label}</p>
            <p className="mt-3 font-serif text-4xl font-bold text-wood">{stat.value}</p>
            <p className="mt-1 text-sm text-horn">{stat.note}</p>
          </article>
        ))}
      </div>
      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <h3 className="border-b border-clay/15 pb-4 font-serif text-3xl font-bold text-bark">Danh sách review</h3>
        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Đang tải review...</div> : (
          <div className="divide-y divide-clay/15">
            {reviews.map((review) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_150px_180px] xl:items-center" key={review.id}>
                <div>
                  <div className="flex items-center gap-2 text-wood">
                    {Array.from({ length: review.rating }).map((_, index) => <Star className="size-4 fill-current" key={index} />)}
                  </div>
                  <h4 className="mt-2 text-base font-bold text-bark">{review.title || review.productName}</h4>
                  <p className="mt-1 text-sm text-horn">{review.customerName} · {review.productName} · {formatDateTime(review.createdAt)}</p>
                  <p className="mt-2 text-sm leading-6 text-bark">{review.content}</p>
                </div>
                <span className="w-fit rounded-full bg-sand px-3 py-2 text-xs font-bold text-wood">{review.status}</span>
                <div className="flex gap-2 xl:justify-end">
                  <button className="h-10 rounded-full border border-clay/25 px-4 text-sm font-semibold text-wood transition hover:bg-sand disabled:opacity-45" disabled={savingId === review.id || review.status === "APPROVED"} onClick={() => updateStatus(review, "APPROVED")} type="button">Duyệt</button>
                  <button className="h-10 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-45" disabled={savingId === review.id || review.status === "REJECTED"} onClick={() => updateStatus(review, "REJECTED")} type="button">Từ chối</button>
                </div>
              </article>
            ))}
            {!reviews.length ? <p className="py-10 text-center text-sm font-semibold text-horn">Chưa có review.</p> : null}
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
      setMessage("Chưa tải được dữ liệu quản trị.");
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
      setMessage("Vui lòng nhập tiêu đề/tên.");
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

      setMessage(editingId ? "Đã cập nhật." : "Đã tạo mới.");
      resetForm();
      await loadItems();
    } catch {
      setMessage("Chưa lưu được dữ liệu. Kiểm tra slug trùng hoặc backend.");
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
      setMessage("Chưa xóa/ẩn được mục này.");
    } finally {
      setSaving(false);
    }
  };

  const listTitle = page === "categories" ? "Danh sách danh mục" : page === "banners" ? "Danh sách banner" : "Danh sách nội dung";
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
          <h3 className="font-serif text-3xl font-bold text-bark">{editingId ? "Sửa mục" : content.primaryAction}</h3>
          {editingId ? <button className="rounded-full border border-clay/25 px-4 py-2 text-sm font-semibold text-wood" onClick={resetForm} type="button">Hủy sửa</button> : null}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => { setTitle(event.target.value); if (!editingId && page !== "banners") setSlug(slugify(event.target.value)); }} placeholder={page === "categories" ? "Tên danh mục" : "Tiêu đề"} value={title} />
          {page !== "banners" ? <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setSlug(event.target.value)} placeholder="slug-url" value={slug} /> : null}
          <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setImageUrl(event.target.value)} placeholder={page === "contents" ? "Ảnh bìa URL" : "Ảnh URL"} value={imageUrl} />
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
          <textarea className="min-h-24 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood md:col-span-2" onChange={(event) => setMeta(event.target.value)} placeholder="Mô tả ngắn / subtitle / summary" value={meta} />
          {page === "contents" ? <textarea className="min-h-44 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood md:col-span-2" onChange={(event) => setBody(event.target.value)} placeholder="Nội dung chi tiết" value={body} /> : null}
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50 md:w-fit" disabled={saving} onClick={saveItem} type="button">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Lưu
          </button>
        </div>
        {message ? <p className="mt-4 rounded-lg bg-sand px-4 py-3 text-sm font-semibold text-wood">{message}</p> : null}
      </section>

      <section className="rounded-lg border border-clay/15 bg-pearl p-5">
        <div className="flex items-center justify-between border-b border-clay/15 pb-4">
          <h3 className="font-serif text-3xl font-bold text-bark">{listTitle}</h3>
          <span className="rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">{items.length} mục</span>
        </div>
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-horn"><Loader2 className="size-4 animate-spin" />Đang tải...</div> : (
          <div className="divide-y divide-clay/15">
            {items.map((item) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_130px_auto] xl:items-center" key={item.id}>
                <div>
                  <h4 className="text-base font-bold text-bark">{itemTitle(item)}</h4>
                  <p className="mt-1 text-sm text-horn">{itemMeta(item)}</p>
                </div>
                <span className="w-fit rounded-full bg-sand px-3 py-2 text-xs font-bold text-wood">{item.status}</span>
                <div className="flex gap-2 xl:justify-end">
                  <button className="inline-flex size-10 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" onClick={() => editItem(item)} title="Sửa" type="button"><Edit3 className="size-4" /></button>
                  <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => deleteItem(item.id)} title="Xóa/ẩn" type="button"><Trash2 className="size-4" /></button>
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
  const [selectedStatus, setSelectedStatus] = useState(content.rows[0]?.status ?? "Hoạt động");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMeta, setDraftMeta] = useState("");
  const [draftImageUrl, setDraftImageUrl] = useState("");
  const [draftLinkUrl, setDraftLinkUrl] = useState("");
  const [draftPosition, setDraftPosition] = useState("HOME");
  const [showEntryForm, setShowEntryForm] = useState(false);

  const labels: Record<typeof page, { listTitle: string; formTitle: string; titlePlaceholder: string; metaPlaceholder: string; button: string }> = {
    staff: {
      listTitle: "Danh sách nhân sự",
      formTitle: "Thêm / cập nhật staff",
      titlePlaceholder: "Tên nhân sự",
      metaPlaceholder: "Vai trò, ca trực hoặc ghi chú",
      button: "Lưu staff",
    },
    customers: {
      listTitle: "Danh sách khách hàng",
      formTitle: "Ghi chú chăm sóc khách",
      titlePlaceholder: "Tên khách hàng",
      metaPlaceholder: "Ghi chú, hạng khách hoặc lịch sử mua",
      button: "Lưu ghi chú",
    },
    categories: {
      listTitle: "Danh sách danh mục",
      formTitle: "Thêm / cập nhật danh mục",
      titlePlaceholder: "Tên danh mục",
      metaPlaceholder: "Mô tả ngắn hoặc số sản phẩm",
      button: "Lưu danh mục",
    },
    banners: {
      listTitle: "Danh sách banner",
      formTitle: "Thêm / cập nhật banner",
      titlePlaceholder: "Tiêu đề banner",
      metaPlaceholder: "Vị trí, link điều hướng hoặc lịch chạy",
      button: "Lưu banner",
    },
    contents: {
      listTitle: "Danh sách nội dung",
      formTitle: "Soạn nội dung",
      titlePlaceholder: "Tiêu đề trang/bài viết",
      metaPlaceholder: "Vị trí hiển thị hoặc mô tả SEO",
      button: "Lưu nội dung",
    },
    seo: {
      listTitle: "Checklist SEO",
      formTitle: "Cập nhật SEO",
      titlePlaceholder: "Đường dẫn trang",
      metaPlaceholder: "Meta title, description hoặc trạng thái index",
      button: "Lưu SEO",
    },
    settings: {
      listTitle: "Nhóm cấu hình",
      formTitle: "Cập nhật cấu hình",
      titlePlaceholder: "Tên cấu hình",
      metaPlaceholder: "Giá trị hoặc mô tả cấu hình",
      button: "Lưu cấu hình",
    },
    roles: {
      listTitle: "Nhóm quyền",
      formTitle: "Cập nhật quyền",
      titlePlaceholder: "Tên nhóm quyền",
      metaPlaceholder: "Quyền truy cập hoặc phạm vi thao tác",
      button: "Lưu quyền",
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
      { title: draftTitle.trim(), meta: draftMeta.trim() || "Chưa có mô tả", status: selectedStatus },
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
              Thêm banner
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
              <h3 className="font-serif text-3xl font-bold text-bark">Thêm banner</h3>
              <button className="inline-flex size-9 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" onClick={() => setShowEntryForm(false)} type="button">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Tiêu đề banner
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftTitle(event.target.value)} placeholder="Ví dụ: Quà tặng cá nhân hóa" value={draftTitle} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Vị trí hiển thị
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setDraftPosition(event.target.value)} value={draftPosition}>
                  <option value="HOME">Trang chủ</option>
                  <option value="CATEGORY">Danh mục</option>
                  <option value="PRODUCT">Chi tiết sản phẩm</option>
                  <option value="CAMPAIGN">Chiến dịch</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Ảnh banner URL
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftImageUrl(event.target.value)} placeholder="https://.../banner.jpg" value={draftImageUrl} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Link điều hướng
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftLinkUrl(event.target.value)} placeholder="/products hoặc /categories/..." value={draftLinkUrl} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Trạng thái
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>
                  <option value="Đang chạy">Đang chạy</option>
                  <option value="Đặt lịch">Đặt lịch</option>
                  <option value="Tạm ẩn">Tạm ẩn</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
                Mô tả / ghi chú
                <textarea className="min-h-24 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood" onChange={(event) => setDraftMeta(event.target.value)} placeholder="Thông điệp phụ, lịch chạy hoặc ghi chú chiến dịch..." value={draftMeta} />
              </label>
              {draftImageUrl ? (
                <div className="overflow-hidden rounded-lg border border-clay/15 bg-sand md:col-span-2">
                  <img alt="Xem trước banner" className="aspect-[21/7] w-full object-cover" src={draftImageUrl} />
                </div>
              ) : null}
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50 md:w-fit" disabled={!draftTitle.trim()} onClick={saveEntryRow} type="button">
                <Save className="size-4" />
                Lưu banner
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-clay/15 bg-pearl p-5">
            <div className="flex flex-col gap-4 border-b border-clay/15 pb-4 md:flex-row md:items-center md:justify-between">
              <h3 className="font-serif text-3xl font-bold text-bark">Danh sách banner</h3>
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
                        <option value="Đang chạy">Đang chạy</option>
                        <option value="Đặt lịch">Đặt lịch</option>
                        <option value="Tạm ẩn">Tạm ẩn</option>
                      </select>
                      <button className="inline-flex size-10 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" title="Sửa" type="button">
                        <Edit3 className="size-4" />
                      </button>
                      <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => removeRow(index)} title="Xóa" type="button">
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
              Thêm nội dung
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
              <h3 className="font-serif text-3xl font-bold text-bark">Thêm nội dung</h3>
              <button className="inline-flex size-9 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" onClick={() => setShowEntryForm(false)} type="button">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Tiêu đề
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftTitle(event.target.value)} placeholder="Ví dụ: Câu chuyện chất liệu" value={draftTitle} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Loại nội dung
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setDraftPosition(event.target.value)} value={draftPosition}>
                  <option value="PAGE">Trang</option>
                  <option value="BLOG">Bài viết</option>
                  <option value="STORY">Câu chuyện</option>
                  <option value="POLICY">Chính sách</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Slug
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftLinkUrl(slugify(event.target.value))} placeholder="cau-chuyen-chat-lieu" value={draftLinkUrl} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Trạng thái
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>
                  <option value="Đã công bố">Đã công bố</option>
                  <option value="Nháp">Nháp</option>
                  <option value="Cần rà soát">Cần rà soát</option>
                  <option value="Lưu trữ">Lưu trữ</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
                Mô tả ngắn
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftMeta(event.target.value)} placeholder="Mô tả ngắn hiển thị trong danh sách..." value={draftMeta} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
                Nội dung
                <textarea className="min-h-56 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood" placeholder="Nhập nội dung chi tiết..." />
              </label>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50 md:w-fit" disabled={!draftTitle.trim()} onClick={saveEntryRow} type="button">
                <Save className="size-4" />
                Lưu nội dung
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-clay/15 bg-pearl p-5">
            <div className="flex flex-col gap-4 border-b border-clay/15 pb-4 md:flex-row md:items-center md:justify-between">
              <h3 className="font-serif text-3xl font-bold text-bark">Danh sách nội dung</h3>
              <span className="w-fit rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">{rows.length} mục</span>
            </div>
            <div className="divide-y divide-clay/15">
              {rows.map((row, index) => (
                <article className="grid gap-4 py-4 xl:grid-cols-[1fr_170px_auto] xl:items-center" key={`${row.title}-${index}`}>
                  <div>
                    <h4 className="text-base font-bold text-bark">{row.title}</h4>
                    <p className="mt-1 text-sm text-horn">{row.meta}</p>
                  </div>
                  <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => updateRowStatus(index, event.target.value)} value={row.status}>
                    <option value="Đã công bố">Đã công bố</option>
                    <option value="Nháp">Nháp</option>
                    <option value="Cần rà soát">Cần rà soát</option>
                    <option value="Lưu trữ">Lưu trữ</option>
                  </select>
                  <div className="flex gap-2 xl:justify-end">
                    <button className="inline-flex size-10 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" title="Sửa" type="button">
                      <Edit3 className="size-4" />
                    </button>
                    <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => removeRow(index)} title="Xóa" type="button">
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
                Họ tên
                <input className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm outline-none focus:border-wood" onChange={(event) => setDraftTitle(event.target.value)} placeholder={titlePlaceholder} value={draftTitle} />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark">
                Trạng thái
                <select className="h-11 rounded-full border border-clay/20 bg-ivory px-4 text-sm font-semibold text-wood outline-none focus:border-wood" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>
                  {Array.from(new Set(content.rows.map((item) => item.status).concat(["Hoạt động", "Tạm khóa", "Thân thiết", "VIP", "Mới"]))).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-bark md:col-span-2">
                Thông tin
                <textarea className="min-h-28 rounded-2xl border border-clay/20 bg-ivory px-4 py-3 text-sm outline-none focus:border-wood" onChange={(event) => setDraftMeta(event.target.value)} placeholder={metaPlaceholder} value={draftMeta} />
              </label>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-wood px-6 font-semibold text-ivory transition hover:bg-bark disabled:opacity-50 md:w-fit" disabled={!draftTitle.trim()} onClick={saveEntryRow} type="button">
                <Save className="size-4" />
                Lưu
              </button>
            </div>
          </section>
        ) : null}

        {!showEntryForm ? <section className="rounded-lg border border-clay/15 bg-pearl p-5">
          <div className="flex flex-col gap-4 border-b border-clay/15 pb-4 md:flex-row md:items-center md:justify-between">
            <h3 className="font-serif text-3xl font-bold text-bark">{listTitle}</h3>
            <span className="w-fit rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">
              {rows.length} mục
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
                  {Array.from(new Set(content.rows.map((item) => item.status).concat([row.status, "Hoạt động", "Tạm khóa", "Thân thiết", "VIP", "Mới"]))).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="flex gap-2 xl:justify-end">
                  <button className="inline-flex size-10 items-center justify-center rounded-full border border-clay/25 text-wood transition hover:bg-sand" title="Sửa" type="button">
                    <Edit3 className="size-4" />
                  </button>
                  <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => removeRow(index)} title="Xóa" type="button">
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
      { title: draftTitle.trim(), meta: draftMeta.trim() || "Chưa có mô tả", status: selectedStatus },
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
              {Array.from(new Set(content.rows.map((row) => row.status).concat(["Hoạt động", "Tạm khóa", "Nháp", "Đã lưu"]))).map((status) => (
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
            <span className="rounded-full bg-sand px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-wood">{rows.length} mục</span>
          </div>
          <div className="divide-y divide-clay/15">
            {rows.map((row, index) => (
              <article className="grid gap-4 py-4 xl:grid-cols-[1fr_160px_auto] xl:items-center" key={`${row.title}-${index}`}>
                <div>
                  <h4 className="text-base font-bold text-bark">{row.title}</h4>
                  <p className="mt-1 text-sm text-horn">{row.meta}</p>
                </div>
                <select className="h-10 rounded-full border border-clay/25 bg-ivory px-4 text-sm font-semibold text-wood outline-none" onChange={(event) => updateRowStatus(index, event.target.value)} value={row.status}>
                  {Array.from(new Set(content.rows.map((item) => item.status).concat([row.status, "Hoạt động", "Tạm khóa", "Nháp", "Đã lưu"]))).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button className="inline-flex size-10 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50" onClick={() => removeRow(index)} type="button" title="Xóa khỏi danh sách">
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
    .map((item) => (item.href.endsWith("/products") ? { ...item, label: "Quản lý sản phẩm" } : item));
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
          <p className="font-serif text-3xl font-bold">Đang kiểm tra quyền...</p>
        </div>
      </main>
    );
  }

  if (accessState === "denied") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7efe4] px-5 text-bark">
        <div className="max-w-lg rounded-lg border border-clay/20 bg-pearl p-8 text-center shadow-[0_18px_60px_rgba(86,53,31,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay">Không có quyền</p>
          <h1 className="mt-3 font-serif text-4xl font-bold">Tài khoản này không được vào khu vực {roleLabel}.</h1>
          <Link className="mt-6 inline-flex rounded-full bg-wood px-6 py-3 font-semibold text-ivory" href="/">
            Về trang bán hàng
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
              <h1 className="mt-1 font-serif text-2xl font-bold">Vân Mộc</h1>
            </div>
            <button
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              className="inline-flex size-10 items-center justify-center rounded-full border border-[#f4ead8]/20 text-[#f4ead8] transition hover:bg-[#f4ead8]/10"
              onClick={() => setMobileMenuOpen((current) => !current)}
              title={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              type="button"
            >
              {mobileMenuOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </button>
          </div>
          <button
            aria-label={sidebarCollapsed ? "Mở sidebar" : "Thu sidebar"}
            className={`mb-4 hidden size-10 shrink-0 items-center justify-center rounded-full border border-[#f4ead8]/20 text-[#f4ead8] transition hover:bg-[#f4ead8]/10 lg:inline-flex ${sidebarCollapsed ? "self-center" : "self-end"}`}
            onClick={() => setSidebarCollapsed((current) => !current)}
            title={sidebarCollapsed ? "Mở sidebar" : "Thu sidebar"}
            type="button"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
          <div className={`hidden border-b border-[#f4ead8]/20 pb-5 lg:block ${sidebarCollapsed ? "lg:hidden" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f4ead8]/70">{roleLabel}</p>
            <h1 className="mt-2 font-serif text-3xl font-bold">Vân Mộc</h1>
            <p className="mt-1 text-sm text-[#f4ead8]/75">Khu quản trị website</p>
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
                {currentUser?.fullName || (role === "admin" ? "Admin Vân Mộc" : "Staff Vân Mộc")}
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
                Đăng xuất
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
                      {currentUser?.fullName || (role === "admin" ? "Admin Vân Mộc" : "Staff Vân Mộc")}
                    </h2>
                    <p className="mt-1 text-sm text-horn">{currentUser?.email || "Chưa có email"}</p>
                  </div>
                </div>
                <button
                  className="inline-flex size-9 items-center justify-center rounded-full border border-clay/20 text-wood transition hover:bg-sand"
                  onClick={() => setProfilePanelOpen(false)}
                  type="button"
                  aria-label="Đóng profile"
                  title="Đóng profile"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <article className="rounded-md border border-clay/15 bg-ivory p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Vai trò</p>
                  <p className="mt-2 font-semibold text-bark">{roleLabel}</p>
                </article>
                <article className="rounded-md border border-clay/15 bg-ivory p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Trạng thái</p>
                  <p className="mt-2 font-semibold text-bark">Đang hoạt động</p>
                </article>
                <article className="rounded-md border border-clay/15 bg-ivory p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Khu vực</p>
                  <p className="mt-2 font-semibold text-bark">{role === "admin" ? "Quản trị hệ thống" : "Vận hành website"}</p>
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
                  <h3 className="font-serif text-3xl font-bold text-bark">Danh sách xử lý</h3>
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
                <p className="font-serif text-2xl font-bold">Vân Mộc</p>
                <p className="mt-1 text-sm text-[#f4ead8]/75">
                  Khu quản trị dành cho {role === "admin" ? "Admin toàn quyền" : "Staff vận hành"}.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#f4ead8]/80">
                <Link href="/" className="transition hover:text-[#f4ead8]">
                  Trang bán hàng
                </Link>
                <span className="text-[#f4ead8]/35">/</span>
                <Link href="/admin/settings" className="transition hover:text-[#f4ead8]">
                  Cấu hình
                </Link>
                <span className="text-[#f4ead8]/35">/</span>
                <Link href="/contact" className="transition hover:text-[#f4ead8]">
                  Liên hệ
                </Link>
              </div>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}

