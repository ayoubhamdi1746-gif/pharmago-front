"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import GlassCard from "@/components/ui/GlassCard";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15 } } };

interface DriverPayout {
  id: string;
  driver_token_hash: string;
  delivery_ticket_id: string;
  amount_tnd: number;
  status: "PENDING" | "PAID";
  created_at: string;
  paid_at: string | null;
}

interface PayoutsData {
  payouts: DriverPayout[];
  total_to_pay_this_week: number;
}

const FILTERS = ["all", "PENDING", "PAID"] as const;

export default function SuperAdminDriverPayments() {
  const [period, setPeriod] = useState<"week" | "all">("week");
  const [filter, setFilter] = useState<typeof FILTERS[number]>("all");
  const [marking, setMarking] = useState<string | null>(null);
  const [data, setData] = useState<PayoutsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = (): string => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("pharmago_token") ?? "";
  };

  const fetchData = () => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }
    fetch(`/api/admin/payouts?period=${period}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => { setData(json.data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { fetchData(); }, [period]);

  const handleMarkPaid = async (payoutId: string) => {
    setMarking(payoutId);
    try {
      const token = getToken();
      await fetch(`/api/admin/payouts/${payoutId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      fetchData();
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Paiement marqué comme payé" } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Erreur lors du marquage" } }));
    } finally {
      setMarking(null);
    }
  };

  const payouts = data?.payouts || [];
  const filtered = filter === "all" ? payouts : payouts.filter((p) => p.status === filter);
  const pendingTotal = payouts.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amount_tnd, 0);
  const paidTotal = payouts.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount_tnd, 0);
  const activeDrivers = [...new Set(payouts.map((p) => p.driver_token_hash))].length;

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-semibold text-white">Paiements livreurs</h1>
          <p className="text-sm text-gray-400">Gestion des commissions des livreurs</p>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard intensity="light" glow="green" className="bg-[rgba(255,255,255,0.05)] border border-[rgba(0,201,167,0.2)] backdrop-blur-[10px]">
            <p className="text-xs text-gray-400 mb-1">Total à payer</p>
            <p className="text-4xl font-bold text-[#E69E3E]">{pendingTotal.toFixed(2)} TND</p>
          </GlassCard>
          <GlassCard intensity="light" glow="green" className="bg-[rgba(255,255,255,0.05)] border border-[rgba(0,201,167,0.2)] backdrop-blur-[10px]">
            <p className="text-xs text-gray-400 mb-1">Total payé</p>
            <p className="text-4xl font-bold text-[#00C853]">{paidTotal.toFixed(2)} TND</p>
          </GlassCard>
          <GlassCard intensity="light" glow="green" className="bg-[rgba(255,255,255,0.05)] border border-[rgba(0,201,167,0.2)] backdrop-blur-[10px]">
            <p className="text-xs text-gray-400 mb-1">Livreurs actifs</p>
            <p className="text-4xl font-bold text-[#00D4AA]">{activeDrivers}</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={item} className="flex items-center justify-between">
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-btn text-sm font-medium transition-colors duration-200 ${
                  filter === f ? "bg-[#00D4AA] text-white" : "bg-[#0D1E32] text-gray-400 border border-[#00D4AA]/20 hover:border-[#00D4AA]/40"
                }`}
              >
                {f === "all" ? "Tous" : f === "PENDING" ? "En attente" : "Payés"}
                {f !== "all" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({f === "PENDING" ? payouts.filter((p) => p.status === "PENDING").length : payouts.filter((p) => p.status === "PAID").length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod("week")}
              className={`px-3 py-1.5 rounded-btn text-sm font-medium transition-colors duration-200 ${period === "week" ? "bg-[#00D4AA] text-white" : "bg-[#0D1E32] text-gray-400 border border-[#00D4AA]/20"}`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setPeriod("all")}
              className={`px-3 py-1.5 rounded-btn text-sm font-medium transition-colors duration-200 ${period === "all" ? "bg-[#00D4AA] text-white" : "bg-[#0D1E32] text-gray-400 border border-[#00D4AA]/20"}`}
            >
              Tout
            </button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#0A1628]/80 rounded-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard intensity="light" glow="none" className="bg-[#0A1628]/80">
            <p className="text-center text-sm text-gray-400 py-8">Aucun paiement pour cette période</p>
          </GlassCard>
        ) : (
          <motion.div variants={item} className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 bg-[#0D1E32] border-b border-[#00D4AA]/20">
                    <th className="p-3">Livreur</th>
                    <th className="p-3">Livraison</th>
                    <th className="p-3">Montant</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-[#00D4AA]/10 hover:bg-[#00D4AA]/5">
                      <td className="p-3">
                        <p className="text-xs font-mono text-white">{p.driver_token_hash.slice(0, 16)}...</p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs font-mono text-gray-400">{p.delivery_ticket_id.slice(0, 8)}...</p>
                      </td>
                      <td className="p-3 text-[#00D4AA] font-bold">{p.amount_tnd.toFixed(2)} TND</td>
                      <td className="p-3 text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.status === "PAID" ? "bg-[#00C853]/10 text-[#00C853]" : "bg-[#E69E3E]/10 text-[#E69E3E]"
                        }`}>
                          {p.status === "PAID" ? "✓ Payé" : "En attente"}
                        </span>
                      </td>
                      <td className="p-3">
                        {p.status === "PENDING" ? (
                          <button
                            onClick={() => handleMarkPaid(p.id)}
                            disabled={marking === p.id}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] rounded-btn transition-colors disabled:opacity-50"
                          >
                            {marking === p.id ? "..." : "Marquer payé"}
                          </button>
                        ) : (
                          <span className="text-xs text-[#00C853]">✓ Confirmé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </RoleGuard>
  );
}