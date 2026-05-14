"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import RoleGuard from "@/components/RoleGuard";
import Skeleton from "@/components/Skeleton";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { t, type Locale } from "@/lib/i18n";

interface PharmacyRevenue {
  total_pharmacy_earnings: number;
  total_commissions: number;
  pending_commissions: number;
  active_subscriptions: number;
  deliveries_this_month: number;
  total_fulfilled_deliveries: number;
  revenue_history: { month: string; commissions: number; pharmacy_earnings: number; net: number }[];
}

export default function PharmacistRevenuePage() {
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["pharmacist-revenue"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PharmacyRevenue>>("/pharmacist/revenue");
      return res.data.data;
    },
  });

  return (
    <RoleGuard allowedRole="pharmacist">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6"
      >
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {t(locale, "pharmacist.revenue.title")}
        </h1>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                variants={staggerItem}
                className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card shadow-soft p-4"
              >
                <p className="text-xs text-gray-400">{t(locale, "pharmacist.revenue.earnings")}</p>
                <p className="text-2xl font-bold text-white">{data.total_pharmacy_earnings.toFixed(2)} TND</p>
              </motion.div>
              <motion.div
                variants={staggerItem}
                className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card shadow-soft p-4"
              >
                <p className="text-xs text-gray-400">{t(locale, "pharmacist.revenue.commissions")}</p>
                <p className="text-2xl font-bold text-white">{data.total_commissions.toFixed(2)} TND</p>
              </motion.div>
              <motion.div
                variants={staggerItem}
                className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card shadow-soft p-4"
              >
                <p className="text-xs text-gray-400">{t(locale, "pharmacist.revenue.pending")}</p>
                <p className="text-2xl font-bold text-[#E69E3E]">{data.pending_commissions.toFixed(2)} TND</p>
              </motion.div>
              <motion.div
                variants={staggerItem}
                className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card shadow-soft p-4"
              >
                <p className="text-xs text-gray-400">{t(locale, "pharmacist.revenue.deliveries")}</p>
                <p className="text-2xl font-bold text-white">{data.deliveries_this_month}</p>
              </motion.div>
            </div>

            {data.revenue_history && data.revenue_history.length > 0 && (
              <motion.div
                variants={staggerItem}
                className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card shadow-soft p-6"
              >
                <h2 className="text-sm font-semibold text-white mb-4">
                  {t(locale, "pharmacist.revenue.chart")}
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenue_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,170,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                    <Tooltip
                      contentStyle={{
                        background: "#0A1628",
                        border: "1px solid rgba(0,212,170,0.2)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="commissions" name={t(locale, "pharmacist.revenue.commissions")} fill="#00D4AA" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pharmacy_earnings" name={t(locale, "pharmacist.revenue.earnings")} fill="#00D4AA" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </>
        ) : null}
      </motion.div>
    </RoleGuard>
  );
}
