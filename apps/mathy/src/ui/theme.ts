/**
 * Los tokens del sistema de diseño. Salen de N, y son la única fuente: ningún
 * componente inventa un color ni una medida.
 *
 * Dark first, paleta contenida, nada de estética infantil. Un chico de cinco
 * años y una persona de cincuenta ven exactamente la misma interfaz.
 */
export const theme = {
  color: {
    bg: "#0b0d10",
    surface: "#141821",
    surfaceHigh: "#1c2027",
    line: "#2a3038",
    ink: "#e8eaed",
    inkDim: "#9aa3ad",
    inkFaint: "#5b636d",
    accent: "#8ab4f8",
    ok: "#81c995",
    warn: "#f8c675",
  },
  space: [4, 8, 12, 16, 24, 32, 48, 64] as const,
  radius: { token: 12, panel: 20, full: 999 },
  /** Duraciones como tokens. Nada dura más de 1.5 s. */
  motion: { quick: 180, base: 320, morph: 700, reveal: 1200 },
  /** Piso de accesibilidad para cualquier cosa que se toque. */
  hitSlop: 44,
} as const;
