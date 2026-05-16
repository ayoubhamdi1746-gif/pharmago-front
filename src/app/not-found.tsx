"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020814] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <motion.circle
              cx="60" cy="60" r="55"
              stroke="#00D4AA" strokeWidth="2" strokeDasharray="6 6"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
              d="M45 50 L60 65 L75 50"
              stroke="#00D4AA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ display: "none" }}
            />
            <path
              d="M35 80 Q60 95 85 80"
              stroke="#00D4AA" strokeWidth="2" fill="none"
              strokeLinecap="round"
            />
            <rect x="40" y="35" width="40" height="35" rx="4" stroke="#00D4AA" strokeWidth="2" fill="none" />
            <line x1="50" y1="45" x2="70" y2="45" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="53" x2="65" y2="53" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="61" x2="60" y2="61" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" />
            <circle cx="60" cy="30" r="5" fill="#00D4AA" opacity="0.3" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-6xl font-bold text-[#00D4AA] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-3">Page introuvable</h2>
          <p className="text-[#64748B] mb-8 leading-relaxed">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-btn text-sm font-semibold bg-[#00D4AA] text-white hover:bg-[#009B7D] transition-all duration-200 shadow-[0_4px_14px_rgba(0,212,170,0.3)]"
          >
            Retour à l'accueil →
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}