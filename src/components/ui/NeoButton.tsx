"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NeoButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "neumorphic";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  glow?: boolean;
  loading?: boolean;
}

const sizeStyles = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

const variantBase = {
  primary:
    "bg-primary text-white border border-primary/30 shadow-[0_4px_14px_rgba(0,212,170,0.25)]",
  ghost:
    "bg-transparent text-text-2 border border-border hover:border-primary/40 hover:text-primary",
  neumorphic:
    "bg-surface-2 text-text-1 border-none",
};

export default function NeoButton({
  children,
  className = "",
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  onClick,
  glow = false,
  loading = false,
}: NeoButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    onClick?.();
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-btn font-medium
        transition-all duration-200 select-none
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${sizeStyles[size]}
        ${variantBase[variant]}
        ${variant === "neumorphic" ? "shadow-neumorphic active:shadow-neumorphic-inset" : ""}
        ${glow && variant === "primary" ? "hover:shadow-[0_4px_20px_rgba(0,212,170,0.4)]" : ""}
        ${className}
      `}
      style={{ isolation: "isolate" }}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.4 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: r.x - 25,
              top: r.y - 25,
              width: 50,
              height: 50,
              background:
                variant === "primary"
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(0,212,170,0.2)",
            }}
          />
        ))}
      </AnimatePresence>

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-btn">
          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </span>
      )}

      <span className={`relative z-10 inline-flex items-center gap-2 ${loading ? "invisible" : ""}`}>
        {children}
      </span>
    </button>
  );
}
