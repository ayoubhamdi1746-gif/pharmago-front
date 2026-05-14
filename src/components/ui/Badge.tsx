"use client";

import { motion } from "framer-motion";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

const variantStyles = {
  success: "bg-success-50 text-success-600 border-success-200",
  warning: "bg-warning-50 text-warning-600 border-warning-200",
  danger: "bg-danger-50 text-danger-600 border-danger-200",
  info: "bg-primary-50 text-primary-600 border-primary-200",
};

const dotColors = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-primary-500",
};

export default function Badge({ variant = "info", children, pulse = false, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <motion.span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {children}
    </span>
  );
}