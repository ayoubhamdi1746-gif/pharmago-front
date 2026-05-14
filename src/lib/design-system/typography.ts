export const typography = {
  fontFamily: {
    sans: ["Inter", "Noto Sans Arabic", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Fira Code", "monospace"],
  },
  fontSize: {
    xs: "11px",
    sm: "13px",
    base: "15px",
    lg: "18px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "48px",
    "4xl": "64px",
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
    base: 1.7,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
    wider: "0.05em",
    widest: "0.15em",
  },
} as const;
