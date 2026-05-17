"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  UserPlus,
  LogOut,
  Stethoscope,
  Truck,
  ShoppingBag,
  FileText,
} from "lucide-react";
import type { Role } from "@/lib/types";
import Logo from "@/components/Logo";

const navItems: Record<Role, { href: string; label: string; icon: React.ReactNode }[]> = {
  patient: [
    { href: "/patient/dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={18} /> },
    { href: "/patient/prescription/new", label: "Nouvelle ordonnance", icon: <FileText size={18} /> },
  ],
  pharmacist: [
    { href: "/pharmacist/dashboard", label: "File d'attente", icon: <LayoutDashboard size={18} /> },
    { href: "/pharmacist/inventory", label: "Inventaire", icon: <ShoppingBag size={18} /> },
    { href: "/pharmacist/revenue", label: "Revenus", icon: <CreditCard size={18} /> },
    { href: "/pharmacist/subscription", label: "Abonnement", icon: <Stethoscope size={18} /> },
  ],
  doctor: [
    { href: "/doctor/dashboard", label: "Confirmations", icon: <Stethoscope size={18} /> },
  ],
  driver: [
    { href: "/driver/dashboard", label: "Livraisons", icon: <Truck size={18} /> },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/onboarding", label: "Onboarding", icon: <UserPlus size={18} /> },
    { href: "/admin/pharmacies", label: "Pharmacies", icon: <Building2 size={18} /> },
    { href: "/admin/payouts", label: "Paiements", icon: <CreditCard size={18} /> },
  ],
  super_admin: [
    { href: "/super-admin/dashboard", label: "Vue globale", icon: <LayoutDashboard size={18} /> },
    { href: "/super-admin/users", label: "Tous les utilisateurs", icon: <Users size={18} /> },
    { href: "/super-admin/demo-requests", label: "Demandes demo", icon: <UserPlus size={18} /> },
    { href: "/super-admin/pharmacies", label: "Pharmacies", icon: <Building2 size={18} /> },
    { href: "/super-admin/driver-payments", label: "Paiements livreurs", icon: <CreditCard size={18} /> },
  ],
};

const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  pharmacist: "Pharmacien",
  patient: "Patient",
  doctor: "Médecin",
  driver: "Livreur",
};

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navItems[role] || [];

  const handleLogout = async () => {
    const { clearTokens } = await import("@/lib/auth");
    await clearTokens();
    router.push("/login");
  };

  return (
    <aside className="flex flex-col" style={{ width: "240px", background: "#050D1A", minHeight: "100vh", padding: "24px 16px" }}>
      <div className="px-4 pb-6 mb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Logo className="h-7 w-auto" />
      </div>

      <div className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #00C9A7, #00A896)" }}>
          {role.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white text-sm font-medium capitalize">{role.replace("_", " ")}</p>
          <p className="text-[#00C9A7] text-xs">{roleLabels[role]}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`nav-link ${active ? "active" : ""}`}>
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-center">
          <p className="text-xs text-white/30">PharmaGo v0.1</p>
        </div>
        <button onClick={handleLogout} className="w-full nav-link text-red-400/70 hover:text-red-400 hover:bg-red-500/5">
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}