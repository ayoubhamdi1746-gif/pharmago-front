"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";

const highRiskKeywords = ["toxin", "lethal", "sedative", "narcotic", "controlled"];

export default function NewPrescriptionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved) setLocale(saved);
  }, []);

  const [medicationName, setMedicationName] = useState("");
  const [doseMg, setDoseMg] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [doctorName, setDoctorName] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [pharmacies, setPharmacies] = useState<{ id: string; name: string; city: string }[]>([]);
  const [pharmacyId, setPharmacyId] = useState("");

  useEffect(() => {
    api.get<ApiResponse<{ pharmacies: { id: string; name: string; city: string }[] }>>("/public/pharmacies")
      .then((res) => setPharmacies(res.data.data?.pharmacies || []))
      .catch(() => {});
  }, []);

  const handleDrugNameChange = (val: string) => {
    setMedicationName(val);
    const lower = val.toLowerCase();
    setShowWarning(highRiskKeywords.some((k) => lower.includes(k)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { getUserFromToken } = await import("@/lib/auth");
      const user = await getUserFromToken();
      const payload = {
        patient_reference_token: user?.identity_id || "",
        items: [
          {
            medication_name: medicationName,
            dose_mg: parseFloat(doseMg),
            quantity: parseInt(quantity, 10),
          },
        ],
        doctor_name: doctorName || undefined,
        doctor_phone: doctorPhone || undefined,
        doctor_email: doctorEmail || undefined,
        issue_date: issueDate || undefined,
        pharmacy_id: pharmacyId || undefined,
      };
      const res = await api.post<ApiResponse<{ prescription_id: string; status: string }>>(
        "/prescriptions",
        payload
      );
      queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] });
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            message: `Prescription created! Status: ${res.data.data?.status}`,
          },
        })
      );
      router.push("/patient/dashboard");
    } catch {
      setError(t(locale, "prescription.new.toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRole="patient">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeInOut" as const }}
        className="max-w-lg mx-auto"
      >
        <h1 className="text-2xl font-semibold text-[#022C22] mb-6">
          {t(locale, "prescription.new.title")}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t(locale, "prescription.new.code_label")}
            </label>
            <input
              type="text"
              value={medicationName}
              onChange={(e) => handleDrugNameChange(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
              placeholder={t(locale, "prescription.new.code_placeholder")}
            />
            {showWarning && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[#E69E3E] mt-1"
              >
                {t(locale, "prescription.new.warning")}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t(locale, "prescription.new.dosage_label")}
              </label>
              <input
                type="number"
                value={doseMg}
                onChange={(e) => setDoseMg(e.target.value)}
                required
                min="0.1"
                step="0.1"
                className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t(locale, "prescription.new.quantity_label")}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t(locale, "prescription.new.doctor_label")}
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
              placeholder={t(locale, "prescription.new.doctor_placeholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t(locale, "prescription.new.doctor_phone_label")}
            </label>
            <input
              type="tel"
              value={doctorPhone}
              onChange={(e) => setDoctorPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
              placeholder={t(locale, "prescription.new.doctor_phone_placeholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t(locale, "prescription.new.doctor_email_label")}
            </label>
            <input
              type="email"
              value={doctorEmail}
              onChange={(e) => setDoctorEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
              placeholder={t(locale, "prescription.new.doctor_email_placeholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t(locale, "prescription.new.date_label")}
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Choisir une pharmacie
            </label>
            <select value={pharmacyId} onChange={(e) => setPharmacyId(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]"
            >
              <option value="">Sélectionnez une pharmacie...</option>
              {pharmacies.map((p) => (
                <option key={p.id} value={p.id}>{p.name} {p.city ? `- ${p.city}` : ""}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-[#FF4D6D] bg-[#FF4D6D]/10 border border-[#FF4D6D]/20 px-3 py-2 rounded-btn">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2.5 rounded-btn text-sm font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-all duration-200 ${
              submitting ? "opacity-70" : ""
            }`}
          >
            {submitting ? t(locale, "prescription.new.submitting") : t(locale, "prescription.new.submit")}
          </button>
        </form>
      </motion.div>
    </RoleGuard>
  );
}
