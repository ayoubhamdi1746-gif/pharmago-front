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

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent?: string }) {
  const count = useCountUp(value);
  return (
    <GlassCard intensity="light" hover={true} className="bg-[#0A1628]/80">
      <div className="flex items-center gap-3 p-1">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${accent ?? "#00D4AA"}15`, color: accent ?? "#00D4AA" }}>
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

const QueueIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const FlagIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const RxIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 4.5v15M19.5 4.5v15M4.5 9h15M4.5 15h15M9 4.5h6M9 19.5h6"/></svg>;
const TruckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const ChartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour ☀️";
  if (h < 18) return "Bon après-midi 🌤️";
  return "Bonsoir 🌙";
}

function timeSince(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
    const handler = () => { const updated = localStorage.getItem("lang") as Locale | null; if (updated) setLocale(updated); };
    window.addEventListener("langchange", handler);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => { window.removeEventListener("langchange", handler); clearInterval(timer); };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["pharmacist-queue"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ prescriptions: PrescriptionVerification[] }>>("/pharmacist/queue");
      return res.data.data?.prescriptions || [];
    },
    refetchInterval: 30000,
  });

  const sorted = (data || []).sort((a, b) => {
    const order: Record<string, number> = { HIGH_RISK_PENDING: 0, PENDING: 1, VERIFIED: 2, DISPENSED: 3 };
    return (order[a.status] || 99) - (order[b.status] || 99);
  });

  const filtered = filter === "all" ? sorted : sorted.filter((p) => p.status === filter);

  const totalPrescriptions = sorted.length;
  const highRiskCount = sorted.filter((p) => p.status === "HIGH_RISK_PENDING").length;
  const verifiedCount = sorted.filter((p) => p.status === "VERIFIED").length;
  const pendingCount = sorted.filter((p) => p.status === "PENDING").length;

  const handleVerify = async (pid: string) => {
    try {
      const { getUserFromToken } = await import("@/lib/auth");
      const user = await getUserFromToken();
      await api.post(`/pharmacist/verify/${pid}`, { pharmacist_license_hash: user?.identity_id || "" });
      queryClient.invalidateQueries({ queryKey: ["pharmacist-queue"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: t(locale, "pharmacist.toast.verified") } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: t(locale, "pharmacist.toast.verify_failed") } }));
    }
  };

  const handleDispense = async (pid: string) => {
    try {
      await api.post(`/pharmacist/dispense/${pid}`, {});
      queryClient.invalidateQueries({ queryKey: ["pharmacist-queue"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: t(locale, "pharmacist.toast.dispensed") } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: t(locale, "pharmacist.toast.dispense_failed") } }));
    }
  };

  const openAssignModal = (pid: string) => { setAssignPid(pid); setPickupCoords(""); setEncryptedDropoff(""); setShowAssignModal(true); };

  const handleAssignDelivery = async () => {
    if (!assignPid) return;
    setAssigningId(assignPid);
    try {
      await api.post(`/delivery/assign/${assignPid}`, { pickup_coords: pickupCoords, encrypted_dropoff: encryptedDropoff });
      setShowAssignModal(false);
      queryClient.invalidateQueries({ queryKey: ["pharmacist-queue"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: t(locale, "pharmacist.toast.assigned") } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: t(locale, "pharmacist.toast.assign_failed") } }));
    } finally { setAssigningId(null); }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post("/dev/seed-pharmacist-queue", {});
      queryClient.invalidateQueries({ queryKey: ["pharmacist-queue"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: t(locale, "pharmacist.seed.success") } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: t(locale, "pharmacist.toast.seed_failed") } }));
    } finally { setSeeding(false); }
  };

  const quickActions = [
    { label: "Nouvelle ordonnance", icon: <RxIcon />, href: "/patient/prescription/new", color: "#00C9A7" },
    { label: "Assigner livreur", icon: <TruckIcon />, href: "#queue", color: "#60A5FA", onClick: () => document.getElementById("queue")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Voir statistiques", icon: <ChartIcon />, href: "/pharmacist/revenue", color: "#C084FC" },
  ];

  const miniData = [3, 7, 5, 9, 4, 8, 6];
  const maxD = Math.max(...miniData);
  const miniH = 32;
  const miniBars = miniData.map((v, i) => {
    const barH = (v / maxD) * miniH;
    const x = i * 18;
    return `<rect x="${x}" y="${miniH - barH}" width="12" height="${barH}" rx="2" fill="#00D4AA" opacity="${0.4 + (v / maxD) * 0.6}"/>`;
  }).join("");

  return (
    <RoleGuard allowedRole="pharmacist">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem}>
          <div className="rounded-2xl p-6" style={{ background: "rgba(10,22,40,0.8)", border: "1px solid rgba(0,201,167,0.15)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {getGreeting()} — PharmaGo Pharmacie 👋
                </h2>
                <p className="text-sm text-white/40">
                  {currentTime.toLocaleDateString("fr-TN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {currentTime.toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <div className="flex items-center gap-6 mt-4 flex-wrap">
                  {highRiskCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF4D6D]/10 border border-[#FF4D6D]/20">
                      <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse" />
                      <span className="text-sm text-[#FF4D6D] font-medium">{highRiskCount} haut risque</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E69E3E]" />
                    <span className="text-sm text-white/50">{pendingCount} en attente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00D4AA]" />
                    <span className="text-sm text-white/50">{verifiedCount} validées</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {quickActions.map((a) => (
                  a.onClick ? (
                    <button key={a.label} onClick={a.onClick}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color }}>
                      {a.icon}{a.label}
                    </button>
                  ) : (
                    <a key={a.label} href={a.href}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                      style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color }}>
                      {a.icon}{a.label}
                    </a>
                  )
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-end gap-3">
              <div className="flex-1">
                <p className="text-[10px] text-white/30 mb-2">Livraisons (7 derniers jours)</p>
                <svg width="126" height={miniH}>
                  <g dangerouslySetInnerHTML={{ __html: miniBars }} />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/30">Total ce mois</p>
                <p className="text-xl font-bold text-[#00C9A7]">{totalPrescriptions}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div id="queue" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t(locale, "pharmacist.stats.total")} value={totalPrescriptions} icon={<QueueIcon />} />
          <StatCard label={t(locale, "pharmacist.stats.highRisk")} value={highRiskCount} icon={<FlagIcon />} accent="#FF4D6D" />
          <StatCard label={t(locale, "pharmacist.stats.verified")} value={verifiedCount} icon={<CheckIcon />} />
          <StatCard label={t(locale, "pharmacist.stats.pending")} value={pendingCount} icon={<ClockIcon />} />
        </div>

        <motion.div variants={staggerItem} className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-semibold text-white tracking-tight">{t(locale, "pharmacist.queue.title")}</h1>
          {isDev && <NeoButton onClick={handleSeed} disabled={seeding} loading={seeding} variant="primary" size="sm">{t(locale, "pharmacist.seed")}</NeoButton>}
        </motion.div>

        <motion.div variants={staggerItem}>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "pharmacist.queue.all" },
              { value: "HIGH_RISK_PENDING", label: "pharmacist.queue.highRisk" },
              { value: "PENDING", label: "pharmacist.queue.pending" },
              { value: "VERIFIED", label: "pharmacist.queue.verified" },
            ].map((f) => (
              <NeoButton key={f.value} onClick={() => setFilter(f.value)} variant={filter === f.value ? "primary" : "ghost"} size="sm">
                {t(locale, f.label)}
              </NeoButton>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
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
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        {isHighRisk && <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse shrink-0" />}
                        <span className="text-sm font-medium text-white">{pv.medicament || `#${pv.prescription_id.slice(0, 8)}`}</span>
                        {pv.dosage && <span className="text-xs text-gray-400">{pv.dosage}</span>}
                        <StatusBadge status={pv.status} locale={locale} />
                        {pv.created_at && <span className="text-xs text-white/20 ml-2">{timeSince(pv.created_at)}</span>}
                      </div>
                      {isHighRisk && <p className="text-xs text-[#FF4D6D] mb-1">{t(locale, "pharmacist.requiresDoctor")}</p>}
                      {confStatus === "AWAITING" && <p className="text-xs text-[#E69E3E] mb-1">{t(locale, "pharmacist.waitingDoctor")}</p>}
                      {pv.doctor_name && <p className="text-xs text-gray-400 mb-0.5">{pv.doctor_name}{pv.doctor_phone ? ` · ${pv.doctor_phone}` : ""}</p>}
                      {hasItems && pv.items!.map((it: PrescriptionItemDetail, idx: number) => (
                        <p key={idx} className="text-xs text-gray-400">{t(locale, "pharmacist.quantity")}: {it.quantity} · {it.dose_mg} mg</p>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <NeoButton onClick={() => handleVerify(pv.prescription_id)} disabled={!canVerify} variant={canVerify ? "primary" : "ghost"} size="sm">
                        Vérifier
                      </NeoButton>
                      {canDispense && (
                        <NeoButton onClick={() => handleDispense(pv.prescription_id)} variant="primary" size="sm">
                          Délivrer
                        </NeoButton>
                      )}
                      {pv.status === "VERIFIED" && (
                        <NeoButton onClick={() => openAssignModal(pv.prescription_id)} variant="neumorphic" size="sm">
                          Assigner
                        </NeoButton>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
            {filtered.length === 0 && (
              <motion.div variants={staggerItem} className="text-center py-16 rounded-2xl" style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(0,201,167,0.15)" }}>
                <svg className="w-16 h-16 mx-auto mb-4 text-[#00D4AA]/20" fill="none" viewBox="0 0 64 64" stroke="currentColor" strokeWidth="1.5">
                  <rect x="12" y="6" width="40" height="52" rx="4" stroke="currentColor"/>
                  <path d="M20 18h24M20 28h16M20 38h24M20 48h12" stroke="currentColor" strokeLinecap="round"/>
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">Aucune ordonnance en attente 🎉</h3>
                <p className="text-sm text-gray-400">Votre file d'attente est vide pour le moment.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#050D1A]/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 space-y-4"
            style={{ border: "1px solid rgba(0,201,167,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <h3 className="text-lg font-semibold text-white">{t(locale, "pharmacist.assignModal.title")}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t(locale, "pharmacist.assignModal.pickup")}</label>
              <input type="text" value={pickupCoords} onChange={(e) => setPickupCoords(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#00D4AA]/20 bg-[#0A1628] text-white text-sm focus:outline-none focus:border-[#00D4AA] placeholder-gray-500"
                placeholder="36.8065,10.1815" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t(locale, "pharmacist.assignModal.dropoff")}</label>
              <input type="text" value={encryptedDropoff} onChange={(e) => setEncryptedDropoff(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#00D4AA]/20 bg-[#0A1628] text-white text-sm focus:outline-none focus:border-[#00D4AA] placeholder-gray-500"
                placeholder={t(locale, "pharmacist.assignModal.dropoff_placeholder")} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <NeoButton onClick={() => setShowAssignModal(false)} variant="ghost" size="md">{t(locale, "pharmacist.assignModal.cancel")}</NeoButton>
              <NeoButton onClick={handleAssignDelivery} disabled={assigningId !== null || !pickupCoords} loading={assigningId !== null} variant="primary" size="md">
                {t(locale, "pharmacist.assignModal.confirm")}
              </NeoButton>
            </div>
          </motion.div>
        </div>
      )}
    </RoleGuard>
  );
}