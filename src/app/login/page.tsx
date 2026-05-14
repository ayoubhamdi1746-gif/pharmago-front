"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { getRedirectPath } from "@/lib/redirect";
import { useLocale } from "@/lib/useLocale";
import { t } from "@/lib/i18n";
import MagneticButton from "@/components/MagneticButton";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

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
        setError(t(locale, "login.error.invalid"));
      } else if (status === 403) {
        setError(t(locale, "login.error.inactive"));
      } else {
        setError(t(locale, "login.error.connection"));
      }
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT: Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#022C22] to-[#004437] relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            {/* Abstract medical shapes */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="#00D4AA" strokeWidth="0.5" opacity="0.3"/>
            <circle cx="300" cy="150" r="120" fill="none" stroke="#00D4AA" strokeWidth="0.5" opacity="0.2"/>
            <circle cx="200" cy="300" r="60" fill="none" stroke="#00D4AA" strokeWidth="0.5" opacity="0.25"/>
            <rect x="50" y="250" width="80" height="80" rx="20" fill="none" stroke="#00D4AA" strokeWidth="0.5" opacity="0.15" transform="rotate(15 90 290)"/>
            <rect x="280" y="320" width="60" height="60" rx="15" fill="none" stroke="#00D4AA" strokeWidth="0.5" opacity="0.2" transform="rotate(-10 310 350)"/>
            {/* Hexagons */}
            <polygon points="320,50 350,62 350,94 320,106 290,94 290,62" fill="none" stroke="#00D4AA" strokeWidth="0.5" opacity="0.2"/>
            <polygon points="60,180 80,188 80,212 60,220 40,212 40,188" fill="none" stroke="#00D4AA" strokeWidth="0.5" opacity="0.25"/>
            {/* Pill shape */}
            <rect x="150" y="80" width="40" height="20" rx="10" fill="#00D4AA" opacity="0.1"/>
            <rect x="250" y="250" width="30" height="15" rx="7.5" fill="#00D4AA" opacity="0.08"/>
            {/* Plus signs */}
            <g transform="translate(80, 350)" opacity="0.15">
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#00D4AA" strokeWidth="1"/>
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#00D4AA" strokeWidth="1"/>
            </g>
            <g transform="translate(350, 280)" opacity="0.12">
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#00D4AA" strokeWidth="1"/>
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#00D4AA" strokeWidth="1"/>
            </g>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Logo className="h-14 w-auto mb-8" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl font-light text-white/80 leading-relaxed max-w-md"
          >
            "{t(locale, "login.quote")}"
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.752h-9.204c-.388 1.208-.597 2.493-.597 3.752z" />
              </svg>
            </div>
            <span className="text-sm text-white/60">{t(locale, "login.trust")}</span>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex-1 bg-[#F0FDF9] flex items-center justify-center p-4 lg:p-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[500px] h-[500px] rounded-full" style={{ top: "20%", left: "-10%", background: "radial-gradient(circle, rgba(0,212,170,0.03) 0%, transparent 70%)", animation: "blob1 20s ease-in-out infinite alternate" }} />
          <div className="absolute w-[400px] h-[400px] rounded-full" style={{ bottom: "10%", right: "-5%", background: "radial-gradient(circle, rgba(0,212,170,0.03) 0%, transparent 70%)", animation: "blob2 18s ease-in-out infinite alternate" }} />
          <style>{`
            @keyframes blob1 { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,-30px) scale(1.05); } 100% { transform: translate(-20px,40px) scale(0.95); } }
            @keyframes blob2 { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,40px) scale(1.05); } 100% { transform: translate(30px,-20px) scale(0.9); } }
            @keyframes shake { 0%,100% { transform: translateX(0); } 10%,50%,90% { transform: translateX(-8px); } 30%,70% { transform: translateX(8px); } }
          `}</style>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <Logo className="h-12 w-auto" />
          </div>

          <div className="bg-white border border-[#A7F3D0] rounded-card shadow-soft p-8">
            <div className="hidden lg:flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
              >
                <Logo className="h-12 w-auto" />
              </motion.div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[#022C22] mb-1.5">
                  {t(locale, "login.username")}
                </label>
                <input
                  id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                  className={`w-full px-3 py-2.5 rounded-btn border bg-white text-[#022C22] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent transition-all duration-200 ${
                    error ? "border-[#FF4D6D]" : "border-[#A7F3D0]"
                  }`}
                  placeholder={t(locale, "login.username_placeholder")}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#022C22] mb-1.5">
                  {t(locale, "login.password")}
                </label>
                <div className={`relative rounded-btn border transition-all duration-200 focus-within:ring-2 focus-within:ring-[#00D4AA] ${
                  error ? "border-[#FF4D6D]" : "border-[#A7F3D0]"
                }`}>
                  <input
                    id="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    className="w-full px-3 py-2.5 rounded-btn bg-white text-[#022C22] text-sm placeholder-gray-400 focus:outline-none border-0"
                    placeholder={t(locale, "login.password_placeholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#022C22] transition-colors"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  key={shakeKey}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }}
                  transition={{ opacity: { duration: 0.15 }, x: { duration: 0.4, ease: "easeInOut" } }}
                  className="text-sm text-[#FF4D6D] bg-[#FF4D6D]/5 border border-[#FF4D6D]/20 px-3 py-2 rounded-btn"
                >
                  {error}
                </motion.p>
              )}

              <MagneticButton
                type="submit" disabled={loading}
                className="w-full py-2.5 rounded-btn text-sm font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-all duration-200 active:scale-[0.96] disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {t(locale, "login.submitting")}
                  </span>
                ) : (
                  t(locale, "login.submit")
                )}
              </MagneticButton>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            {t(locale, "login.footer")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}