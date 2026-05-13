"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const plans = [
  { id: "STARTER", price: "200 TND/mois", limit: "50 livraisons/mois", features: ["50 livraisons sécurisées/mois", "Vérification pharmacien incluse", "Support email prioritaire"] },
  { id: "PRO", price: "450 TND/mois", limit: "Livraisons illimitées", features: ["Livraisons illimitées", "Statistiques et rapports détaillés", "Support téléphonique prioritaire"] },
  { id: "ENTERPRISE", price: "900 TND/mois", limit: "Multi-branches", features: ["Multi-branches (jusqu'à 5)", "API dédiée et intégration sur mesure", "Support dédié 24h/24"] },
];

const cities = ["Tunis", "Sfax", "Sousse", "Monastir", "Bizerte", "Nabeul", "Gabes"];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function RegisterPharmacyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    pharmacy_name: "", responsible_name: "", phone: "", city: "",
    email: "", password: "", confirm_password: "", plan: "STARTER", payment_provider: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ username: string; pharmacy_id: string } | null>(null);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const canStep1 = () => {
    return form.pharmacy_name && form.responsible_name && form.phone.match(/^\+216\d{8,}$/) &&
      form.city && form.email && form.password.length >= 8 && form.password === form.confirm_password;
  };

  const handlePay = async (provider: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/billing/register-pharmacy", {
        ...form, payment_provider: provider,
      });
      const data = res.data;
      if (data.status === "ok" && data.data) {
        setSuccess({ username: data.data.username, pharmacy_id: data.data.pharmacy_id });
        setStep(4);
      } else {
        setError("Erreur lors de l'inscription");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF9] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="bg-white border border-[#A7F3D0] rounded-card shadow-soft p-8">
          <div className="flex justify-center mb-6">
            <a href="/"><Image src="/logo.svg" alt="PharmaGo" width={140} height={42} className="h-10 w-auto" /></a>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s ? "bg-[#00D4AA] text-white shadow-[0_0_12px_rgba(0,212,170,0.4)]" :
                  step > s ? "bg-[#00D4AA]/20 text-[#00D4AA]" : "bg-gray-100 text-gray-400"
                }`}>{s}</div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-[#00D4AA]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-sm text-[#FF4D6D] bg-[#FF4D6D]/10 border border-[#FF4D6D]/20 px-3 py-2 rounded-btn mb-4">{error}</p>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: Info */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h1 className="text-xl font-semibold text-[#022C22] text-center mb-1">Inscrire ma pharmacie</h1>
                <p className="text-sm text-gray-500 text-center mb-6">Créez votre compte professionnel</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nom de la pharmacie *</label>
                      <input value={form.pharmacy_name} onChange={(e) => update("pharmacy_name", e.target.value)} required
                        className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Responsable *</label>
                      <input value={form.responsible_name} onChange={(e) => update("responsible_name", e.target.value)} required
                        className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Téléphone *</label>
                      <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+216 XX XXX XXX" required
                        className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Ville *</label>
                      <select value={form.city} onChange={(e) => update("city", e.target.value)} required
                        className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]">
                        <option value="">Sélectionnez...</option>
                        {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required
                      className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Mot de passe *</label>
                      <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8}
                        className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]" />
                      {form.password && form.password.length < 8 && <p className="text-xs text-[#E69E3E] mt-1">Min. 8 caractères</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Confirmer *</label>
                      <input type="password" value={form.confirm_password} onChange={(e) => update("confirm_password", e.target.value)} required
                        className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4AA]" />
                      {form.confirm_password && form.password !== form.confirm_password && <p className="text-xs text-[#FF4D6D] mt-1">Les mots de passe ne correspondent pas</p>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep(2)} disabled={!canStep1()}
                  className="w-full mt-6 py-3 rounded-btn text-sm font-semibold text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Continuer →
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  <a href="/login" className="text-[#00D4AA] hover:underline">Déjà un compte ? Se connecter</a>
                </p>
              </motion.div>
            )}

            {/* STEP 2: Choose plan */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h1 className="text-xl font-semibold text-[#022C22] text-center mb-1">Choisissez votre formule</h1>
                <p className="text-sm text-gray-500 text-center mb-6">Sélectionnez le plan adapté à votre pharmacie</p>
                <div className="space-y-3 mb-6">
                  {plans.map((p) => (
                    <button key={p.id} type="button" onClick={() => update("plan", p.id)}
                      className={`w-full p-4 rounded-btn border-2 text-left transition-all duration-200 ${
                        form.plan === p.id ? "border-[#00D4AA] bg-[#F0FDF9] shadow-[0_0_12px_rgba(0,212,170,0.2)]" : "border-[#A7F3D0] hover:border-[#00D4AA]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#022C22]">{p.id}</p>
                          <p className="text-lg font-bold text-[#00D4AA] mt-1">{p.price}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{p.limit}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          form.plan === p.id ? "border-[#00D4AA]" : "border-gray-300"
                        }`}>
                          {form.plan === p.id && <div className="w-2.5 h-2.5 rounded-full bg-[#00D4AA]" />}
                        </div>
                      </div>
                      <ul className="mt-3 space-y-1">
                        {p.features.map((f, i) => (
                          <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                            <span className="text-[#00D4AA]">{"\u2713"}</span> {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-btn text-sm font-medium text-gray-600 border border-[#A7F3D0] hover:bg-[#F0FDF9] transition-all">
                    ← Retour
                  </button>
                  <button onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-btn text-sm font-semibold text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-all">
                    Continuer →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Payment */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h1 className="text-xl font-semibold text-[#022C22] text-center mb-1">Paiement</h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Finalisez l'inscription — Forfait <strong>{form.plan}</strong>
                </p>
                <div className="bg-[#F0FDF9] rounded-btn p-4 mb-6 space-y-1">
                  <p className="text-sm text-gray-600">Pharmacie: <strong>{form.pharmacy_name}</strong></p>
                  <p className="text-sm text-gray-600">Responsable: <strong>{form.responsible_name}</strong></p>
                  <p className="text-sm text-gray-600">Ville: <strong>{form.city}</strong></p>
                  <p className="text-sm text-gray-600">Forfait: <strong>{form.plan}</strong></p>
                  <p className="text-lg font-bold text-[#00D4AA] mt-2">
                    Total: {plans.find((p) => p.id === form.plan)?.price}
                  </p>
                </div>
                <div className="space-y-3">
                  <button onClick={() => handlePay("KONNECT")} disabled={loading}
                    className="w-full py-3 rounded-btn text-sm font-semibold text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                    {loading ? "Traitement..." : "Payer avec Konnect"}
                  </button>
                  <button onClick={() => handlePay("FLOUCI")} disabled={loading}
                    className="w-full py-3 rounded-btn text-sm font-semibold text-white bg-[#022C22] hover:bg-[#065F46] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                    {loading ? "Traitement..." : "Payer avec Flouci"}
                  </button>
                </div>
                <button onClick={() => setStep(2)} disabled={loading}
                  className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-all">
                  ← Modifier le forfait
                </button>
              </motion.div>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F0FDF9] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#00D4AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-[#022C22] mb-2">Inscription en cours !</h2>
                <p className="text-sm text-gray-500 mb-6">Votre compte sera activé après confirmation du paiement.</p>
                {success && (
                  <div className="bg-[#F0FDF9] rounded-btn p-4 text-left space-y-2 mb-6">
                    <p className="text-sm"><span className="font-medium">Identifiant:</span> <code className="text-xs bg-white px-2 py-0.5 rounded">{success.username}</code></p>
                    <p className="text-sm"><span className="font-medium">Mot de passe:</span> <code className="text-xs bg-white px-2 py-0.5 rounded">(celui que vous avez choisi)</code></p>
                  </div>
                )}
                <p className="text-sm text-[#065F46] mb-6">Votre compte est activé. Connectez-vous.</p>
                <a href="/login"
                  className="inline-block px-6 py-2.5 rounded-btn text-sm font-semibold text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-all">
                  Se connecter
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
