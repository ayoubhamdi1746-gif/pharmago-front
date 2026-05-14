"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import Skeleton from "@/components/Skeleton";
import Modal from "@/components/Modal";
import GlassCard from "@/components/ui/GlassCard";
import NeoButton from "@/components/ui/NeoButton";
import api from "@/lib/api";
import type { ApiResponse, VettedDriver, DashboardStats, RevenueData, Subscription as SubType } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeInOut" as const } },
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <GlassCard intensity="light" glow="green" hover={true} className={className}>
      {children}
    </GlassCard>
  );
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ref.current = Math.round(eased * target * 100) / 100;
      setValue(ref.current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}

function RevenueCount({ target }: { target: number }) {
  const count = useCountUp(target);
  return <p className="text-5xl font-bold">{count.toFixed(2)} TND</p>;
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const count = useCountUp(value);
  return (
    <motion.div variants={item} className={`bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-4 transition-all duration-200 hover:border-[#00D4AA] hover:shadow-[0_0_20px_rgba(0,212,170,0.15)]`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center text-[#00D4AA]">
          {icon}
        </div>
        <div>
          <p className={`text-5xl font-bold ${color}`}>{count}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const FlagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { locale } = useLocale();
  const [showRegister, setShowRegister] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subPharmacyName, setSubPharmacyName] = useState("");
  const [subPharmacyId, setSubPharmacyId] = useState("");
  const [subPlan, setSubPlan] = useState("STARTER");
  const [driverId, setDriverId] = useState("");
  const [suspendHash, setSuspendHash] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardStats>>("/admin/stats");
      return res.data.data;
    },
  });

  const { data: revenue } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<RevenueData>>("/admin/revenue");
      return res.data.data;
    },
  });

  const { data: subs } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ subscriptions: SubType[] }>>("/admin/subscriptions");
      return res.data.data?.subscriptions || [];
    },
  });

  const { data: drivers, isLoading } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ drivers: VettedDriver[] }>>("/admin/drivers");
      return res.data.data?.drivers || [];
    },
  });

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/subscriptions", {
        pharmacy_name: subPharmacyName,
        pharmacy_id: subPharmacyId || "00000000-0000-0000-0000-000000000001",
        plan: subPlan,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-revenue"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "admin.toast.subscription_created") } })
      );
      setSubPharmacyName("");
      setSubPharmacyId("");
      setSubPlan("STARTER");
      setShowSubForm(false);
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "admin.toast.subscription_failed") } })
      );
    }
  };

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/drivers", {
        driver_id: driverId,
        pharmacy_id: "00000000-0000-0000-0000-000000000001",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "admin.toast.driver_registered") } })
      );
      setDriverId("");
      setShowRegister(false);
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "admin.toast.registration_failed") } })
      );
    }
  };

  const handleSuspend = async () => {
    if (!suspendHash) return;
    try {
      await api.patch(`/admin/drivers/${suspendHash}/suspend`, {});
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "admin.toast.driver_suspended") } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "admin.billing.suspension_error") } })
      );
    } finally {
      setSuspendHash(null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post("/dev/seed-users", {});
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-revenue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: t(locale, "admin.toast.seeded") } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "admin.toast.seed_failed") } })
      );
    } finally {
      setSeeding(false);
    }
  };

  const getLicenseColor = (expiresAt: string) => {
    const days = (new Date(expiresAt).getTime() - Date.now()) / 86400000;
    if (days > 30) return "text-[#00C853]";
    if (days > 0) return "text-[#E69E3E]";
    return "text-[#FF4D6D]";
  };

  return (
    <RoleGuard allowedRole="admin">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={item} className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#022C22]">
            {t(locale, "admin.title")}
          </h1>
          <div className="flex items-center gap-2">
            {isDev && (
              <NeoButton onClick={handleSeed} disabled={seeding} loading={seeding} variant="primary" size="sm">
                {t(locale, "admin.seed")}
              </NeoButton>
            )}
            <NeoButton onClick={() => setShowRegister(true)} variant="primary" size="md">
              {t(locale, "admin.register_driver")}
            </NeoButton>
          </div>
        </motion.div>

        {/* Platform revenue banner — prominent at top */}
        {revenue && (
          <motion.div variants={item} className="bg-gradient-to-r from-[#00D4AA] to-[#009B7D] rounded-card p-6 text-white shadow-[0_8px_30px_rgba(0,212,170,0.3)]">
            <p className="text-sm opacity-80 mb-1">{t(locale, "admin.billing.banner")}</p>
            <RevenueCount target={(revenue.mrr_tnd ?? 0) + (revenue.commissions_tnd ?? 0)} />
            <div className="flex gap-6 mt-2 text-sm opacity-80">
              <span>MRR: {revenue.mrr_tnd ?? 0} TND</span>
              <span>Commissions: {revenue.commissions_tnd ?? 0} TND</span>
              <span>Net: {revenue.net_profit ?? 0} TND</span>
            </div>
          </motion.div>
        )}

        <motion.div variants={item} className="grid grid-cols-3 gap-4">
          <StatCard label={t(locale, "admin.stats.deliveries")} value={stats?.total_deliveries_today ?? 0} icon={<TruckIcon />} color="text-[#00D4AA]" />
          <StatCard label={t(locale, "admin.stats.flagged")} value={stats?.flagged_prescriptions ?? 0} icon={<FlagIcon />} color="text-[#FF4D6D]" />
          <StatCard label={t(locale, "admin.stats.drivers")} value={stats?.active_drivers ?? 0} icon={<UsersIcon />} color="text-[#00C853]" />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <NeoButton onClick={() => setShowRegister(true)} variant="primary" size="md" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            {t(locale, "admin.register_driver")}
          </NeoButton>
          <NeoButton onClick={() => setShowSubForm(true)} variant="neumorphic" size="md" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            {t(locale, "admin.billing.new")}
          </NeoButton>
          <Link href="/admin/payouts"
            className="flex items-center gap-2 px-4 py-3 rounded-btn text-sm font-medium text-[#022C22] bg-[#F0FDF9] border border-[#A7F3D0] hover:border-[#00D4AA] transition-all duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {t(locale, "admin.payouts.title")}
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#022C22]">{t(locale, "admin.billing.title")}</h2>
            <NeoButton onClick={() => setShowSubForm(true)} variant="primary" size="md">
              {t(locale, "admin.billing.new")}
            </NeoButton>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.billing.mrr")}</p>
              <p className="text-5xl font-bold text-[#00D4AA]">{revenue?.mrr_tnd ?? 0} TND</p>
            </Card>
            <Card>
              <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.billing.commissions")}</p>
              <p className="text-5xl font-bold text-[#E69E3E]">{revenue?.commissions_tnd ?? 0} TND</p>
            </Card>
            <Card>
              <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.billing.pharmacy_earnings")}</p>
              <p className="text-5xl font-bold text-[#00C853]">{revenue?.total_pharmacy_earnings ?? 0} TND</p>
            </Card>
            <Card>
              <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.billing.driver_payouts")}</p>
              <p className="text-5xl font-bold text-[#FF4D6D]">{revenue?.total_driver_payouts ?? 0} TND</p>
            </Card>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card>
              <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.billing.active_subs")}</p>
              <p className="text-5xl font-bold text-[#00C853]">{revenue?.active_subscriptions ?? 0}</p>
            </Card>
            <Card>
              <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.billing.deliveries_month")}</p>
              <p className="text-5xl font-bold text-[#022C22]">{revenue?.deliveries_this_month ?? 0}</p>
            </Card>
            <Card>
              <p className="text-xs text-[#6B7280] mb-1">{t(locale, "admin.billing.net_profit")}</p>
              <p className="text-5xl font-bold text-[#022C22]">{revenue?.net_profit ?? 0} TND</p>
            </Card>
          </div>

          {revenue?.revenue_history && revenue.revenue_history.length > 0 && (
            <Card className="mb-4">
              <p className="text-sm font-semibold text-[#022C22] mb-3">{t(locale, "admin.billing.revenue_chart")}</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenue.revenue_history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #A7F3D0" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="mrr" name={t(locale, "admin.billing.mrr")} fill="#00D4AA" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#6B7280' }} />
                  <Bar dataKey="commissions" name={t(locale, "admin.billing.commissions")} fill="#E69E3E" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#6B7280' }} />
                  <Bar dataKey="net" name={t(locale, "admin.billing.net_profit")} fill="#022C22" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#6B7280' }} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
          {subs && subs.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 mb-2">
                {t(locale, "admin.billing.top_plan")}<span className="text-[#00D4AA] font-semibold">{revenue?.top_plan || "N/A"}</span>
              </p>
              {subs.map((s) => (
                <Card key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#022C22]">{s.pharmacy_name}</p>
                    <p className="text-xs text-gray-500">
                      {s.plan} &middot; {s.price_tnd} TND/mo &middot;
                      {s.is_active ? (
                        <span className="text-[#00C853]"> {t(locale, "admin.status.active")}</span>
                      ) : (
                        <span className="text-[#FF4D6D]"> {t(locale, "admin.status.inactive")}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{s.delivery_count_this_month}{s.delivery_limit != null ? `/${s.delivery_limit}` : ""} {t(locale, "admin.billing.deliveries")}</p>
                    <p>{t(locale, "admin.billing.expires")}{new Date(s.expires_at).toLocaleDateString()}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <motion.div variants={item}>
            <h2 className="text-lg font-semibold text-[#022C22] mb-3">
              {t(locale, "admin.drivers.title")}
            </h2>
            <div className="space-y-2">
              {(drivers || []).map((d) => (
                <Card key={d.driver_token_hash} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#022C22] font-mono">
                      {d.driver_token_hash.slice(0, 16)}...
                    </p>
                    <p className={`text-xs mt-0.5 ${getLicenseColor(d.license_expires_at)}`}>
                      {t(locale, "admin.drivers.license")}{new Date(d.license_expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        d.is_active ? "bg-[#00C853]" : "bg-gray-300"
                      }`}
                    />
                    <NeoButton
                      onClick={() => setSuspendHash(d.driver_token_hash)}
                      disabled={!d.is_active}
                      variant="ghost"
                      size="sm"
                    >
                      {t(locale, "admin.drivers.suspend")}
                    </NeoButton>
                  </div>
                </Card>
              ))}
              {(drivers || []).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t(locale, "admin.drivers.empty")}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {showRegister && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowRegister(false)} />
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handleRegisterDriver}
              className="relative bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-6 max-w-md w-full space-y-4"
            >
              <h3 className="text-lg font-semibold text-[#022C22]">
                {t(locale, "admin.register.title")}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t(locale, "admin.register.id_label")}
                </label>
                <input
                  type="text"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                  placeholder={t(locale, "admin.register.id_placeholder")}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <NeoButton onClick={() => setShowRegister(false)} variant="ghost" size="md">
                  {t(locale, "admin.register.cancel")}
                </NeoButton>
                <NeoButton type="submit" variant="primary" size="md">
                  {t(locale, "admin.register.submit")}
                </NeoButton>
              </div>
            </motion.form>
          </div>
        )}

        {showSubForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowSubForm(false)} />
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handleCreateSubscription}
              className="relative bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-6 max-w-md w-full space-y-4"
            >
              <h3 className="text-lg font-semibold text-[#022C22]">{t(locale, "admin.subscription.title")}</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "admin.subscription.name_label")}</label>
                <input
                  type="text"
                  value={subPharmacyName}
                  onChange={(e) => setSubPharmacyName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "admin.subscription.id_label")}</label>
                <input
                  type="text"
                  value={subPharmacyId}
                  onChange={(e) => setSubPharmacyId(e.target.value)}
                  placeholder={t(locale, "admin.subscription.id_placeholder")}
                  className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "admin.subscription.plan_label")}</label>
                <select
                  value={subPlan}
                  onChange={(e) => setSubPlan(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                >
                  <option value="STARTER">{t(locale, "admin.subscription.starter")}</option>
                  <option value="PRO">{t(locale, "admin.subscription.pro")}</option>
                  <option value="ENTERPRISE">{t(locale, "admin.subscription.enterprise")}</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <NeoButton onClick={() => setShowSubForm(false)} variant="ghost" size="md">
                  {t(locale, "admin.subscription.cancel")}
                </NeoButton>
                <NeoButton type="submit" variant="primary" size="md">
                  {t(locale, "admin.subscription.create")}
                </NeoButton>
              </div>
            </motion.form>
          </div>
        )}

        <Modal
          open={!!suspendHash}
          onClose={() => setSuspendHash(null)}
          onConfirm={handleSuspend}
          title={t(locale, "admin.modal.suspend_title")}
          message={t(locale, "admin.modal.suspend_message")}
          confirmLabel={t(locale, "admin.modal.suspend_confirm")}
          variant="danger"
        />
      </motion.div>
    </RoleGuard>
  );
}
