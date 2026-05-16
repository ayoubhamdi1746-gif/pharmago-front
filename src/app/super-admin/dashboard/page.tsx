"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import GlassCard from "@/components/ui/GlassCard";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeInOut" as const } },
};

interface SuperStats {
  total_pharmacies: number;
  total_patients: number;
  total_deliveries: number;
  total_revenue: number;
  new_users_last_7_days: number;
}

interface MetricCard {
  label: string;
  value: number;
  format?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const icons = {
  pharmacy: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  patient: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  delivery: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  revenue: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  growth: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

function MetricCard({ label, value, format, icon, color, bg }: MetricCard) {
  const display = format === "currency" ? `${value.toLocaleString()} TND` : value.toLocaleString();
  return (
    <motion.div variants={item}>
      <GlassCard intensity="light" glow="green" hover={true} className="bg-[#0A1628]/80">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-white">{display}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function SuperAdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["super-stats"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SuperStats>>("/admin/super/stats");
      return res.data.data;
    },
  });

  const metrics: MetricCard[] = [
    { label: "Pharmacies inscrites", value: data?.total_pharmacies ?? 0, icon: icons.pharmacy, color: "#3B82F6", bg: "bg-blue-500/10" },
    { label: "Patients actifs", value: data?.total_patients ?? 0, icon: icons.patient, color: "#10B981", bg: "bg-emerald-500/10" },
    { label: "Livraisons totales", value: data?.total_deliveries ?? 0, icon: icons.delivery, color: "#F97316", bg: "bg-orange-500/10" },
    { label: "Revenus totaux", value: data?.total_revenue ?? 0, format: "currency", icon: icons.revenue, color: "#8B5CF6", bg: "bg-violet-500/10" },
    { label: "Nouveaux inscrits (7j)", value: data?.new_users_last_7_days ?? 0, icon: icons.growth, color: "#06B6D4", bg: "bg-cyan-500/10" },
  ];

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={item}>
          <h1 className="text-2xl font-semibold text-white">Super Admin — Vue globale</h1>
          <p className="text-sm text-gray-400">Statistiques de la plateforme</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
        )}
      </motion.div>
    </RoleGuard>
  );
}
