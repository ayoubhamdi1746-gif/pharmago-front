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

function StatCard({ label, value, format }: { label: string; value: number; format?: string }) {
  const display = format === "currency" ? `${value.toLocaleString()} TND` : value.toLocaleString();
  return (
    <motion.div variants={item}>
      <GlassCard intensity="light" glow="green" hover={true} className="bg-[#0A1628]/80">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-4xl font-bold text-white">{display}</p>
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
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Pharmacies inscrites" value={data?.total_pharmacies ?? 0} />
            <StatCard label="Patients" value={data?.total_patients ?? 0} />
            <StatCard label="Livraisons totales" value={data?.total_deliveries ?? 0} />
            <StatCard label="Revenus totaux" value={data?.total_revenue ?? 0} format="currency" />
            <StatCard label="Nouveaux inscrits (7j)" value={data?.new_users_last_7_days ?? 0} />
          </div>
        )}
      </motion.div>
    </RoleGuard>
  );
}
