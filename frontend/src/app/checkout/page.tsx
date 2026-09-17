"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, ChevronRight, CreditCard, Loader2, MapPin, ShoppingCart, WalletCards } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { createOrder, formatVnd } from "@/lib/api";

const suggestedProducts = [
  {
    name: "Lược sừng",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Trâm cài",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Quà tặng",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Khắc tên",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85",
  },
];

const checkoutItem = {
  productSlug: "luoc-sung-tu-nhien-vm01",
  name: "Lược sừng tự nhiên VM01",
  image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=400&q=85",
  price: 350000,
  engravingPrice: 50000,
  shippingFee: 30000,
};

const ORDER_CODES_KEY = "vanmoc-order-codes";

type PaymentMethod = "COD" | "BANK_TRANSFER" | "E_WALLET";

const paymentMethods: Array<{
  value: PaymentMethod;
  title: string;
  description: string;
  icon: typeof Banknote;
}> = [
  {
    value: "COD",
    title: "Thanh toán khi nhận hàng",
    description: "Trả tiền mặt cho nhân viên giao hàng.",
    icon: Banknote,
  },
  {
    value: "BANK_TRANSFER",
    title: "Chuyển khoản ngân hàng",
    description: "Nhận thông tin chuyển khoản sau khi đặt đơn.",
    icon: CreditCard,
  },
  {
    value: "E_WALLET",
    title: "Ví điện tử",
    description: "Thanh toán qua ví điện tử khi đơn được xác nhận.",
    icon: WalletCards,
  },
];

type FieldProps = {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

type Province = {
  code: number;
  name: string;
};

type District = {
  code: number;
  name: string;
};

type ProvinceDetail = Province & {
  districts: District[];
};

type NominatimReverseResponse = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: {
    house_number?: string;
    road?: string;
    quarter?: string;
    suburb?: string;
    city_district?: string;
    district?: string;
    county?: string;
    city?: string;
    town?: string;
    state?: string;
  };
};

type BigDataCloudReverseResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  localityInfo?: {
    administrative?: Array<{
      name?: string;
      description?: string;
      adminLevel?: number;
    }>;
    informative?: Array<{
      name?: string;
      description?: string;
    }>;
  };
};

type PhotonReverseResponse = {
  features?: Array<{
    properties?: {
      name?: string;
      street?: string;
      district?: string;
      city?: string;
      county?: string;
      state?: string;
    };
  }>;
};

function Field({ label, name, placeholder, type = "text", required, value, onChange }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-bark">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-full border border-transparent bg-sand/60 px-5 text-sm text-bark outline-none transition placeholder:text-horn focus:border-clay focus:bg-ivory"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function normalizeDivisionName(value: string) {
  return value
    .replace(/^(Thành phố|Tỉnh|Quận|Huyện|Thị xã|Thành phố thuộc tỉnh)\s+/i, "")
    .trim();
}

function getDivisionKey(value: string) {
  return normalizeDivisionName(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findDivisionByName<T extends { name: string }>(items: T[], name: string) {
  const key = getDivisionKey(name);

  if (!key) {
    return undefined;
  }

  return items.find((item) => {
    const itemKey = getDivisionKey(item.name);
    return itemKey === key || itemKey.includes(key) || key.includes(itemKey);
  });
}

function isDistrictLike(value?: string) {
  const key = getDivisionKey(value ?? "");
  return key.includes("huyen") || key.includes("quan") || key.includes("thixa") || key.includes("thanhpho");
}

function pickProvinceName(address?: NominatimReverseResponse["address"]) {
  return address?.state ?? address?.city ?? address?.town ?? "";
}

function pickDistrictName(address?: NominatimReverseResponse["address"]) {
  return address?.city_district ?? address?.district ?? address?.county ?? "";
}

function pickStreetAddress(response: NominatimReverseResponse) {
  const address = response.address;
  const parts = [address?.house_number, address?.road, address?.quarter ?? address?.suburb].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : response.display_name ?? "";
}

function uniqueAddressParts(parts: Array<string | undefined>) {
  const seen = new Set<string>();

  return parts.filter((part): part is string => {
    const key = getDivisionKey(part ?? "");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function reverseGeocodeWithBigDataCloud(latitude: number, longitude: number): Promise<NominatimReverseResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "vi",
  });

  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Cannot reverse geocode location");
  }

  const data = (await response.json()) as BigDataCloudReverseResponse;
  const administrative = data.localityInfo?.administrative ?? [];
  const informative = data.localityInfo?.informative ?? [];
  const districtAdmin =
    informative.find((item) => isDistrictLike(`${item.name ?? ""} ${item.description ?? ""}`)) ??
    administrative.find((item) => isDistrictLike(`${item.name ?? ""} ${item.description ?? ""}`)) ??
    administrative.find((item) => /^(Quận|Huyện|Thị xã|Thành phố)\s+/i.test(item.name ?? ""));
  const provinceName = data.principalSubdivision ?? administrative.find((item) => item.adminLevel === 4)?.name ?? "";
  const districtName = districtAdmin?.name ?? "";
  const displayName = uniqueAddressParts([data.locality, districtName, data.principalSubdivision]).join(", ");

  return {
    display_name: displayName,
    address: {
      city_district: districtName,
      state: provinceName,
    },
  };
}

async function reverseGeocodeWithPhoton(latitude: number, longitude: number): Promise<NominatimReverseResponse> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    lang: "vi",
  });

  const response = await fetch(`https://photon.komoot.io/reverse?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Cannot reverse geocode location");
  }

  const data = (await response.json()) as PhotonReverseResponse;
  const properties = data.features?.[0]?.properties;

  if (!properties) {
    throw new Error("Cannot reverse geocode location");
  }

  const streetAddress = [properties.name, properties.street].filter(Boolean).join(", ");

  return {
    display_name: streetAddress || [properties.district, properties.city, properties.county, properties.state].filter(Boolean).join(", "),
    address: {
      road: properties.street ?? properties.name,
      suburb: properties.district,
      city_district: properties.county,
      city: properties.city,
      state: properties.state,
    },
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [form, setForm] = useState({
    customerName: "Nguyễn An",
    email: "customer+mocvan2026@gmail.com",
    phone: "0900000003",
    province: "Hà Nội",
    district: "Thanh Xuân",
    address: "12 Nguyễn Trãi, Thanh Xuân",
    note: "",
    gps: "",
    paymentMethod: "COD" as PaymentMethod,
  });

  useEffect(() => {
    let isActive = true;

    async function loadProvinces() {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/v1/p/");
        if (!response.ok) {
          throw new Error("Cannot load provinces");
        }

        const data = (await response.json()) as Province[];
        if (!isActive) {
          return;
        }

        setProvinces(data);
      } catch {
        setLocationMessage("Chưa tải được danh sách tỉnh/thành. Bạn vẫn có thể nhập địa chỉ bằng tay.");
      }
    }

    loadProvinces();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (provinceCode || provinces.length === 0) {
      return;
    }

    const matchedProvince = findDivisionByName(provinces, form.province);
    if (matchedProvince) {
      setProvinceCode(String(matchedProvince.code));
    }
  }, [form.province, provinceCode, provinces]);

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      return;
    }

    let isActive = true;

    async function loadDistricts() {
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/v1/p/${provinceCode}?depth=2`);
        if (!response.ok) {
          throw new Error("Cannot load districts");
        }

        const data = (await response.json()) as ProvinceDetail;
        if (!isActive) {
          return;
        }

        setDistricts(data.districts ?? []);
      } catch {
        setLocationMessage("Chưa tải được danh sách quận/huyện. Bạn vẫn có thể nhập địa chỉ bằng tay.");
      }
    }

    loadDistricts();

    return () => {
      isActive = false;
    };
  }, [provinceCode]);

  useEffect(() => {
    if (districtCode || districts.length === 0) {
      return;
    }

    const matchedDistrict = findDivisionByName(districts, form.district);
    if (matchedDistrict) {
      setDistrictCode(String(matchedDistrict.code));
    }
  }, [districtCode, districts, form.district]);

  const setField = (field: keyof typeof form) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleProvinceChange = (value: string) => {
    setProvinceCode(value);
    setDistrictCode("");
    const province = provinces.find((item) => String(item.code) === value);
    setForm((current) => ({
      ...current,
      province: province ? normalizeDivisionName(province.name) : "",
      district: "",
    }));
  };

  const handleDistrictChange = (value: string) => {
    setDistrictCode(value);
    const district = districts.find((item) => String(item.code) === value);
    setForm((current) => ({
      ...current,
      district: district ? normalizeDivisionName(district.name) : "",
    }));
  };

  const applyAddressFromGps = async (latitude: number, longitude: number) => {
    const gps = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    setDistrictCode("");
    setForm((current) => ({
      ...current,
      district: "",
      gps,
    }));

    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
    });

    let data: NominatimReverseResponse;

    try {
      const response = await fetch(`/api/reverse-geocode?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Cannot reverse geocode location");
      }

      data = (await response.json()) as NominatimReverseResponse;
    } catch {
      try {
        data = await reverseGeocodeWithPhoton(latitude, longitude);
      } catch {
        data = await reverseGeocodeWithBigDataCloud(latitude, longitude);
      }
    }

    const provinceName = normalizeDivisionName(pickProvinceName(data.address));
    const districtName = normalizeDivisionName(pickDistrictName(data.address));
    const streetAddress = pickStreetAddress(data);
    const matchedDistrict = findDivisionByName(districts, districtName);

    setForm((current) => ({
      ...current,
      province: provinceName || current.province,
      district: matchedDistrict ? normalizeDivisionName(matchedDistrict.name) : "",
      address: streetAddress || current.address,
      gps,
    }));

    const matchedProvince = findDivisionByName(provinces, provinceName);
    if (matchedProvince) {
      setProvinceCode(String(matchedProvince.code));
    }

    setDistrictCode(matchedDistrict ? String(matchedDistrict.code) : "");

    setLocationMessage(`Đã lấy GPS: ${gps}`);
  };

  const handleUseCurrentLocation = () => {
    setLocationMessage("");
    setError("");

    if (!navigator.geolocation) {
      setLocationMessage("Trình duyệt này chưa hỗ trợ lấy vị trí GPS.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const gps = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;

        try {
          await applyAddressFromGps(position.coords.latitude, position.coords.longitude);
        } catch {
          setForm((current) => ({ ...current, gps }));
          setLocationMessage("Đã có tọa độ GPS nhưng chưa đổi được sang địa chỉ. Bạn nhập địa chỉ thủ công giúp nhé.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocationMessage("Bạn cần cho phép trình duyệt truy cập vị trí để dùng GPS.");
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 12000 },
    );
  };

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const noteWithGps = [form.note, form.gps ? `GPS: ${form.gps}` : ""].filter(Boolean).join("\n");

      const order = await createOrder({
        customerName: form.customerName,
        phone: form.phone,
        email: form.email,
        province: form.province,
        address: `${form.address}, ${form.district}`,
        note: noteWithGps,
        paymentMethod: form.paymentMethod,
        items: [
          {
            productSlug: checkoutItem.productSlug,
            quantity: 1,
            personalization: {
              content: "NGUYỄN AN",
              font: "Cormorant Garamond",
              position: "Cán lược",
              engravingPrice: checkoutItem.engravingPrice,
            },
          },
        ],
      });

      const savedOrderCodes = JSON.parse(window.localStorage.getItem(ORDER_CODES_KEY) ?? "[]") as string[];
      const nextOrderCodes = [order.orderCode, ...savedOrderCodes.filter((code) => code !== order.orderCode)];
      window.localStorage.setItem(ORDER_CODES_KEY, JSON.stringify(nextOrderCodes));
      window.localStorage.setItem("vanmoc-has-order", "true");
      window.localStorage.setItem("vanmoc-last-order-code", order.orderCode);
      window.dispatchEvent(new Event("vanmoc-order-changed"));
      router.push(`/order/${order.orderCode}`);
    } catch {
      setError("Chưa tạo được đơn hàng. Bạn kiểm tra backend đang chạy ở cổng 4000 nhé.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-ivory text-bark">
      <section className="px-5 py-10 text-center md:px-10">
        <h1 className="font-sans text-3xl font-extrabold uppercase tracking-wide text-bark md:text-4xl">
          Thanh toán
        </h1>
        <Link
          className="mt-2 inline-block border-b border-clay text-sm font-semibold uppercase text-horn transition hover:text-wood"
          href="/products"
        >
          Tiếp tục mua hàng
        </Link>
      </section>

      <section className="px-5 pb-16 md:px-10">
        <form className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_0.78fr]" onSubmit={handlePlaceOrder}>
          <div className="space-y-10">
            <div>
              <h2 className="font-sans text-2xl font-extrabold text-bark md:text-3xl">Thông tin liên hệ</h2>
              <div className="mt-6 grid max-w-2xl gap-5">
                <Field label="Họ và tên" name="customerName" onChange={setField("customerName")} placeholder="Nhập họ tên của bạn..." required value={form.customerName} />
                <Field label="Email" name="email" onChange={setField("email")} placeholder="Nhập email của bạn..." required type="email" value={form.email} />
                <Field label="Số điện thoại" name="phone" onChange={setField("phone")} placeholder="Nhập số điện thoại..." required type="tel" value={form.phone} />
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-sans text-2xl font-extrabold text-bark md:text-3xl">Thông tin giao hàng</h2>
                <button
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-wood px-5 text-sm font-semibold text-ivory transition hover:bg-bark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  disabled={isLocating}
                  onClick={handleUseCurrentLocation}
                  type="button"
                >
                  {isLocating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                  {isLocating ? "Đang lấy GPS..." : "Dùng GPS"}
                </button>
              </div>
              <div className="mt-6 grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  {provinces.length > 0 ? (
                    <label className="block">
                      <span className="text-sm font-semibold text-bark">Tỉnh / Thành phố</span>
                      <select
                        className="mt-2 h-11 w-full rounded-full border border-transparent bg-sand/60 px-5 text-sm text-bark outline-none transition focus:border-clay focus:bg-ivory"
                        onChange={(event) => handleProvinceChange(event.target.value)}
                        required
                        value={provinceCode}
                      >
                        <option value="">Chọn tỉnh / thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {normalizeDivisionName(province.name)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <Field label="Tỉnh / Thành phố" name="province" onChange={setField("province")} placeholder="Ví dụ: Hà Nội" required value={form.province} />
                  )}
                  {districts.length > 0 ? (
                    <label className="block">
                      <span className="text-sm font-semibold text-bark">Quận / Huyện</span>
                      <select
                        className="mt-2 h-11 w-full rounded-full border border-transparent bg-sand/60 px-5 text-sm text-bark outline-none transition focus:border-clay focus:bg-ivory disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={!provinceCode}
                        onChange={(event) => handleDistrictChange(event.target.value)}
                        required
                        value={districtCode}
                      >
                        <option value="">{provinceCode ? "Chọn quận / huyện" : "Chọn tỉnh trước"}</option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {normalizeDivisionName(district.name)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <Field label="Quận / Huyện" name="district" onChange={setField("district")} placeholder="Ví dụ: Thanh Xuân" required value={form.district} />
                  )}
                </div>
                <Field label="Địa chỉ" name="address" onChange={setField("address")} placeholder="Số nhà, tên đường, phường/xã..." required value={form.address} />
                {locationMessage ? <p className="text-sm font-semibold text-horn">{locationMessage}</p> : null}
                <label className="block">
                  <span className="text-sm font-semibold text-bark">Ghi chú đơn hàng</span>
                  <textarea
                    className="mt-2 min-h-28 w-full rounded-2xl border border-transparent bg-sand/60 px-5 py-4 text-sm text-bark outline-none transition placeholder:text-horn focus:border-clay focus:bg-ivory"
                    onChange={(event) => setField("note")(event.target.value)}
                    placeholder="Lời nhắn cho Vân Mộc..."
                    value={form.note}
                  />
                </label>
                <div>
                  <p className="text-sm font-semibold text-bark">Phương thức thanh toán</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const selected = form.paymentMethod === method.value;

                      return (
                        <label
                          className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                            selected ? "border-wood bg-sand/70 shadow-[0_10px_28px_rgba(45,33,24,0.08)]" : "border-sand bg-pearl hover:border-clay"
                          }`}
                          key={method.value}
                        >
                          <input
                            checked={selected}
                            className="sr-only"
                            name="paymentMethod"
                            onChange={() => setField("paymentMethod")(method.value)}
                            type="radio"
                            value={method.value}
                          />
                          <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${selected ? "bg-wood text-ivory" : "bg-sand text-wood"}`}>
                            <Icon className="size-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-bold text-bark">{method.title}</span>
                            <span className="mt-1 block text-xs leading-5 text-horn">{method.description}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-sand bg-pearl p-7 shadow-[0_18px_45px_rgba(45,33,24,0.08)]">
            <h2 className="font-sans text-xl font-extrabold text-bark">Tóm tắt đơn hàng</h2>
            <div className="mt-6 flex gap-4 border-b border-sand pb-5">
              <div className="size-20 overflow-hidden rounded-lg bg-sand">
                <img alt={checkoutItem.name} className="h-full w-full object-cover" src={checkoutItem.image} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-bark">{checkoutItem.name}</p>
                <p className="mt-1 text-sm text-horn">Khắc tên: NGUYỄN AN</p>
                <p className="mt-2 text-sm font-semibold text-wood">{formatVnd(checkoutItem.price)}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-sand pb-3">
                <span className="text-horn">Tạm tính</span>
                <span className="font-semibold text-bark">{formatVnd(checkoutItem.price)}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-3">
                <span className="text-horn">Phí khắc tên</span>
                <span className="font-semibold text-bark">{formatVnd(checkoutItem.engravingPrice)}</span>
              </div>
              <div className="flex justify-between border-b border-sand pb-3">
                <span className="text-horn">Vận chuyển</span>
                <span className="font-semibold text-bark">{formatVnd(checkoutItem.shippingFee)}</span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-extrabold">
                <span>Tổng cộng</span>
                <span>{formatVnd(checkoutItem.price + checkoutItem.engravingPrice + checkoutItem.shippingFee)}</span>
              </div>
            </div>

            {error ? <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

            <button
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-wood font-semibold text-ivory transition hover:bg-bark disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              <ShoppingCart className="size-5" />
              {isSubmitting ? "Đang tạo đơn..." : "Thanh toán ngay"}
            </button>
            <p className="mt-4 text-xs leading-6 text-horn">
              Khi bấm thanh toán, đơn hàng sẽ được lưu thật vào PostgreSQL qua backend Spring Boot.
            </p>
          </aside>
        </form>
      </section>

      <section className="overflow-hidden px-5 py-12 md:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-sans text-3xl font-extrabold uppercase text-bark">
            Có thể bạn sẽ thích
          </h2>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {suggestedProducts.map((product) => (
              <Link className="group overflow-hidden rounded-lg bg-sand" href="/products/luoc-sung-tu-nhien-vm01" key={product.name}>
                <img
                  alt={product.name}
                  className="aspect-[4/4.7] w-full object-cover transition duration-500 group-hover:scale-105"
                  src={product.image}
                />
                <div className="bg-wood px-5 py-5 text-center font-serif text-2xl font-semibold text-ivory">
                  {product.name}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button className="inline-flex size-12 items-center justify-center rounded-full bg-wood text-ivory" type="button">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
