"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import Skeleton from "@/components/Skeleton";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import type { ApiResponse, PharmacyAdminRow } from "@/lib/types";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { t, type Locale } from "@/lib/i18n";

const PLANS = ["STARTER", "PRO", "ENTERPRISE"];

export default function AdminPharmaciesPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [suspendTarget, setSuspendTarget] = useState<PharmacyAdminRow | null>(null);
  const [detailTarget, setDetailTarget] = useState<PharmacyAdminRow | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  const { data: pharmacies, isLoading } = useQuery({
    queryKey: ["admin-pharmacies"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ pharmacies: PharmacyAdminRow[] }>>("/admin/pharmacies");
      return res.data.data?.pharmacies ?? [];
    },
  });

  const suspendMut = useMutation({
    mutationFn: async (pharmacyId: string) => {
      await api.patch(`/admin/pharmacies/${pharmacyId}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pharmacies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-revenue"] });
      setSuspendTarget(null);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", message: suspendTarget?.is_active
            ? t(locale, "admin.pharmacies.toast.suspended")
            : t(locale, "admin.pharmacies.toast.activated")
          },
        })
      );
    },
    onError: () => {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "error", message: t(locale, "admin.pharmacies.toast.error") },
        })
      );
    },
  });

  const filtered = (pharmacies ?? []).filter((p) => {
    const nameCity = `${p.pharmacy_name} ${p.city ?? ""}`.toLowerCase();
    if (search && !nameCity.includes(search.toLowerCase())) return false;
    if (planFilter && p.plan !== planFilter) return false;
    if (statusFilter === "active" && !p.is_active) return false;
    if (statusFilter === "inactive" && p.is_active) return false;
    if (cityFilter && p.city !== cityFilter) return false;
    return true;
  });

  return (
    <RoleGuard allowedRole="admin">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-6"
      >
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {t(locale, "admin.pharmacies.title")}
        </h1>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(locale, "admin.pharmacies.search")}
            className="flex-1 min-w-[200px] px-4 py-2 border border-[#00D4AA]/20 bg-[#0D1E32] rounded-btn text-sm text-white focus:outline-none focus:border-[#00D4AA] placeholder-gray-500"
          />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 border border-[#00D4AA]/20 bg-[#0D1E32] text-white rounded-btn text-sm focus:outline-none focus:border-[#00D4AA]"
          >
            <option value="">{t(locale, "admin.pharmacies.all_plans")}</option>
            {PLANS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#00D4AA]/20 bg-[#0D1E32] text-white rounded-btn text-sm focus:outline-none focus:border-[#00D4AA]"
          >
            <option value="">{t(locale, "admin.pharmacies.all_statuses")}</option>
            <option value="active">{t(locale, "admin.status.active")}</option>
            <option value="inactive">{t(locale, "admin.status.inactive")}</option>
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2 border border-[#00D4AA]/20 bg-[#0D1E32] text-white rounded-btn text-sm focus:outline-none focus:border-[#00D4AA]"
          >
            <option value="">Toutes les villes</option>
            {[...new Set((pharmacies ?? []).map(p => p.city).filter(Boolean) as string[])].sort().map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const headers = ["Nom", "Ville", "Plan", "Livraisons", "Revenu", "Statut"];
              const rows = filtered.map(p => [p.pharmacy_name, p.city || "", p.plan, p.delivery_count_this_month, p.total_delivery_earnings.toFixed(2), p.is_active ? "Actif" : "Inactif"]);
              const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "pharmacies.csv"; a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 border border-[#00D4AA]/20 bg-[#0D1E32] text-[#00D4AA] rounded-btn text-sm hover:bg-[#00D4AA]/10 transition-colors"
          >
            Export CSV
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : filtered.length > 0 ? (
          <motion.div variants={staggerItem} className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 bg-[#0D1E32] border-b border-[#00D4AA]/20">
                    <th className="p-3 pr-4">{t(locale, "admin.pharmacies.name")}</th>
                    <th className="p-3 pr-4">{t(locale, "admin.pharmacies.city")}</th>
                    <th className="p-3 pr-4">{t(locale, "admin.pharmacies.plan")}</th>
                    <th className="p-3 pr-4">{t(locale, "admin.pharmacies.deliveries")}</th>
                    <th className="p-3 pr-4">{t(locale, "admin.pharmacies.revenue")}</th>
                    <th className="p-3 pr-4">{t(locale, "admin.pharmacies.status")}</th>
                    <th className="p-3">{t(locale, "admin.pharmacies.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-[#00D4AA]/10 hover:bg-[#00D4AA]/5 cursor-pointer" onClick={() => setDetailTarget(p)}>
                      <td className="p-3 pr-4 font-medium text-white">{p.pharmacy_name}</td>
                      <td className="p-3 pr-4 text-gray-400">{p.city || "—"}</td>
                      <td className="p-3 pr-4">
                        <span className="px-2 py-0.5 text-xs font-medium bg-[#00D4AA]/10 text-[#00D4AA] rounded-full">
                          {p.plan}
                        </span>
                      </td>
                      <td className="p-3 pr-4">
                        <span className={p.delivery_limit && p.delivery_count_this_month >= p.delivery_limit ? "text-[#FF4D6D] font-medium" : "text-gray-300"}>
                          {p.delivery_count_this_month}
                          {p.delivery_limit ? ` / ${p.delivery_limit}` : ""}
                        </span>
                      </td>
                      <td className="p-3 pr-4 text-[#00D4AA] font-medium">
                        {p.total_delivery_earnings.toFixed(2)} TND
                      </td>
                      <td className="p-3 pr-4">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            p.is_active
                              ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                              : "bg-[#FF4D6D]/10 text-[#FF4D6D]"
                          }`}
                        >
                          {p.is_active ? t(locale, "admin.status.active") : t(locale, "admin.status.inactive")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDetailTarget(p)}
                            className="px-3 py-1.5 text-xs font-medium text-[#00D4AA] bg-[#00D4AA]/10 rounded-btn hover:bg-[#00D4AA]/20 transition-colors"
                          >
                            {t(locale, "admin.pharmacies.details")}
                          </button>
                          <button
                            onClick={() => setSuspendTarget(p)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-btn transition-colors ${
                              p.is_active
                                ? "text-[#FF4D6D] bg-[#FF4D6D]/10 hover:bg-[#FF4D6D]/20"
                                : "text-[#00D4AA] bg-[#00D4AA]/10 hover:bg-[#00D4AA]/20"
                            }`}
                          >
                            {p.is_active
                              ? t(locale, "admin.pharmacies.suspend")
                              : t(locale, "admin.pharmacies.activate")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={staggerItem} className="text-center py-12 text-gray-500">
            <p className="text-lg">{t(locale, "admin.pharmacies.empty")}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Suspend Confirmation Modal */}
      <Modal
        open={suspendTarget !== null}
        variant={suspendTarget?.is_active ? "danger" : "default"}
        title={t(locale, "admin.pharmacies.modal_suspend_title")}
        message={t(locale, "admin.pharmacies.modal_suspend_message")}
        confirmLabel={suspendTarget?.is_active ? t(locale, "admin.pharmacies.suspend") : t(locale, "admin.pharmacies.activate")}
        onConfirm={() => suspendTarget && suspendMut.mutate(suspendTarget.pharmacy_id)}
        onClose={() => setSuspendTarget(null)}
      />

      {/* Details Modal */}
      <Modal
        open={detailTarget !== null}
        variant="default"
        title={t(locale, "admin.pharmacies.details_title")}
        onClose={() => setDetailTarget(null)}
      >
        {detailTarget && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400">{t(locale, "admin.pharmacies.name")}</p>
                <p className="font-medium text-white">{detailTarget.pharmacy_name}</p>
              </div>
              <div>
                <p className="text-gray-400">{t(locale, "admin.pharmacies.city")}</p>
                <p className="font-medium text-white">{detailTarget.city || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">{t(locale, "admin.pharmacies.plan")}</p>
                <p className="font-medium text-white">{detailTarget.plan}</p>
              </div>
              <div>
                <p className="text-gray-400">{t(locale, "admin.pharmacies.revenue")}</p>
                <p className="font-medium text-[#00D4AA]">{detailTarget.total_delivery_earnings.toFixed(2)} TND</p>
              </div>
              <div>
                <p className="text-gray-400">{t(locale, "admin.pharmacies.deliveries")}</p>
                <p className="font-medium text-white">
                  {detailTarget.delivery_count_this_month}
                  {detailTarget.delivery_limit ? ` / ${detailTarget.delivery_limit}` : " / ∞"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Prix</p>
                <p className="font-medium text-white">{detailTarget.price_tnd.toFixed(2)} TND/mois</p>
              </div>
              <div>
                <p className="text-gray-400">{t(locale, "pharmacist.subscription.renewal")}</p>
                <p className="font-medium text-white">
                  {new Date(detailTarget.expires_at).toLocaleDateString(locale === "ar" ? "ar-TN" : "fr-TN")}
                </p>
              </div>
              <div>
                <p className="text-gray-400">{t(locale, "admin.pharmacies.status")}</p>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    detailTarget.is_active
                      ? "bg-[#00D4AA]/10 text-[#00D4AA]"
                      : "bg-[#FF4D6D]/10 text-[#FF4D6D]"
                  }`}
                >
                  {detailTarget.is_active ? t(locale, "admin.status.active") : t(locale, "admin.status.inactive")}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </RoleGuard>
  );
}
