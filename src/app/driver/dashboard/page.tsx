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
import { useLocale } from "@/lib/useLocale";
import { t } from "@/lib/i18n";
import type { ApiResponse, DeliveryTicket } from "@/lib/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15 } } };

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return <span className="text-[#FF4D6D] font-mono">Expiré</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const color = h > 2 ? "text-[#00D4AA]" : h > 1 ? "text-[#E69E3E]" : "text-[#FF4D6D]";
  return <span className={`font-mono ${color}`}>{h}h {m}m {s}s</span>;
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.split("").concat(Array(6 - value.length).fill(""));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(cleaned);
  };
  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <input ref={inputRef} type="text" inputMode="numeric" value={value} onChange={handleChange}
        className="absolute inset-0 opacity-0 w-full h-full cursor-text" autoComplete="one-time-code" />
      <div className="flex gap-2 justify-center">
        {digits.map((d, i) => (
          <div key={i} className={`w-10 h-12 rounded-btn border-2 flex items-center justify-center text-lg font-mono font-bold transition-all duration-150 ${
            d ? "border-[#00D4AA] bg-[#0D1E32] text-white" : "border-[#00D4AA]/30 bg-[#0A1628] text-gray-500"
          } ${value.length === i ? "ring-2 ring-[#00D4AA]" : ""}`}>
            {d || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const queryClient = useQueryClient();
  const { locale } = useLocale();
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [seeding, setSeeding] = useState(false);
  const [available, setAvailable] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["driver-tickets"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ tickets: DeliveryTicket[] }>>("/driver/tickets");
      return res.data.data?.tickets || [];
    },
  });

  const handleFulfill = async (ticketId: string) => {
    const otp = otpInputs[ticketId];
    if (!otp || otp.length !== 6) return;
    try {
      await api.post(`/delivery/fulfill/${ticketId}`, { otp });
      queryClient.invalidateQueries({ queryKey: ["driver-tickets"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: t(locale, "driver.toast.success") } }));
      setOtpInputs((prev) => ({ ...prev, [ticketId]: "" }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: t(locale, "driver.toast.error") } }));
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post("/dev/seed-driver", {});
      queryClient.invalidateQueries({ queryKey: ["driver-tickets"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Seed OK" } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Seed failed" } }));
    } finally {
      setSeeding(false);
    }
  };

  const activeTickets = (data || []).filter((t) => !t.is_fulfilled);
  const history = (data || []).filter((t) => t.is_fulfilled);

  return (
    <RoleGuard allowedRole="driver">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
        <motion.div variants={item} className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Livreur</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAvailable(!available)}
              className={`flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium transition-all duration-200 ${
                available ? "bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA]/40" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${available ? "bg-[#00D4AA] animate-pulse" : "bg-gray-500"}`} />
              {available ? "Disponible" : "Indisponible"}
            </button>
            {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
              <NeoButton onClick={handleSeed} disabled={seeding} loading={seeding} variant="ghost" size="sm" className="text-gray-400">Seed</NeoButton>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-40 w-full" /><Skeleton className="h-24 w-full" /></div>
        ) : !available ? (
          <motion.div variants={item} className="text-center py-16 bg-[#0A1628]/80 rounded-card border border-gray-500/20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Mode indisponible</h3>
            <p className="text-sm text-gray-400">Vous ne recevrez pas de nouvelles livraisons.</p>
            <button onClick={() => setAvailable(true)} className="mt-4 px-5 py-2 rounded-btn text-sm font-medium bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30 hover:bg-[#00D4AA]/20">
              Devenir disponible
            </button>
          </motion.div>
        ) : activeTickets.length > 0 ? (
          <>
            <motion.div variants={item}>
              <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Livraisons assignées ({activeTickets.length})
              </h2>
              <div className="space-y-3">
                {activeTickets.map((ticket) => (
                  <GlassCard key={ticket.id} intensity="light" glow="green" hover={true} className="bg-[#0A1628]/80 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-mono text-white">#{ticket.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
                          Expire dans <CountdownTimer expiresAt={ticket.expires_at} />
                        </p>
                      </div>
                      <StatusBadge status="assigned" locale={locale} />
                    </div>
                    <div className="bg-[#0D1E32] rounded-btn p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Point de récupération</p>
                      <p className="text-sm text-white">{ticket.pickup_coords}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wide text-center">Code OTP du patient</p>
                      <OtpInput value={otpInputs[ticket.id] || ""} onChange={(v) => setOtpInputs((prev) => ({ ...prev, [ticket.id]: v }))} />
                      <div className="flex gap-3">
                        <NeoButton onClick={() => handleFulfill(ticket.id)}
                          disabled={(otpInputs[ticket.id]?.length || 0) !== 6}
                          variant="primary" size="md" className="flex-1 text-white">
                          Confirmer la livraison
                        </NeoButton>
                        <NeoButton onClick={() => window.dispatchEvent(new CustomEvent("toast", { detail: { type: "warning", message: "Problème signalé" } }))}
                          variant="ghost" size="md" className="text-red-400">
                          Signaler un problème
                        </NeoButton>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
            {history.length > 0 && (
              <motion.div variants={item}>
                <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Historique</h2>
                <div className="space-y-2">
                  {history.map((t) => (
                    <GlassCard key={t.id} intensity="light" glow="none" hover={false} className="bg-[#0A1628]/80 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-gray-400">#{t.id.slice(0, 8)}</span>
                        <StatusBadge status="delivered" locale={locale} />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={item} className="text-center py-16 bg-[#0A1628]/80 rounded-card border border-[#00D4AA]/20">
            <svg className="w-16 h-16 mx-auto mb-4 text-[#00D4AA]/30" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth="1.2">
              <circle cx="40" cy="40" r="28" stroke="currentColor" fill="none" strokeDasharray="4 4"/>
              <path d="M28 42l8 8 16-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Aucune livraison assignée 🎉</h3>
            <p className="text-sm text-gray-400">Vous êtes prêt. Les nouvelles commandes apparaîtront ici.</p>
          </motion.div>
        )}
      </motion.div>
    </RoleGuard>
  );
}