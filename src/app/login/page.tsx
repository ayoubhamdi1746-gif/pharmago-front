"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { getRedirectPath } from "@/lib/redirect";
import MagneticButton from "@/components/MagneticButton";

export default function LoginPage() {
  const router = useRouter();
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
      console.log("[login] submitting:", { username, url: (await import("@/lib/api")).default.defaults.baseURL + "/auth/login" });
      const { data } = await api.post("/auth/login", { username, password });
      console.log("[login] success:", data);
      const { setTokens, getUserFromToken } = await import("@/lib/auth");
      await setTokens(data.access_token, data.refresh_token);
      const user = await getUserFromToken();
      if (user) {
        router.push(getRedirectPath(user.role));
      }
    } catch (err: unknown) {
      console.error("[login] error:", err);
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setError("Invalid username or password");
      } else if (status === 403) {
        setError("Account is inactive. Contact your administrator.");
      } else {
        setError("Connection error. Please check that the server is running.");
      }
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF9] flex items-center justify-center p-4 overflow-hidden">
      {/* Subtle mesh background */}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-white border border-[#A7F3D0] rounded-card shadow-soft p-8">
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
            >
              <Image src="/logo.svg" alt="PharmaGo" width={160} height={48} className="h-12 w-auto" priority />
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#022C22] mb-1.5">
                Username
              </label>
              <input
                id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                className={`w-full px-3 py-2.5 rounded-btn border bg-white text-[#022C22] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent transition-all duration-200 ${
                  error ? "border-[#FF4D6D]" : "border-[#A7F3D0]"
                }`}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#022C22] mb-1.5">
                Password
              </label>
              <div className={`relative rounded-btn border transition-all duration-200 focus-within:ring-2 focus-within:ring-[#00D4AA] ${
                error ? "border-[#FF4D6D]" : "border-[#A7F3D0]"
              }`}>
                <input
                  id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-btn bg-white text-[#022C22] text-sm placeholder-gray-400 focus:outline-none border-0"
                  placeholder="Enter your password"
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </MagneticButton>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          PharmaGo &mdash; Medical Delivery Management
        </p>
      </motion.div>
    </div>
  );
}
