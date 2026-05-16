"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import StatusBadge from "@/components/StatusBadge";
import Skeleton from "@/components/Skeleton";
import GlassCard from "@/components/ui/GlassCard";
import NeoButton from "@/components/ui/NeoButton";
import api from "@/lib/api";
import type { ApiResponse, PrescriptionVerification, PrescriptionItemDetail } from "@/lib/types";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { t, type Locale } from "@/lib/i18n";

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ref.current = Math.round(eased * target);
      setValue(ref.current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

function StatCard({
  label,
  value,
  icon,
  glow,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  glow?: string;
}) {
  const count = useCountUp(value);
  return (
    <GlassCard intensity="light" glow={glow ? "green" : "none"} hover={true} className={`bg-[#0A1628]/80 ${glow || ""}`}>
      <div className="flex items-center gap-3 p-1">
        <div className="w-10 h-10 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center text-[#00D4AA]">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{count}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

const QueueIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const FlagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default function PharmacistDashboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [seeding, setSeeding] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignPid, setAssignPid] = useState("");
  const [pickupCoords, setPickupCoords] = useState("");
  const [encryptedDropoff, setEncryptedDropoff] = useState("");
  const [locale, setLocale] = useState<Locale>("fr");

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
    queryKey: ["pharmacist-queue"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ prescriptions: PrescriptionVerification[] }>>(
        "/pharmacist/queue"
      );
      return res.data.data?.prescriptions || [];
    },
  });

  const sorted = (data || []).sort((a, b) => {
    const order: Record<string, number> = {
      HIGH_RISK_PENDING: 0,
      PENDING: 1,
      VERIFIED: 2,
      DISPENSED: 3,
    };
    return (order[a.status] || 99) - (order[b.status] || 99);
  });

  const filtered =
    filter === "all" ? sorted : sorted.filter((p) => p.status === filter);

  const handleVerify = async (pid: string) => {
    try {
      const { getUserFromToken } = await import("@/lib/auth");
      const user = await getUserFromToken();
      await api.post(`/pharmacist/verify/${pid}`, {
        pharmacist_license_hash: user?.identity_id || "",
      });
      queryClient.invalidateQueries({ queryKey: ["pharmacist-queue"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "pharmacist.toast.verified") } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "pharmacist.toast.verify_failed") } })
      );
    }
  };

  const handleDispense = async (pid: string) => {
    try {
      await api.post(`/pharmacist/dispense/${pid}`, {});
      queryClient.invalidateQueries({ queryKey: ["pharmacist-queue"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "pharmacist.toast.dispensed") } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "pharmacist.toast.dispense_failed") } })
      );
    }
  };

  const openAssignModal = (pid: string) => {
    setAssignPid(pid);
    setPickupCoords("");
    setEncryptedDropoff("");
    setShowAssignModal(true);
  };

  const handleAssignDelivery = async () => {
    if (!assignPid) return;
    setAssigningId(assignPid);
    try {
      await api.post(`/delivery/assign/${assignPid}`, {
        pickup_coords: pickupCoords,
        encrypted_dropoff: encryptedDropoff,
      });
      setShowAssignModal(false);
      queryClient.invalidateQueries({ queryKey: ["pharmacist-queue"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "pharmacist.toast.assigned") } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "pharmacist.toast.assign_failed") } })
      );
    } finally {
      setAssigningId(null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post("/dev/seed-pharmacist-queue", {});
      queryClient.invalidateQueries({ queryKey: ["pharmacist-queue"] });
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", message: t(locale, "pharmacist.seed.success") },
        })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "pharmacist.toast.seed_failed") } })
      );
    } finally {
      setSeeding(false);
    }
  };

  const filters = [
    { value: "all", label: "pharmacist.queue.all" },
    { value: "HIGH_RISK_PENDING", label: "pharmacist.queue.highRisk" },
    { value: "PENDING", label: "pharmacist.queue.pending" },
    { value: "VERIFIED", label: "pharmacist.queue.verified" },
  ];

  const totalPrescriptions = sorted.length;
  const highRiskCount = sorted.filter((p) => p.status === "HIGH_RISK_PENDING").length;
  const verifiedCount = sorted.filter((p) => p.status === "VERIFIED").length;
  const pendingCount = sorted.filter((p) => p.status === "PENDING").length;

  return (
    <RoleGuard allowedRole="pharmacist">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={staggerItem}>
          <div className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Bonjour, PharmaGo Pharmacie 👋</h2>
              <p className="text-sm text-gray-400">{new Date().toLocaleDateString("fr-TN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E69E3E] animate-pulse" />
                  <span className="text-sm text-gray-400"><span className="text-white font-semibold">{highRiskCount}</span> ordonnances en attente</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D4AA]" />
                  <span className="text-sm text-gray-400"><span className="text-white font-semibold">{verifiedCount}</span> validées</span>
                </div>
              </div>
            </div>
            <a href="#queue" className="px-5 py-2.5 rounded-btn text-sm font-medium bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30 hover:bg-[#00D4AA]/20 transition-all duration-200 flex items-center gap-2">
              Voir la file d'attente →
            </a>
          </div>
        </motion.div>

        <div id="queue" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t(locale, "pharmacist.stats.total")} value={totalPrescriptions} icon={<QueueIcon />} />
          <StatCard
            label={t(locale, "pharmacist.stats.highRisk")}
            value={highRiskCount}
            icon={<FlagIcon />}
            glow={highRiskCount > 0 ? "shadow-[0_0_20px_rgba(255,77,109,0.15)]" : ""}
          />
          <StatCard label={t(locale, "pharmacist.stats.verified")} value={verifiedCount} icon={<CheckIcon />} />
          <StatCard label={t(locale, "pharmacist.stats.pending")} value={pendingCount} icon={<ClockIcon />} />
        </div>

        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            {t(locale, "pharmacist.queue.title")}
          </h1>
          {isDev && (
            <NeoButton onClick={handleSeed} disabled={seeding} loading={seeding} variant="primary" size="sm" className="text-white">
              {t(locale, "pharmacist.seed")}
            </NeoButton>
          )}
        </motion.div>

        <motion.div variants={staggerItem}>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <NeoButton
                key={f.value}
                onClick={() => setFilter(f.value)}
                variant={filter === f.value ? "primary" : "ghost"}
                size="sm"
              >
                {t(locale, f.label)}
              </NeoButton>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <motion.div variants={staggerItem} className="space-y-3">
            {filtered.map((pv) => {
              const isHighRisk = pv.status === "HIGH_RISK_PENDING";
              const canVerify = pv.status === "PENDING";
              const canDispense = pv.status === "VERIFIED";
              const hasItems = pv.items && pv.items.length > 0;
              const confStatus = pv.doctor_confirmation_status;
              return (
                <GlassCard
                  intensity="light"
                  glow={isHighRisk ? "red" : "green"}
                  hover={true}
                  className={`bg-[#0A1628]/80 border-l-2 ${isHighRisk ? "border-l-[#FF4D6D]" : pv.status === "VERIFIED" ? "border-l-[#00D4AA]" : canVerify ? "border-l-[#E69E3E]" : "border-l-[#00D4AA]/30"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {isHighRisk && (
                          <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse shrink-0" />
                        )}
                        <span className="text-sm font-medium text-white">
                          {pv.medicament || `#${pv.prescription_id.slice(0, 8)}`}
                        </span>
                        {pv.dosage && (
                          <span className="text-xs text-gray-400">{pv.dosage}</span>
                        )}
                        <StatusBadge status={pv.status} locale={locale} />
                      </div>
                      {isHighRisk && (
                        <p className="text-xs text-[#FF4D6D] mb-1">
                          {t(locale, "pharmacist.requiresDoctor")}
                        </p>
                      )}
                      {confStatus === "AWAITING" && (
                        <p className="text-xs text-[#E69E3E] mb-1">
                          {t(locale, "pharmacist.waitingDoctor")}
                        </p>
                      )}
                      {pv.doctor_name && (
                        <p className="text-xs text-gray-400 mb-0.5">
                          {pv.doctor_name}
                          {pv.doctor_phone ? ` · ${pv.doctor_phone}` : ""}
                        </p>
                      )}
                      {pv.pharmacist_license_hash && (
                        <p className="text-xs text-gray-500 mb-0.5">
                          Lic. {pv.pharmacist_license_hash.slice(0, 8)}
                        </p>
                      )}
                      {hasItems && pv.items!.map((it: PrescriptionItemDetail, idx: number) => (
                        <p key={idx} className="text-xs text-gray-400">
                          {t(locale, "pharmacist.quantity")}: {it.quantity} · {it.dose_mg} mg
                        </p>
                      ))}
                      {pv.created_at && (
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(pv.created_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <NeoButton
                        onClick={() => handleVerify(pv.prescription_id)}
                        disabled={!canVerify}
                        variant={canVerify ? "primary" : "ghost"}
                        size="sm"
                      >
                        {t(locale, "queue.verify")}
                      </NeoButton>
                      {canDispense && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <NeoButton
                            onClick={() => handleDispense(pv.prescription_id)}
                            variant="primary"
                            size="sm"
                          >
                            {t(locale, "queue.dispense")}
                          </NeoButton>
                        </motion.div>
                      )}
                      {pv.status === "VERIFIED" && (
                        <NeoButton
                          onClick={() => openAssignModal(pv.prescription_id)}
                          variant="neumorphic"
                          size="sm"
                        >
                          {t(locale, "pharmacist.assignDelivery")}
                        </NeoButton>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
            {filtered.length === 0 && (
              <motion.div variants={staggerItem} className="text-center py-16 bg-[#0A1628]/80 rounded-card border border-[#00D4AA]/20">
                <svg className="w-20 h-20 mx-auto mb-5 text-[#00D4AA]/30" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth="1.2">
                  <rect x="16" y="10" width="48" height="60" rx="5" stroke="currentColor" fill="none" />
                  <path d="M26 24h28M26 34h20M26 44h28M26 54h14" stroke="currentColor" strokeLinecap="round" />
                  <circle cx="55" cy="56" r="12" stroke="currentColor" fill="none" />
                  <path d="M55 50v12M49 56h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">Aucune ordonnance en attente 🎉</h3>
                <p className="text-sm text-gray-400">Votre file d'attente est vide pour le moment.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A1628]/95 backdrop-blur-xl border border-[#00D4AA]/20 rounded-card shadow-xl p-6 w-full max-w-md mx-4 space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">{t(locale, "pharmacist.assignModal.title")}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t(locale, "pharmacist.assignModal.pickup")}</label>
              <input
                type="text"
                value={pickupCoords}
                onChange={(e) => setPickupCoords(e.target.value)}
                className="w-full px-3 py-2.5 rounded-btn border border-[#00D4AA]/20 bg-[#0D1E32] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent placeholder-gray-500"
                placeholder="36.8065,10.1815"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t(locale, "pharmacist.assignModal.dropoff")}</label>
              <input
                type="text"
                value={encryptedDropoff}
                onChange={(e) => setEncryptedDropoff(e.target.value)}
                className="w-full px-3 py-2.5 rounded-btn border border-[#00D4AA]/20 bg-[#0D1E32] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent placeholder-gray-500"
                placeholder={t(locale, "pharmacist.assignModal.dropoff_placeholder")}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <NeoButton
                onClick={() => setShowAssignModal(false)}
                variant="ghost"
                size="md"
              >
                {t(locale, "pharmacist.assignModal.cancel")}
              </NeoButton>
              <NeoButton
                onClick={handleAssignDelivery}
                disabled={assigningId !== null || !pickupCoords}
                loading={assigningId !== null}
                variant="primary"
                size="md"
              >
                {t(locale, "pharmacist.assignModal.confirm")}
              </NeoButton>
            </div>
          </motion.div>
        </div>
      )}
    </RoleGuard>
  );
}
