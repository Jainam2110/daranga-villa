import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Extract hostname from x-forwarded-host or host header
  const rawHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    url.hostname;

  const hostname = rawHost.split(":")[0].toLowerCase();

  // Determine if hostname is the admin subdomain
  // Matches admin.darangavillas.com, admin.localhost, admin.lvh.me, admin.127.0.0.1.nip.io, etc.
  const isAdminSubdomain =
    hostname.startsWith("admin.") ||
    hostname === "admin.localhost" ||
    hostname.endsWith(".admin.localhost");

  // Skip static assets, Next.js internal requests, API endpoints, and media files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    /\.(png|jpg|jpeg|gif|webp|svg|css|js|ico|ttf|woff|woff2)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 1. REQUEST ON ADMIN SUBDOMAIN (e.g. admin.darangavillas.com / admin.localhost:3000)
  if (isAdminSubdomain) {
    // If request path already starts with /admin (e.g. admin.darangavillas.com/admin/dashboard)
    if (pathname.startsWith("/admin")) {
      const cleanPath = pathname.replace(/^\/admin/, "") || "/";
      const redirectUrl = new URL(cleanPath, request.url);
      redirectUrl.search = url.search;
      return NextResponse.redirect(redirectUrl);
    }

    // Rewrite clean route to internal /admin App Router route
    // e.g. / -> /admin
    // e.g. /login -> /admin/login
    // e.g. /dashboard -> /admin/dashboard
    // e.g. /villas -> /admin/villas
    const internalPath = `/admin${pathname === "/" ? "" : pathname}`;
    const internalUrl = new URL(internalPath, request.url);
    internalUrl.search = url.search;

    return NextResponse.rewrite(internalUrl);
  }

  // 2. REQUEST ON MAIN CUSTOMER DOMAIN (e.g. darangavillas.com / localhost:3000)
  // If user attempts to access /admin or /admin/... on main domain
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const protocol = request.headers.get("x-forwarded-proto") || "https";

    let adminHost = "admin.darangavillas.com";
    if (hostname.includes("localhost")) {
      const port = rawHost.includes(":") ? rawHost.split(":")[1] : "3000";
      adminHost = `admin.localhost:${port}`;
    }

    const cleanPath = pathname.replace(/^\/admin/, "") || "/";
    const scheme = hostname.includes("localhost") ? "http" : protocol;
    const targetUrl = `${scheme}://${adminHost}${cleanPath}${url.search}`;

    return NextResponse.redirect(targetUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files & _next assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
