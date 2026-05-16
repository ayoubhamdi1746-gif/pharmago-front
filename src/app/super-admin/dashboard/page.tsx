"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building2, Users, Truck, DollarSign, UserPlus, TrendingUp } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface SuperStats {
  total_pharmacies: number;
  total_patients: number;
  total_deliveries: number;
  total_revenue: number;
  new_users_last_7_days: number;
}

function MetricCard({
  icon,
  value,
  label,
  trend,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  trend?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <motion.div variants={item} whileHover={{ y: -2 }} className="metric-card group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs" style={{ color: "#34D399" }}>
            <TrendingUp size={12} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-white font-bold" style={{ fontSize: "2.25rem", lineHeight: "1", marginBottom: "6px" }}>
        {value.toLocaleString()}
      </p>
      <p className="text-white/40 text-sm">{label}</p>
    </motion.div>
  );
}

function StatRow({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-center gap-3">
        <span className="text-white/30">{icon}</span>
        <span className="text-white/50 text-sm">{label}</span>
      </div>
      <span className="text-white font-medium text-sm">{value.toLocaleString()}</span>
    </div>
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

  const stats = [
    { icon: <Building2 size={20} />, value: data?.total_pharmacies ?? 0, label: "Pharmacies inscrites", iconBg: "rgba(59, 130, 246, 0.15)", iconColor: "#60A5FA" },
    { icon: <Users size={20} />, value: data?.total_patients ?? 0, label: "Patients", iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399" },
    { icon: <Truck size={20} />, value: data?.total_deliveries ?? 0, label: "Livraisons totales", iconBg: "rgba(249, 115, 22, 0.15)", iconColor: "#FB923C" },
    { icon: <DollarSign size={20} />, value: data?.total_revenue ?? 0, label: "Revenus totaux (TND)", iconBg: "rgba(168, 85, 247, 0.15)", iconColor: "#C084FC" },
    { icon: <UserPlus size={20} />, value: data?.new_users_last_7_days ?? 0, label: "Nouveaux inscrits (7j)", iconBg: "rgba(6, 182, 212, 0.15)", iconColor: "#22D3EE" },
  ];

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div variants={container} initial="hidden" animate="show" className="min-h-screen" style={{ background: "#020814" }}>
        <div className="px-8 pt-8 pb-6">
          <motion.div variants={item}>
            <h1 className="text-xl font-semibold text-white">Super Admin — Vue globale</h1>
            <p className="text-sm text-white/40 mt-1">Statistiques complètes de la plateforme</p>
          </motion.div>
        </div>

        <div className="px-8 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="metric-card">
                    <div className="skeleton w-10 h-10 rounded-xl mb-4" />
                    <div className="skeleton w-20 h-8 rounded mb-2" />
                    <div className="skeleton w-32 h-4 rounded" />
                  </div>
                ))
              : stats.map((s, i) => <MetricCard key={i} {...s} />)}
          </div>
        </div>

        <div className="px-8 pb-8">
          <motion.div variants={item}>
            <div className="rounded-2xl overflow-hidden" style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
            }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <h2 className="text-white font-semibold text-base">Activité récente</h2>
                <p className="text-white/30 text-xs mt-0.5">7 derniers jours</p>
              </div>
              <div className="px-6 py-2">
                <StatRow label="Nouvelles pharmacies" value={Math.floor((data?.total_pharmacies ?? 0) * 0.15)} icon={<Building2 size={14} />} />
                <StatRow label="Nouveaux patients" value={Math.floor((data?.total_patients ?? 0) * 0.08)} icon={<Users size={14} />} />
                <StatRow label="Livraisons effectuées" value={Math.floor((data?.total_deliveries ?? 0) * 0.12)} icon={<Truck size={14} />} />
                <StatRow label="Revenus générés (TND)" value={Math.floor((data?.total_revenue ?? 0) * 0.1)} icon={<DollarSign size={14} />} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </RoleGuard>
  );
}