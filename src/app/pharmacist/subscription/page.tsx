"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import Skeleton from "@/components/Skeleton";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import type { ApiResponse, Subscription, PaymentTransaction } from "@/lib/types";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { t, type Locale } from "@/lib/i18n";

const PLAN_PRICES: Record<string, number> = { STARTER: 200, PRO: 450, ENTERPRISE: 900 };

export default function PharmacistSubscriptionPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  const { data: sub, isLoading } = useQuery({
    queryKey: ["pharmacist-subscription"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Subscription>>("/pharmacist/subscription");
      return res.data.data;
    },
  });

  const { data: txns } = useQuery({
    queryKey: ["pharmacist-transactions"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ transactions: PaymentTransaction[] }>>("/pharmacist/transactions");
      return res.data.data?.transactions ?? [];
    },
  });

  const changePlanMut = useMutation({
    mutationFn: async (plan: string) => {
      const res = await api.post<ApiResponse<{ payment_url: string }>>("/billing/subscribe", {
        pharmacy_name: sub?.pharmacy_name,
        plan,
        phone: "",
        payment_provider: selectedPlan === "KONNECT" ? "KONNECT" : "FLOUCI",
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data?.payment_url) window.open(data.payment_url, "_blank");
      setShowModal(false);
    },
  });

  const usagePercent = sub?.delivery_limit
    ? Math.min(100, Math.round(((sub.delivery_count_this_month ?? 0) / sub.delivery_limit) * 100))
    : 0;

  const usageColor =
    usagePercent < 60 ? "bg-[#00D4AA]" : usagePercent < 85 ? "bg-amber-500" : "bg-red-500";

  return (
    <RoleGuard allowedRole="pharmacist">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        <h1 className="text-2xl font-semibold text-[#022C22] tracking-tight">
          {t(locale, "pharmacist.subscription.title")}
        </h1>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : sub ? (
          <>
            {/* Plan Card */}
            <motion.div
              variants={staggerItem}
              className="bg-white border border-[#A7F3D0] rounded-card shadow-soft p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t(locale, "pharmacist.subscription.plan")}</p>
                  <p className="text-2xl font-bold text-[#022C22]">
                    {sub.plan}
                  </p>
                  <p className="text-lg font-semibold text-[#00D4AA] mt-1">
                    {sub.price_tnd.toFixed(2)} TND/{t(locale, "pharmacist.subscription.price").toLowerCase()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    sub.is_active
                      ? "bg-[#F0FDF9] text-[#00D4AA] border border-[#A7F3D0]"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {sub.is_active
                    ? t(locale, "pharmacist.subscription.active")
                    : t(locale, "pharmacist.subscription.inactive")}
                </span>
              </div>

              {/* Usage Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">{t(locale, "pharmacist.subscription.usage")}</span>
                  <span className="font-medium text-[#022C22]">
                    {sub.delivery_count_this_month} / {sub.delivery_limit ?? "∞"}{" "}
                    {t(locale, "pharmacist.subscription.deliveries")}
                  </span>
                </div>
                {sub.delivery_limit ? (
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${usageColor}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-[#00D4AA]">{t(locale, "pharmacist.subscription.unlimited")}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">{t(locale, "pharmacist.subscription.renewal")}</p>
                  <p className="font-medium text-[#022C22]">
                    {new Date(sub.expires_at).toLocaleDateString(locale === "ar" ? "ar-TN" : "fr-TN")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">{t(locale, "pharmacist.subscription.status")}</p>
                  <p className="font-medium text-[#022C22]">
                    {sub.is_active
                      ? t(locale, "pharmacist.subscription.active")
                      : t(locale, "pharmacist.subscription.inactive")}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setSelectedPlan(sub.plan); setShowModal(true); }}
                className="mt-6 w-full py-2.5 bg-[#022C22] text-white rounded-btn text-sm font-medium hover:bg-[#044C3A] transition-colors"
              >
                {t(locale, "pharmacist.subscription.change_plan")}
              </button>
            </motion.div>

            {/* Transactions */}
            <motion.div
              variants={staggerItem}
              className="bg-white border border-[#A7F3D0] rounded-card shadow-soft p-6"
            >
              <h2 className="text-sm font-semibold text-[#022C22] mb-4">
                {t(locale, "pharmacist.subscription.transactions")}
              </h2>
              {txns && txns.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-[#A7F3D0]">
                        <th className="pb-2 pr-4">{t(locale, "pharmacist.subscription.provider")}</th>
                        <th className="pb-2 pr-4">{t(locale, "pharmacist.subscription.amount")}</th>
                        <th className="pb-2 pr-4">{t(locale, "pharmacist.subscription.transaction_status")}</th>
                        <th className="pb-2">{t(locale, "pharmacist.subscription.date")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txns.map((txn) => (
                        <tr key={txn.id} className="border-b border-gray-50">
                          <td className="py-3 pr-4 font-medium">{txn.provider}</td>
                          <td className="py-3 pr-4">{txn.amount_tnd.toFixed(2)} TND</td>
                          <td className="py-3 pr-4">
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                txn.status === "COMPLETED"
                                  ? "bg-[#F0FDF9] text-[#00D4AA]"
                                  : txn.status === "PENDING"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {t(locale, `status.${txn.status}`)}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500">
                            {new Date(txn.created_at).toLocaleDateString(locale === "ar" ? "ar-TN" : "fr-TN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  {t(locale, "pharmacist.subscription.empty_transactions")}
                </p>
              )}
            </motion.div>
          </>
        ) : null}
      </motion.div>

      {/* Change Plan Modal */}
      <Modal
        open={showModal}
        variant="default"
        title={t(locale, "pharmacist.subscription.modal_title")}
        onClose={() => setShowModal(false)}
      >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{t(locale, "pharmacist.subscription.modal_sub")}</p>
            {["STARTER", "PRO", "ENTERPRISE"].map((plan) => {
              const price = PLAN_PRICES[plan] ?? 0;
              const isCurrent = sub?.plan === plan;
              return (
                <label
                  key={plan}
                  className={`block p-4 border rounded-card cursor-pointer transition-all ${
                    selectedPlan === plan
                      ? "border-[#00D4AA] bg-[#F0FDF9]"
                      : "border-gray-200 hover:border-[#A7F3D0]"
                  } ${isCurrent ? "opacity-60" : ""}`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan}
                    checked={selectedPlan === plan}
                    onChange={() => setSelectedPlan(plan)}
                    className="mr-2 accent-[#00D4AA]"
                    disabled={isCurrent}
                  />
                  <span className="font-medium text-[#022C22]">{plan}</span>
                  <span className="float-right text-[#00D4AA] font-semibold">{price} TND/mois</span>
                </label>
              );
            })}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedPlan("KONNECT");
                  changePlanMut.mutate(selectedPlan);
                }}
                disabled={changePlanMut.isPending || selectedPlan === sub?.plan}
                className="flex-1 py-2.5 bg-[#022C22] text-white rounded-btn text-sm font-medium hover:bg-[#044C3A] transition-colors disabled:opacity-50"
              >
                {t(locale, "pharmacist.subscription.pay_konnect")}
              </button>
              <button
                onClick={() => {
                  setSelectedPlan("FLOUCI");
                  changePlanMut.mutate(selectedPlan);
                }}
                disabled={changePlanMut.isPending || selectedPlan === sub?.plan}
                className="flex-1 py-2.5 bg-[#00D4AA] text-white rounded-btn text-sm font-medium hover:bg-[#00BFA0] transition-colors disabled:opacity-50"
              >
                {t(locale, "pharmacist.subscription.pay_flouci")}
              </button>
            </div>
          </div>
        </Modal>
    </RoleGuard>
  );
}
