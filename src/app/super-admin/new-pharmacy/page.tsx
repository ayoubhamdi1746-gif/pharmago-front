"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import NeoButton from "@/components/ui/NeoButton";
import api from "@/lib/api";
import { useLocale } from "@/lib/useLocale";
import { t } from "@/lib/i18n";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15 } } };

const PLANS = ["STARTER", "PRO", "ENTERPRISE"] as const;
const CITIES = ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Nabeul", "Manouba", "Ben Arous"];

export default function NewPharmacyPage() {
  const { locale } = useLocale();
  const [form, setForm] = useState({ pharmacy_name: "", responsible_name: "", phone: "", city: "", plan: "STARTER", email: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{ username: string; pharmacy_id: string } | null>(null);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register-pharmacy", form);
      setResult(res.data.data);
      setSuccess(true);
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Pharmacie créée avec succès" } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Erreur lors de la création" } }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-semibold text-white">{t(locale, "super_admin.new_pharmacy.title") || "Nouvelle pharmacie"}</h1>
          <p className="text-sm text-gray-400">{t(locale, "super_admin.new_pharmacy.subtitle") || "Créer un compte farmacia"}</p>
        </motion.div>

        <motion.div variants={item}>
          <div className="bg-[#0A1628]/80 border border-[#00D4AA]/20 rounded-card p-6 space-y-4">
            {success && result ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 rounded-full bg-[#00D4AA]/10 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-[#00D4AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Pharmacie créée !</h2>
                <div className="bg-[#0D1E32] rounded-btn p-4 text-left space-y-2">
                  <p className="text-xs text-gray-400">Username temporaire</p>
                  <p className="text-sm font-mono text-[#00D4AA]">{result.username}</p>
                  <p className="text-xs text-gray-400 mt-2">ID</p>
                  <p className="text-xs font-mono text-gray-300">{result.pharmacy_id}</p>
                </div>
                <NeoButton onClick={() => { setSuccess(false); setResult(null); setForm({ pharmacy_name: "", responsible_name: "", phone: "", city: "", plan: "STARTER", email: "" }); }} variant="primary" size="md">
                  Créer une autre
                </NeoButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t(locale, "super_admin.new_pharmacy.name") || "Nom de la pharmacie"}</label>
                    <input value={form.pharmacy_name} onChange={(e) => set("pharmacy_name", e.target.value)} required className="w-full px-3 py-2.5 rounded-btn border border-[#00D4AA]/20 bg-[#0D1E32] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] placeholder-gray-500" placeholder="Pharmacie El Amen" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t(locale, "super_admin.new_pharmacy.responsible") || "Responsable"}</label>
                    <input value={form.responsible_name} onChange={(e) => set("responsible_name", e.target.value)} required className="w-full px-3 py-2.5 rounded-btn border border-[#00D4AA]/20 bg-[#0D1E32] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] placeholder-gray-500" placeholder="Ahmed Trabelsi" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t(locale, "super_admin.new_pharmacy.email") || "Email"}</label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required className="w-full px-3 py-2.5 rounded-btn border border-[#00D4AA]/20 bg-[#0D1E32] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] placeholder-gray-500" placeholder="pharmacie@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t(locale, "super_admin.new_pharmacy.phone") || "Téléphone"}</label>
                    <input value={form.phone} onChange={(e) => set("phone", e.target.value)} required className="w-full px-3 py-2.5 rounded-btn border border-[#00D4AA]/20 bg-[#0D1E32] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] placeholder-gray-500" placeholder="+216 20 000 000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t(locale, "super_admin.new_pharmacy.city") || "Ville"}</label>
                    <select value={form.city} onChange={(e) => set("city", e.target.value)} required className="w-full px-3 py-2.5 rounded-btn border border-[#00D4AA]/20 bg-[#0D1E32] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]">
                      <option value="">Sélectionner...</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Plan</label>
                    <select value={form.plan} onChange={(e) => set("plan", e.target.value)} className="w-full px-3 py-2.5 rounded-btn border border-[#00D4AA]/20 bg-[#0D1E32] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]">
                      {PLANS.map((p) => <option key={p} value={p}>{p} — {p === "STARTER" ? "200" : p === "PRO" ? "450" : "900"} TND/mois</option>)}
                    </select>
                  </div>
                </div>
                <NeoButton type="submit" disabled={loading} loading={loading} variant="primary" size="md" className="w-full text-white">
                  {t(locale, "super_admin.new_pharmacy.submit") || "Créer la pharmacie"}
                </NeoButton>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </RoleGuard>
  );
}