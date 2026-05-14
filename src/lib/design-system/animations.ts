import { type Variants, type Transition } from "framer-motion";

export const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 24,
};

export const springSnap: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

export const easeOut: Transition = {
  duration: 0.2,
  ease: "easeInOut",
};

export const easeOutFast: Transition = {
  duration: 0.15,
  ease: "easeInOut",
};

export const easeReveal: Transition = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1],
};

export const glassEnter: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: easeOut,
  },
  hover: {
    y: -2,
    borderColor: "rgba(0,212,170,0.3)",
    boxShadow: "0 8px 32px rgba(0,212,170,0.12)",
    transition: easeOutFast,
  },
  tap: {
    scale: 0.98,
    transition: easeOutFast,
  },
};

export const scaleFadeIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.05, ...easeOut },
  }),
};

export const slideUpFade: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" },
  }),
};

export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

export const pulseGlow: Variants = {
  idle: { boxShadow: "0 0 0 rgba(0,212,170,0)" },
  active: {
    boxShadow: [
      "0 0 12px rgba(0,212,170,0.3)",
      "0 0 24px rgba(0,212,170,0.2)",
      "0 0 12px rgba(0,212,170,0.3)",
    ],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

export const shimmerVariants: Variants = {
  hidden: { backgroundPosition: "200% 0" },
  visible: {
    backgroundPosition: "-200% 0",
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
  },
};

export const countUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

export const badgePulse: Variants = {
  initial: { scale: 1 },
  change: {
    scale: [1, 1.08, 1],
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export const floatingAnimation = {
  y: [0, -8, 0],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};

export const particleFloat = (i: number) => ({
  y: [0, -40 - i * 5, -80 - i * 3, -40 - i * 5, 0],
  x: [0, 10, -5, 8, 0],
  opacity: [0.4, 0.5, 0.2, 0.4, 0.4],
  transition: {
    duration: 8 + (i % 7) * 1.5,
    repeat: Infinity,
    delay: i * 0.4,
    ease: "easeInOut",
  },
});

export const rippleVariants: Variants = {
  hidden: { scale: 0, opacity: 0.5 },
  visible: {
    scale: 4,
    opacity: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};
