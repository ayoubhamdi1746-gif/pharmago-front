"use client";

import { motion } from "framer-motion";

type PulseStatus = "verified" | "pending" | "high-risk" | "warning" | "info";

interface StatusPulseProps {
  status: PulseStatus;
  label: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

const statusConfig: Record<
  PulseStatus,
  { dot: string; bg: string; text: string; glow: string }
> = {
  verified: {
    dot: "bg-primary-400",
    bg: "bg-primary-500/10",
    text: "text-primary-400",
    glow: "0 0 8px rgba(0,212,170,0.4)",
  },
  pending: {
    dot: "bg-warning-400",
    bg: "bg-warning-500/10",
    text: "text-warning-400",
    glow: "0 0 8px rgba(255,179,71,0.4)",
  },
  "high-risk": {
    dot: "bg-danger-400",
    bg: "bg-danger-500/10",
    text: "text-danger-400",
    glow: "0 0 8px rgba(255,77,109,0.4)",
  },
  warning: {
    dot: "bg-orange-400",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    glow: "0 0 8px rgba(251,146,60,0.4)",
  },
  info: {
    dot: "bg-blue-400",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    glow: "0 0 8px rgba(96,165,250,0.4)",
  },
};

const sizeMap = {
  sm: { dot: "w-1.5 h-1.5", text: "text-[10px]", px: "px-2", py: "py-0.5" },
  md: { dot: "w-2 h-2", text: "text-xs", px: "px-2.5", py: "py-1" },
  lg: { dot: "w-2.5 h-2.5", text: "text-sm", px: "px-3", py: "py-1.5" },
};

export default function StatusPulse({
  status,
  label,
  className = "",
  size = "md",
  showDot = true,
}: StatusPulseProps) {
  const cfg = statusConfig[status];
  const s = sizeMap[size];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.bg} ${cfg.text} ${s.px} ${s.py} ${s.text} ${className}`}
    >
      {showDot && (
        <motion.span
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`rounded-full ${s.dot}`}
          style={{ boxShadow: cfg.glow }}
        />
      )}
      {label}
    </motion.span>
  );
}
