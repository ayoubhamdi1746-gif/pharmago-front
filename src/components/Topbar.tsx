"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import type { Role } from "@/lib/types";
import NotificationsBadge from "./NotificationsBadge";

export default function Topbar({ role }: { role: Role }) {
  const router = useRouter();
  const [now, setNow] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    }
    document.documentElement.classList.toggle("dark", true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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
      className="h-14 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300"
      style={{ background: "#020814", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(0, 201, 167, 0.1)", color: "#00C9A7", border: "1px solid rgba(0, 201, 167, 0.2)" }}
        >
          {role.replace("_", " ").toUpperCase()}
        </div>
        <span className="text-white/30 text-xs">{now}</span>
      </div>

      <div className="flex items-center gap-3">
        <NotificationsBadge />

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#00C9A7" }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: darkMode ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {darkMode ? <Moon size={15} /> : <Sun size={15} />}
          </motion.div>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 transition-all"
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <LogOut size={14} />
          Déconnexion
        </button>
      </div>
    </header>
  );
}