"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Role } from "@/lib/types";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  Shield,
  Users,
  Building2,
  CreditCard,
  Pill,
  Truck,
  Stethoscope,
  PackagePlus,
  DollarSign,
  ClipboardList,
} from "lucide-react";

const navKeys: Record<Role, { href: string; key: string; icon?: React.ComponentType<{ className?: string }> }[]> = {
  patient: [
    { href: "/patient/dashboard", key: "sidebar.dashboard", icon: LayoutDashboard },
    { href: "/patient/prescription/new", key: "sidebar.new_prescription", icon: PackagePlus },
  ],
  pharmacist: [
    { href: "/pharmacist/dashboard", key: "sidebar.queue", icon: ClipboardList },
    { href: "/pharmacist/inventory", key: "sidebar.inventory", icon: Pill },
    { href: "/pharmacist/revenue", key: "sidebar.revenue", icon: DollarSign },
    { href: "/pharmacist/subscription", key: "sidebar.subscription", icon: CreditCard },
  ],
  doctor: [
    { href: "/doctor/dashboard", key: "sidebar.confirmations", icon: Stethoscope },
  ],
  driver: [
    { href: "/driver/dashboard", key: "sidebar.deliveries", icon: Truck },
  ],
  admin: [
    { href: "/admin/dashboard", key: "sidebar.admin_panel", icon: LayoutDashboard },
    { href: "/admin/onboarding", key: "sidebar.onboarding", icon: Users },
    { href: "/admin/pharmacies", key: "sidebar.pharmacies", icon: Building2 },
    { href: "/admin/payouts", key: "sidebar.payouts", icon: DollarSign },
  ],
  super_admin: [
    { href: "/super-admin/dashboard", key: "sidebar.super_admin.overview" },
    { href: "/super-admin/users", key: "sidebar.super_admin.users" },
    { href: "/super-admin/demo-requests", key: "sidebar.super_admin.demo_requests" },
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
  super_admin: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navKeys[role] || [];
  const { locale } = useLocale();

  const colors = roleColors[role];

  const handleLogout = async () => {
    const { clearTokens } = await import("@/lib/auth");
    await clearTokens();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#0A1628] min-h-screen p-4 hidden md:flex flex-col border-r border-[#00D4AA]/10">
      <div className="flex items-center gap-3 mb-8 px-3">
        <Logo className="h-7 w-auto" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-3 py-2 mx-3 mb-6 rounded-lg bg-[#00D4AA]/10"
      >
        <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
        <span className="text-xs font-medium text-[#00D4AA]">
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
          const Icon = item.icon;
          return (
            <motion.div key={item.href} variants={staggerItem}>
              <Link href={item.href}>
                <div
                  className={`relative px-3 py-2.5 rounded-btn text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                    active
                      ? "text-[#00D4AA] bg-[#00D4AA]/10 border-l-[3px] border-[#00D4AA] shadow-[0_0_20px_rgba(0,212,170,0.15)]"
                      : "text-gray-400 hover:text-[#00D4AA] hover:bg-[rgba(0,201,167,0.08)] border-l-[3px] border-transparent"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-[#00D4AA] via-[#00E676] to-[#00D4AA] rounded-r-full shadow-[0_0_10px_rgba(0,212,170,0.5)]" />
                  )}
                  {Icon && <Icon className={`w-4 h-4 ${active ? "text-[#00D4AA]" : "text-gray-500"}`} />}
                  {t(locale, item.key)}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      <div className="pt-4 border-t border-[#00D4AA]/10 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 rounded-btn text-sm font-medium text-gray-500 hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/10 transition-all duration-200 text-left"
        >
          {t(locale, "nav.logout")}
        </button>
        <p className="text-[10px] text-gray-600 text-center">{t(locale, "sidebar.version")}</p>
      </div>
    </aside>
  );
}
