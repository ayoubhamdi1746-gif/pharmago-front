"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { getRedirectPath } from "@/lib/redirect";
import Logo from "@/components/Logo";

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    let raf = 0;
    raf = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const ordCount = useCountUp(1295, 2500);
  const satCount = useCountUp(98, 2000);
  const delay = useCountUp(24, 1800);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { username, password });
      const { setTokens, getUserFromToken } = await import("@/lib/auth");
      await setTokens(data.access_token, data.refresh_token);
      const user = await getUserFromToken();
      if (user) {
        router.push(getRedirectPath(user.role));
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setError("Nom d'utilisateur ou mot de passe incorrect");
      } else if (status === 403) {
        setError("Compte inactif. Contactez l'administrateur.");
      } else {
        setError("Erreur de connexion au serveur");
      }
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#020814" }}>
      {/* LEFT PANEL (40%) */}
      <div
        className="hidden lg:flex flex-col relative overflow-hidden"
        style={{ width: "40%", background: "radial-gradient(ellipse at 30% 50%, rgba(0,201,167,0.15) 0%, #020814 70%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(0,201,167,0.25) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="absolute pointer-events-none"
          style={{ top: "10%", left: "20%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(0,201,167,0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="relative z-10 p-8">
          <Logo className="h-8 w-auto" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-10 relative z-10">
          <div className="text-center max-w-xs">
            <div style={{ fontSize: "5rem", lineHeight: "0.5", color: "#00C9A7", fontFamily: "Georgia, serif" }}>&ldquo;</div>
            <p className="text-white italic" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", lineHeight: "1.5", marginTop: "-1rem" }}>
              La gestion médicale enfin sécurisée et simplifiée
            </p>
            <div style={{ fontSize: "5rem", lineHeight: "0.5", color: "#00C9A7", fontFamily: "Georgia, serif", textAlign: "right" }}>&rdquo;</div>
          </div>
        </div>
        <div className="relative z-10 p-8 space-y-5">
          <div className="flex items-center gap-4 pl-4" style={{ borderLeft: "3px solid #00C9A7" }}>
            <span className="text-white font-bold" style={{ fontSize: "2rem" }}>{ordCount.toLocaleString()}</span>
            <span className="text-white/50 text-sm">ordonnances sécurisées</span>
          </div>
          <div className="flex items-center gap-4 pl-4" style={{ borderLeft: "3px solid #00C9A7" }}>
            <span className="text-white font-bold" style={{ fontSize: "2rem" }}>{satCount}%</span>
            <span className="text-white/50 text-sm">taux de satisfaction</span>
          </div>
          <div className="flex items-center gap-4 pl-4" style={{ borderLeft: "3px solid #00C9A7" }}>
            <span className="text-white font-bold" style={{ fontSize: "2rem" }}>&lt;{delay}h</span>
            <span className="text-white/50 text-sm">délai d&apos;activation</span>
          </div>
          <div className="flex items-center gap-2 text-white/30 text-xs pt-4">
            <span>Certifié</span>
            <span style={{ color: "#00C9A7" }}>·</span>
            <span>Sécurisé</span>
            <span style={{ color: "#00C9A7" }}>·</span>
            <span>🇹🇳 Tunisie</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (60%) */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: "#FFFFFF" }}>
        <motion.div
          key={shakeKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full"
          style={{ maxWidth: "420px" }}
        >
          <div style={{
            borderRadius: "24px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,201,167,0.1)",
            padding: "48px",
            background: "#FFFFFF",
          }}>
            <div className="flex justify-center mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}>
                <Logo className="h-12 w-auto" />
              </motion.div>
            </div>
            <div className="text-center mb-8">
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}
                className="text-2xl font-bold text-gray-900">
                Bon retour 👋
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }}
                className="text-sm text-gray-500 mt-2">
                Connectez-vous à votre espace PharmaGo
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">Nom d&apos;utilisateur</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </div>
                  <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                    className={`input-premium ${error ? "error" : ""}`}
                    placeholder="Entrez votre nom d'utilisateur"
                    autoComplete="username" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input id="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    className={`input-premium pr-11 ${error ? "error" : ""}`}
                    placeholder="Entrez votre mot de passe"
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                    style={{ background: "none", border: "none" }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div key={`err-${shakeKey}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0, x: [0, -6, 6, -5, 5, 0] }}
                  transition={{ duration: 0.4, ease: "easeInOut" }} className="error-message">
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              <motion.button type="submit" disabled={loading} className="btn-primary"
                whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Connexion en cours...
                  </span>
                ) : "Se connecter"}
              </motion.button>

              <div className="text-right">
                <button type="button" className="text-sm text-gray-400 hover:text-[#00C9A7] transition-colors"
                  style={{ background: "none", border: "none", cursor: "pointer" }}>
                  Mot de passe oublié ?
                </button>
              </div>
            </form>

            <div className="text-center mt-6 pt-6" style={{ borderTop: "1px solid #E5E7EB" }}>
              <p className="text-sm text-gray-500">
                Pas encore inscrit ?{" "}
                <a href="/register/pharmacy" className="text-[#00C9A7] font-medium hover:underline">
                  Inscrire ma pharmacie →
                </a>
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">PharmaGo — Gestion de livraison médicale</p>
        </motion.div>
      </div>
    </div>
  );
}