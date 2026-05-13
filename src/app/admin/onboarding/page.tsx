"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import { t, type Locale } from "@/lib/i18n";

const plans = ["STARTER", "PRO", "ENTERPRISE"] as const;

const planColors: Record<string, string> = {
  STARTER: "from-[#00D4AA]/20 to-[#00D4AA]/5 border-[#00D4AA]",
  PRO: "from-[#00C853]/20 to-[#00C853]/5 border-[#00C853]",
  ENTERPRISE: "from-[#022C22]/20 to-[#022C22]/5 border-[#022C22]",
};

export default function OnboardingPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [phone, setPhone] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  const handlePay = async (plan: string, provider: string) => {
    setLoading(`${plan}-${provider}`);
    try {
      const res = await api.post("/billing/subscribe", {
        pharmacy_name: pharmacyName || `Pharmacie ${plan}`,
        plan,
        phone: phone || "+21600000000",
        payment_provider: provider,
      });
      const paymentUrl = res.data.data?.payment_url;
      if (paymentUrl) {
        window.open(paymentUrl, "_blank");
      }
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "onboarding.error") } })
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <RoleGuard allowedRole="admin">
      <div className="max-w-5xl mx-auto space-y-8" dir={locale === "ar" ? "rtl" : "ltr"}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-[#022C22] mb-2">{t(locale, "onboarding.title")}</h1>
          <p className="text-gray-500">{t(locale, "onboarding.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-b ${planColors[plan]} border-2 rounded-card shadow-soft p-6 flex flex-col`}
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-[#022C22]">
                  {t(locale, `onboarding.${plan.toLowerCase()}.label`)}
                </h2>
                <p className="text-3xl font-bold text-[#022C22] mt-2">
                  {t(locale, `onboarding.${plan.toLowerCase()}.price`)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {t(locale, `onboarding.${plan.toLowerCase()}.limit`)}
                </p>
              </div>

              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                {[
                  t(locale, `onboarding.${plan.toLowerCase()}.feat1`),
                  t(locale, `onboarding.${plan.toLowerCase()}.feat2`),
                  t(locale, `onboarding.${plan.toLowerCase()}.feat3`),
                ].map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-[#00D4AA] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex-1" />

              <div className="space-y-3">
                <button
                  onClick={() => handlePay(plan, "KONNECT")}
                  disabled={loading !== null}
                  className="w-full py-3 rounded-btn text-sm font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-colors duration-200 disabled:opacity-50"
                >
                  {loading === `${plan}-KONNECT` ? t(locale, "onboarding.processing") : t(locale, "onboarding.pay_konnect")}
                </button>
                <button
                  onClick={() => handlePay(plan, "FLOUCI")}
                  disabled={loading !== null}
                  className="w-full py-3 rounded-btn text-sm font-medium text-[#022C22] bg-white border-2 border-[#A7F3D0] hover:border-[#00D4AA] transition-colors duration-200 disabled:opacity-50"
                >
                  {loading === `${plan}-FLOUCI` ? t(locale, "onboarding.processing") : t(locale, "onboarding.pay_flouci")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-6 max-w-lg mx-auto space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "onboarding.phone")}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t(locale, "onboarding.phone_placeholder")}
              className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "admin.subscription.name_label")}</label>
            <input
              type="text"
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
            />
          </div>
        </motion.div>
      </div>
    </RoleGuard>
  );
}
