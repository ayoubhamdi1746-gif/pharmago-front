import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register", "/api"];
const rolePrefixes: Record<string, string> = {
  patient: "/patient",
  pharmacist: "/pharmacist",
  doctor: "/doctor",
  driver: "/driver",
  admin: "/admin",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("pharmago_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { jwtDecode } = await import("jwt-decode");
    const payload = jwtDecode<{ role: string; exp: number }>(token);

    if (payload.exp * 1000 < Date.now()) {
      const refresh = request.cookies.get("pharmago_refresh")?.value;
      if (!refresh) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }

    const expectedPrefix = rolePrefixes[payload.role];
    if (expectedPrefix && !pathname.startsWith(expectedPrefix)) {
      const redirectMap: Record<string, string> = {
        patient: "/patient/dashboard",
        pharmacist: "/pharmacist/dashboard",
        doctor: "/doctor/dashboard",
        driver: "/driver/dashboard",
        admin: "/admin/dashboard",
      };
      return NextResponse.redirect(
        new URL(redirectMap[payload.role] || "/login", request.url)
      );
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
