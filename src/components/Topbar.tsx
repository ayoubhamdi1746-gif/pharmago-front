"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Role } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

export default function Topbar({ role }: { role: Role }) {
  const router = useRouter();
  const { locale, toggleLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    const { clearTokens } = await import("@/lib/auth");
    await clearTokens();
    router.push("/login");
  };

  return (
    <header
      className={`h-16 sticky top-0 z-40 flex items-center justify-between px-6 transition-all duration-300 bg-white border-b border-[#A7F3D0] ${
        scrolled ? "shadow-[0_4px_20px_rgba(0,212,170,0.1)]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F0FDF9] text-[#00D4AA]">
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLocale}
          className="relative w-14 h-7 rounded-full bg-[#F0FDF9] border border-[#A7F3D0] transition-all duration-200 hover:border-[#00D4AA]"
        >
          <motion.span
            className="absolute top-0.5 w-6 h-6 rounded-full bg-[#00D4AA] flex items-center justify-center text-[10px] font-semibold text-white"
            animate={{ left: locale === "ar" ? "calc(100% - 26px)" : "2px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {locale === "ar" ? "AR" : "FR"}
          </motion.span>
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-btn text-sm font-medium text-gray-500 hover:text-[#022C22] hover:bg-[#F0FDF9] transition-all duration-200"
        >
          {t(locale, "nav.logout")}
        </button>
      </div>
    </header>
  );
}
