"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";

export default function Topbar({ role }: { role: Role }) {
  const router = useRouter();
  const [now, setNow] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) + " · " + d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const { clearTokens } = await import("@/lib/auth");
    await clearTokens();
    router.push("/login");
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-6 sticky top-0 z-40"
      style={{ background: "#020814", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(0, 201, 167, 0.1)", color: "#00C9A7", border: "1px solid rgba(0, 201, 167, 0.2)" }}>
          {role.replace("_", " ").toUpperCase()}
        </div>
        <span className="text-white/30 text-xs">{now}</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 transition-all"
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </header>
  );
}