export const colors = {
  primary: {
    50: "#E6FFF8",
    100: "#B3FFEA",
    200: "#80FFDC",
    300: "#00FF94",
    400: "#00D4AA",
    500: "#00B894",
    600: "#009B7D",
    700: "#007965",
    800: "#005F4E",
    900: "#004437",
  },
  success: {
    50: "#E6FFF8",
    100: "#B3FFEA",
    200: "#80FFDC",
    300: "#4DFFCE",
    400: "#00E676",
    500: "#00C853",
    600: "#009B4D",
    700: "#007933",
    800: "#005C22",
    900: "#004015",
  },
  warning: {
    50: "#FFF7ED",
    100: "#FFE8C2",
    200: "#FFD898",
    300: "#FFC86E",
    400: "#FFB347",
    500: "#E69E3E",
    600: "#CC8934",
    700: "#99662B",
    800: "#664422",
    900: "#332218",
  },
  danger: {
    50: "#FFF0F2",
    100: "#FFCCD4",
    200: "#FF99A8",
    300: "#FF667D",
    400: "#FF4D6D",
    500: "#E63E5C",
    600: "#CC2F4B",
    700: "#99223A",
    800: "#661828",
    900: "#330E17",
  },
  surface: {
    DEFAULT: "#FFFFFF",
    2: "#F8FAFC",
    3: "#F1F5F9",
  },
  text: {
    1: "#0F172A",
    2: "#475569",
    3: "#94A3B8",
  },
  border: {
    DEFAULT: "#E2E8F0",
    light: "#F1F5F9",
  },
  dark: {
    surface: "#0A1628",
    surface2: "#0D1E32",
    surface3: "#0F2640",
    text1: "#FFFFFF",
    text2: "#94A3B8",
    text3: "#475569",
  },
} as const;

export function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
