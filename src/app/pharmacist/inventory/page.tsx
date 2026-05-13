"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import { t, type Locale } from "@/lib/i18n";

interface Medication {
  id: string;
  pharmacy_id: string;
  medication_name: string;
  dosage: string;
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

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
    <div className={`bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-4 transition-all duration-200 hover:border-[#00D4AA] ${className}`}>
      {children}
    </div>
  );
}

export default function PharmacistInventory() {
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>("fr");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [stock, setStock] = useState("");
  const [available, setAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  const { data: medications, isLoading } = useQuery({
    queryKey: ["pharmacist-inventory"],
    queryFn: async () => {
      const res = await api.get<{ status: string; data: { medications: Medication[] } }>("/pharmacist/inventory");
      return res.data.data?.medications || [];
    },
  });

  const resetForm = () => {
    setName("");
    setDosage("");
    setStock("");
    setAvailable(true);
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (med: Medication) => {
    setName(med.medication_name);
    setDosage(med.dosage);
    setStock(String(med.stock_quantity));
    setAvailable(med.is_available);
    setEditId(med.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await api.patch(`/pharmacist/inventory/${editId}`, {
          medication_name: name,
          dosage,
          stock_quantity: parseInt(stock) || 0,
          is_available: available,
        });
      } else {
        await api.post("/pharmacist/inventory", {
          pharmacy_id: "00000000-0000-0000-0000-000000000001",
          medication_name: name,
          dosage,
          stock_quantity: parseInt(stock) || 0,
          is_available: available,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["pharmacist-inventory"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: editId ? t(locale, "pharmacist.inventory.updated") : t(locale, "pharmacist.inventory.added") } })
      );
      resetForm();
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: t(locale, "pharmacist.inventory.error") } })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockMeds = (medications || []).filter((m) => m.stock_quantity < 10);

  return (
    <RoleGuard allowedRole="pharmacist">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={item} className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#022C22]">
            {t(locale, "pharmacist.inventory.title")}
          </h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 rounded-btn text-sm font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-colors duration-200"
          >
            {t(locale, "pharmacist.inventory.add")}
          </button>
        </motion.div>

        {lowStockMeds.length > 0 && (
          <motion.div variants={item}>
            <Card className="border-[#FF4D6D]">
              <p className="text-sm font-medium text-[#FF4D6D] mb-2">
                {t(locale, "pharmacist.inventory.low_stock_alert")}
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockMeds.map((m) => (
                  <span key={m.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FF4D6D]/10 text-[#FF4D6D]">
                    {m.medication_name} ({m.stock_quantity})
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div variants={item}>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-card animate-pulse" />
              ))}
            </div>
          ) : (medications || []).length === 0 ? (
            <Card>
              <p className="text-sm text-gray-500 text-center py-4">{t(locale, "pharmacist.inventory.empty")}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(medications || []).map((m) => (
                <div key={m.id} onClick={() => openEdit(m)} className="cursor-pointer">
                <Card className="hover:shadow-[0_0_20px_rgba(0,212,170,0.15)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#022C22]">{m.medication_name}</p>
                      <p className="text-xs text-gray-500">{m.dosage}</p>
                    </div>
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded ${
                        m.stock_quantity < 10 ? "bg-[#FF4D6D]/10 text-[#FF4D6D]" : "bg-[#00D4AA]/10 text-[#00D4AA]"
                      }`}
                    >
                      {m.stock_quantity}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${m.is_available ? "bg-[#00C853]" : "bg-gray-300"}`} />
                    <span className="text-xs text-gray-500">
                      {m.is_available ? t(locale, "pharmacist.inventory.available") : t(locale, "pharmacist.inventory.unavailable")}
                    </span>
                  </div>
                </Card>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={resetForm} />
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handleSubmit}
              className="relative bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-6 max-w-md w-full space-y-4"
            >
              <h3 className="text-lg font-semibold text-[#022C22]">
                {editId ? t(locale, "pharmacist.inventory.edit_title") : t(locale, "pharmacist.inventory.add_title")}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "pharmacist.inventory.name_label")}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "pharmacist.inventory.dosage_label")}</label>
                <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent" placeholder={t(locale, "pharmacist.inventory.dosage_placeholder")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t(locale, "pharmacist.inventory.stock_label")}</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min="0"
                  className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="available" checked={available} onChange={(e) => setAvailable(e.target.checked)}
                  className="w-4 h-4 rounded border-[#A7F3D0] text-[#00D4AA] focus:ring-[#00D4AA]" />
                <label htmlFor="available" className="text-sm text-gray-600">{t(locale, "pharmacist.inventory.available_label")}</label>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 rounded-btn text-sm font-medium text-gray-600 bg-white border border-[#A7F3D0] hover:bg-[#F0FDF9] transition-colors duration-200">
                  {t(locale, "pharmacist.inventory.cancel")}
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 rounded-btn text-sm font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-colors duration-200 disabled:opacity-50">
                  {submitting ? "..." : (editId ? t(locale, "pharmacist.inventory.save") : t(locale, "pharmacist.inventory.add"))}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </motion.div>
    </RoleGuard>
  );
}
