import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export type ApiProduct = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  stockQuantity: number;
  status: string;
  personalizable: boolean;
  imageUrl: string;
  images?: string[];
};

export type AdminProduct = ApiProduct & {
  description?: string;
  shortDescription?: string;
  material?: string;
  origin?: string;
};

export type ProductMutationPayload = {
  categorySlug: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  material: string;
  origin: string;
  price: number;
  stockQuantity: number;
  status: string;
  personalizable: boolean;
  imageUrl: string;
  imageUrls: string[];
};

export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: string;
};

export type ApiReview = {
  id: number;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  productName: string;
};

export type AdminOrder = {
  orderCode: string;
  customerName: string;
  phone: string;
  email?: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

export type AdminPersonalization = {
  id: number;
  orderCode: string;
  productName: string;
  customerName: string;
  content: string;
  font?: string;
  position?: string;
  engravingPrice: number;
  orderStatus: string;
  createdAt: string;
};

export type AdminTraceProduct = {
  id: number;
  traceCode: string;
  productName: string;
  productSlug: string;
  batchCode?: string;
  status: string;
  qrUrl: string;
  eventCount: number;
  createdAt: string;
};

export type AdminReview = ApiReview & {
  status: string;
  createdAt: string;
};

export type ApiCartItem = {
  id: number;
  productName: string;
  productSlug: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  engravingContent?: string;
  engravingFont?: string;
  engravingPosition?: string;
  engravingPrice?: number;
};

export type ApiCart = {
  id: number;
  items: ApiCartItem[];
  subtotal: number;
  personalizationFee: number;
  total: number;
};

export type ApiOrderItem = {
  id: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  engravingContent?: string;
  engravingFont?: string;
  engravingPosition?: string;
  engravingPrice?: number;
};

export type ApiOrder = {
  id: number;
  orderCode: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  note?: string;
  subtotal: number;
  shippingFee: number;
  personalizationFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: ApiOrderItem[];
};

export type CreateOrderPayload = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  note?: string;
  paymentMethod: string;
  items: Array<{
    productSlug: string;
    quantity: number;
    personalization?: {
      content?: string;
      font?: string;
      position?: string;
      engravingPrice?: number;
    };
  }>;
};

export type ApiUser = {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  status: string;
};

export type AuthResponse = {
  user: ApiUser;
  token: string;
};

export function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export async function getProducts(categorySlug?: string) {
  const params = categorySlug && categorySlug !== "all" ? `?category=${categorySlug}` : "";
  const response = await fetch(`${API_BASE_URL}/api/products${params}`);

  if (!response.ok) {
    throw new Error("Cannot load products");
  }

  return (await response.json()) as ApiProduct[];
}

function authHeaders() {
  const token = typeof window === "undefined" ? "" : window.localStorage.getItem("vanmoc-auth-token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAdminProducts() {
  const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (response.status === 403 || response.status === 404) {
    return getProducts();
  }

  if (!response.ok) {
    throw new Error("Cannot load admin products");
  }

  return (await response.json()) as AdminProduct[];
}

export async function createAdminProduct(payload: ProductMutationPayload) {
  const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Cannot create product");
  }

  return (await response.json()) as { id: number; slug: string; status: string };
}

export async function updateAdminProduct(slug: string, payload: ProductMutationPayload) {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Cannot update product");
  }

  return (await response.json()) as { slug: string; status: string };
}

export async function archiveAdminProduct(slug: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Cannot archive product");
  }

  return (await response.json()) as { slug: string; status: string };
}

export async function getAdminOrders() {
  const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Cannot load admin orders");
  }

  return (await response.json()) as AdminOrder[];
}

export async function updateAdminOrderStatus(code: string, payload: { orderStatus?: string; paymentStatus?: string }) {
  const response = await fetch(`${API_BASE_URL}/api/admin/orders/${encodeURIComponent(code)}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Cannot update order status");
  }

  return (await response.json()) as { orderCode: string; status: string };
}

export async function getAdminPersonalizations() {
  const response = await fetch(`${API_BASE_URL}/api/admin/personalizations`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Cannot load personalizations");
  }

  return (await response.json()) as AdminPersonalization[];
}

export async function getAdminTraceProducts() {
  const response = await fetch(`${API_BASE_URL}/api/admin/trace-products`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Cannot load trace products");
  }

  return (await response.json()) as AdminTraceProduct[];
}

export async function updateAdminTraceStatus(code: string, status: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/trace-products/${encodeURIComponent(code)}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Cannot update trace status");
  }

  return (await response.json()) as { traceCode: string; status: string };
}

export async function getAdminReviews() {
  const response = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Cannot load admin reviews");
  }

  return (await response.json()) as AdminReview[];
}

export async function updateAdminReviewStatus(id: number, status: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/reviews/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Cannot update review status");
  }

  return (await response.json()) as { id: number; status: string };
}

export async function getProduct(slug: string) {
  const response = await fetch(`${API_BASE_URL}/api/products/${slug}`);

  if (!response.ok) {
    throw new Error("Cannot load product");
  }

  return (await response.json()) as ApiProduct;
}

export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/api/categories`);

  if (!response.ok) {
    throw new Error("Cannot load categories");
  }

  return (await response.json()) as ApiCategory[];
}

export async function getReviews() {
  const response = await fetch(`${API_BASE_URL}/api/reviews`);

  if (!response.ok) {
    throw new Error("Cannot load reviews");
  }

  return (await response.json()) as ApiReview[];
}

export async function getCart(sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/cart?sessionId=${encodeURIComponent(sessionId)}`);

  if (!response.ok) {
    throw new Error("Cannot load cart");
  }

  return (await response.json()) as ApiCart;
}

export async function addCartItem(payload: {
  sessionId: string;
  productSlug: string;
  quantity: number;
  personalization?: CreateOrderPayload["items"][number]["personalization"];
}) {
  const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Cannot add cart item");
  }

  return (await response.json()) as ApiCart;
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Cannot create order");
  }

  return (await response.json()) as ApiOrder;
}

export async function getOrder(code: string) {
  const response = await fetch(`${API_BASE_URL}/api/orders/${code}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Cannot load order");
  }

  return (await response.json()) as ApiOrder;
}

export async function login(payload: { email: string; password: string; rememberMe: boolean }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(error?.message ?? "Cannot login");
  }

  return (await response.json()) as AuthResponse;
}

export async function register(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(error?.message ?? "Cannot register");
  }

  return (await response.json()) as AuthResponse;
}

export async function googleLogin(credential: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(error?.message ?? "Cannot login with Google");
  }

  return (await response.json()) as AuthResponse;
}

export async function forgotPassword(email: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(error?.message ?? "Cannot reset password");
  }

  return (await response.json()) as { found: boolean; message: string };
}

export async function resetPassword(payload: { email: string; resetCode: string; password: string; confirmPassword: string }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(error?.message ?? "Cannot reset password");
  }

  return (await response.json()) as { message: string };
}
