"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.12 } },
};

interface DemoRequestRow {
  id: string;
  name: string;
  pharmacy: string;
  city: string;
  phone: string;
  message: string;
  is_processed: boolean;
  created_at: string | null;
}

interface DemoRequestsData {
  requests: DemoRequestRow[];
  total: number;
}

function formatDate(iso: string | null) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SuperAdminDemoRequests() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["demo-requests"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DemoRequestsData>>("/public/demo-requests");
      return res.data.data;
    },
  });

  const handleMarkProcessed = async (id: string) => {
    try {
      await api.patch(`/public/demo-requests/${id}/process`);
      refetch();
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Marqué comme traité" } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Erreur" } }));
    }
  };

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-semibold text-white">Demandes de démo</h1>
          <p className="text-sm text-gray-400">{data?.total ?? 0} demandes au total</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-[#0A1628]/80 rounded-card animate-pulse" />
            ))}
          </div>
        ) : (data?.requests ?? []).length === 0 ? (
          <motion.div variants={item} className="text-center py-16 bg-[#0A1628]/80 rounded-card border border-[#00D4AA]/20">
            <p className="text-gray-400">Aucune demande de démo pour le moment.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {(data?.requests ?? []).map((req) => (
              <motion.div
                key={req.id}
                variants={item}
                className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card p-5 transition-all duration-200 hover:border-[#00D4AA]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{req.name}</p>
                      {!req.is_processed && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#00D4AA]/20 text-[#00D4AA]">Nouvelle</span>
                      )}
                      {req.is_processed && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/20 text-gray-400">Traité</span>
                      )}
                    </div>
                    <p className="text-xs text-[#00D4AA] font-medium">{req.pharmacy} · {req.city || "N/A"}</p>
                    <p className="text-xs text-gray-400 mt-1">{req.phone}</p>
                    {req.message && <p className="text-xs text-gray-400 mt-2 italic">"{req.message}"</p>}
                    <p className="text-[10px] text-gray-600 mt-2">{formatDate(req.created_at)}</p>
                  </div>
                  {!req.is_processed && (
                    <button
                      onClick={() => handleMarkProcessed(req.id)}
                      className="shrink-0 px-3 py-1.5 rounded-btn text-xs font-medium bg-[#00D4AA]/10 text-[#00D4AA] hover:bg-[#00D4AA]/20 transition-all duration-200"
                    >
                      Marquer traité
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </RoleGuard>
  );
}