"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import { t, type Locale } from "@/lib/i18n";

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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeInOut" as const } },
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-4 transition-all duration-200 hover:border-[#00D4AA] ${className}`}>
      {children}
    </div>
  );
}

export default function AdminPayouts() {
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>("fr");
  const [period, setPeriod] = useState<"week" | "all">("week");
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payouts", period],
    queryFn: async () => {
      const res = await api.get<{ status: string; data: PayoutsData }>(`/admin/payouts?period=${period}`);
      return res.data.data;
    },
  });

  const handleMarkPaid = async (payoutId: string) => {
    setMarking(payoutId);
    try {
      await api.post(`/admin/payouts/${payoutId}/mark-paid`);
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "admin.payouts.marked_paid") } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "admin.payouts.mark_failed") } })
      );
    } finally {
      setMarking(null);
    }
  };

  const payouts = data?.payouts || [];
  const totalToPay = data?.total_to_pay_this_week || 0;

  return (
    <RoleGuard allowedRole="admin">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={item} className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#022C22]">
            {t(locale, "admin.payouts.title")}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod("week")}
              className={`px-3 py-1.5 rounded-btn text-sm font-medium transition-colors duration-200 ${
                period === "week"
                  ? "bg-[#00D4AA] text-white"
                  : "bg-white text-gray-600 border border-[#A7F3D0] hover:bg-[#F0FDF9]"
              }`}
            >
              {t(locale, "admin.payouts.this_week")}
            </button>
            <button
              onClick={() => setPeriod("all")}
              className={`px-3 py-1.5 rounded-btn text-sm font-medium transition-colors duration-200 ${
                period === "all"
                  ? "bg-[#00D4AA] text-white"
                  : "bg-white text-gray-600 border border-[#A7F3D0] hover:bg-[#F0FDF9]"
              }`}
            >
              {t(locale, "admin.payouts.all_time")}
            </button>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.payouts.total_week")}</p>
            <p className="text-2xl font-bold text-[#00D4AA]">{totalToPay.toFixed(2)} TND</p>
          </Card>
          <Card>
            <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.payouts.pending_count")}</p>
            <p className="text-2xl font-bold text-[#E69E3E]">{payouts.filter((p) => p.status === "PENDING").length}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.payouts.paid_count")}</p>
            <p className="text-2xl font-bold text-[#00C853]">{payouts.filter((p) => p.status === "PAID").length}</p>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <h2 className="text-lg font-semibold text-[#022C22] mb-3">
            {t(locale, "admin.payouts.list_title")}
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-card animate-pulse" />
              ))}
            </div>
          ) : payouts.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-500 text-center py-4">{t(locale, "admin.payouts.empty")}</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {payouts.map((p) => (
                <Card key={p.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-mono text-[#022C22]">
                        {p.driver_token_hash.slice(0, 16)}...
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "PAID"
                            ? "bg-[#00C853]/10 text-[#00C853]"
                            : "bg-[#E69E3E]/10 text-[#E69E3E]"
                        }`}
                      >
                        {p.status === "PAID" ? t(locale, "admin.payouts.paid") : t(locale, "admin.payouts.pending")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString()} &middot; {p.amount_tnd.toFixed(2)} TND
                    </p>
                  </div>
                  {p.status === "PENDING" && (
                    <button
                      onClick={() => handleMarkPaid(p.id)}
                      disabled={marking === p.id}
                      className="px-3 py-1.5 rounded-btn text-xs font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-colors duration-200 disabled:opacity-50"
                    >
                      {marking === p.id ? "..." : t(locale, "admin.payouts.mark_paid")}
                    </button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </RoleGuard>
  );
}
