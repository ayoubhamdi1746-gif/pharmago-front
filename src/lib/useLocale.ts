"use client";

import { useState, useEffect, useCallback } from "react";
import { type Locale } from "@/lib/i18n";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", locale);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === "ar" ? "fr" : "ar"));
  }, []);

  const isRtl = locale === "ar";

  return { locale, setLocale, toggleLocale, isRtl };
}
