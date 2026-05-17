import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token, refresh_token } = await request.json();

    if (!token) {
      return NextResponse.json({ status: "error", message: "Token required" }, { status: 400 });
    }

    const response = NextResponse.json({ status: "ok" });

    response.cookies.set("pharmago_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 30 * 60,
    });

    response.cookies.set("pharmago_token_client", token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 30 * 60,
    });

    if (refresh_token) {
      response.cookies.set("pharmago_refresh", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 86400 * 7,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid request" }, { status: 400 });
  }
}