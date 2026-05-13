"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Role } from "@/lib/types";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { t, type Locale } from "@/lib/i18n";

const navKeys: Record<Role, { href: string; key: string }[]> = {
  patient: [
    { href: "/patient/dashboard", key: "sidebar.dashboard" },
    { href: "/patient/prescription/new", key: "sidebar.new_prescription" },
  ],
  pharmacist: [
    { href: "/pharmacist/dashboard", key: "sidebar.queue" },
    { href: "/pharmacist/inventory", key: "sidebar.inventory" },
    { href: "/pharmacist/revenue", key: "sidebar.revenue" },
    { href: "/pharmacist/subscription", key: "sidebar.subscription" },
  ],
  doctor: [
    { href: "/doctor/dashboard", key: "sidebar.confirmations" },
  ],
  driver: [
    { href: "/driver/dashboard", key: "sidebar.deliveries" },
  ],
  admin: [
    { href: "/admin/dashboard", key: "sidebar.admin_panel" },
    { href: "/admin/onboarding", key: "sidebar.onboarding" },
    { href: "/admin/pharmacies", key: "sidebar.pharmacies" },
    { href: "/admin/payouts", key: "sidebar.payouts" },
  ],
};

const roleColors: Record<Role, { bg: string; text: string; dot: string }> = {
  patient: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  pharmacist: { bg: "bg-[#F0FDF9]", text: "text-[#00D4AA]", dot: "bg-[#00D4AA]" },
  doctor: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  driver: { bg: "bg-teal-50", text: "text-teal-600", dot: "bg-teal-500" },
  admin: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
};

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navKeys[role] || [];
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
    const handler = () => {
      const updated = localStorage.getItem("lang") as Locale | null;
      if (updated) setLocale(updated);
    };
    window.addEventListener("langchange", handler);
    return () => window.removeEventListener("langchange", handler);
  }, []);

  const colors = roleColors[role];

  const handleLogout = async () => {
    const { clearTokens } = await import("@/lib/auth");
    await clearTokens();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white min-h-screen p-4 hidden md:flex flex-col border-r border-[#A7F3D0]">
      <div className="flex items-center gap-3 mb-8 px-3">
        <Image src="/logo.svg" alt="PharmaGo" width={100} height={40} className="h-7 w-auto" priority />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center gap-2 px-3 py-2 mx-3 mb-6 rounded-lg ${colors.bg}`}
      >
        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <span className={`text-xs font-medium ${colors.text}`}>
          {t(locale, role === "patient" ? "sidebar.patient" : `sidebar.${role}`)}
        </span>
      </motion.div>

      <motion.nav
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-1 flex-1"
      >
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <motion.div key={item.href} variants={staggerItem}>
              <Link href={item.href}>
                <div
                  className={`relative px-3 py-2.5 rounded-btn text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-[#00D4AA] bg-[#F0FDF9] border-l-[3px] border-[#00D4AA]"
                      : "text-gray-500 hover:text-[#022C22] hover:bg-[#F0FDF9] border-l-[3px] border-transparent"
                  }`}
                >
                  {t(locale, item.key)}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      <div className="pt-4 border-t border-[#A7F3D0] space-y-3">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 rounded-btn text-sm font-medium text-gray-500 hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/10 transition-all duration-200 text-left"
        >
          {t(locale, "nav.logout")}
        </button>
        <p className="text-[10px] text-gray-400 text-center">{t(locale, "sidebar.version")}</p>
      </div>
    </aside>
  );
}
