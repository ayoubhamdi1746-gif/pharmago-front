export const tokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },
  radii: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    md: "0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
    lg: "0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)",
    glow: "0 0 20px rgba(0,212,170,0.3), 0 0 60px rgba(0,212,170,0.1)",
    "glow-red": "0 0 12px rgba(255,77,109,0.3), 0 0 24px rgba(255,77,109,0.1)",
    neumorphic:
      "8px 8px 16px rgba(0,0,0,0.06), -8px -8px 16px rgba(255,255,255,0.8)",
    "neumorphic-inset":
      "inset 4px 4px 8px rgba(0,0,0,0.06), inset -4px -4px 8px rgba(255,255,255,0.8)",
  },
  blur: {
    glass: "20px",
    "glass-strong": "32px",
  },
  durations: {
    fast: 150,
    normal: 200,
    slow: 300,
    reveal: 600,
  },
} as const;
