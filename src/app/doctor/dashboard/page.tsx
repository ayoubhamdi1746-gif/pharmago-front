"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import StatusBadge from "@/components/StatusBadge";
import Skeleton from "@/components/Skeleton";
import Modal from "@/components/Modal";
import GlassCard from "@/components/ui/GlassCard";
import NeoButton from "@/components/ui/NeoButton";
import api from "@/lib/api";
import type { ApiResponse, DoctorConfirmationRequest } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeInOut" as const } } };

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

function Countdown({ expiresAt, locale }: { expiresAt: string; locale: Locale }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return <span className="text-[#FF4D6D] font-mono font-bold">{t(locale, "doctor.expired")}</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pct = diff / (4 * 3600000);
  const color = pct > 0.5 ? "text-[#00D4AA]" : pct > 0.25 ? "text-[#E69E3E]" : "text-[#FF4D6D]";
  return <span className={`font-mono font-bold ${color}`}>{h}h {m}m {s}s</span>;
}

export default function DoctorDashboard() {
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("fr");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
    const handler = () => {
      const updated = localStorage.getItem("lang") as Locale | null;
      if (updated) setLocale(updated);
    };
    window.addEventListener("langchange", handler);
    return () => window.removeEventListener("langchange", handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-confirmations"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ confirmations: DoctorConfirmationRequest[] }>>("/doctor/confirmations");
      return res.data.data?.confirmations || [];
    },
  });

  const awaiting = (data || []).filter((c) => c.status === "AWAITING");
  const signed = (data || []).filter((c) => c.status === "SIGNED");
  const expired = (data || []).filter((c) => c.status === "EXPIRED");

  const handleConfirm = async () => {
    if (!confirmId) return;
    try {
      await api.post(`/doctor/confirm/${confirmId}`, {});
      queryClient.invalidateQueries({ queryKey: ["doctor-confirmations"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: t(locale, "doctor.toast.confirmed") } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: t(locale, "doctor.toast.failed") } }));
    } finally {
      setConfirmId(null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post("/dev/seed-doctor", {});
      queryClient.invalidateQueries({ queryKey: ["doctor-confirmations"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: t(locale, "doctor.toast.seeded") } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: t(locale, "doctor.toast.seed_failed") } }));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <RoleGuard allowedRole="doctor">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#022C22] mb-1">{t(locale, "doctor.title")}</h1>
            <p className="text-sm text-gray-500">{t(locale, "doctor.subtitle")}</p>
          </div>
          {isDev && (
            <NeoButton onClick={handleSeed} disabled={seeding} loading={seeding} variant="primary" size="sm">
              {t(locale, "doctor.seed")}
            </NeoButton>
          )}
        </motion.div>

        {awaiting.length > 0 && (
          <motion.div variants={item}>
            <GlassCard intensity="light" glow="none" hover={false} className="!bg-amber-50/80 border-amber-200"><div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm font-medium text-amber-800">
                {awaiting.length} {t(locale, "doctor.banner_count")}
              </p>
            </div></GlassCard>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            {awaiting.length > 0 && (
              <motion.div variants={item}>
                <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">{t(locale, "doctor.awaiting")}</h2>
                <div className="space-y-3">
                  {awaiting.map((c) => (
                    <GlassCard key={c.id} intensity="light" glow="none" hover={false} className="!bg-white border-2 border-amber-200"><div className="p-1">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#022C22]">{c.medicament || `#${c.prescription_id.slice(0, 8)}`}</span>
                            {c.dosage && <span className="text-xs text-gray-500">{c.dosage}</span>}
                            <StatusBadge status={c.status} locale={locale} />
                          </div>
                          <p className="text-xs text-gray-500">
                            {c.doctor_name ? `Dr. ${c.doctor_name}` : `${t(locale, "prescription.new.doctor_label")}: #${c.prescription_id.slice(0, 8)}`} &middot; {t(locale, "doctor.safety_reason")}
                          </p>
                          {c.patient_reference_token && (
                            <p className="text-xs text-gray-400">Patient: #{c.patient_reference_token.slice(0, 12)}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-500">{t(locale, "doctor.expires")}</span>
                            <Countdown expiresAt={c.expires_at} locale={locale} />
                          </div>
                        </div>
                        <NeoButton onClick={() => setConfirmId(c.prescription_id)} variant="primary" size="md">
                          {t(locale, "doctor.confirm")}
                        </NeoButton>
                      </div>
                    </div></GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {signed.length > 0 && (
              <motion.div variants={item}>
                <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">{t(locale, "doctor.signed")}</h2>
                <div className="space-y-2">
                  {signed.map((c) => (
                    <GlassCard key={c.id} intensity="light" glow="green" hover={false}>
                      <div className="flex items-center gap-3 opacity-70">
                        <span className="text-sm text-[#022C22]">{c.medicament || `#${c.prescription_id.slice(0, 8)}`}</span>
                        <StatusBadge status={c.status} locale={locale} />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {expired.length > 0 && (
              <motion.div variants={item}>
                <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">{t(locale, "doctor.expired")}</h2>
                <div className="space-y-2">
                  {expired.map((c) => (
                    <GlassCard key={c.id} intensity="light" glow="none" hover={false}>
                      <div className="flex items-center gap-3 opacity-50">
                        <span className="text-sm text-[#022C22]">{c.medicament || `#${c.prescription_id.slice(0, 8)}`}</span>
                        <StatusBadge status={c.status} locale={locale} />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {awaiting.length === 0 && signed.length === 0 && expired.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">{t(locale, "doctor.empty")}</p>
            )}
          </>
        )}

        <Modal open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleConfirm}
          title={t(locale, "doctor.modal.title")} message={t(locale, "doctor.modal.message")}
          confirmLabel={t(locale, "doctor.modal.confirm")} variant="warning" />
      </motion.div>
    </RoleGuard>
  );
}
