"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { glassEnter, springGentle } from "@/lib/design-system";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "green" | "red" | "none";
  intensity?: "light" | "medium" | "strong";
  as?: "div" | "section" | "article";
  style?: React.CSSProperties;
}

const blurMap = { light: "12px", medium: "20px", strong: "32px" };
const bgMap = {
  light: "rgba(255,255,255,0.6)",
  medium: "rgba(10,22,40,0.7)",
  strong: "rgba(2,11,24,0.85)",
};
const borderMap = {
  light: "rgba(0,212,170,0.1)",
  medium: "rgba(0,212,170,0.15)",
  strong: "rgba(0,212,170,0.08)",
};

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = "green",
  intensity = "medium",
  as = "div",
  style,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = motion[as as keyof typeof motion] as typeof motion.div;

  const glowStyles: Record<string, string> = {
    green: "0 0 30px rgba(0,212,170,0.08), 0 0 60px rgba(0,212,170,0.04)",
    red: "0 0 30px rgba(255,77,109,0.08), 0 0 60px rgba(255,77,109,0.04)",
    none: "0 0 0 transparent",
  };

  return (
    <Tag
      ref={ref}
      initial="hidden"
      whileInView="visible"
      whileHover={hover ? "hover" : undefined}
      whileTap={hover ? "tap" : undefined}
      viewport={{ once: true, margin: "-40px" }}
      variants={glassEnter}
      className={`relative overflow-hidden rounded-card ${className}`}
      style={{
        background: bgMap[intensity],
        backdropFilter: `blur(${blurMap[intensity]})`,
        WebkitBackdropFilter: `blur(${blurMap[intensity]})`,
        border: `1px solid ${borderMap[intensity]}`,
        boxShadow: glowStyles[glow],
        ...style,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-card"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute -top-px left-4 right-4 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,212,170,0.3), transparent)",
        }}
      />
      {children}
    </Tag>
  );
}
