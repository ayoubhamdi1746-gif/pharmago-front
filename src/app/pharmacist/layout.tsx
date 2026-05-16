"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PharmacistLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { href: "/pharmacist/dashboard", label: "File d'attente", icon: "queue" },
    { href: "/pharmacist/inventory", label: "Inventaire", icon: "inventory" },
    { href: "/pharmacist/revenue", label: "Revenus", icon: "revenue" },
    { href: "/pharmacist/subscription", label: "Mon abonnement", icon: "subscription" },
  ];

  const icons: Record<string, React.ReactNode> = {
    queue: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    inventory: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    ),
    revenue: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    subscription: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  };

  return (
    <div className="min-h-screen bg-[#020814] text-white flex">
      <aside className={`w-56 min-h-screen fixed top-0 left-0 border-r border-[#00D4AA]/10 bg-[#0A1628]/80 backdrop-blur-xl transition-all duration-300 ${scrolled ? "pt-16" : ""}`}>
        <div className="p-5 border-b border-[#00D4AA]/10">
          <Link href="/pharmacist/dashboard" className="flex items-center gap-2">
            <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", fontWeight: 700, letterSpacing: "0.5px" }}>
              PHARMA<span style={{ color: "#00D4AA" }}>.</span>GO
            </span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30"
                    : "text-gray-400 hover:text-white hover:bg-[#00D4AA]/5"
                }`}>
                <span className={active ? "text-[#00D4AA]" : "text-gray-500"}>{icons[item.icon]}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#00D4AA]/10">
          <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Deconnexion
          </Link>
          <p className="mt-2 text-[10px] text-gray-600 px-4">PharmaGo v0.1</p>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}