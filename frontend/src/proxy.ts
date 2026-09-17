import { NextRequest, NextResponse } from "next/server";

const locales = ["vi", "en"] as const;

function pathnameLocale(pathname: string) {
  return locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

export function proxy(request: NextRequest) {
  const locale = pathnameLocale(request.nextUrl.pathname);

  if (!locale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = request.nextUrl.pathname.replace(`/${locale}`, "") || "/";

  const response = NextResponse.rewrite(url);
  response.cookies.set("vanmoc-language", locale, { path: "/" });
  return response;
}

export const config = {
  matcher: "/((?!api|_next|.*\\..*).*)",
};
