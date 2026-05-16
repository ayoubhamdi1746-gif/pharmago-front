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
          <div key={i} className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-mono font-bold transition-all duration-150 ${
            d ? "border-[#00D4AA] bg-[#0D1E32] text-white" : "border-[#00D4AA]/30 bg-[#0A1628] text-gray-500"
          } ${value.length === i ? "ring-2 ring-[#00D4AA]/50" : ""}`}>
            {d || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

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
    refetchInterval: available ? 15000 : 60000,
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
    } finally { setSeeding(false); }
  };

  const tickets = data || [];
  const activeTickets = tickets.filter((t) => !t.is_fulfilled);
  const history = tickets.filter((t) => t.is_fulfilled);

  const completedToday = history.filter((t) => {
    const ts = (t as unknown as Record<string, unknown>).fulfilled_at as string | null | undefined;
    if (!ts) return false;
    const d = new Date(ts);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const todayEarnings = completedToday * 8;

  return (
    <RoleGuard allowedRole="driver">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
        <motion.div variants={item} className="space-y-4">
          <h1 className="text-xl font-semibold text-white">Dashboard Livreur</h1>
          <button
            onClick={() => setAvailable(!available)}
            className={`w-full py-4 rounded-2xl text-base font-semibold transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-3 ${
              available
                ? "bg-[#00D4AA] text-white shadow-[0_8px_30px_rgba(0,201,167,0.4)]"
                : "bg-white/5 text-gray-400 border border-white/10"
            }`}
          >
            {available ? (
              <>
                <span className="relative flex w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full w-3 h-3 bg-white" />
                </span>
                Disponible
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-gray-500" />
                Indisponible
              </>
            )}
          </button>
          {available && (
            <p className="text-xs text-center text-[#00D4AA]/60">Les pharmacies peuvent vous assigner des livraisons</p>
          )}
        </motion.div>

        {completedToday > 0 && (
          <motion.div variants={item}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Livraisons aujourd'hui", value: completedToday },
                { label: "Gagné aujourd'hui", value: `${todayEarnings} TND` },
                { label: "Ce mois", value: `${history.length}` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: "rgba(10,22,40,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/30 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /></div>
        ) : !available ? (
          <motion.div variants={item} className="text-center py-16 rounded-2xl" style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Mode indisponible</h3>
            <p className="text-sm text-gray-400 mb-4">Vous ne recevrez pas de nouvelles livraisons.</p>
            <button onClick={() => setAvailable(true)} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#00D4AA] text-white hover:bg-[#059669] transition-all">
              Devenir disponible
            </button>
          </motion.div>
        ) : activeTickets.length > 0 ? (
          <>
            <motion.div variants={item}>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
                Livraisons assignées ({activeTickets.length})
              </h2>
              <div className="space-y-3">
                {activeTickets.map((ticket) => (
                  <GlassCard key={ticket.id} intensity="light" glow="green" hover={false} className="bg-[#0A1628]/80 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-mono text-white">Ticket #{ticket.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
                          Expire dans <CountdownTimer expiresAt={ticket.expires_at} />
                        </p>
                      </div>
                      <StatusBadge status="assigned" locale={locale} />
                    </div>

                    <div className="rounded-xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-[10px] text-white/30 mb-1.5">Point de récupération</p>
                      <p className="text-sm text-white font-mono">{ticket.pickup_coords}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-[11px] text-white/40 uppercase tracking-widest mb-3">Entrez le code OTP du patient</p>
                        <OtpInput value={otpInputs[ticket.id] || ""} onChange={(v) => setOtpInputs((prev) => ({ ...prev, [ticket.id]: v }))} />
                      </div>
                      <div className="flex gap-3">
                        <NeoButton onClick={() => handleFulfill(ticket.id)}
                          disabled={(otpInputs[ticket.id]?.length || 0) !== 6}
                          variant="primary" size="md" className="flex-1 text-white font-semibold">
                          Confirmer livraison
                        </NeoButton>
                        <NeoButton onClick={() => window.dispatchEvent(new CustomEvent("toast", { detail: { type: "warning", message: "Problème signalé" } }))}
                          variant="ghost" size="md" className="text-[#FF4D6D]">
                          Signaler
                        </NeoButton>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>

            {history.length > 0 && (
              <motion.div variants={item}>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
                  Historique ({history.length} livraisons)
                </h2>
                <div className="space-y-2">
                  {history.map((ticket) => {
                    const ts = (ticket as unknown as Record<string, unknown>).fulfilled_at as string | null | undefined;
                    const dateStr = ts ? new Date(ts).toLocaleDateString("fr-TN") : "";
                    return (
                      <GlassCard key={ticket.id} intensity="light" glow="none" hover={false} className="bg-[#0A1628]/80 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#00D4AA]/10 flex items-center justify-center text-[#00D4A7]">✓</div>
                            <div>
                              <span className="text-sm font-mono text-white/60">#{ticket.id.slice(0, 8)}</span>
                              {dateStr && <span className="text-[10px] text-white/20 ml-2">{dateStr}</span>}
                            </div>
                          </div>
                          <span className="text-xs text-emerald-400">Complété</span>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={item} className="text-center py-16 rounded-2xl" style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(0,201,167,0.15)" }}>
            <svg className="w-12 h-12 mx-auto mb-4 text-[#00D4AA]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Aucune livraison 🎉</h3>
            <p className="text-sm text-gray-400">Les nouvelles commandes apparaîtront ici.</p>
          </motion.div>
        )}

        <motion.div variants={item} className="flex items-center gap-3 pt-2">
          {isDev && <NeoButton onClick={handleSeed} disabled={seeding} loading={seeding} variant="ghost" size="sm" className="text-gray-400">Seed</NeoButton>}
        </motion.div>
      </motion.div>
    </RoleGuard>
  );
}