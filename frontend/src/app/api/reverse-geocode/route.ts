import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

export async function GET(request: NextRequest) {
  const latitude = request.nextUrl.searchParams.get("lat");
  const longitude = request.nextUrl.searchParams.get("lon");

  if (!latitude || !longitude) {
    return NextResponse.json({ message: "Missing coordinates" }, { status: 400 });
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ message: "Invalid coordinates" }, { status: 400 });
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    lat: String(lat),
    lon: String(lon),
    "accept-language": "vi",
  });

  try {
    const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "vi",
        "User-Agent": "VanMoc/1.0 (local development checkout address lookup)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Cannot reverse geocode location" }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ message: "Cannot reverse geocode location" }, { status: 502 });
  }
}
