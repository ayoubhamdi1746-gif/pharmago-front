"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import StatusBadge from "@/components/StatusBadge";
import Skeleton from "@/components/Skeleton";
import GlassCard from "@/components/ui/GlassCard";
import NeoButton from "@/components/ui/NeoButton";
import api from "@/lib/api";
import type { ApiResponse, PrescriptionVerification } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeInOut" as const } } };

const statusSteps = [
  { key: "PENDING", label: "Soumise" },
  { key: "HIGH_RISK_PENDING", label: "Vérification" },
  { key: "VERIFIED", label: "Prête" },
  { key: "DISPENSED", label: "Livrée" },
];

function StepCircle({ done, current }: { done: boolean; current: boolean }) {
  if (done) return (
    <div className="w-6 h-6 rounded-full bg-[#00D4AA] flex items-center justify-center">
      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
  if (current) return (
    <div className="w-6 h-6 rounded-full bg-[#00D4AA] flex items-center justify-center shadow-[0_0_0_4px_rgba(0,212,170,0.2)]">
      <div className="w-2.5 h-2.5 rounded-full bg-white" />
    </div>
  );
  return (
    <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-gray-300" />
    </div>
  );
}

function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const currentIdx = currentStatus === "HIGH_RISK_PENDING" ? 1 : statusSteps.findIndex((s) => s.key === currentStatus);
  return (
    <div className="flex items-center">
      {statusSteps.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <StepCircle done={isDone} current={isCurrent} />
              <span className={`text-[10px] mt-1 font-medium ${isDone || isCurrent ? "text-[#00D4AA]" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {idx < statusSteps.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 -mt-5 ${isDone ? "bg-[#00D4AA]" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default function PatientDashboard() {
  const queryClient = useQueryClient();
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
    queryKey: ["patient-prescriptions"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ prescriptions: PrescriptionVerification[] }>>("/patient/prescriptions");
      return res.data.data?.prescriptions || [];
    },
  });

  const { data: deliveries } = useQuery({
    queryKey: ["my-deliveries"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ deliveries: { ticket_id: string; status: string }[] }>>("/my/deliveries");
      return res.data.data?.deliveries || [];
    },
  });

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post("/dev/seed-patient", {});
      queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "patient.toast.seeded") } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "patient.toast.seed_failed") } })
      );
    } finally {
      setSeeding(false);
    }
  };

  const activeDelivery = (deliveries || []).find((d) => d.status !== "delivered");

  return (
    <RoleGuard allowedRole="patient">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
        <motion.div variants={item} className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#022C22]">{t(locale, "patient.dashboard.title")}</h1>
          <div className="flex items-center gap-2">
            {isDev && (
              <NeoButton onClick={handleSeed} disabled={seeding} loading={seeding} variant="primary" size="sm">
                {t(locale, "patient.seed")}
              </NeoButton>
            )}
            <Link href="/patient/prescription/new">
              <NeoButton variant="primary" size="md">
                {t(locale, "patient.dashboard.new")}
              </NeoButton>
            </Link>
          </div>
        </motion.div>

        {activeDelivery && (
          <motion.div variants={item}>
            <GlassCard intensity="light" glow="green" hover={false}>
              <div className="flex items-center gap-4">
                <span className="w-3 h-3 rounded-full bg-[#00D4AA] animate-pulse shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#022C22]">{t(locale, "patient.dashboard.deliveries")}</p>
                  <p className="text-xs text-[#00D4AA]">{t(locale, "patient.dashboard.in_transit")}</p>
                </div>
                <StatusBadge status={activeDelivery.status} locale={locale} />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : data && data.length > 0 ? (
          <motion.div variants={item} className="space-y-3">
            {data.map((pv) => (
              <motion.div key={pv.prescription_id} whileHover={{ x: 2 }}>
                <GlassCard intensity="light" glow="green" hover={true}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#022C22]">
                          {pv.medicament || `#${pv.prescription_id.slice(0, 8)}`}
                          {pv.dosage && <span className="text-xs text-gray-500 ml-2">{pv.dosage}</span>}
                        </p>
                        {pv.doctor_name && (
                          <p className="text-xs text-gray-500 mt-0.5">{t(locale, "prescription.new.doctor_label")}: {pv.doctor_name}</p>
                        )}
                        {pv.created_at && (
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(pv.created_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <StatusBadge status={pv.status} locale={locale} />
                    </div>
                    <StatusStepper currentStatus={pv.status} />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <GlassCard intensity="light" glow="none" hover={false}>
              <div className="p-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-[#A7F3D0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-[#022C22] mb-2">{t(locale, "patient.dashboard.empty.title")}</h3>
                <p className="text-sm text-gray-500 mb-6">{t(locale, "patient.dashboard.empty.desc")}</p>
                <Link href="/patient/prescription/new">
                  <NeoButton variant="primary" size="md">
                    {t(locale, "patient.dashboard.create")}
                  </NeoButton>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <motion.div variants={item} className="pt-4">
          <NeoButton
            variant="ghost"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent("toast", { detail: { type: "warning", message: t(locale, "patient.toast.report") } }))}
          >
            {t(locale, "patient.dashboard.report")}
          </NeoButton>
        </motion.div>
      </motion.div>
    </RoleGuard>
  );
}
