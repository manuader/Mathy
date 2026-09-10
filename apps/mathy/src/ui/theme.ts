/**
 * Los tokens del sistema de diseño. Salen de N, y son la única fuente: ningún
 * componente inventa un color ni una medida.
 *
 * La paleta es la de un crepúsculo: el mundo es oscuro y quieto para que el
 * color fuerte quede libre para significar. Cada color vivo tiene un trabajo y
 * uno solo (N §2.2):
 *
 * - `accent`, `coral`, `violet`: a qué colección pertenece algo. Son los equipos:
 *   el primer cuenco, el segundo, el tercero.
 * - `ok`: "coincide", "quedó emparejado", "esto es lo mismo".
 * - `warn`: "mirá acá". Nunca "mal": no hay rojo de error.
 * - `gold`: lo aprendido. La llave, la luz de Lumi, el botón que sigue.
 *
 * Un chico de cinco años y una persona de cincuenta ven la misma interfaz.
 */
export const theme = {
  color: {
    bg: "#0c1624",
    bgDeep: "#070e18",
    surface: "#13233a",
    surfaceHigh: "#1b304c",
    line: "#2c4466",
    ink: "#f4f7fb",
    inkDim: "#aab8ca",
    inkFaint: "#6f819a",
    accent: "#56b8ff",
    coral: "#ff7f96",
    violet: "#b294ff",
    ok: "#3fe0a4",
    warn: "#ffb547",
    gold: "#ffd166",
    goldDeep: "#f59e2c",
    /** El vidrio de los carteles que flotan sobre el mundo. */
    glass: "rgba(12, 22, 36, 0.78)",
    glassLine: "rgba(255, 255, 255, 0.10)",
    /** El velo detrás de una tarjeta de entrada o de cierre. */
    veil: "rgba(5, 10, 18, 0.72)",
  },
  space: [4, 8, 12, 16, 24, 32, 48, 64] as const,
  radius: { token: 12, panel: 20, card: 28, full: 999 },
  /** Duraciones como tokens. Nada dura más de 1.5 s. */
  motion: { quick: 180, base: 320, morph: 700, reveal: 1200 },
  /**
   * Los resortes de los gestos. Un objeto que se levanta crece con `lift`; uno
   * que cae en su lugar rebota una vez con `settle`, y así se siente que llegó.
   */
  spring: {
    lift: { damping: 14, stiffness: 260, mass: 0.6 },
    settle: { damping: 11, stiffness: 190, mass: 0.7 },
  },
  /** Piso de accesibilidad para cualquier cosa que se toque. */
  hitSlop: 44,
} as const;

/** Las áreas del curriculum. Cada una es un lugar del mundo, con su luz. */
export type Area = "found" | "arith" | "prealg" | "alg" | "calc" | "linalg" | "prob" | "graph" | "geom" | "disc";

/**
 * El cielo y el suelo de cada área, para el paisaje de reemplazo mientras no hay
 * imagen, y el tono con que el área se nombra en los mapas. El tono del área es
 * de la interfaz, nunca del lienzo: adentro del juego el color es de la matemática.
 */
export const AREAS: Record<Area, { readonly sky: string; readonly ground: string; readonly hue: string }> = {
  found: { sky: "#1f3d52", ground: "#0d1a26", hue: "#ffc46b" },
  arith: { sky: "#133f58", ground: "#0a1824", hue: "#5cc8ff" },
  prealg: { sky: "#2b2757", ground: "#110f24", hue: "#b79bff" },
  alg: { sky: "#3b2c2a", ground: "#140f0e", hue: "#ff9f5a" },
  calc: { sky: "#1c4040", ground: "#0b1818", hue: "#63e2c6" },
  linalg: { sky: "#1f2f55", ground: "#0c1222", hue: "#7aa2ff" },
  prob: { sky: "#3a2447", ground: "#150d1b", hue: "#ff8fc8" },
  graph: { sky: "#153a4a", ground: "#08161d", hue: "#6fd3ff" },
  geom: { sky: "#232a4f", ground: "#0d0f20", hue: "#ffd166" },
  disc: { sky: "#2d3140", ground: "#101218", hue: "#c3cad8" },
};

/** El área de un nodo, por el prefijo de su id. */
export function areaOf(nodeId: string): Area {
  const head = nodeId.split(".")[0] ?? "";
  switch (head) {
    case "found":
      return "found";
    case "arith":
      return "arith";
    case "prealg":
      return "prealg";
    case "alg":
      return "alg";
    case "precalc":
    case "calc1":
      return "calc";
    case "linalg":
      return "linalg";
    case "prob":
      return "prob";
    case "graph":
      return "graph";
    case "geom":
    case "trig":
      return "geom";
    default:
      return "disc";
  }
}
