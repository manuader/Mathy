# La lección y la guía, como datos

La lección de un nodo es **su módulo** en `apps/mathy/src/lessons/<nodo>.ts`, que ya
existe vacío y ya está registrado en `lessons/index.ts`: escribir la lección es llenar
ese archivo. El módulo lleva tres cosas: la lección (sólo claves), **sus textos**
(`texts`, que `t()` lee después del diccionario) y **sus dibujos de llaves** si
necesita alguno nuevo (`glyphs`). Así un nodo se escribe sin tocar `i18n.ts`,
`lessons/index.ts` ni `ui/KeyGlyph.tsx`, y varios nodos se escriben a la vez.

Los tipos están en `lessons/types.ts`. El nodo 1 (`lessons/cardinality.ts`) es la
referencia de forma, aunque es anterior a los módulos y sus textos viven en `i18n.ts`.

## Plantilla

```ts
/**
 * La lección de <nombre del minijuego>, nivel por nivel.
 * <Una o dos frases: qué gestos estrena cada nivel y cuáles repiten uno conocido.>
 */
import type { CoachStep, KeySpec, LessonModule } from "./types.ts";

const NODE = "<id del nodo>";

const k = (n: number, part: string): string => `lesson.${NODE}.${n}.${part}`;

const step = (n: number, id: string, advance: CoachStep["advance"]): CoachStep => ({
  id,
  textKey: k(n, `coach.${id}`),
  advance,
});

/** El paso que explica el resultado: la ronda espera a que se lea. */
const reveal = (n: number): CoachStep => ({ ...step(n, "reveal", "tap"), holds: true });

const key = (id: string, glyph: string): KeySpec => ({
  id,
  titleKey: `key.${id}.title`,
  bodyKey: `key.${id}.body`,
  glyph,
});

export const MODULE: LessonModule = {
  lesson: {
  node: NODE,
  learnedKey: `node.${NODE}.learned`,
  levels: [
    {
      level: 1,
      whyKey: k(1, "why"),
      goalKey: k(1, "goal"),
      key: key("<area>.<idea>", "<glifo>"),
      uses: [],                       // llaves de niveles o nodos anteriores que lo resuelven
      coach: [
        step(1, "look", "tap"),
        step(1, "<hacer>", { signal: "<evento>" }),
        reveal(1),
      ],
    },
    // … un objeto por nivel del nodo, en orden
  ],
  },
  texts: {
    [k(1, "why")]: "…",
    [k(1, "goal")]: "…",
    [k(1, "coach.look")]: "…",
    "key.<area>.<idea>.title": "…",
    "key.<area>.<idea>.body": "…",
    [`node.${NODE}.learned`]: "…",
  },
  // Sólo si ningún dibujo base sirve (pair, plusOne, shuffle, travel, oneByOne,
  // sameCount): puntos y barras sobre una caja de 40 × 40.
  glyphs: {
    "<area>.<dibujo>": { dots: [[10, 20, 4], [30, 20, 4, true]], bars: [[12, 19, 16, 2]] },
  },
};
```

No hace falta registrarlo: el módulo ya está en `lessons/index.ts`. Un módulo con
`levels` vacío es un nodo sin lección, y se juega como antes.

## Los campos

| Campo | Qué es | Regla |
|---|---|---|
| `whyKey` | qué idea enseña el nivel | una o dos frases; nombra la idea, no el tema |
| `goalKey` | qué hay que hacer para superarlo | una frase imperativa; es lo que queda a la vista mientras se juega |
| `key` | la llave que deja | `id` permanente `<área>.<idea>`; ver la skill, "Cómo se escribe una llave" |
| `uses` | ids de llaves que ayudan | se muestran en la tarjeta de entrada y abren la chuleta |
| `coach` | la guía de la primera ronda | 3–5 pasos en niveles que estrenan gesto; 1 paso `recall` en los que repiten |
| `learnedKey` | lo que deja el concepto entero | una frase para la tarjeta de cierre del último nivel |

## Los pasos

- `advance: "tap"` → el cartel muestra "Siguiente" (o "Entendido" en el último).
- `advance: { signal: "<evento>" }` → el cartel muestra "Te toca" y el paso avanza
  cuando la actividad llama `say("<evento>")`. Una señal adelanta hasta el paso que
  la espera: si el jugador hizo el gesto antes, la guía no se lo pide dos veces.
- `holds: true` → mientras el paso está a la vista, la ronda no se cierra. Es para
  el `reveal`: si la ronda siguiente arrancara debajo, el jugador leería la
  explicación sobre un tablero que ya no es el suyo.
- La pose de Lumi sale sola del paso: `point` si espera un gesto, `wow` si `holds`,
  `think` si es de leer.

Nombres de paso usados en el nodo 1, para reusar: `look`, `drag`, `bridge`,
`pairAll`, `fill`, `choose`, `carry`, `recall`, `reveal`. Señales: `placed`,
`bridge`, `solved`, `added`, `matched`, `chosen`, `cardPlaced`. Son de la
actividad, no globales: cada nodo nombra las suyas.

## Los textos (en `texts` del módulo)

```ts
"lesson.<nodo>.1.why": "…",
"lesson.<nodo>.1.goal": "…",
"lesson.<nodo>.1.coach.look": "…",
"lesson.<nodo>.1.coach.<hacer>": "…",
"lesson.<nodo>.1.coach.reveal": "…",
"key.<id>.title": "…",
"key.<id>.body": "…",
"node.<nodo>.learned": "…",
```

Ejemplos del nodo 1 que marcan el tono:

- why: "Cómo saber qué grupo tiene más sin contar: poniendo cada cosa frente a
  otra. Lo que queda sin pareja dice quién tiene más."
- goal: "Emparejá todas las frutas y fijate qué cuenco tiene más."
- coach: "Ahora una fruta del otro cuenco. Va a quedar enfrente, y entre las dos
  aparece un puente."
- reveal: "La fruta que quedó sin puente es la que sobra: su cuenco tiene más.
  Comparaste sin contar."
- key: "Emparejar compara" / "Poné cada cosa frente a otra. Si sobra alguna, ese
  lado tiene más; si no sobra ninguna, tienen lo mismo. No hace falta contar."

## Las llaves y la chuleta

`earnedKeys(levelsDone)` da las llaves ganadas (una por nivel superado de cada nodo
con lección) y la chuleta las muestra arriba de las reglas del diseño, con "volver
a jugar el nivel N". Las entradas de `docs/R-cheatsheet/` siguen llegando con los
niveles de capa `symbolic` o `formal` (`ui/unlocks.ts`).

Decisión abierta, anotada en U4: las llaves viven hoy en el código de la app; si se
mueven a YAML en `docs/` (dato contra prosa), R0 cambia con ellas.
