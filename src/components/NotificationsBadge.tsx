"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

const notifIcons: Record<string, string> = {
  pharmacy: "🏥", user: "👤", payment: "💰", delivery: "📦", prescription: "📋",
};

export default function NotificationsBadge() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const res = await api.get("/notifications/unread");
      const d = res?.data?.data;
      if (d) {
        setNotifs(d.notifications || []);
        setUnread(d.unread_count || 0);
      }
    } catch { /* silent */ }
  };

  useEffect(() => { fetchNotifs(); }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    try { await api.post("/notifications/mark-all-read"); setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true }))); setUnread(0); } catch { /* silent */ }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
        style={{ background: open ? "rgba(0,201,167,0.15)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#00C9A7" }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: "#FF4D6D", border: "2px solid #020814" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
            style={{ background: "#050D1A", border: "1px solid rgba(0,201,167,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-[#00C9A7] hover:text-white transition-colors">
                  <Check size={12} />Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Bell size={24} className="text-white/20 mb-2" />
                  <p className="text-white/30 text-xs">Aucune notification</p>
                </div>
              ) : notifs.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="text-base mt-0.5">{notifIcons[n.type] || "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.is_read ? "text-white/50" : "text-white"} font-medium`}>{n.title}</p>
                    <p className="text-xs text-white/30 mt-0.5 truncate">{n.message}</p>
                    <p className="text-[10px] text-white/20 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "#00C9A7" }} />}
                </div>
              ))}
            </div>

            <div className="px-4 py-3 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button className="flex items-center justify-center gap-1 text-xs text-white/30 hover:text-[#00C9A7] transition-colors w-full">
                Voir toutes les notifications <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}