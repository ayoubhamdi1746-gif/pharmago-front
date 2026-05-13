"use client";

import { motion } from "framer-motion";
import { badgeVariants } from "@/lib/motion";
import { t, type Locale } from "@/lib/i18n";

const statusConfig: Record<
  string,
  { color: string; bg: string; glow?: string; pulse?: boolean }
> = {
  PENDING: { color: "text-warning-400", bg: "bg-warning-500/10", pulse: true },
  HIGH_RISK_PENDING: {
    color: "text-danger-400",
    bg: "bg-danger-500/10",
    glow: "glow-high-risk",
    pulse: true,
  },
  VERIFIED: {
    color: "text-primary-400",
    bg: "bg-primary-500/10",
    glow: "glow-verified",
  },
  DISPENSED: { color: "text-primary-300", bg: "bg-primary-500/10" },
  assigned: { color: "text-warning-400", bg: "bg-warning-500/10", pulse: true },
  in_transit: {
    color: "text-primary-400",
    bg: "bg-primary-500/10",
  },
  delivered: {
    color: "text-success-400",
    bg: "bg-success-500/10",
  },
  AWAITING: {
    color: "text-warning-400",
    bg: "bg-warning-500/10",
    pulse: true,
  },
  SIGNED: { color: "text-success-400", bg: "bg-success-500/10" },
  EXPIRED: { color: "text-danger-400", bg: "bg-danger-500/10" },
};

export default function StatusBadge({ status, locale = "fr" }: { status: string; locale?: Locale }) {
  const cfg = statusConfig[status] || {
    color: "text-gray-400",
    bg: "bg-gray-500/10",
  };
  const label = t(locale, `status.${status}`);

  return (
    <motion.span
      variants={badgeVariants}
      initial="initial"
      animate="change"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg} ${cfg.glow || ""}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          cfg.pulse
            ? "bg-warning-400 animate-pulse"
            : status === "HIGH_RISK_PENDING"
            ? "bg-danger-400"
            : status === "VERIFIED" || status === "SIGNED" || status === "delivered"
            ? "bg-primary-400"
            : "bg-primary-400"
        }`}
      />
      {label}
    </motion.span>
  );
}
