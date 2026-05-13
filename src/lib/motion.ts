import { type Variants, type Transition } from "framer-motion";

/* ------------------------------------------------------------------
   Shared transitions
   ------------------------------------------------------------------ */
export const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export const springStiff: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 24,
};

export const easeOut: Transition = {
  duration: 0.2,
  ease: "easeInOut",
};

export const easeOutFast: Transition = {
  duration: 0.15,
  ease: "easeInOut",
};

/* ------------------------------------------------------------------
   Page
   ------------------------------------------------------------------ */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

export const pageContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

/* ------------------------------------------------------------------
   Cards & list items
   ------------------------------------------------------------------ */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, ...easeOut },
  }),
};

export const cardHover = {
  whileHover: { y: -2, transition: easeOutFast },
  whileTap: { scale: 0.98, transition: easeOutFast },
};

/* ------------------------------------------------------------------
   Modal
   ------------------------------------------------------------------ */
export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOutFast },
  exit: { opacity: 0, transition: easeOutFast },
};

export const modalCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: easeOut,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: easeOutFast,
  },
};

/* ------------------------------------------------------------------
   Toast / slide-in notifications
   ------------------------------------------------------------------ */
export const toastVariants: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springGentle,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: easeOutFast,
  },
};

/* ------------------------------------------------------------------
   Status badge pulse
   ------------------------------------------------------------------ */
export const badgeVariants: Variants = {
  initial: { scale: 1 },
  change: {
    scale: [1, 1.08, 1],
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

/* ------------------------------------------------------------------
   Sidebar
   ------------------------------------------------------------------ */
export const sidebarVariants: Variants = {
  expanded: { width: 240, transition: easeOut },
  collapsed: { width: 64, transition: easeOut },
};

export const sidebarItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: easeOut },
};

/* ------------------------------------------------------------------
   Mobile drawer
   ------------------------------------------------------------------ */
export const drawerVariants: Variants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: easeOut },
  exit: { x: "-100%", transition: easeOutFast },
};

/* ------------------------------------------------------------------
   Buttons & interactive
   ------------------------------------------------------------------ */
export const buttonTap = {
  whileHover: { scale: 1.02, transition: easeOutFast },
  whileTap: { scale: 0.97, transition: easeOutFast },
};

export const buttonMagnetic: Variants = {
  rest: { x: 0, y: 0 },
};

/* ------------------------------------------------------------------
   Fade / scale entrance
   ------------------------------------------------------------------ */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOut },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: easeOut },
};

/* ------------------------------------------------------------------
   Count-up number
   ------------------------------------------------------------------ */
export const countUpVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

/* ------------------------------------------------------------------
   Stagger helpers
   ------------------------------------------------------------------ */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};
