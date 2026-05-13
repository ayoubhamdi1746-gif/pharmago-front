"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import StatusBadge from "@/components/StatusBadge";
import Skeleton from "@/components/Skeleton";
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
    <motion.div
      variants={staggerItem}
      className={`bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-4 transition-all duration-200 hover:border-[#00D4AA] hover:shadow-[0_0_20px_rgba(0,212,170,0.15)] ${glow || ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center text-[#00D4AA]">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-[#022C22]">{count}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </motion.div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <h1 className="text-2xl font-semibold text-[#022C22] tracking-tight">
            {t(locale, "pharmacist.queue.title")}
          </h1>
          {isDev && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 rounded-btn text-xs font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-all duration-200 disabled:opacity-60"
            >
              {seeding ? "..." : t(locale, "pharmacist.seed")}
            </button>
          )}
        </motion.div>

        <motion.div variants={staggerItem}>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-btn text-xs font-medium transition-all duration-200 active:scale-[0.96] ${
                  filter === f.value
                    ? "bg-[#00D4AA] text-white"
                    : "bg-[#F0FDF9] text-gray-500 hover:text-[#022C22] hover:border-[#00D4AA] border border-[#A7F3D0]"
                }`}
              >
                {t(locale, f.label)}
              </button>
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
                <motion.div
                  key={pv.prescription_id}
                  variants={staggerItem}
                  whileHover={{ x: 2 }}
                  className={`rounded-card shadow-soft p-4 border-l-2 transition-all duration-200 hover:border-[#00D4AA] ${
                    isHighRisk
                      ? "bg-[#FFF0F0] border border-[#FF4D6D]/30 border-l-[#FF4D6D] hover:shadow-[0_0_20px_rgba(255,77,109,0.15)]"
                      : pv.status === "VERIFIED"
                      ? "bg-[#F0FDF9] border border-[#A7F3D0] border-l-[#00D4AA] hover:shadow-[0_0_20px_rgba(0,212,170,0.15)]"
                      : canVerify
                      ? "bg-[#F0FDF9] border border-[#A7F3D0] border-l-[#E69E3E] hover:shadow-[0_0_20px_rgba(0,212,170,0.15)]"
                      : "bg-[#F0FDF9] border border-[#A7F3D0] border-l-[#A7F3D0] hover:shadow-[0_0_20px_rgba(0,212,170,0.15)]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {isHighRisk && (
                          <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse shrink-0" />
                        )}
                        <span className="text-sm font-medium text-[#022C22]">
                          {pv.medicament || `#${pv.prescription_id.slice(0, 8)}`}
                        </span>
                        {pv.dosage && (
                          <span className="text-xs text-gray-500">{pv.dosage}</span>
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
                        <p className="text-xs text-gray-500 mb-0.5">
                          {pv.doctor_name}
                          {pv.doctor_phone ? ` · ${pv.doctor_phone}` : ""}
                        </p>
                      )}
                      {pv.pharmacist_license_hash && (
                        <p className="text-xs text-gray-400 mb-0.5">
                          Lic. {pv.pharmacist_license_hash.slice(0, 8)}
                        </p>
                      )}
                      {hasItems && pv.items!.map((it: PrescriptionItemDetail, idx: number) => (
                        <p key={idx} className="text-xs text-gray-500">
                          {t(locale, "pharmacist.quantity")}: {it.quantity} · {it.dose_mg} mg
                        </p>
                      ))}
                      {pv.created_at && (
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(pv.created_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => handleVerify(pv.prescription_id)}
                        disabled={!canVerify}
                        className={`px-3 py-1.5 rounded-btn text-xs font-medium transition-all duration-200 active:scale-[0.96] ${
                          canVerify
                            ? "bg-[#00D4AA] text-white hover:bg-[#009B7D]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-[#A7F3D0]"
                        }`}
                      >
                        {t(locale, "queue.verify")}
                      </button>
                      {canDispense && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <button
                            onClick={() => handleDispense(pv.prescription_id)}
                            className="px-3 py-1.5 rounded-btn text-xs font-medium bg-[#00D4AA] text-white hover:bg-[#009B7D] transition-all duration-200 active:scale-[0.96]"
                          >
                            {t(locale, "queue.dispense")}
                          </button>
                        </motion.div>
                      )}
                      {pv.status === "VERIFIED" && (
                        <button
                          onClick={() => openAssignModal(pv.prescription_id)}
                          className="px-3 py-1.5 rounded-btn text-xs font-medium bg-[#022C22] text-white hover:bg-[#0B4D3E] transition-all duration-200 active:scale-[0.96]"
                        >
                          {t(locale, "pharmacist.assignDelivery")}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <motion.div variants={staggerItem} className="text-center py-12">
                <svg className="w-24 h-24 mx-auto mb-4 text-[#A7F3D0]" fill="none" viewBox="0 0 64 64" stroke="currentColor" strokeWidth="1">
                  <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" fill="none" />
                  <path d="M20 18h24M20 26h16M20 34h24M20 42h12" stroke="currentColor" strokeLinecap="round" />
                  <circle cx="48" cy="44" r="8" stroke="currentColor" fill="none" />
                  <path d="M48 40v8M44 44h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h3 className="text-lg font-medium text-[#022C22] mb-2">{t(locale, "pharmacist.queue.title")}</h3>
                <p className="text-sm text-gray-500">{t(locale, "pharmacist.queue.empty")}</p>
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
            className="bg-white rounded-card shadow-xl p-6 w-full max-w-md mx-4 space-y-4"
          >
            <h3 className="text-lg font-semibold text-[#022C22]">{t(locale, "pharmacist.assignModal.title")}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "pharmacist.assignModal.pickup")}</label>
              <input
                type="text"
                value={pickupCoords}
                onChange={(e) => setPickupCoords(e.target.value)}
                className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                placeholder="36.8065,10.1815"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "pharmacist.assignModal.dropoff")}</label>
              <input
                type="text"
                value={encryptedDropoff}
                onChange={(e) => setEncryptedDropoff(e.target.value)}
                className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                placeholder={t(locale, "pharmacist.assignModal.dropoff_placeholder")}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-btn text-sm font-medium text-gray-500 hover:text-[#022C22] border border-[#A7F3D0] transition-colors"
              >
                {t(locale, "pharmacist.assignModal.cancel")}
              </button>
              <button
                onClick={handleAssignDelivery}
                disabled={assigningId !== null || !pickupCoords}
                className="px-4 py-2 rounded-btn text-sm font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-all duration-200 disabled:opacity-60"
              >
                {assigningId ? "..." : t(locale, "pharmacist.assignModal.confirm")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </RoleGuard>
  );
}
