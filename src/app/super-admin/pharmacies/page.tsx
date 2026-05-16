"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import Skeleton from "@/components/Skeleton";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import { useLocale } from "@/lib/useLocale";
import { t } from "@/lib/i18n";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15 } } };

interface Pharmacy {
  id: string;
  pharmacy_name: string;
  city: string | null;
  plan: string;
  is_active: boolean;
  delivery_count_this_month: number;
  delivery_limit: number | null;
  total_delivery_earnings: number;
  price_tnd: number;
  expires_at: string;
}

const PLANS = ["STARTER", "PRO", "ENTERPRISE"];

export default function SuperAdminPharmacies() {
  const { locale } = useLocale();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["super-pharmacies"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ pharmacies: Pharmacy[] }>>("/admin/pharmacies");
      return res.data.data?.pharmacies ?? [];
    },
  });

  const filtered = (data ?? []).filter((p) => {
    const nameCity = `${p.pharmacy_name} ${p.city ?? ""}`.toLowerCase();
    if (search && !nameCity.includes(search.toLowerCase())) return false;
    if (planFilter && p.plan !== planFilter) return false;
    if (cityFilter && p.city !== cityFilter) return false;
    return true;
  });

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-semibold text-white">{t(locale, "super_admin.pharmacies.title") || "Toutes les pharmacies"}</h1>
          <p className="text-sm text-gray-400">{filtered.length} pharmacies inscrites</p>
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap gap-3 items-center">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="flex-1 min-w-[200px] px-4 py-2 border border-[#00D4AA]/20 bg-[#0D1E32] rounded-btn text-sm text-white focus:outline-none focus:border-[#00D4AA] placeholder-gray-500" />
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="px-4 py-2 border border-[#00D4AA]/20 bg-[#0D1E32] text-white rounded-btn text-sm focus:outline-none">
            <option value="">Tous les plans</option>
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="px-4 py-2 border border-[#00D4AA]/20 bg-[#0D1E32] text-white rounded-btn text-sm focus:outline-none">
            <option value="">Toutes les villes</option>
            {[...new Set((data ?? []).map((p) => p.city).filter(Boolean) as string[])].sort().map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </motion.div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <motion.div variants={item} className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 bg-[#0D1E32] border-b border-[#00D4AA]/20">
                    <th className="p-3">Nom</th>
                    <th className="p-3">Ville</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Livraisons</th>
                    <th className="p-3">Revenus</th>
                    <th className="p-3">Expiration</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-[#00D4AA]/10 hover:bg-[#00D4AA]/5">
                      <td className="p-3 font-medium text-white">{p.pharmacy_name}</td>
                      <td className="p-3 text-gray-400">{p.city || "—"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-xs font-medium bg-[#00D4AA]/10 text-[#00D4AA] rounded-full">{p.plan}</span>
                      </td>
                      <td className="p-3 text-gray-300">{p.delivery_count_this_month}{p.delivery_limit ? ` / ${p.delivery_limit}` : ""}</td>
                      <td className="p-3 text-[#00D4AA] font-medium">{p.total_delivery_earnings.toFixed(2)} TND</td>
                      <td className="p-3 text-gray-400">{new Date(p.expires_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${p.is_active ? "bg-[#00D4AA]/10 text-[#00D4AA]" : "bg-[#FF4D6D]/10 text-[#FF4D6D]"}`}>
                          {p.is_active ? "Actif" : "Inactif"}
                        </span>
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