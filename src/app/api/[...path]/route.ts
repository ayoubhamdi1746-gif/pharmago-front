import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://web-production-7aa4.up.railway.app";

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname.replace(/^\/api/, "");
  const query = request.nextUrl.search;
  const token = request.cookies.get("pharmago_token")?.value;
  const refreshToken = request.cookies.get("pharmago_refresh")?.value;
  const url = `${API_BASE}${path}${query}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let body: string | undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.text();
  }

  try {
    const res = await fetch(url, {
      method: request.method,
      headers,
      body,
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    const response = NextResponse.json(data, { status: res.status });

    if (token) response.cookies.set("pharmago_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 30 * 60,
    });
    if (refreshToken) response.cookies.set("pharmago_refresh", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    return NextResponse.json({ status: "error", message: "Backend unreachable" }, { status: 502 });
  }
}

export async function GET(request: NextRequest) { return handleRequest(request); }
export async function POST(request: NextRequest) { return handleRequest(request); }
export async function PATCH(request: NextRequest) { return handleRequest(request); }
export async function DELETE(request: NextRequest) { return handleRequest(request); }
export async function PUT(request: NextRequest) { return handleRequest(request); }