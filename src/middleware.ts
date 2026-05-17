import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api", "/plans", "/cgu", "/confidentialite", "/payment"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Laisse passer les chemins publics
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  
  // Vérifie juste si un token existe
  const token = request.cookies.get("pharmago_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Laisse RoleGuard gérer toute la logique de rôle côté client
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
