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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeInOut" as const } },
};

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const { locale } = useLocale();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return <span className="text-[#FF4D6D] font-mono">{t(locale, "driver.expired_label")}</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const color = h > 2 ? "text-[#00D4AA]" : h > 1 ? "text-[#E69E3E]" : "text-[#FF4D6D]";
  return <span className={`font-mono ${color}`}>{h}h {m}m {s}s</span>;
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.split("").concat(Array(6 - value.length).fill(""));
  const handleClick = () => inputRef.current?.focus();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(cleaned);
  };
  return (
    <div className="relative" onClick={handleClick}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 w-full h-full cursor-text"
        autoComplete="one-time-code"
      />
      <div className="flex gap-2 justify-center">
        {digits.map((d, i) => (
          <div
            key={i}
            className={`w-10 h-12 rounded-btn border-2 flex items-center justify-center text-lg font-mono font-bold transition-all duration-150 ${
              d ? "border-[#00D4AA] bg-[#F0FDF9] text-[#022C22]" : "border-[#A7F3D0] bg-white text-gray-300"
            } ${value.length === i ? "ring-2 ring-[#00D4AA] border-[#00D4AA]" : ""}`}
          >
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

  const { data, isLoading } = useQuery({
    queryKey: ["driver-tickets"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ tickets: DeliveryTicket[] }>>("/driver/tickets");
      return res.data.data?.tickets || [];
    },
  });

  const activeTicket = (data || []).find((t) => !t.is_fulfilled);
  const history = (data || []).filter((t) => t.is_fulfilled);

  const handleFulfill = async (ticketId: string) => {
    const otp = otpInputs[ticketId];
    if (!otp || otp.length !== 6) return;
    try {
      await api.post(`/delivery/fulfill/${ticketId}`, { otp });
      queryClient.invalidateQueries({ queryKey: ["driver-tickets"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "driver.toast.success") } })
      );
      setOtpInputs((prev) => ({ ...prev, [ticketId]: "" }));
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "driver.toast.error") } })
      );
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post("/dev/seed-driver", {});
      queryClient.invalidateQueries({ queryKey: ["driver-tickets"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "driver.toast.seeded") } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "driver.toast.seed_failed") } })
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <RoleGuard allowedRole="driver">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
        <motion.div variants={item} className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#022C22]">{t(locale, "driver.title")}</h1>
          {isDev && (
            <NeoButton onClick={handleSeed} disabled={seeding} loading={seeding} variant="primary" size="sm">
              {t(locale, "driver.seed")}
            </NeoButton>
          )}
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            {activeTicket && (
              <motion.div variants={item}>
                <GlassCard intensity="light" glow="green" hover={false}><div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-[#00D4AA] animate-pulse" />
                      <h2 className="text-lg font-semibold text-[#022C22]">{t(locale, "driver.active")}</h2>
                    </div>
                    <StatusBadge status="assigned" locale={locale} />
                  </div>

                  <div className="bg-[#F0FDF9] rounded-btn p-4 space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{t(locale, "driver.ref")}</p>
                    <p className="text-sm font-mono text-[#022C22]">{activeTicket.id}</p>
                  </div>

                  <div className="bg-[#F0FDF9] rounded-btn p-4 space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{t(locale, "driver.pickup")}</p>
                    <p className="text-sm font-medium text-[#022C22]">{activeTicket.pickup_coords}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t(locale, "driver.expires")}</span>
                    <CountdownTimer expiresAt={activeTicket.expires_at} />
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{t(locale, "driver.otp_placeholder")}</p>
                    <OtpInput
                      value={otpInputs[activeTicket.id] || ""}
                      onChange={(v) => setOtpInputs((prev) => ({ ...prev, [activeTicket.id]: v }))}
                    />
                    <NeoButton
                      onClick={() => handleFulfill(activeTicket.id)}
                      disabled={(otpInputs[activeTicket.id]?.length || 0) !== 6}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      {t(locale, "driver.deliver")}
                    </NeoButton>
                  </div>
                </div>
                </GlassCard>
              </motion.div>
            )}

            {history.length > 0 && (
              <motion.div variants={item}>
                <h2 className="text-lg font-semibold text-[#022C22] mb-3">{t(locale, "driver.history")}</h2>
                <div className="space-y-2">
                  {history.map((t) => (
                    <GlassCard key={t.id} intensity="light" glow="green" hover={false}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-mono">#{t.id.slice(0, 8)}</span>
                        <StatusBadge status="delivered" locale={locale} />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {!activeTicket && history.length === 0 && (
              <motion.div variants={item} className="text-center py-12">
                <svg className="w-28 h-28 mx-auto mb-4 text-[#A7F3D0]" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth="1.2">
                  <rect x="18" y="38" width="36" height="14" rx="3" stroke="currentColor" fill="#F0FDF9" />
                  <path d="M18 42l6-16h24l8 16" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M24 26l2-6h16" stroke="currentColor" fill="none" strokeLinecap="round" />
                  <circle cx="28" cy="56" r="6" stroke="currentColor" fill="white" />
                  <circle cx="52" cy="56" r="6" stroke="currentColor" fill="white" />
                  <circle cx="28" cy="56" r="2" stroke="currentColor" fill="none" />
                  <circle cx="52" cy="56" r="2" stroke="currentColor" fill="none" />
                  <path d="M42 38v-9h8" stroke="currentColor" strokeLinecap="round" />
                  <rect x="46" y="30" width="3" height="2" rx="0.5" stroke="currentColor" />
                  <path d="M14 44h-2a2 2 0 01-2-2v-2" stroke="currentColor" strokeLinecap="round" />
                  <path d="M58 44h2a2 2 0 002-2v-2" stroke="currentColor" strokeLinecap="round" />
                </svg>
                <h3 className="text-lg font-medium text-[#022C22] mb-2">{t(locale, "driver.empty")}</h3>
                <p className="text-sm text-gray-500">{t(locale, "driver.empty_sub")}</p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </RoleGuard>
  );
}
