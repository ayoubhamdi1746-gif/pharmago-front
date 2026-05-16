"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Building2, Users, Truck, DollarSign, UserPlus, PlusCircle, Download, Activity, Clock } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

interface SuperStats {
  total_pharmacies: number;
  total_patients: number;
  total_deliveries: number;
  total_revenue: number;
  new_users_last_7_days: number;
}

interface MonthlyData { months: { month: string; revenue: number; count: number }[]; }
interface ActivityData { events: { type: string; description: string; created_at: string }[]; }

function MetricCard({ icon, value, label, iconBg, iconColor }: { icon: React.ReactNode; value: number; label: string; iconBg: string; iconColor: string }) {
  return (
    <motion.div variants={item} whileHover={{ y: -2 }} className="metric-card group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      </div>
      <p className="text-white font-bold" style={{ fontSize: "2.25rem", lineHeight: "1", marginBottom: "6px" }}>{value.toLocaleString()}</p>
      <p className="text-white/40 text-sm">{label}</p>
    </motion.div>
  );
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "il y a quelques secondes";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

const eventIcons: Record<string, React.ReactNode> = { user: <Users size={14} />, pharmacy: <Building2 size={14} />, payment: <DollarSign size={14} /> };

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ["super-stats"], queryFn: async () => { const res = await api.get<ApiResponse<SuperStats>>("/admin/super/stats"); return res.data.data; } });
  const { data: monthly } = useQuery({ queryKey: ["super-monthly"], queryFn: async () => { const res = await api.get<ApiResponse<MonthlyData>>("/admin/super/stats/monthly"); return res.data.data; } });
  const { data: activity } = useQuery({ queryKey: ["super-activity"], queryFn: async () => { const res = await api.get<ApiResponse<ActivityData>>("/admin/super/activity"); return res.data.data; } });

  const statsCards = [
    { icon: <Building2 size={20} />, value: stats?.total_pharmacies ?? 0, label: "Pharmacies inscrites", iconBg: "rgba(59,130,246,0.15)", iconColor: "#60A5FA" },
    { icon: <Users size={20} />, value: stats?.total_patients ?? 0, label: "Patients", iconBg: "rgba(16,185,129,0.15)", iconColor: "#34D399" },
    { icon: <Truck size={20} />, value: stats?.total_deliveries ?? 0, label: "Livraisons totales", iconBg: "rgba(249,115,22,0.15)", iconColor: "#FB923C" },
    { icon: <DollarSign size={20} />, value: stats?.total_revenue ?? 0, label: "Revenus totaux (TND)", iconBg: "rgba(168,85,247,0.15)", iconColor: "#C084FC" },
    { icon: <UserPlus size={20} />, value: stats?.new_users_last_7_days ?? 0, label: "Nouveaux inscrits (7j)", iconBg: "rgba(6,182,212,0.15)", iconColor: "#22D3EE" },
  ];

  const quickActions = [
    { label: "Nouvelle pharmacie", icon: <PlusCircle size={16} />, href: "/super-admin/new-pharmacy", color: "#00C9A7" },
    { label: "Voir utilisateurs", icon: <Users size={16} />, href: "/super-admin/users", color: "#60A5FA" },
    { label: "Export CSV", icon: <Download size={16} />, href: "/super-admin/users", color: "#C084FC" },
  ];

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div variants={container} initial="hidden" animate="show" className="min-h-screen" style={{ background: "#020814" }}>
        <div className="px-8 pt-8 pb-6">
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Super Admin — Vue globale</h1>
              <p className="text-sm text-white/40 mt-1">Statistiques complètes de la plateforme</p>
            </div>
            <div className="flex items-center gap-3">
              {quickActions.map((a) => (
                <a key={a.label} href={a.href} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color }}>
                  {a.icon}{a.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {statsLoading ? [...Array(5)].map((_, i) => (
              <div key={i} className="metric-card"><div className="skeleton w-10 h-10 rounded-xl mb-4" /><div className="skeleton w-20 h-8 rounded mb-2" /><div className="skeleton w-32 h-4 rounded" /></div>
            )) : statsCards.map((s, i) => <MetricCard key={i} {...s} />)}
          </div>
        </div>

        <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
            <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <Users size={16} style={{ color: "#00C9A7" }} />
              <h2 className="text-white font-semibold text-base">Revenus des 6 derniers mois</h2>
            </div>
            <div className="p-6">
              {monthly?.months && monthly.months.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthly.months} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#050D1A", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 8, color: "#fff", fontSize: 12 }} cursor={{ fill: "rgba(0,201,167,0.05)" }} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {monthly.months.map((_, index) => <Cell key={index} fill="#00C9A7" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[180px] text-white/30 text-sm">Pas de données disponibles</div>
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
            <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <Activity size={16} style={{ color: "#00C9A7" }} />
              <h2 className="text-white font-semibold text-base">Activité récente</h2>
            </div>
            <div className="px-6 py-3 max-h-[260px] overflow-y-auto">
              {activity?.events && activity.events.length > 0 ? activity.events.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: i < activity.events.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,201,167,0.1)" }}>
                    <span style={{ color: "#00C9A7" }}>{eventIcons[ev.type] || <Clock size={14} />}</span>
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-white/70 text-sm truncate">{ev.description}</p></div>
                  <span className="text-white/30 text-xs shrink-0">{timeAgo(ev.created_at)}</span>
                </div>
              )) : <div className="flex items-center justify-center py-12 text-white/30 text-sm">Aucune activité récente</div>}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </RoleGuard>
  );
}