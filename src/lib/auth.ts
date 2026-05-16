"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import type { AuthPayload } from "./types";

const COOKIE_NAME = "pharmago_token";
const COOKIE_REFRESH = "pharmago_refresh";

export async function setTokens(access: string, refresh: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 30 * 60,
  });
  cookieStore.set(COOKIE_REFRESH, refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_REFRESH)?.value;
}

export async function clearTokens() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(COOKIE_REFRESH);
}

export async function getUserFromToken(): Promise<AuthPayload | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    return jwtDecode<AuthPayload>(token);
  } catch {
    return null;
  }
}


