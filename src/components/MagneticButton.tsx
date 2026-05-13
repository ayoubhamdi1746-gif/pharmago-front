"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export default function MagneticButton({
  children,
  className = "",
  disabled,
  type = "button",
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: -999, y: -999 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setPos({ x: -999, y: -999 });
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{ isolation: "isolate" }}
    >
      <motion.span
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,212,170,0.25) 0%, rgba(0,212,170,0.08) 40%, transparent 70%)",
        }}
        animate={{ left: pos.x, top: pos.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
