"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import GlassCard from "@/components/ui/GlassCard";
import { useLocale } from "@/lib/useLocale";
import { t } from "@/lib/i18n";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15 } } };

export default function PatientProfile() {
  const { locale } = useLocale();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "Ahmed Mansour", email: "ahmed.mansour@email.tn", phone: "+216 XX XXX XXX" });

  const handleSave = () => {
    setEditing(false);
    window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Profil mis à jour" } }));
  };

  return (
    <RoleGuard allowedRole="patient">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-semibold text-white">Mon profil</h1>
          <p className="text-sm text-gray-400">Gérez vos informations personnelles</p>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard intensity="light" glow="none" hover={false} className="bg-[#0A1628]/80 p-6 space-y-5">
            <div className="flex items-center gap-4 pb-5 border-b border-[#00D4AA]/10">
              <div className="w-16 h-16 rounded-full bg-[#00D4AA]/20 flex items-center justify-center text-2xl font-bold text-[#00D4AA]">
                {form.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{form.name}</p>
                <p className="text-xs text-gray-400">Patient PharmaGo</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Nom complet</label>
              {editing ? (
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-btn bg-[#0D1E32] border border-[#00D4AA]/20 text-white text-sm focus:outline-none focus:border-[#00D4AA]" />
              ) : (
                <p className="text-sm text-white">{form.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              {editing ? (
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-btn bg-[#0D1E32] border border-[#00D4AA]/20 text-white text-sm focus:outline-none focus:border-[#00D4AA]" />
              ) : (
                <p className="text-sm text-white">{form.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Téléphone</label>
              {editing ? (
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-btn bg-[#0D1E32] border border-[#00D4AA]/20 text-white text-sm focus:outline-none focus:border-[#00D4AA]" />
              ) : (
                <p className="text-sm text-white">{form.phone}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              {editing ? (
                <>
                  <button onClick={handleSave}
                    className="px-5 py-2 rounded-btn text-sm font-medium bg-[#00D4AA] text-white hover:bg-[#009B7D] transition-colors">
                    Enregistrer
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="px-5 py-2 rounded-btn text-sm font-medium border border-[#00D4AA]/30 text-gray-400 hover:text-white transition-colors">
                    Annuler
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="px-5 py-2 rounded-btn text-sm font-medium border border-[#00D4AA]/30 text-[#00D4AA] hover:bg-[#00D4AA]/10 transition-colors">
                  Modifier
                </button>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <h2 className="text-lg font-semibold text-white mb-3">Historique des livraisons</h2>
          <div className="text-center py-8 bg-[#0A1628]/80 rounded-card border border-[#00D4AA]/20">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.5 2.5 2.5-2.5H7a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1h3.5a1 1 0 011-1l1.5 1.5 1.5-1.5H17a1 1 0 001-1v-1a1 1 0 011-1h1l2.5 2.5-2.5 2.5V22"/>
            </svg>
            <p className="text-sm text-gray-400">Aucun historique pour le moment.</p>
          </div>
        </motion.div>
      </motion.div>
    </RoleGuard>
  );
}