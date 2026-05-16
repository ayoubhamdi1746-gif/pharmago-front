"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import StatusBadge from "@/components/StatusBadge";
import Skeleton from "@/components/Skeleton";
import GlassCard from "@/components/ui/GlassCard";
import NeoButton from "@/components/ui/NeoButton";
import api from "@/lib/api";
import { useLocale } from "@/lib/useLocale";
import { t } from "@/lib/i18n";
import type { ApiResponse, PrescriptionVerification } from "@/lib/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeInOut" as const } } };

function PulseRing({ color = "#00C9A7" }: { color?: string }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <span className="absolute w-full h-full rounded-full animate-ping opacity-20" style={{ background: color }} />
      <span className="relative w-2.5 h-2.5 rounded-full" style={{ background: color }} />
    </div>
  );
}

function StepCircle({ done, current, color = "#00C9A7" }: { done: boolean; current: boolean; color?: string }) {
  if (done) return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: color }}>
      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
  if (current) return (
    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: color }}>
      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
    </div>
  );
  return <div className="w-6 h-6 rounded-full border-2 border-white/20 shrink-0" />;
}

function StatusStepper({ currentStatus, steps }: { currentStatus: string; steps: { key: string; label: string; icon: React.ReactNode }[] }) {
  const currentIdx = steps.findIndex((s) => s.key === currentStatus);
  return (
    <div className="flex items-center gap-0 relative">
      <div className="absolute top-3 left-0 right-0 h-0.5 bg-white/10" style={{ zIndex: 0 }} />
      <div className="absolute top-3 left-0 h-0.5 transition-all duration-500" style={{ width: `${Math.min(100, (currentIdx / (steps.length - 1)) * 100)}%`, background: "linear-gradient(90deg, #00C9A7, #00E5FF)", zIndex: 1 }} />
      {steps.map((step, i) => (
        <div key={step.key} className="flex flex-col items-center relative" style={{ zIndex: 2 }}>
          <div className="mb-1.5">{step.icon}</div>
          <StepCircle done={i < currentIdx} current={i === currentIdx} />
          <span className={`text-[10px] mt-1.5 whitespace-nowrap ${i <= currentIdx ? "text-[#00C9A7] font-medium" : "text-white/30"}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

const RxIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 4.5v15M19.5 4.5v15M4.5 9h15M4.5 15h15"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TruckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const HomeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default function PatientDashboard() {
  const queryClient = useQueryClient();
  const { locale } = useLocale();
  const [seeding, setSeeding] = useState(false);

  const statusSteps = [
    { key: "PENDING", label: "Reçue", icon: <RxIcon /> },
    { key: "HIGH_RISK_PENDING", label: "Vérification", icon: <CheckIcon /> },
    { key: "VERIFIED", label: "Prête", icon: <CheckIcon /> },
    { key: "DISPENSED", label: "Livrée", icon: <HomeIcon /> },
  ];

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
      const res = await api.get<ApiResponse<{ deliveries: { ticket_id: string; status: string }[] }>>("/patient/my/deliveries");
      return res.data.data?.deliveries || [];
    },
  });

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post("/dev/seed-patient", {});
      queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: t(locale, "patient.toast.seeded") } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: t(locale, "patient.toast.seed_failed") } }));
    } finally { setSeeding(false); }
  };

  const activeDelivery = (deliveries || []).find((d) => d.status === "in_transit");
  const inProgress = (data || []).filter((p) => p.status !== "DISPENSED");
  const history = (data || []).filter((p) => p.status === "DISPENSED");

  return (
    <RoleGuard allowedRole="patient">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
        <motion.div variants={item} className="text-center pt-8">
          <p className="text-white/40 text-sm mb-2">
            {new Date().toLocaleDateString("fr-TN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl font-semibold text-white mb-2">Bonjour 👋</h1>
          <p className="text-sm text-[#64748B] mb-10">Vos médicaments, livrés en toute sécurité</p>

          <Link
            href="/patient/prescription/new"
            className="inline-flex items-center gap-3 px-12 py-5 rounded-full text-lg font-bold bg-[#00D4AA] text-white hover:bg-[#009B7D] transition-all shadow-[0_8px_30px_rgba(0,212,170,0.4)] active:scale-[0.98]"
            style={{ boxShadow: "0 0 40px rgba(0,201,167,0.3)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Nouvelle ordonnance +
          </Link>
        </motion.div>

        {activeDelivery && (
          <motion.div variants={item}>
            <div className="rounded-2xl p-5" style={{ background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)" }}>
              <div className="flex items-center gap-3 mb-3">
                <PulseRing />
                <span className="text-sm font-semibold text-white">Livraison en cours</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#00C9A7]">
                <div className="flex items-center gap-1.5"><TruckIcon /><span>En route</span></div>
                <StatusBadge status="in_transit" locale={locale} />
              </div>
            </div>
          </motion.div>
        )}

        {inProgress.length > 0 && (
          <motion.div variants={item}>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">En cours ({inProgress.length})</h2>
            <div className="space-y-3">
              {inProgress.map((pv) => (
                <GlassCard key={pv.prescription_id} intensity="light" glow="green" hover={true} className="bg-[#0A1628]/80">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{pv.medicament || `#${pv.prescription_id.slice(0, 8)}`}</p>
                        {pv.doctor_name && <p className="text-xs text-white/40 mt-0.5">{pv.doctor_name}</p>}
                        {pv.created_at && <p className="text-[10px] text-white/20 mt-1">{new Date(pv.created_at).toLocaleDateString("fr-TN")}</p>}
                      </div>
                      <StatusBadge status={pv.status} locale={locale} />
                    </div>
                    <StatusStepper currentStatus={pv.status} steps={statusSteps} />
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
        ) : history.length > 0 && (
          <motion.div variants={item}>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Historique</h2>
            <div className="space-y-2">
              {history.map((pv) => (
                <GlassCard key={pv.prescription_id} intensity="light" glow="none" hover={false} className="bg-[#0A1628]/80 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00D4AA]/10 flex items-center justify-center"><RxIcon /></div>
                      <div>
                        <p className="text-sm text-white/60">{pv.medicament || `#${pv.prescription_id.slice(0, 8)}`}</p>
                        {pv.created_at && <p className="text-[10px] text-white/20">{new Date(pv.created_at).toLocaleDateString("fr-TN")}</p>}
                      </div>
                    </div>
                    <StatusBadge status={pv.status} locale={locale} />
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {!isLoading && data?.length === 0 && (
          <motion.div variants={item}>
            <GlassCard intensity="light" glow="none" hover={false} className="bg-[#0A1628]/80 py-16 text-center">
              <svg className="w-14 h-14 mx-auto mb-4 text-[#00D4AA]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">Aucune ordonnance</h3>
              <p className="text-sm text-gray-400 mb-6">Soumettez votre première ordonnance pour commencer.</p>
              <Link href="/patient/prescription/new">
                <NeoButton variant="primary" size="md" className="text-white">Créer une ordonnance</NeoButton>
              </Link>
            </GlassCard>
          </motion.div>
        )}

        <motion.div variants={item} className="flex items-center gap-3 pt-2">
          {isDev && (
            <NeoButton onClick={handleSeed} disabled={seeding} loading={seeding} variant="ghost" size="sm" className="text-[#00D4AA] border-[#00D4AA]/30">
              Seed
            </NeoButton>
          )}
          <NeoButton variant="ghost" size="sm" onClick={() => window.dispatchEvent(new CustomEvent("toast", { detail: { type: "info", message: "Rapport envoyé" } }))} className="text-gray-400 hover:text-white">
            Signaler un problème
          </NeoButton>
        </motion.div>
      </motion.div>
    </RoleGuard>
  );
}