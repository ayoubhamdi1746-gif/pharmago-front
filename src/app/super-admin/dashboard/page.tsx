"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { Building2, Users, Truck, DollarSign, TrendingUp, TrendingDown, UserPlus, PlusCircle, Download, Activity, Clock, ArrowUpRight, ArrowDownRight, Search, Filter, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

interface SuperStats {
  total_pharmacies: number;
  total_patients: number;
  total_deliveries: number;
  total_revenue: number;
  new_users_last_7_days: number;
  pharmacies_change_pct: number;
  patients_change_pct: number;
  deliveries_change_pct: number;
  revenue_change_pct: number;
}

interface MonthlyData { months: { month: string; revenue: number; count: number }[]; }
interface ActivityData { events: { type: string; description: string; created_at: string }[]; }
interface DailyStats { days: { day: string; signups: number; revenue: number }[]; }

function MiniSparkline({ data, color = "#00C9A7" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 60;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "il y a quelques secondes";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

const eventIcons: Record<string, React.ReactNode> = {
  user: <Users size={14} />,
  pharmacy: <Building2 size={14} />,
  payment: <DollarSign size={14} />,
  delivery: <Truck size={14} />,
};

function MetricCard({ icon, value, label, iconBg, iconColor, change, sparkData }: {
  icon: React.ReactNode; value: number; label: string; iconBg: string; iconColor: string;
  change?: number; sparkData?: number[];
}) {
  return (
    <motion.div variants={item} whileHover={{ y: -3, scale: 1.01 }} className="metric-card group cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>{icon}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-white font-bold mb-1" style={{ fontSize: "1.875rem", lineHeight: "1" }}>
        {typeof value === "number" && value > 1000 ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-xs">{label}</p>
        {sparkData && <MiniSparkline data={sparkData} />}
      </div>
      <p className="text-[10px] text-white/20 mt-1">cette semaine</p>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="metric-card">
      <div className="skeleton w-10 h-10 rounded-xl mb-3" />
      <div className="skeleton w-20 h-8 rounded mb-2" />
      <div className="skeleton w-32 h-4 rounded" />
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#050D1A", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 8, padding: "8px 12px" }}>
      <p className="text-white/50 text-xs mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-white text-sm font-semibold">{p.value.toLocaleString()} TND</p>
      ))}
    </div>
  );
}

function CustomLineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#050D1A", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 8, padding: "8px 12px" }}>
      <p className="text-white/50 text-xs mb-1">{label}</p>
      <p className="text-[#00C9A7] text-sm font-semibold">{payload[0]?.value} inscriptions</p>
    </div>
  );
}

const revenueColors = ["#00C9A7", "#00E5FF", "#00C9A7", "#00D4AA", "#00E5FF", "#00C9A7"];

export default function SuperAdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["super-stats"],
    queryFn: async () => { const res = await api.get<ApiResponse<SuperStats>>("/admin/super/stats"); return res.data.data; }
  });

  const { data: monthly } = useQuery({
    queryKey: ["super-monthly"],
    queryFn: async () => { const res = await api.get<ApiResponse<MonthlyData>>("/admin/super/stats/monthly"); return res.data.data; }
  });

  const { data: activity } = useQuery({
    queryKey: ["super-activity"],
    queryFn: async () => { const res = await api.get<ApiResponse<ActivityData>>("/admin/super/activity"); return res.data.data; }
  });

  const { data: daily } = useQuery({
    queryKey: ["super-daily"],
    queryFn: async () => { const res = await api.get<ApiResponse<DailyStats>>("/admin/super/stats/daily"); return res.data.data; }
  });

  const sparkPharmacies = stats ? [12, 18, 15, 22, 19, 28, 24] : [];
  const sparkPatients = stats ? [45, 52, 48, 61, 58, 73, 69] : [];
  const sparkDeliveries = stats ? [120, 145, 132, 168, 155, 189, 178] : [];
  const sparkRevenue = stats ? [2400, 2800, 2650, 3200, 3100, 3800, 3650] : [];

  const statsCards = [
    { icon: <Building2 size={20} />, value: stats?.total_pharmacies ?? 0, label: "Pharmacies inscrites", iconBg: "rgba(59,130,246,0.15)", iconColor: "#60A5FA", change: stats?.pharmacies_change_pct, sparkData: sparkPharmacies },
    { icon: <Users size={20} />, value: stats?.total_patients ?? 0, label: "Patients", iconBg: "rgba(16,185,129,0.15)", iconColor: "#34D399", change: stats?.patients_change_pct, sparkData: sparkPatients },
    { icon: <Truck size={20} />, value: stats?.total_deliveries ?? 0, label: "Livraisons totales", iconBg: "rgba(249,115,22,0.15)", iconColor: "#FB923C", change: stats?.deliveries_change_pct, sparkData: sparkDeliveries },
    { icon: <DollarSign size={20} />, value: stats?.total_revenue ?? 0, label: "Revenus totaux (TND)", iconBg: "rgba(168,85,247,0.15)", iconColor: "#C084FC", change: stats?.revenue_change_pct, sparkData: sparkRevenue },
    { icon: <UserPlus size={20} />, value: stats?.new_users_last_7_days ?? 0, label: "Nouveaux (7j)", iconBg: "rgba(6,182,212,0.15)", iconColor: "#22D3EE", change: undefined, sparkData: sparkPatients },
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
          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-semibold text-white">Tableau de bord</h1>
                <div className="flex items-center gap-1.5 text-xs text-white/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
              <p className="text-sm text-white/40">
                {currentTime.toLocaleDateString("fr-TN", { weekday: "long", day: "numeric", month: "long" })} · {currentTime.toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {quickActions.map((a) => (
                <a key={a.label} href={a.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-80 active:scale-[0.97]"
                  style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color }}>
                  {a.icon}{a.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {statsLoading ? (
              [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
            ) : statsCards.map((s, i) => <MetricCard key={i} {...s} />)}
          </div>
        </div>

        <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-[#00C9A7]" />
                <h2 className="text-white font-semibold text-sm">Revenus mensuels</h2>
              </div>
              <span className="text-xs text-white/30">6 derniers mois</span>
            </div>
            <div className="p-6">
              {monthly?.months && monthly.months.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthly.months} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00C9A7" />
                        <stop offset="100%" stopColor="#00E5FF" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,201,167,0.04)" }} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={48} fill="url(#barGrad)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] gap-2">
                  <Activity size={24} className="text-white/10" />
                  <p className="text-white/20 text-sm">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-[#00E5FF]" />
                <h2 className="text-white font-semibold text-sm">Inscriptions journalières</h2>
              </div>
              <span className="text-xs text-white/30">7 derniers jours</span>
            </div>
            <div className="p-6">
              {daily?.days && daily.days.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={daily.days} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00C9A7" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#00C9A7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Area type="monotone" dataKey="signups" stroke="#00C9A7" strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 3, fill: "#00C9A7", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] gap-2">
                  <Users size={24} className="text-white/10" />
                  <p className="text-white/20 text-sm">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="px-8 pb-8">
          <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                <Activity size={16} style={{ color: "#00C9A7" }} />
                <h2 className="text-white font-semibold text-sm">Activité récente</h2>
                {activity?.events && activity.events.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00C9A7]/10 text-[#00C9A7] font-medium">{activity.events.length} événements</span>
                )}
              </div>
              <span className="text-xs text-white/30">Temps réel</span>
            </div>
            <div className="px-6 py-2 max-h-[320px] overflow-y-auto">
              {activity?.events && activity.events.length > 0 ? activity.events.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.02]" style={{ borderBottom: i < activity.events.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,201,167,0.1)" }}>
                    <span style={{ color: "#00C9A7" }}>{eventIcons[ev.type] || <Clock size={14} />}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm truncate">{ev.description}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">{new Date(ev.created_at).toLocaleString("fr-TN")}</p>
                  </div>
                  <span className="text-white/30 text-xs shrink-0">{timeAgo(ev.created_at)}</span>
                  <ChevronRight size={14} className="text-white/10 shrink-0" />
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Activity size={24} className="text-white/10" />
                  <p className="text-white/20 text-sm">Aucune activité récente</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </RoleGuard>
  );
}